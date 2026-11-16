import os

from fastapi import APIRouter, Depends, HTTPException
from google.auth.transport import requests as google_requests
from google.oauth2 import id_token
from sqlalchemy.orm import Session
from typing import cast

from app.auth import get_current_user, require_roles
from app.database import get_db
from app.db_models import PatientProfile as PatientProfileModel
from app.db_models import User as UserModel
from app.models import (
    Appointment,
    BulkDeleteRequest,
    BulkDeleteResponse,
    ChatRequest,
    ChatResponse,
    CreateAppointment,
    CreateTask,
    CreateUser,
    GoogleLoginRequest,
    LoginRequest,
    NotifyRequest,
    NotifyResponse,
    PatientProfile,
    PatientRegister,
    RegisterRequest,
    RegisterResponse,
    Role,
    Token,
    User,
)
from app.security import create_access_token
from app.services.appointment_service import AppointmentService
from app.services.chat_service import ChatService
from app.services.notification_service import NotificationService
from app.services.task_service import TaskService
from app.services.user_service import UserService


router = APIRouter(prefix="/api")

service = TaskService()
appointment_service = AppointmentService()
user_service = UserService()
notification_service = NotificationService()
chat_service = ChatService()


# ----- Authentication -----

@router.get("/auth/providers")
def auth_providers():
    """Return public sign-in configuration; OAuth client IDs are not secrets."""

    google_client_id = os.environ.get("GOOGLE_CLIENT_ID", "").strip()

    return {
        "google": {
            "enabled": bool(google_client_id),
            "client_id": google_client_id or None,
        }
    }

@router.post("/auth/login", response_model=Token)
def login(data: LoginRequest, db: Session = Depends(get_db)):

    user = user_service.authenticate(db, data.username, data.password)

    if not user:
        raise HTTPException(
            status_code=401,
            detail="Invalid username or password",
        )

    if user.status != "ACTIVE":
        raise HTTPException(
            status_code=403,
            detail=(
                "Your account is pending approval. "
                "An administrator will activate it shortly."
            ),
        )

    token = create_access_token(user.username, user.role)

    return Token(
        access_token=token,
        username=user.username,
        role=cast(Role, user.role),
    )


@router.post("/auth/register", response_model=RegisterResponse)
def register(data: RegisterRequest, db: Session = Depends(get_db)):

    if user_service.get_by_username(db, data.username):
        raise HTTPException(
            status_code=400,
            detail="Username already exists",
        )

    if user_service.get_by_phone(db, data.phone):
        raise HTTPException(
            status_code=400,
            detail="Phone number is already registered",
        )

    if data.role == "DOCTOR" and not (data.license_number or "").strip():
        raise HTTPException(
            status_code=400,
            detail="A medical license number is required for doctors",
        )

    user = user_service.register(db, data)

    if user.status == "PENDING":
        message = (
            "Membership request received. A doctor account requires admin "
            "approval before you can sign in."
        )
    else:
        message = "Membership created. You can now sign in."

    return RegisterResponse(
        username=user.username,
        role=cast(Role, user.role),
        status=cast(str, user.status),  # type: ignore[arg-type]
        message=message,
    )


@router.post("/auth/register-patient", response_model=RegisterResponse)
def register_patient(data: PatientRegister, db: Session = Depends(get_db)):

    if user_service.get_by_username(db, data.username):
        raise HTTPException(
            status_code=400,
            detail="Username already exists",
        )

    if user_service.get_by_phone(db, data.phone):
        raise HTTPException(
            status_code=400,
            detail="Phone number is already registered",
        )

    user, _ = user_service.register_patient(db, data)

    return RegisterResponse(
        username=user.username,
        role=cast(Role, user.role),
        status=cast(str, user.status),  # type: ignore[arg-type]
        message="Membership created. You can now sign in.",
    )


@router.post("/notify/email", response_model=NotifyResponse)
def notify_email(data: NotifyRequest):

    delivered, simulated, detail = notification_service.send_email(
        data.to, data.subject, data.message
    )

    return NotifyResponse(
        delivered=delivered,
        simulated=simulated,
        detail=detail,
    )


@router.post("/notify/sms", response_model=NotifyResponse)
def notify_sms(data: NotifyRequest):

    delivered, simulated, detail = notification_service.send_sms(
        data.to, data.message
    )

    return NotifyResponse(
        delivered=delivered,
        simulated=simulated,
        detail=detail,
    )


@router.post("/notify/whatsapp", response_model=NotifyResponse)
def notify_whatsapp(data: NotifyRequest):

    delivered, simulated, detail = notification_service.send_whatsapp(
        data.to, data.message
    )

    return NotifyResponse(
        delivered=delivered,
        simulated=simulated,
        detail=detail,
    )


# ----- AI assistant (public) -----

@router.post("/chat", response_model=ChatResponse)
def chat(data: ChatRequest):

    reply, model, simulated = chat_service.reply(data.message, data.history)

    return ChatResponse(
        reply=reply,
        model=model,
        simulated=simulated,
    )


@router.get("/auth/me", response_model=User)
def read_me(current_user: UserModel = Depends(get_current_user)):
    return current_user


@router.get("/patients", response_model=list[PatientProfile])
def get_patients(
    _: UserModel = Depends(require_roles("DOCTOR")),
    db: Session = Depends(get_db),
):

    return (
        db.query(PatientProfileModel)
        .order_by(PatientProfileModel.created_at.desc())
        .all()
    )


@router.get("/patients/me", response_model=PatientProfile)
def read_my_profile(
    current_user: UserModel = Depends(require_roles("PATIENT")),
    db: Session = Depends(get_db),
):

    profile = (
        db.query(PatientProfileModel)
        .filter(PatientProfileModel.user_id == current_user.id)
        .first()
    )

    if not profile:
        raise HTTPException(
            status_code=404,
            detail="Patient profile not found",
        )

    return profile


@router.post("/patients/bulk-delete", response_model=BulkDeleteResponse)
def delete_patients(
    data: BulkDeleteRequest,
    _: UserModel = Depends(require_roles()),
    db: Session = Depends(get_db),
):
    patient_ids = sorted({patient_id for patient_id in data.ids if patient_id > 0})

    if not patient_ids:
        raise HTTPException(
            status_code=400,
            detail="Select at least one patient record to delete",
        )

    deleted = (
        db.query(PatientProfileModel)
        .filter(PatientProfileModel.id.in_(patient_ids))
        .delete(synchronize_session=False)
    )
    db.commit()

    return BulkDeleteResponse(deleted=deleted)


# ----- User management (admin only) -----

@router.get("/users", response_model=list[User])
def get_users(
    _: UserModel = Depends(require_roles()),
    db: Session = Depends(get_db),
):
    return user_service.get_users(db)


@router.post("/users", response_model=User)
def create_user(
    data: CreateUser,
    _: UserModel = Depends(require_roles()),
    db: Session = Depends(get_db),
):

    if user_service.get_by_username(db, data.username):
        raise HTTPException(
            status_code=400,
            detail="Username already exists",
        )

    if data.phone and user_service.get_by_phone(db, data.phone):
        raise HTTPException(
            status_code=400,
            detail="Phone number is already registered",
        )

    return user_service.create_user(db, data)


@router.post("/users/{user_id}/approve", response_model=User)
def approve_user(
    user_id: int,
    _: UserModel = Depends(require_roles()),
    db: Session = Depends(get_db),
):

    user = user_service.approve_user(db, user_id)

    if not user:
        raise HTTPException(
            status_code=404,
            detail="User not found",
        )

    return user


@router.delete("/users/{user_id}")
def delete_user(
    user_id: int,
    current_user: UserModel = Depends(require_roles()),
    db: Session = Depends(get_db),
):

    if current_user.id == user_id:
        raise HTTPException(
            status_code=400,
            detail="You cannot delete your own account",
        )

    success = user_service.delete_user(db, user_id)

    if not success:
        raise HTTPException(
            status_code=404,
            detail="User not found",
        )

    return {"success": True}


# ----- Tasks (doctor + admin) -----

@router.get("/tasks")
def get_tasks(_: UserModel = Depends(require_roles("DOCTOR"))):

    return service.get_tasks()


@router.get("/tasks/{task_id}")
def get_task(
    task_id: int,
    _: UserModel = Depends(require_roles("DOCTOR")),
):

    task = service.get_task(task_id)

    if not task:
        raise HTTPException(
            status_code=404,
            detail="Task not found",
        )

    return task


@router.post("/tasks")
def create_task(
    data: CreateTask,
    _: UserModel = Depends(require_roles("DOCTOR")),
):

    return service.create_task(data)


@router.delete("/tasks/{task_id}")
def delete_task(
    task_id: int,
    _: UserModel = Depends(require_roles("DOCTOR")),
):

    success = service.delete_task(task_id)

    if not success:
        raise HTTPException(
            status_code=404,
            detail="Task not found",
        )

    return {
        "success": True
    }


# ----- Appointments -----

@router.get("/appointments", response_model=list[Appointment])
def get_appointments(
    _: UserModel = Depends(require_roles("DOCTOR")),
    db: Session = Depends(get_db),
):
    return appointment_service.get_appointments(db)


@router.get("/appointments/mine", response_model=list[Appointment])
def get_my_appointments(
    current_user: UserModel = Depends(require_roles("PATIENT")),
    db: Session = Depends(get_db),
):
    return appointment_service.get_appointments_for_user(
        db, current_user.username
    )


@router.post("/appointments", response_model=Appointment)
def create_appointment(
    data: CreateAppointment,
    current_user: UserModel = Depends(require_roles("PATIENT")),
    db: Session = Depends(get_db),
):

    return appointment_service.create_appointment(
        db, data, created_by=current_user.username
    )


@router.post("/appointments/bulk-delete", response_model=BulkDeleteResponse)
def delete_appointments(
    data: BulkDeleteRequest,
    _: UserModel = Depends(require_roles()),
    db: Session = Depends(get_db),
):
    appointment_ids = sorted(
        {appointment_id for appointment_id in data.ids if appointment_id > 0}
    )

    if not appointment_ids:
        raise HTTPException(
            status_code=400,
            detail="Select at least one appointment to delete",
        )

    deleted = appointment_service.delete_appointments(db, appointment_ids)
    return BulkDeleteResponse(deleted=deleted)


@router.post("/auth/google", response_model=Token)
def google_login(data: GoogleLoginRequest, db: Session = Depends(get_db)):

    client_id = os.environ.get("GOOGLE_CLIENT_ID", "").strip()
    if not client_id:
        raise HTTPException(
            status_code=503,
            detail="Google Sign-In is not configured on the server.",
        )

    try:
        google_user = id_token.verify_oauth2_token(
            data.credential,
            google_requests.Request(),
            client_id,
        )
    except ValueError:
        raise HTTPException(
            status_code=401,
            detail="Invalid Google credential.",
        )

    if google_user.get("iss") not in {
        "accounts.google.com",
        "https://accounts.google.com",
    }:
        raise HTTPException(status_code=401, detail="Invalid Google issuer.")

    google_sub = google_user.get("sub")
    email = (google_user.get("email") or "").strip().lower()
    full_name = (google_user.get("name") or "Google User").strip()

    if not google_sub or not email or not google_user.get("email_verified"):
        raise HTTPException(
            status_code=401,
            detail="A verified Google email address is required.",
        )

    user = user_service.get_by_google_sub(db, google_sub)

    # Link a verified Google identity to an existing local account when the
    # account email is already known.
    if not user:
        user = user_service.get_by_email(db, email)

    if not user:
        profile = (
            db.query(PatientProfileModel)
            .filter(PatientProfileModel.email == email)
            .first()
        )
        if profile:
            user = (
                db.query(UserModel)
                .filter(UserModel.id == profile.user_id)
                .first()
            )

    if user:
        if user.google_sub and user.google_sub != google_sub:
            raise HTTPException(
                status_code=409,
                detail="This account is linked to a different Google identity.",
            )
        user.google_sub = google_sub
        user.email = email
        if not user.full_name:
            user.full_name = full_name
        db.commit()
        db.refresh(user)
    else:
        base_username = email.split("@", 1)[0]
        safe_username = "".join(
            char for char in base_username.lower() if char.isalnum() or char in "._-"
        ).strip("._-") or "google-user"
        safe_username = safe_username[:70]
        username = safe_username
        suffix = 2
        while user_service.get_by_username(db, username):
            username = f"{safe_username[:70 - len(str(suffix)) - 1]}-{suffix}"
            suffix += 1

        user = user_service.create_google_patient(
            db,
            username=username,
            email=email,
            full_name=full_name,
            google_sub=google_sub,
        )

    token = create_access_token(user.username, user.role)

    return Token(
        access_token=token,
        username=user.username,
        role=cast(Role, user.role),
    )

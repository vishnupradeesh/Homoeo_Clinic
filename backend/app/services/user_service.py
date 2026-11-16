import secrets

from sqlalchemy.orm import Session

from app.db_models import PatientProfile, User
from app.models import CreateUser, PatientRegister, RegisterRequest
from app.security import hash_password, verify_password


class UserService:

    def get_by_username(self, db: Session, username: str) -> User | None:
        return (
            db.query(User)
            .filter(User.username == username)
            .first()
        )

    def get_by_email(self, db: Session, email: str) -> User | None:
        return (
            db.query(User)
            .filter(User.email == email)
            .first()
        )

    def get_by_google_sub(self, db: Session, google_sub: str) -> User | None:
        return (
            db.query(User)
            .filter(User.google_sub == google_sub)
            .first()
        )

    def get_by_phone(self, db: Session, phone: str) -> User | None:
        return (
            db.query(User)
            .filter(User.phone == phone)
            .first()
        )

    def get_by_username_or_phone(
        self, db: Session, identifier: str
    ) -> User | None:
        return (
            db.query(User)
            .filter((User.username == identifier) | (User.phone == identifier))
            .first()
        )

    def get_users(self, db: Session) -> list[User]:
        return db.query(User).order_by(User.created_at.desc()).all()

    def authenticate(
        self,
        db: Session,
        identifier: str,
        password: str,
    ) -> User | None:

        user = self.get_by_username_or_phone(db, identifier)

        if not user or not verify_password(password, user.hashed_password):
            return None

        return user

    def create_user(self, db: Session, data: CreateUser) -> User:

        user = User(
            username=data.username,
            phone=data.phone,
            full_name=data.full_name,
            hashed_password=hash_password(data.password),
            role=data.role,
            status="ACTIVE",
        )

        db.add(user)
        db.commit()
        db.refresh(user)

        return user

    def create_google_patient(
        self,
        db: Session,
        *,
        username: str,
        email: str,
        full_name: str,
        google_sub: str,
    ) -> User:
        user = User(
            username=username,
            email=email,
            full_name=full_name,
            # Keep the existing non-null password column satisfied. This
            # random value is never shared with the user or used for login.
            hashed_password=hash_password(secrets.token_urlsafe(32)),
            google_sub=google_sub,
            role="PATIENT",
            status="ACTIVE",
        )

        db.add(user)
        db.commit()
        db.refresh(user)

        return user

    def register(self, db: Session, data: RegisterRequest) -> User:

        # Doctors require admin approval before they can sign in.
        status = "PENDING" if data.role == "DOCTOR" else "ACTIVE"

        user = User(
            username=data.username,
            phone=data.phone,
            full_name=data.full_name,
            hashed_password=hash_password(data.password),
            role=data.role,
            status=status,
            license_number=data.license_number,
            interview=data.interview,
        )

        db.add(user)
        db.commit()
        db.refresh(user)

        return user

    def register_patient(
        self,
        db: Session,
        data: PatientRegister,
    ) -> tuple[User, PatientProfile]:

        user = User(
            username=data.username,
            phone=data.phone,
            full_name=data.name,
            hashed_password=hash_password(data.password),
            role="PATIENT",
            status="ACTIVE",
        )

        db.add(user)
        db.flush()  # assign user.id before creating the profile

        profile = PatientProfile(
            user_id=user.id,
            name=data.name,
            parent_name=data.parent_name,
            birth_date=data.birth_date,
            gender=data.gender,
            phone=data.phone,
            email=data.email,
            address=data.address,
            latitude=data.latitude,
            longitude=data.longitude,
            occupation=data.occupation,
            marital_status=data.marital_status,
            blood_group=data.blood_group,
            current_health_issues=data.current_health_issues,
            previous_history=data.previous_history,
            character_notes=data.character_notes,
        )

        db.add(profile)
        db.commit()
        db.refresh(user)
        db.refresh(profile)

        return user, profile

    def approve_user(self, db: Session, user_id: int) -> User | None:

        user = db.query(User).filter(User.id == user_id).first()

        if not user:
            return None

        user.status = "ACTIVE"
        db.commit()
        db.refresh(user)

        return user

    def delete_user(self, db: Session, user_id: int) -> bool:

        user = db.query(User).filter(User.id == user_id).first()

        if not user:
            return False

        db.delete(user)
        db.commit()

        return True

    def ensure_default_admin(self, db: Session) -> None:

        existing = self.get_by_username(db, "admin")

        if existing:
            return

        admin = User(
            username="admin",
            full_name="Administrator",
            hashed_password=hash_password("Madurai@2023"),
            role="ADMIN",
            status="ACTIVE",
        )

        db.add(admin)
        db.commit()

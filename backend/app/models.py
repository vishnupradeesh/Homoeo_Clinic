from pydantic import BaseModel, EmailStr
from typing import Optional, Literal
from datetime import datetime


Role = Literal["ADMIN", "DOCTOR", "PATIENT"]

# Roles a person may self-register as (admins are provisioned internally).
SelfRole = Literal["DOCTOR", "PATIENT"]

Status = Literal["ACTIVE", "PENDING"]


class Task(BaseModel):
    id: int
    title: str
    description: Optional[str] = None
    status: str = "pending"


class CreateTask(BaseModel):
    title: str
    description: Optional[str] = None


class CreateAppointment(BaseModel):
    name: str
    email: EmailStr
    phone: str
    preferred_date: str
    message: Optional[str] = None


class Appointment(BaseModel):
    id: int
    name: str
    email: str
    phone: str
    preferred_date: str
    message: Optional[str] = None
    created_by: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True


class BulkDeleteRequest(BaseModel):
    ids: list[int]


class BulkDeleteResponse(BaseModel):
    success: bool = True
    deleted: int


class LoginRequest(BaseModel):
    username: str
    password: str


class GoogleLoginRequest(BaseModel):
    credential: str


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    username: str
    role: Role


class CreateUser(BaseModel):
    username: str
    password: str
    role: Role
    phone: Optional[str] = None
    full_name: Optional[str] = None


class RegisterRequest(BaseModel):
    full_name: str
    phone: str
    username: str
    password: str
    role: SelfRole
    # Required for doctors: license and short interview answers.
    license_number: Optional[str] = None
    interview: Optional[str] = None


class RegisterResponse(BaseModel):
    username: str
    role: Role
    status: Status
    message: str


class PatientRegister(BaseModel):
    # Credentials (step 5)
    username: str
    password: str

    # Step 1 - basic details
    name: str
    parent_name: Optional[str] = None
    birth_date: Optional[str] = None
    gender: Optional[str] = None
    phone: str
    email: Optional[EmailStr] = None
    address: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    occupation: Optional[str] = None
    marital_status: Optional[str] = None
    blood_group: Optional[str] = None

    # Steps 2-4 - clinical intake
    current_health_issues: Optional[str] = None
    previous_history: Optional[str] = None
    character_notes: Optional[str] = None


class PatientProfile(BaseModel):
    id: int
    user_id: int
    name: str
    parent_name: Optional[str] = None
    birth_date: Optional[str] = None
    gender: Optional[str] = None
    phone: str
    email: Optional[str] = None
    address: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    occupation: Optional[str] = None
    marital_status: Optional[str] = None
    blood_group: Optional[str] = None
    current_health_issues: Optional[str] = None
    previous_history: Optional[str] = None
    character_notes: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True


class NotifyRequest(BaseModel):
    to: str
    subject: str
    message: str


class NotifyResponse(BaseModel):
    delivered: bool
    simulated: bool
    detail: str


class User(BaseModel):
    id: int
    username: str
    phone: Optional[str] = None
    email: Optional[EmailStr] = None
    full_name: Optional[str] = None
    role: Role
    status: Status = "ACTIVE"
    license_number: Optional[str] = None
    interview: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True


class ChatMessage(BaseModel):
    role: Literal["user", "assistant"]
    content: str


class ChatRequest(BaseModel):
    message: str
    history: list[ChatMessage] = []


class ChatResponse(BaseModel):
    reply: str
    model: str
    simulated: bool

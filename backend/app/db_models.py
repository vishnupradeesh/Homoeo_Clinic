from datetime import datetime
from typing import Optional

from sqlalchemy import DateTime, Float, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.database import Base


class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    username: Mapped[str] = mapped_column(
        String(80), unique=True, nullable=False, index=True
    )
    phone: Mapped[Optional[str]] = mapped_column(
        String(30), unique=True, nullable=True, index=True
    )
    email: Mapped[Optional[str]] = mapped_column(
        String(200), nullable=True, index=True
    )
    google_sub: Mapped[Optional[str]] = mapped_column(
        String(255), unique=True, nullable=True, index=True
    )
    full_name: Mapped[Optional[str]] = mapped_column(String(120), nullable=True)
    hashed_password: Mapped[str] = mapped_column(String(255), nullable=False)
    role: Mapped[str] = mapped_column(
        String(20), nullable=False, default="PATIENT"
    )
    status: Mapped[str] = mapped_column(
        String(20), nullable=False, default="ACTIVE"
    )
    license_number: Mapped[Optional[str]] = mapped_column(
        String(80), nullable=True
    )
    interview: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime, default=datetime.utcnow, nullable=False
    )


class Appointment(Base):
    __tablename__ = "appointments"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    name: Mapped[str] = mapped_column(String(120), nullable=False)
    email: Mapped[str] = mapped_column(String(200), nullable=False)
    phone: Mapped[str] = mapped_column(String(30), nullable=False)
    preferred_date: Mapped[str] = mapped_column(String(20), nullable=False)
    message: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    created_by: Mapped[Optional[str]] = mapped_column(
        String(80), nullable=True, index=True
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime, default=datetime.utcnow, nullable=False
    )


class PatientProfile(Base):
    __tablename__ = "patient_profiles"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    user_id: Mapped[int] = mapped_column(
        Integer, nullable=False, unique=True, index=True
    )

    # Step 1 - basic details
    name: Mapped[str] = mapped_column(String(120), nullable=False)
    parent_name: Mapped[Optional[str]] = mapped_column(String(120), nullable=True)
    birth_date: Mapped[Optional[str]] = mapped_column(String(20), nullable=True)
    gender: Mapped[Optional[str]] = mapped_column(String(20), nullable=True)
    phone: Mapped[str] = mapped_column(String(30), nullable=False)
    email: Mapped[Optional[str]] = mapped_column(String(200), nullable=True)
    address: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    latitude: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    longitude: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    occupation: Mapped[Optional[str]] = mapped_column(String(120), nullable=True)
    marital_status: Mapped[Optional[str]] = mapped_column(
        String(30), nullable=True
    )
    blood_group: Mapped[Optional[str]] = mapped_column(String(10), nullable=True)

    # Step 2/3/4 - clinical intake
    current_health_issues: Mapped[Optional[str]] = mapped_column(
        Text, nullable=True
    )
    previous_history: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    character_notes: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    created_at: Mapped[datetime] = mapped_column(
        DateTime, default=datetime.utcnow, nullable=False
    )

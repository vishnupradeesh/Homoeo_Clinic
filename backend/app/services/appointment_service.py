from sqlalchemy.orm import Session

from app.db_models import Appointment
from app.models import CreateAppointment


class AppointmentService:

    def get_appointments(self, db: Session) -> list[Appointment]:
        return (
            db.query(Appointment)
            .order_by(Appointment.created_at.desc())
            .all()
        )

    def get_appointments_for_user(
        self,
        db: Session,
        username: str,
    ) -> list[Appointment]:
        return (
            db.query(Appointment)
            .filter(Appointment.created_by == username)
            .order_by(Appointment.created_at.desc())
            .all()
        )

    def create_appointment(
        self,
        db: Session,
        data: CreateAppointment,
        created_by: str | None = None,
    ) -> Appointment:

        appointment = Appointment(
            name=data.name,
            email=data.email,
            phone=data.phone,
            preferred_date=data.preferred_date,
            message=data.message,
            created_by=created_by,
        )

        db.add(appointment)
        db.commit()
        db.refresh(appointment)

        return appointment

    def delete_appointments(self, db: Session, appointment_ids: list[int]) -> int:
        deleted = (
            db.query(Appointment)
            .filter(Appointment.id.in_(appointment_ids))
            .delete(synchronize_session=False)
        )
        db.commit()
        return deleted

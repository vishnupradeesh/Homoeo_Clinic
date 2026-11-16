from pathlib import Path

from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker


DB_PATH = Path(__file__).resolve().parent.parent / "clinic.db"

engine = create_engine(
    f"sqlite:///{DB_PATH}",
    connect_args={"check_same_thread": False},
)

SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine,
)

Base = declarative_base()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def init_db():
    # Import models so tables are registered before create_all.
    from app import db_models  # noqa: F401

    Base.metadata.create_all(bind=engine)

    _migrate_add_created_by()
    _migrate_user_columns()
    _seed_default_admin()


def _migrate_add_created_by():
    from sqlalchemy import inspect, text

    inspector = inspect(engine)

    if "appointments" not in inspector.get_table_names():
        return

    columns = {col["name"] for col in inspector.get_columns("appointments")}

    if "created_by" not in columns:
        with engine.begin() as conn:
            conn.execute(
                text("ALTER TABLE appointments ADD COLUMN created_by VARCHAR(80)")
            )


def _migrate_user_columns():
    from sqlalchemy import inspect, text

    inspector = inspect(engine)

    if "users" not in inspector.get_table_names():
        return

    columns = {col["name"] for col in inspector.get_columns("users")}

    additions = {
        "phone": "VARCHAR(30)",
        "email": "VARCHAR(200)",
        "google_sub": "VARCHAR(255)",
        "full_name": "VARCHAR(120)",
        "status": "VARCHAR(20)",
        "license_number": "VARCHAR(80)",
        "interview": "TEXT",
    }

    with engine.begin() as conn:
        for name, ddl in additions.items():
            if name not in columns:
                conn.execute(
                    text(f"ALTER TABLE users ADD COLUMN {name} {ddl}")
                )

        # Google subject IDs must identify only one local account.
        conn.execute(
            text(
                "CREATE UNIQUE INDEX IF NOT EXISTS "
                "ix_users_google_sub_unique ON users (google_sub)"
            )
        )

        # Existing accounts predate the status column; treat them as active.
        conn.execute(
            text("UPDATE users SET status = 'ACTIVE' WHERE status IS NULL")
        )


def _seed_default_admin():
    from app.services.user_service import UserService

    db = SessionLocal()
    try:
        UserService().ensure_default_admin(db)
    finally:
        db.close()

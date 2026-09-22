import os

from app.auth.security import hash_password
from app.database.database import SessionLocal
from app.models.asset import Asset
from app.models.user import User


def seed_admin():
    name = os.getenv("ADMIN_NAME")
    email = os.getenv("ADMIN_EMAIL")
    password = os.getenv("ADMIN_PASSWORD")
    department = os.getenv("ADMIN_DEPARTMENT", "IT")

    if not name or not email or not password:
        print("Admin seed skipped: required admin environment variables are not set.")
        return

    db = SessionLocal()

    try:
        existing_user = db.query(User).filter(User.email == email).first()

        if existing_user:
            print("Admin seed skipped: admin user already exists.")
            return

        admin = User(
            name=name,
            email=email,
            department=department,
            password_hash=hash_password(password),
            role="Admin",
        )

        db.add(admin)
        db.commit()

        print("Admin user created successfully.")

    finally:
        db.close()


if __name__ == "__main__":
    seed_admin()

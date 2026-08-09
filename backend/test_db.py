from app.database.database import engine

try:
    with engine.connect():
        print("✅ Connected to PostgreSQL successfully!")
except Exception as e:
    print("❌ Connection failed")
    print(e)
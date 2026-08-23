from fastapi import FastAPI

from app.database.database import Base, engine
from app.models.asset import Asset
from app.models.user import User
from app.routes.assets import router as assets_router
from app.routes.users import router as users_router


app = FastAPI(title="AssetHub API")

Base.metadata.create_all(bind=engine)

app.include_router(assets_router)
app.include_router(users_router)

@app.get("/")
def root():
    return {"message": "Welcome to AssetHub!"}
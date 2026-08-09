from fastapi import FastAPI

from app.database.database import Base, engine
from app.models.asset import Asset
from app.routes.assets import router as assets_router

app = FastAPI(title="AssetHub API")

Base.metadata.create_all(bind=engine)

app.include_router(assets_router)


@app.get("/")
def root():
    return {"message": "Welcome to AssetHub!"}
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.database.database import Base, engine
from app.models.asset import Asset
from app.models.user import User
from app.routes.assets import router as assets_router
from app.routes.users import router as users_router
from app.auth.routes import router as auth_router


app = FastAPI(title="AssetHub API")


app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


Base.metadata.create_all(bind=engine)


app.include_router(assets_router)
app.include_router(users_router)
app.include_router(auth_router)


@app.get("/")
def root():
    return {"message": "Welcome to AssetHub!"}
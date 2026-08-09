from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database.database import SessionLocal
from app.models.asset import Asset
from app.schemas.asset import AssetCreate, AssetResponse

router = APIRouter(
    prefix="/assets",
    tags=["Assets"]
)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@router.post("/", response_model=AssetResponse)
def create_asset(asset: AssetCreate, db: Session = Depends(get_db)):
    new_asset = Asset(
        asset_tag=asset.asset_tag,
        asset_type=asset.asset_type,
        brand=asset.brand,
        model=asset.model
    )

    db.add(new_asset)
    db.commit()
    db.refresh(new_asset)

    return new_asset
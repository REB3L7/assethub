from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database.database import SessionLocal
from app.models.asset import Asset
from app.models.user import User
from app.schemas.asset import AssetCreate, AssetResponse, AssetUpdate

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

@router.get("/", response_model=list[AssetResponse])
def get_assets(db: Session = Depends(get_db)):
    return db.query(Asset).all()

@router.get("/{asset_id}", response_model=AssetResponse)
def get_asset(asset_id: int, db: Session = Depends(get_db)):
    asset = db.query(Asset).filter(Asset.id == asset_id).first()

    if not asset:
        raise HTTPException(
            status_code=404,
            detail="Asset not found"
        )

    return asset

@router.put("/{asset_id}", response_model=AssetResponse)
def update_asset(
    asset_id: int,
    asset_data: AssetUpdate,
    db: Session = Depends(get_db)
):
    asset = db.query(Asset).filter(Asset.id == asset_id).first()

    if not asset:
        raise HTTPException(
            status_code=404,
            detail="Asset not found"
        )

    asset.asset_tag = asset_data.asset_tag
    asset.asset_type = asset_data.asset_type
    asset.brand = asset_data.brand
    asset.model = asset_data.model
    asset.status = asset_data.status

    db.commit()
    db.refresh(asset)

    return asset

@router.delete("/{asset_id}")
def delete_asset(asset_id: int, db: Session = Depends(get_db)):
    asset = db.query(Asset).filter(Asset.id == asset_id).first()

    if not asset:
        raise HTTPException(
            status_code=404,
            detail="Asset not found"
        )

    db.delete(asset)
    db.commit()

    return {"message": "Asset deleted successfully"}

@router.post("/{asset_id}/assign/{user_id}", response_model=AssetResponse)
def assign_asset(
    asset_id: int,
    user_id: int,
    db: Session = Depends(get_db)
):
    asset = db.query(Asset).filter(Asset.id == asset_id).first()

    if not asset:
        raise HTTPException(
            status_code=404,
            detail="Asset not found"
        )

    user = db.query(User).filter(User.id == user_id).first()

    if not user:
        raise HTTPException(
            status_code=404,
            detail="User not found"
        )

    asset.assigned_to = user.id
    asset.status = "Assigned"

    db.commit()
    db.refresh(asset)

    return asset
@router.post("/{asset_id}/unassign", response_model=AssetResponse)
def unassign_asset(
    asset_id: int,
    db: Session = Depends(get_db)
):
    asset = db.query(Asset).filter(Asset.id == asset_id).first()

    if not asset:
        raise HTTPException(
            status_code=404,
            detail="Asset not found"
        )

    asset.assigned_to = None
    asset.status = "Available"

    db.commit()
    db.refresh(asset)

    return asset
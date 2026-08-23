from sqlalchemy import Column, Integer, String
from app.database.database import Base

class Asset(Base):
    __tablename__ = "assets"

    id = Column(Integer, primary_key=True, index=True)
    asset_tag = Column(String, unique=True, nullable=False)
    asset_type = Column(String, nullable=False)
    brand = Column(String, nullable=False)
    model = Column(String, nullable=False)
    status = Column(String, default="Available")
    assigned_to = Column(Integer, nullable=True)
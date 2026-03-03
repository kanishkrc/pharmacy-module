from sqlalchemy import Column, Integer, String, Float, Date, DateTime, ForeignKey, Enum as SQLEnum
from sqlalchemy.orm import relationship
from database import Base
from datetime import datetime
import enum


class MedicineStatus(str, enum.Enum):
    ACTIVE = "Active"
    LOW_STOCK = "Low Stock"
    EXPIRED = "Expired"
    OUT_OF_STOCK = "Out of Stock"


class SaleStatus(str, enum.Enum):
    COMPLETED = "Completed"
    PENDING = "Pending"
    CANCELLED = "Cancelled"


class PurchaseOrderStatus(str, enum.Enum):
    PENDING = "Pending"
    COMPLETED = "Completed"


class Medicine(Base):
    __tablename__ = "medicines"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    generic_name = Column(String, nullable=False)
    category = Column(String, nullable=False)
    batch_no = Column(String, nullable=False, unique=True)
    expiry_date = Column(Date, nullable=False)
    quantity = Column(Integer, nullable=False, default=0)
    cost_price = Column(Float, nullable=False)
    mrp = Column(Float, nullable=False)
    supplier = Column(String, nullable=False)
    status = Column(String, nullable=False, default=MedicineStatus.ACTIVE.value)

    sale_items = relationship("SaleItem", back_populates="medicine")


class Sale(Base):
    __tablename__ = "sales"

    id = Column(Integer, primary_key=True, index=True)
    invoice_no = Column(String, nullable=False, unique=True)
    patient_name = Column(String, nullable=False)
    items_count = Column(Integer, nullable=False)
    payment_method = Column(String, nullable=False)
    total_amount = Column(Float, nullable=False)
    status = Column(String, nullable=False, default=SaleStatus.COMPLETED.value)
    created_at = Column(DateTime, nullable=False, default=datetime.utcnow)

    items = relationship("SaleItem", back_populates="sale")


class SaleItem(Base):
    __tablename__ = "sale_items"

    id = Column(Integer, primary_key=True, index=True)
    sale_id = Column(Integer, ForeignKey("sales.id"), nullable=False)
    medicine_id = Column(Integer, ForeignKey("medicines.id"), nullable=False)
    quantity = Column(Integer, nullable=False)
    price = Column(Float, nullable=False)

    sale = relationship("Sale", back_populates="items")
    medicine = relationship("Medicine", back_populates="sale_items")


class PurchaseOrder(Base):
    __tablename__ = "purchase_orders"

    id = Column(Integer, primary_key=True, index=True)
    order_no = Column(String, nullable=False, unique=True)
    supplier = Column(String, nullable=False)
    total_amount = Column(Float, nullable=False)
    status = Column(String, nullable=False, default=PurchaseOrderStatus.PENDING.value)
    created_at = Column(DateTime, nullable=False, default=datetime.utcnow)

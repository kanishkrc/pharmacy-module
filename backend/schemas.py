from pydantic import BaseModel
from typing import Optional, List
from datetime import date, datetime


# --- Medicine Schemas ---
class MedicineBase(BaseModel):
    name: str
    generic_name: str
    category: str
    batch_no: str
    expiry_date: date
    quantity: int
    cost_price: float
    mrp: float
    supplier: str


class MedicineCreate(MedicineBase):
    pass


class MedicineUpdate(BaseModel):
    name: Optional[str] = None
    generic_name: Optional[str] = None
    category: Optional[str] = None
    batch_no: Optional[str] = None
    expiry_date: Optional[date] = None
    quantity: Optional[int] = None
    cost_price: Optional[float] = None
    mrp: Optional[float] = None
    supplier: Optional[str] = None
    status: Optional[str] = None


class MedicineResponse(MedicineBase):
    id: int
    status: str

    class Config:
        from_attributes = True


class StatusUpdate(BaseModel):
    status: str


# --- Sale Schemas ---
class SaleItemCreate(BaseModel):
    medicine_id: int
    quantity: int
    price: float


class SaleCreate(BaseModel):
    patient_name: str
    payment_method: str
    items: List[SaleItemCreate]


class SaleItemResponse(BaseModel):
    id: int
    medicine_id: int
    quantity: int
    price: float

    class Config:
        from_attributes = True


class SaleResponse(BaseModel):
    id: int
    invoice_no: str
    patient_name: str
    items_count: int
    payment_method: str
    total_amount: float
    status: str
    created_at: datetime

    class Config:
        from_attributes = True


# --- Dashboard Schemas ---
class DashboardSummary(BaseModel):
    todays_sales: float
    sales_growth: float
    items_sold_today: int
    total_orders: int
    low_stock_count: int
    purchase_orders_total: float
    pending_orders: int


class InventoryOverview(BaseModel):
    total_items: int
    active_stock: int
    low_stock: int
    total_value: float

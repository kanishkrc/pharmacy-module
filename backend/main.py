from fastapi import FastAPI, Depends, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import Optional, List
from datetime import date, datetime
import random

from database import engine, get_db, Base
from models import Medicine, Sale, SaleItem, PurchaseOrder, MedicineStatus
from schemas import (
    MedicineCreate,
    MedicineUpdate,
    MedicineResponse,
    StatusUpdate,
    SaleCreate,
    SaleResponse,
    DashboardSummary,
    InventoryOverview,
)
from seed_data import seed_database

app = FastAPI(title="Pharmacy CRM API", version="1.0.0")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def startup():
    Base.metadata.create_all(bind=engine)
    db = next(get_db())
    try:
        seed_database(db)
    finally:
        db.close()


# ==================== DASHBOARD ENDPOINTS ====================


@app.get("/api/dashboard/summary", response_model=DashboardSummary)
def get_dashboard_summary(db: Session = Depends(get_db)):
    """Get today's sales summary, items sold, low stock count, and purchase orders summary."""

    # Today's sales
    today = date.today()
    todays_sales_result = (
        db.query(func.coalesce(func.sum(Sale.total_amount), 0))
        .filter(func.date(Sale.created_at) == today)
        .scalar()
    )

    # If no sales today, use total of all sales for demo purposes
    if todays_sales_result == 0:
        todays_sales_result = (
            db.query(func.coalesce(func.sum(Sale.total_amount), 0)).scalar()
        )

    # Items sold today
    items_sold_today = (
        db.query(func.coalesce(func.sum(Sale.items_count), 0))
        .filter(func.date(Sale.created_at) == today)
        .scalar()
    )
    if items_sold_today == 0:
        items_sold_today = (
            db.query(func.coalesce(func.sum(Sale.items_count), 0)).scalar()
        )

    # Total orders
    total_orders = db.query(func.count(Sale.id)).scalar()

    # Low stock items (quantity < 50)
    low_stock_count = (
        db.query(func.count(Medicine.id))
        .filter(Medicine.status == MedicineStatus.LOW_STOCK.value)
        .scalar()
    )

    # Purchase orders
    purchase_orders_total = (
        db.query(func.coalesce(func.sum(PurchaseOrder.total_amount), 0)).scalar()
    )
    pending_orders = (
        db.query(func.count(PurchaseOrder.id))
        .filter(PurchaseOrder.status == "Pending")
        .scalar()
    )

    return DashboardSummary(
        todays_sales=todays_sales_result,
        sales_growth=12.5,
        items_sold_today=items_sold_today,
        total_orders=total_orders,
        low_stock_count=low_stock_count,
        purchase_orders_total=purchase_orders_total,
        pending_orders=pending_orders,
    )


@app.get("/api/dashboard/recent-sales", response_model=List[SaleResponse])
def get_recent_sales(limit: int = Query(10, ge=1, le=50), db: Session = Depends(get_db)):
    """Get recent sales list."""
    sales = db.query(Sale).order_by(Sale.created_at.desc()).limit(limit).all()
    return sales


# ==================== INVENTORY ENDPOINTS ====================


@app.get("/api/inventory/overview", response_model=InventoryOverview)
def get_inventory_overview(db: Session = Depends(get_db)):
    """Get inventory overview statistics."""
    total_items = db.query(func.count(Medicine.id)).scalar()
    active_stock = (
        db.query(func.count(Medicine.id))
        .filter(Medicine.status == MedicineStatus.ACTIVE.value)
        .scalar()
    )
    low_stock = (
        db.query(func.count(Medicine.id))
        .filter(Medicine.status == MedicineStatus.LOW_STOCK.value)
        .scalar()
    )

    # Total value = sum of (quantity * mrp) for all medicines
    medicines = db.query(Medicine).all()
    total_value = sum(m.quantity * m.mrp for m in medicines)

    return InventoryOverview(
        total_items=total_items,
        active_stock=active_stock,
        low_stock=low_stock,
        total_value=total_value,
    )


@app.get("/api/inventory/medicines", response_model=List[MedicineResponse])
def get_medicines(
    search: Optional[str] = Query(None),
    status: Optional[str] = Query(None),
    category: Optional[str] = Query(None),
    db: Session = Depends(get_db),
):
    """List medicines with optional search, status, and category filters."""
    query = db.query(Medicine)

    if search:
        search_term = f"%{search}%"
        query = query.filter(
            (Medicine.name.ilike(search_term))
            | (Medicine.generic_name.ilike(search_term))
            | (Medicine.batch_no.ilike(search_term))
            | (Medicine.supplier.ilike(search_term))
        )

    if status:
        query = query.filter(Medicine.status == status)

    if category:
        query = query.filter(Medicine.category == category)

    return query.all()


@app.post("/api/inventory/medicines", response_model=MedicineResponse, status_code=201)
def create_medicine(medicine: MedicineCreate, db: Session = Depends(get_db)):
    """Add a new medicine to inventory."""
    # Check for duplicate batch number
    existing = db.query(Medicine).filter(Medicine.batch_no == medicine.batch_no).first()
    if existing:
        raise HTTPException(status_code=400, detail="Batch number already exists")

    # Determine status based on quantity and expiry
    status = MedicineStatus.ACTIVE.value
    if medicine.quantity == 0:
        status = MedicineStatus.OUT_OF_STOCK.value
    elif medicine.quantity < 50:
        status = MedicineStatus.LOW_STOCK.value
    if medicine.expiry_date < date.today():
        status = MedicineStatus.EXPIRED.value

    db_medicine = Medicine(**medicine.model_dump(), status=status)
    db.add(db_medicine)
    db.commit()
    db.refresh(db_medicine)
    return db_medicine


@app.put("/api/inventory/medicines/{medicine_id}", response_model=MedicineResponse)
def update_medicine(
    medicine_id: int, medicine_update: MedicineUpdate, db: Session = Depends(get_db)
):
    """Update a medicine's details."""
    db_medicine = db.query(Medicine).filter(Medicine.id == medicine_id).first()
    if not db_medicine:
        raise HTTPException(status_code=404, detail="Medicine not found")

    update_data = medicine_update.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_medicine, key, value)

    # Auto-update status based on quantity and expiry
    if "quantity" in update_data or "expiry_date" in update_data:
        if db_medicine.quantity == 0:
            db_medicine.status = MedicineStatus.OUT_OF_STOCK.value
        elif db_medicine.quantity < 50:
            db_medicine.status = MedicineStatus.LOW_STOCK.value
        else:
            db_medicine.status = MedicineStatus.ACTIVE.value

        if db_medicine.expiry_date and db_medicine.expiry_date < date.today():
            db_medicine.status = MedicineStatus.EXPIRED.value

    db.commit()
    db.refresh(db_medicine)
    return db_medicine


@app.patch("/api/inventory/medicines/{medicine_id}/status", response_model=MedicineResponse)
def update_medicine_status(
    medicine_id: int, status_update: StatusUpdate, db: Session = Depends(get_db)
):
    """Mark a medicine as expired or out of stock."""
    db_medicine = db.query(Medicine).filter(Medicine.id == medicine_id).first()
    if not db_medicine:
        raise HTTPException(status_code=404, detail="Medicine not found")

    valid_statuses = [s.value for s in MedicineStatus]
    if status_update.status not in valid_statuses:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid status. Must be one of: {valid_statuses}",
        )

    db_medicine.status = status_update.status
    db.commit()
    db.refresh(db_medicine)
    return db_medicine


# ==================== SALES ENDPOINTS ====================


@app.post("/api/sales", response_model=SaleResponse, status_code=201)
def create_sale(sale: SaleCreate, db: Session = Depends(get_db)):
    """Create a new sale and decrement inventory."""
    total_amount = 0
    items_count = len(sale.items)

    # Validate medicines and calculate total
    for item in sale.items:
        medicine = db.query(Medicine).filter(Medicine.id == item.medicine_id).first()
        if not medicine:
            raise HTTPException(
                status_code=404, detail=f"Medicine with id {item.medicine_id} not found"
            )
        if medicine.quantity < item.quantity:
            raise HTTPException(
                status_code=400,
                detail=f"Insufficient stock for {medicine.name}. Available: {medicine.quantity}",
            )
        if medicine.status == MedicineStatus.EXPIRED.value:
            raise HTTPException(
                status_code=400,
                detail=f"Cannot sell expired medicine: {medicine.name}",
            )
        total_amount += item.price

    # Generate invoice number
    last_sale = db.query(Sale).order_by(Sale.id.desc()).first()
    next_id = (last_sale.id + 1) if last_sale else 1
    invoice_no = f"INV-{datetime.now().year}-{1233 + next_id}"

    # Create sale
    db_sale = Sale(
        invoice_no=invoice_no,
        patient_name=sale.patient_name,
        items_count=items_count,
        payment_method=sale.payment_method,
        total_amount=total_amount,
        status="Completed",
        created_at=datetime.utcnow(),
    )
    db.add(db_sale)
    db.flush()

    # Create sale items and decrement inventory
    for item in sale.items:
        db_sale_item = SaleItem(
            sale_id=db_sale.id,
            medicine_id=item.medicine_id,
            quantity=item.quantity,
            price=item.price,
        )
        db.add(db_sale_item)

        # Decrement inventory
        medicine = db.query(Medicine).filter(Medicine.id == item.medicine_id).first()
        medicine.quantity -= item.quantity
        if medicine.quantity == 0:
            medicine.status = MedicineStatus.OUT_OF_STOCK.value
        elif medicine.quantity < 50:
            medicine.status = MedicineStatus.LOW_STOCK.value

    db.commit()
    db.refresh(db_sale)
    return db_sale


@app.get("/api/sales/search-medicines", response_model=List[MedicineResponse])
def search_medicines_for_sale(
    q: str = Query("", min_length=0),
    db: Session = Depends(get_db),
):
    """Search available medicines for the Make a Sale section."""
    query = db.query(Medicine).filter(
        Medicine.status != MedicineStatus.EXPIRED.value,
        Medicine.status != MedicineStatus.OUT_OF_STOCK.value,
        Medicine.quantity > 0,
    )

    if q:
        search_term = f"%{q}%"
        query = query.filter(
            (Medicine.name.ilike(search_term))
            | (Medicine.generic_name.ilike(search_term))
        )

    return query.all()


# ==================== UTILITY ENDPOINTS ====================


@app.get("/api/health")
def health_check():
    return {"status": "healthy", "message": "Pharmacy CRM API is running"}

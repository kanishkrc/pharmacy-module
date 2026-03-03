from sqlalchemy.orm import Session
from models import Medicine, Sale, SaleItem, PurchaseOrder, MedicineStatus
from datetime import date, datetime


def seed_database(db: Session):
    """Seed the database with sample data matching the reference images."""

    # Check if data already exists
    if db.query(Medicine).first():
        return

    # --- Seed Medicines ---
    medicines = [
        Medicine(
            name="Paracetamol 650mg",
            generic_name="Acetaminophen",
            category="Analgesic",
            batch_no="PCM-2024-0892",
            expiry_date=date(2026, 8, 20),
            quantity=500,
            cost_price=15.00,
            mrp=25.00,
            supplier="MedSupply Co.",
            status=MedicineStatus.ACTIVE.value,
        ),
        Medicine(
            name="Omeprazole 20mg Capsule",
            generic_name="Omeprazole",
            category="Gastric",
            batch_no="OMP-2024-5873",
            expiry_date=date(2025, 11, 10),
            quantity=45,
            cost_price=65.00,
            mrp=95.75,
            supplier="HealthCare Ltd.",
            status=MedicineStatus.LOW_STOCK.value,
        ),
        Medicine(
            name="Aspirin 75mg",
            generic_name="Aspirin",
            category="Anticoagulant",
            batch_no="ASP-2023-3401",
            expiry_date=date(2024, 9, 30),
            quantity=300,
            cost_price=28.00,
            mrp=45.00,
            supplier="GreenMed",
            status=MedicineStatus.EXPIRED.value,
        ),
        Medicine(
            name="Atorvastatin 10mg",
            generic_name="Atorvastatin Besylate",
            category="Cardiovascular",
            batch_no="AME-2024-0945",
            expiry_date=date(2025, 10, 15),
            quantity=0,
            cost_price=145.00,
            mrp=195.00,
            supplier="PharmaCorp",
            status=MedicineStatus.OUT_OF_STOCK.value,
        ),
        Medicine(
            name="Amoxicillin 500mg",
            generic_name="Amoxicillin",
            category="Antibiotic",
            batch_no="AMX-2024-1122",
            expiry_date=date(2026, 3, 15),
            quantity=200,
            cost_price=35.00,
            mrp=55.00,
            supplier="MedSupply Co.",
            status=MedicineStatus.ACTIVE.value,
        ),
        Medicine(
            name="Metformin 500mg",
            generic_name="Metformin HCl",
            category="Antidiabetic",
            batch_no="MET-2024-7789",
            expiry_date=date(2026, 6, 20),
            quantity=350,
            cost_price=18.00,
            mrp=30.00,
            supplier="HealthCare Ltd.",
            status=MedicineStatus.ACTIVE.value,
        ),
        Medicine(
            name="Cetirizine 10mg",
            generic_name="Cetirizine HCl",
            category="Antihistamine",
            batch_no="CET-2024-3345",
            expiry_date=date(2026, 1, 10),
            quantity=40,
            cost_price=12.00,
            mrp=20.00,
            supplier="GreenMed",
            status=MedicineStatus.LOW_STOCK.value,
        ),
        Medicine(
            name="Ibuprofen 400mg",
            generic_name="Ibuprofen",
            category="Analgesic",
            batch_no="IBU-2024-9901",
            expiry_date=date(2026, 5, 25),
            quantity=180,
            cost_price=22.00,
            mrp=38.00,
            supplier="PharmaCorp",
            status=MedicineStatus.ACTIVE.value,
        ),
        Medicine(
            name="Pantoprazole 40mg",
            generic_name="Pantoprazole Sodium",
            category="Gastric",
            batch_no="PAN-2024-6654",
            expiry_date=date(2026, 9, 30),
            quantity=120,
            cost_price=55.00,
            mrp=85.00,
            supplier="MedSupply Co.",
            status=MedicineStatus.ACTIVE.value,
        ),
        Medicine(
            name="Losartan 50mg",
            generic_name="Losartan Potassium",
            category="Cardiovascular",
            batch_no="LOS-2024-2210",
            expiry_date=date(2025, 12, 31),
            quantity=30,
            cost_price=72.00,
            mrp=110.00,
            supplier="HealthCare Ltd.",
            status=MedicineStatus.LOW_STOCK.value,
        ),
    ]

    db.add_all(medicines)
    db.flush()

    # --- Seed Sales ---
    sales = [
        Sale(
            invoice_no="INV-2024-1234",
            patient_name="Rajesh Kumar",
            items_count=3,
            payment_method="Card",
            total_amount=340.00,
            status="Completed",
            created_at=datetime(2024, 11, 1, 10, 30, 0),
        ),
        Sale(
            invoice_no="INV-2024-1235",
            patient_name="Sarah Smith",
            items_count=2,
            payment_method="Cash",
            total_amount=145.00,
            status="Completed",
            created_at=datetime(2024, 11, 1, 11, 0, 0),
        ),
        Sale(
            invoice_no="INV-2024-1236",
            patient_name="Michael Johnson",
            items_count=5,
            payment_method="UPI",
            total_amount=625.00,
            status="Completed",
            created_at=datetime(2024, 11, 1, 14, 30, 0),
        ),
        Sale(
            invoice_no="INV-2024-1237",
            patient_name="Priya Sharma",
            items_count=1,
            payment_method="Cash",
            total_amount=95.75,
            status="Completed",
            created_at=datetime(2024, 11, 2, 9, 15, 0),
        ),
        Sale(
            invoice_no="INV-2024-1238",
            patient_name="David Wilson",
            items_count=4,
            payment_method="Card",
            total_amount=480.00,
            status="Completed",
            created_at=datetime(2024, 11, 2, 16, 45, 0),
        ),
    ]

    db.add_all(sales)
    db.flush()

    # --- Seed Sale Items ---
    sale_items = [
        SaleItem(sale_id=sales[0].id, medicine_id=medicines[0].id, quantity=2, price=50.00),
        SaleItem(sale_id=sales[0].id, medicine_id=medicines[4].id, quantity=1, price=55.00),
        SaleItem(sale_id=sales[0].id, medicine_id=medicines[7].id, quantity=3, price=114.00),
        SaleItem(sale_id=sales[1].id, medicine_id=medicines[0].id, quantity=3, price=75.00),
        SaleItem(sale_id=sales[1].id, medicine_id=medicines[6].id, quantity=1, price=20.00),
        SaleItem(sale_id=sales[2].id, medicine_id=medicines[5].id, quantity=2, price=60.00),
        SaleItem(sale_id=sales[2].id, medicine_id=medicines[8].id, quantity=1, price=85.00),
        SaleItem(sale_id=sales[2].id, medicine_id=medicines[4].id, quantity=2, price=110.00),
        SaleItem(sale_id=sales[2].id, medicine_id=medicines[0].id, quantity=5, price=125.00),
        SaleItem(sale_id=sales[2].id, medicine_id=medicines[7].id, quantity=2, price=76.00),
    ]

    db.add_all(sale_items)

    # --- Seed Purchase Orders ---
    purchase_orders = [
        PurchaseOrder(
            order_no="PO-2024-001",
            supplier="MedSupply Co.",
            total_amount=25000.00,
            status="Completed",
            created_at=datetime(2024, 10, 28, 10, 0, 0),
        ),
        PurchaseOrder(
            order_no="PO-2024-002",
            supplier="HealthCare Ltd.",
            total_amount=18750.00,
            status="Completed",
            created_at=datetime(2024, 10, 30, 14, 0, 0),
        ),
        PurchaseOrder(
            order_no="PO-2024-003",
            supplier="GreenMed",
            total_amount=12500.00,
            status="Pending",
            created_at=datetime(2024, 11, 1, 9, 0, 0),
        ),
        PurchaseOrder(
            order_no="PO-2024-004",
            supplier="PharmaCorp",
            total_amount=22000.00,
            status="Pending",
            created_at=datetime(2024, 11, 2, 11, 30, 0),
        ),
        PurchaseOrder(
            order_no="PO-2024-005",
            supplier="MedSupply Co.",
            total_amount=18000.00,
            status="Pending",
            created_at=datetime(2024, 11, 3, 8, 0, 0),
        ),
    ]

    db.add_all(purchase_orders)
    db.commit()
    print("Database seeded successfully!")

# Pharmacy Module — EMR Feature Implementation

A simplified Pharmacy Module for the SwasthiQ EMR system with Dashboard (Sales Overview) and Inventory pages.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | Python, FastAPI, SQLAlchemy, SQLite |
| Frontend | React (Vite), React Router, Axios |

## Project Structure

```
pharmacy/
├── backend/
│   ├── main.py          # FastAPI app & endpoints
│   ├── models.py        # SQLAlchemy models
│   ├── schemas.py       # Pydantic request/response models
│   ├── database.py      # DB engine & session
│   ├── seed_data.py     # Sample data seeder
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── components/  # Sidebar, TopBar, SummaryCards, etc.
│   │   ├── pages/       # Dashboard.jsx, Inventory.jsx
│   │   ├── services/    # api.js (Axios client)
│   │   ├── App.jsx      # Router setup
│   │   └── main.jsx     # Entry point
│   ├── index.html
│   └── package.json
└── README.md
```

## Setup & Run

### Backend

```bash
cd backend
py -m pip install -r requirements.txt
py -m uvicorn main:app --reload --port 8000
```

The API will be available at `http://localhost:8000`. The database is auto-created and seeded on first run.

### Frontend

```bash
cd frontend
npm install
npm run dev
```

The app will be available at `http://localhost:5173`.

## REST API Contracts

### Dashboard

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/dashboard/summary` | Today's sales, items sold, low stock count, purchase order totals |
| `GET` | `/api/dashboard/recent-sales?limit=10` | Recent sales with invoice details |

#### GET `/api/dashboard/summary` — Response
```json
{
  "todays_sales": 1685.75,
  "sales_growth": 12.5,
  "items_sold_today": 15,
  "total_orders": 5,
  "low_stock_count": 3,
  "purchase_orders_total": 96250.0,
  "pending_orders": 3
}
```

### Inventory

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/inventory/overview` | Total items, active stock, low stock, total value |
| `GET` | `/api/inventory/medicines?search=&status=&category=` | List/filter/search medicines |
| `POST` | `/api/inventory/medicines` | Add new medicine |
| `PUT` | `/api/inventory/medicines/{id}` | Update medicine details |
| `PATCH` | `/api/inventory/medicines/{id}/status` | Change medicine status |

#### POST `/api/inventory/medicines` — Request
```json
{
  "name": "Paracetamol 500mg",
  "generic_name": "Acetaminophen",
  "category": "Analgesic",
  "batch_no": "PCM-2025-0001",
  "expiry_date": "2027-01-15",
  "quantity": 100,
  "cost_price": 12.00,
  "mrp": 20.00,
  "supplier": "MedSupply Co."
}
```

### Sales

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/sales` | Create a sale (auto-decrements inventory) |
| `GET` | `/api/sales/search-medicines?q=` | Search available medicines for sale |

#### POST `/api/sales` — Request
```json
{
  "patient_name": "John Doe",
  "payment_method": "Cash",
  "items": [
    { "medicine_id": 1, "quantity": 2, "price": 50.00 }
  ]
}
```

### Data Consistency & How Python Functions Ensure Integrity

The backend enforces data consistency through several mechanisms built into the Python/FastAPI functions:

#### 1. Transactional Sales with Inventory Decrement
When `POST /api/sales` is called, the `create_sale()` function:
- **Validates** all medicine IDs exist and have sufficient stock before any changes
- **Blocks expired medicines** from being sold (returns `400 Bad Request`)
- **Atomically decrements** each medicine's quantity within a single SQLAlchemy session
- **Auto-updates status**: if `quantity == 0` → "Out of Stock", if `quantity < 50` → "Low Stock"
- Only calls `db.commit()` after all items are processed — if any item fails validation, the entire sale is rolled back

#### 2. Auto-Status Management on Update
When `PUT /api/inventory/medicines/{id}` is called, the `update_medicine()` function:
- Checks if `quantity` or `expiry_date` was changed in the update
- Automatically recalculates status: `qty == 0` → Out of Stock, `qty < 50` → Low Stock, `qty >= 50` → Active
- Expired medicines (expiry < today) are marked "Expired" regardless of quantity
- This ensures status is always consistent with the underlying data

#### 3. Unique Constraints & Validation
- **Batch numbers** are unique at the DB level — `POST /api/inventory/medicines` rejects duplicates with `400`
- **Pydantic models** validate all request payloads (types, required fields) before they reach the database
- All responses use structured Pydantic `response_model` schemas for consistent JSON output

#### 4. Status Override via PATCH
`PATCH /api/inventory/medicines/{id}/status` allows manual status changes (e.g., marking "Expired" or "Out of Stock") with validation that only valid status values are accepted.

## Validation & Error Handling

All endpoints return structured JSON errors:

```json
{
  "detail": "Insufficient stock for Paracetamol 500mg. Available: 10"
}
```

HTTP status codes: `200` (OK), `201` (Created), `400` (Bad Request), `404` (Not Found).

## Deployment

### Backend (e.g., Render / Railway)
```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --host 0.0.0.0 --port 8000
```

### Frontend (e.g., Vercel / Netlify)
Update `API_BASE_URL` in `frontend/src/services/api.js` to point to your deployed backend URL, then:
```bash
cd frontend
npm install
npm run build
# Deploy the `dist/` folder
```

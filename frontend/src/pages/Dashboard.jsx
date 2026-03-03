import { useState, useEffect } from 'react';
import { Search, ShoppingCart } from 'lucide-react';
import TopBar from '../components/TopBar';
import SummaryCards from '../components/SummaryCards';
import TabNav from '../components/TabNav';
import StatusBadge from '../components/StatusBadge';
import { getDashboardSummary, getRecentSales, searchMedicinesForSale, createSale } from '../services/api';
import './Dashboard.css';

function Dashboard() {
    const [summary, setSummary] = useState(null);
    const [recentSales, setRecentSales] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Make a Sale state
    const [patientId, setPatientId] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [selectedItems, setSelectedItems] = useState([]);
    const [saleLoading, setSaleLoading] = useState(false);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [summaryRes, salesRes] = await Promise.all([
                getDashboardSummary(),
                getRecentSales(),
            ]);
            setSummary(summaryRes.data);
            setRecentSales(salesRes.data);
            setError(null);
        } catch (err) {
            setError('Failed to load dashboard data. Please ensure the backend is running.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleSearchMedicine = async () => {
        if (!searchQuery.trim()) return;
        try {
            const res = await searchMedicinesForSale(searchQuery);
            setSearchResults(res.data);
        } catch (err) {
            console.error('Search failed:', err);
        }
    };

    const handleAddToSale = (medicine) => {
        if (selectedItems.find(item => item.medicine_id === medicine.id)) return;
        setSelectedItems([...selectedItems, {
            medicine_id: medicine.id,
            name: medicine.name,
            generic_name: medicine.generic_name,
            batch_no: medicine.batch_no,
            expiry_date: medicine.expiry_date,
            quantity: 1,
            mrp: medicine.mrp,
            supplier: medicine.supplier,
            status: medicine.status,
            price: medicine.mrp,
        }]);
    };

    const handleRemoveItem = (medicineId) => {
        setSelectedItems(selectedItems.filter(item => item.medicine_id !== medicineId));
    };

    const handleQuantityChange = (medicineId, qty) => {
        setSelectedItems(selectedItems.map(item =>
            item.medicine_id === medicineId
                ? { ...item, quantity: parseInt(qty) || 1, price: (parseInt(qty) || 1) * item.mrp }
                : item
        ));
    };

    const handleCreateBill = async () => {
        if (!patientId.trim() || selectedItems.length === 0) return;
        try {
            setSaleLoading(true);
            await createSale({
                patient_name: patientId,
                payment_method: 'Cash',
                items: selectedItems.map(item => ({
                    medicine_id: item.medicine_id,
                    quantity: item.quantity,
                    price: item.price,
                })),
            });
            setPatientId('');
            setSelectedItems([]);
            setSearchResults([]);
            setSearchQuery('');
            fetchData();
        } catch (err) {
            alert(err.response?.data?.detail || 'Failed to create sale');
        } finally {
            setSaleLoading(false);
        }
    };

    const formatDate = (dateStr) => {
        const d = new Date(dateStr);
        return d.toISOString().split('T')[0];
    };

    if (error) {
        return (
            <div className="page-content">
                <TopBar onAddMedicine={() => { }} />
                <div className="error-state">
                    <p>{error}</p>
                    <button className="btn btn-primary" onClick={fetchData}>Retry</button>
                </div>
            </div>
        );
    }

    return (
        <div className="page-content">
            <TopBar onAddMedicine={() => { }} />
            <SummaryCards data={summary} loading={loading} />
            <TabNav onNewSale={() => { }} onNewPurchase={() => { }} />

            {/* Make a Sale Section */}
            <div className="section-card">
                <h3 className="section-title">Make a Sale</h3>
                <p className="section-subtitle">Select medicines from inventory</p>

                <div className="sale-search-row">
                    <div className="input-group">
                        <input
                            type="text"
                            placeholder="Patient Id"
                            value={patientId}
                            onChange={(e) => setPatientId(e.target.value)}
                            className="input"
                        />
                    </div>
                    <div className="input-group search-input-group">
                        <Search size={16} className="input-icon" />
                        <input
                            type="text"
                            placeholder="Search medicines..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSearchMedicine()}
                            className="input input-with-icon"
                        />
                    </div>
                    <button className="btn btn-success" onClick={handleSearchMedicine}>
                        Enter
                    </button>
                    <div style={{ flex: 1 }} />
                    <button
                        className="btn btn-danger"
                        onClick={handleCreateBill}
                        disabled={saleLoading || selectedItems.length === 0}
                    >
                        Bill
                    </button>
                </div>

                {/* Search results dropdown */}
                {searchResults.length > 0 && (
                    <div className="search-results-dropdown">
                        {searchResults.map((med) => (
                            <div
                                key={med.id}
                                className="search-result-item"
                                onClick={() => handleAddToSale(med)}
                            >
                                <span className="search-result-name">{med.name}</span>
                                <span className="search-result-generic">{med.generic_name}</span>
                                <span className="search-result-price">₹{med.mrp}</span>
                                <span className="search-result-qty">Qty: {med.quantity}</span>
                            </div>
                        ))}
                    </div>
                )}

                {/* Selected items table */}
                <div className="table-wrapper">
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>MEDICINE NAME</th>
                                <th>GENERIC NAME</th>
                                <th>BATCH NO</th>
                                <th>EXPIRY DATE</th>
                                <th>QUANTITY</th>
                                <th>MRP / PRICE</th>
                                <th>SUPPLIER</th>
                                <th>STATUS</th>
                                <th>ACTIONS</th>
                            </tr>
                        </thead>
                        <tbody>
                            {selectedItems.length === 0 ? (
                                <tr>
                                    <td colSpan="9" className="empty-row">
                                        Search and add medicines to create a sale
                                    </td>
                                </tr>
                            ) : (
                                selectedItems.map((item) => (
                                    <tr key={item.medicine_id}>
                                        <td className="td-bold">{item.name}</td>
                                        <td>{item.generic_name}</td>
                                        <td>{item.batch_no}</td>
                                        <td>{item.expiry_date}</td>
                                        <td>
                                            <input
                                                type="number"
                                                min="1"
                                                value={item.quantity}
                                                onChange={(e) => handleQuantityChange(item.medicine_id, e.target.value)}
                                                className="qty-input"
                                            />
                                        </td>
                                        <td>₹{item.price.toFixed(2)}</td>
                                        <td>{item.supplier}</td>
                                        <td><StatusBadge status={item.status} /></td>
                                        <td>
                                            <button
                                                className="btn btn-outline btn-sm"
                                                onClick={() => handleRemoveItem(item.medicine_id)}
                                            >
                                                Remove
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Recent Sales */}
            <div className="recent-sales">
                <h3 className="section-title">Recent Sales</h3>
                {loading ? (
                    <div className="loading-state">Loading...</div>
                ) : (
                    <div className="sales-list">
                        {recentSales.map((sale) => (
                            <div key={sale.id} className="sale-card">
                                <div className="sale-card-left">
                                    <div className="sale-icon">
                                        <ShoppingCart size={18} color="#10b981" />
                                    </div>
                                    <div className="sale-info">
                                        <div className="sale-invoice">{sale.invoice_no}</div>
                                        <div className="sale-details">
                                            {sale.patient_name} • {sale.items_count} items •{' '}
                                            {sale.payment_method}
                                        </div>
                                    </div>
                                </div>
                                <div className="sale-card-right">
                                    <div className="sale-amount">₹{sale.total_amount.toLocaleString('en-IN')}</div>
                                    <div className="sale-date">{formatDate(sale.created_at)}</div>
                                </div>
                                <StatusBadge status={sale.status} />
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

export default Dashboard;

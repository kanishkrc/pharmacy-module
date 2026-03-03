import { useState, useEffect, useCallback } from 'react';
import { Search, Filter, Download, Package, CheckCircle, AlertTriangle, DollarSign, Pencil } from 'lucide-react';
import TopBar from '../components/TopBar';
import SummaryCards from '../components/SummaryCards';
import TabNav from '../components/TabNav';
import StatusBadge from '../components/StatusBadge';
import AddMedicineModal from '../components/AddMedicineModal';
import EditMedicineModal from '../components/EditMedicineModal';
import { getDashboardSummary, getInventoryOverview, getMedicines, updateMedicineStatus } from '../services/api';
import './Inventory.css';

function Inventory() {
    const [summary, setSummary] = useState(null);
    const [overview, setOverview] = useState(null);
    const [medicines, setMedicines] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [editingMedicine, setEditingMedicine] = useState(null);
    const [showFilterDropdown, setShowFilterDropdown] = useState(false);

    const fetchData = useCallback(async () => {
        try {
            setLoading(true);
            const [summaryRes, overviewRes, medsRes] = await Promise.all([
                getDashboardSummary(),
                getInventoryOverview(),
                getMedicines({ search: searchQuery || undefined, status: statusFilter || undefined }),
            ]);
            setSummary(summaryRes.data);
            setOverview(overviewRes.data);
            setMedicines(medsRes.data);
            setError(null);
        } catch (err) {
            setError('Failed to load inventory data. Please ensure the backend is running.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, [searchQuery, statusFilter]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleSearch = (e) => {
        setSearchQuery(e.target.value);
    };

    const handleFilterStatus = (status) => {
        setStatusFilter(status === statusFilter ? '' : status);
        setShowFilterDropdown(false);
    };

    const handleEditMedicine = (medicine) => {
        setEditingMedicine(medicine);
        setShowEditModal(true);
    };

    const handleStatusChange = async (medicineId, newStatus) => {
        try {
            await updateMedicineStatus(medicineId, newStatus);
            fetchData();
        } catch (err) {
            alert(err.response?.data?.detail || 'Failed to update status');
        }
    };

    if (error) {
        return (
            <div className="page-content">
                <TopBar onAddMedicine={() => setShowAddModal(true)} />
                <div className="error-state">
                    <p>{error}</p>
                    <button className="btn btn-primary" onClick={fetchData}>Retry</button>
                </div>
            </div>
        );
    }

    return (
        <div className="page-content">
            <TopBar onAddMedicine={() => setShowAddModal(true)} />
            <SummaryCards data={summary} loading={loading} />
            <TabNav onNewSale={() => { }} onNewPurchase={() => { }} />

            {/* Inventory Overview */}
            <div className="section-card">
                <h3 className="section-title">Inventory Overview</h3>
                {overview && (
                    <div className="inventory-overview-cards">
                        <div className="overview-card">
                            <div className="overview-card-top">
                                <span className="overview-label">Total Items</span>
                                <Package size={18} className="overview-icon icon-blue" />
                            </div>
                            <div className="overview-value">{overview.total_items}</div>
                        </div>
                        <div className="overview-card">
                            <div className="overview-card-top">
                                <span className="overview-label">Active Stock</span>
                                <CheckCircle size={18} className="overview-icon icon-green" />
                            </div>
                            <div className="overview-value">{overview.active_stock}</div>
                        </div>
                        <div className="overview-card">
                            <div className="overview-card-top">
                                <span className="overview-label">Low Stock</span>
                                <AlertTriangle size={18} className="overview-icon icon-orange" />
                            </div>
                            <div className="overview-value">{overview.low_stock}</div>
                        </div>
                        <div className="overview-card">
                            <div className="overview-card-top">
                                <span className="overview-label">Total Value</span>
                                <DollarSign size={18} className="overview-icon icon-purple" />
                            </div>
                            <div className="overview-value">₹{Number(overview.total_value).toLocaleString('en-IN')}</div>
                        </div>
                    </div>
                )}
            </div>

            {/* Complete Inventory */}
            <div className="inventory-header">
                <h3 className="section-title">Complete Inventory</h3>
                <div className="inventory-actions">
                    <div className="filter-container">
                        <button
                            className="btn btn-outline btn-sm"
                            onClick={() => setShowFilterDropdown(!showFilterDropdown)}
                        >
                            <Filter size={14} />
                            Filter
                            {statusFilter && <span className="active-filter-dot" />}
                        </button>
                        {showFilterDropdown && (
                            <div className="filter-dropdown">
                                <button className={`filter-option ${statusFilter === '' ? 'active' : ''}`} onClick={() => handleFilterStatus('')}>All</button>
                                <button className={`filter-option ${statusFilter === 'Active' ? 'active' : ''}`} onClick={() => handleFilterStatus('Active')}>Active</button>
                                <button className={`filter-option ${statusFilter === 'Low Stock' ? 'active' : ''}`} onClick={() => handleFilterStatus('Low Stock')}>Low Stock</button>
                                <button className={`filter-option ${statusFilter === 'Expired' ? 'active' : ''}`} onClick={() => handleFilterStatus('Expired')}>Expired</button>
                                <button className={`filter-option ${statusFilter === 'Out of Stock' ? 'active' : ''}`} onClick={() => handleFilterStatus('Out of Stock')}>Out of Stock</button>
                            </div>
                        )}
                    </div>
                    <button className="btn btn-outline btn-sm">
                        <Download size={14} />
                        Export
                    </button>
                </div>
            </div>

            <div className="search-bar">
                <Search size={16} className="search-bar-icon" />
                <input
                    type="text"
                    placeholder="Search medicines by name, generic name, batch no, or supplier..."
                    value={searchQuery}
                    onChange={handleSearch}
                    className="search-bar-input"
                />
            </div>

            <div className="table-wrapper">
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>MEDICINE NAME</th>
                            <th>GENERIC NAME</th>
                            <th>CATEGORY</th>
                            <th>BATCH NO</th>
                            <th>EXPIRY DATE</th>
                            <th>QUANTITY</th>
                            <th>COST PRICE</th>
                            <th>MRP</th>
                            <th>SUPPLIER</th>
                            <th>STATUS</th>
                            <th>ACTIONS</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr>
                                <td colSpan="11" className="empty-row">Loading medicines...</td>
                            </tr>
                        ) : medicines.length === 0 ? (
                            <tr>
                                <td colSpan="11" className="empty-row">No medicines found</td>
                            </tr>
                        ) : (
                            medicines.map((med) => (
                                <tr key={med.id}>
                                    <td className="td-bold">{med.name}</td>
                                    <td>{med.generic_name}</td>
                                    <td>{med.category}</td>
                                    <td>{med.batch_no}</td>
                                    <td>{med.expiry_date}</td>
                                    <td>
                                        <span className={med.quantity < 50 && med.quantity > 0 ? 'qty-warning' : med.quantity === 0 ? 'qty-danger' : ''}>
                                            {med.quantity}
                                        </span>
                                    </td>
                                    <td>₹{med.cost_price.toFixed(2)}</td>
                                    <td>₹{med.mrp.toFixed(2)}</td>
                                    <td>{med.supplier}</td>
                                    <td><StatusBadge status={med.status} /></td>
                                    <td>
                                        <div className="action-buttons">
                                            <button
                                                className="btn btn-outline btn-sm"
                                                onClick={() => handleEditMedicine(med)}
                                                title="Edit medicine"
                                            >
                                                <Pencil size={13} />
                                                Edit
                                            </button>
                                            {med.status !== 'Expired' && (
                                                <button
                                                    className="btn btn-outline btn-sm btn-warn"
                                                    onClick={() => handleStatusChange(med.id, 'Expired')}
                                                >
                                                    Mark Expired
                                                </button>
                                            )}
                                            {med.status !== 'Out of Stock' && (
                                                <button
                                                    className="btn btn-outline btn-sm btn-muted"
                                                    onClick={() => handleStatusChange(med.id, 'Out of Stock')}
                                                >
                                                    Mark OOS
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            <AddMedicineModal
                isOpen={showAddModal}
                onClose={() => setShowAddModal(false)}
                onSuccess={fetchData}
            />

            <EditMedicineModal
                isOpen={showEditModal}
                onClose={() => { setShowEditModal(false); setEditingMedicine(null); }}
                onSuccess={fetchData}
                medicine={editingMedicine}
            />
        </div>
    );
}

export default Inventory;

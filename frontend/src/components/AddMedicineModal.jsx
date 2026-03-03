import { useState } from 'react';
import { X } from 'lucide-react';
import { createMedicine } from '../services/api';
import './AddMedicineModal.css';

function AddMedicineModal({ isOpen, onClose, onSuccess }) {
    const [form, setForm] = useState({
        name: '',
        generic_name: '',
        category: '',
        batch_no: '',
        expiry_date: '',
        quantity: '',
        cost_price: '',
        mrp: '',
        supplier: '',
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    if (!isOpen) return null;

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        // Validate
        for (const key of Object.keys(form)) {
            if (!form[key]) {
                setError(`Please fill in ${key.replace(/_/g, ' ')}`);
                return;
            }
        }

        try {
            setLoading(true);
            await createMedicine({
                ...form,
                quantity: parseInt(form.quantity),
                cost_price: parseFloat(form.cost_price),
                mrp: parseFloat(form.mrp),
            });
            setForm({
                name: '', generic_name: '', category: '', batch_no: '',
                expiry_date: '', quantity: '', cost_price: '', mrp: '', supplier: '',
            });
            onSuccess();
            onClose();
        } catch (err) {
            setError(err.response?.data?.detail || 'Failed to add medicine');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2 className="modal-title">Add New Medicine</h2>
                    <button className="modal-close" onClick={onClose}>
                        <X size={20} />
                    </button>
                </div>

                {error && <div className="modal-error">{error}</div>}

                <form onSubmit={handleSubmit} className="modal-form">
                    <div className="form-grid">
                        <div className="form-group">
                            <label>Medicine Name</label>
                            <input name="name" value={form.name} onChange={handleChange} className="input" placeholder="e.g. Paracetamol 500mg" />
                        </div>
                        <div className="form-group">
                            <label>Generic Name</label>
                            <input name="generic_name" value={form.generic_name} onChange={handleChange} className="input" placeholder="e.g. Acetaminophen" />
                        </div>
                        <div className="form-group">
                            <label>Category</label>
                            <input name="category" value={form.category} onChange={handleChange} className="input" placeholder="e.g. Analgesic" />
                        </div>
                        <div className="form-group">
                            <label>Batch No</label>
                            <input name="batch_no" value={form.batch_no} onChange={handleChange} className="input" placeholder="e.g. PCM-2024-1234" />
                        </div>
                        <div className="form-group">
                            <label>Expiry Date</label>
                            <input name="expiry_date" type="date" value={form.expiry_date} onChange={handleChange} className="input" />
                        </div>
                        <div className="form-group">
                            <label>Quantity</label>
                            <input name="quantity" type="number" min="0" value={form.quantity} onChange={handleChange} className="input" placeholder="0" />
                        </div>
                        <div className="form-group">
                            <label>Cost Price (₹)</label>
                            <input name="cost_price" type="number" step="0.01" min="0" value={form.cost_price} onChange={handleChange} className="input" placeholder="0.00" />
                        </div>
                        <div className="form-group">
                            <label>MRP (₹)</label>
                            <input name="mrp" type="number" step="0.01" min="0" value={form.mrp} onChange={handleChange} className="input" placeholder="0.00" />
                        </div>
                        <div className="form-group full-width">
                            <label>Supplier</label>
                            <input name="supplier" value={form.supplier} onChange={handleChange} className="input" placeholder="e.g. MedSupply Co." />
                        </div>
                    </div>

                    <div className="modal-actions">
                        <button type="button" className="btn btn-outline" onClick={onClose}>Cancel</button>
                        <button type="submit" className="btn btn-primary" disabled={loading}>
                            {loading ? 'Adding...' : 'Add Medicine'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default AddMedicineModal;

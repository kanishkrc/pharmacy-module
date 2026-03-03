import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { updateMedicine } from '../services/api';
import './AddMedicineModal.css';

function EditMedicineModal({ isOpen, onClose, onSuccess, medicine }) {
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

    useEffect(() => {
        if (medicine) {
            setForm({
                name: medicine.name || '',
                generic_name: medicine.generic_name || '',
                category: medicine.category || '',
                batch_no: medicine.batch_no || '',
                expiry_date: medicine.expiry_date || '',
                quantity: medicine.quantity?.toString() || '',
                cost_price: medicine.cost_price?.toString() || '',
                mrp: medicine.mrp?.toString() || '',
                supplier: medicine.supplier || '',
            });
        }
    }, [medicine]);

    if (!isOpen || !medicine) return null;

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        for (const key of Object.keys(form)) {
            if (!form[key] && form[key] !== 0) {
                setError(`Please fill in ${key.replace(/_/g, ' ')}`);
                return;
            }
        }

        try {
            setLoading(true);
            await updateMedicine(medicine.id, {
                ...form,
                quantity: parseInt(form.quantity),
                cost_price: parseFloat(form.cost_price),
                mrp: parseFloat(form.mrp),
            });
            onSuccess();
            onClose();
        } catch (err) {
            setError(err.response?.data?.detail || 'Failed to update medicine');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2 className="modal-title">Edit Medicine</h2>
                    <button className="modal-close" onClick={onClose}>
                        <X size={20} />
                    </button>
                </div>

                {error && <div className="modal-error">{error}</div>}

                <form onSubmit={handleSubmit} className="modal-form">
                    <div className="form-grid">
                        <div className="form-group">
                            <label>Medicine Name</label>
                            <input name="name" value={form.name} onChange={handleChange} className="input" />
                        </div>
                        <div className="form-group">
                            <label>Generic Name</label>
                            <input name="generic_name" value={form.generic_name} onChange={handleChange} className="input" />
                        </div>
                        <div className="form-group">
                            <label>Category</label>
                            <input name="category" value={form.category} onChange={handleChange} className="input" />
                        </div>
                        <div className="form-group">
                            <label>Batch No</label>
                            <input name="batch_no" value={form.batch_no} onChange={handleChange} className="input" />
                        </div>
                        <div className="form-group">
                            <label>Expiry Date</label>
                            <input name="expiry_date" type="date" value={form.expiry_date} onChange={handleChange} className="input" />
                        </div>
                        <div className="form-group">
                            <label>Quantity</label>
                            <input name="quantity" type="number" min="0" value={form.quantity} onChange={handleChange} className="input" />
                        </div>
                        <div className="form-group">
                            <label>Cost Price (₹)</label>
                            <input name="cost_price" type="number" step="0.01" min="0" value={form.cost_price} onChange={handleChange} className="input" />
                        </div>
                        <div className="form-group">
                            <label>MRP (₹)</label>
                            <input name="mrp" type="number" step="0.01" min="0" value={form.mrp} onChange={handleChange} className="input" />
                        </div>
                        <div className="form-group full-width">
                            <label>Supplier</label>
                            <input name="supplier" value={form.supplier} onChange={handleChange} className="input" />
                        </div>
                    </div>

                    <div className="modal-actions">
                        <button type="button" className="btn btn-outline" onClick={onClose}>Cancel</button>
                        <button type="submit" className="btn btn-primary" disabled={loading}>
                            {loading ? 'Saving...' : 'Save Changes'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default EditMedicineModal;

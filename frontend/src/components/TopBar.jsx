import { Download, Plus } from 'lucide-react';
import './TopBar.css';

function TopBar({ onAddMedicine }) {
    return (
        <div className="topbar">
            <div className="topbar-left">
                <h1 className="topbar-title">Pharmacy CRM</h1>
                <p className="topbar-subtitle">Manage inventory, sales, and purchase orders</p>
            </div>
            <div className="topbar-actions">
                <button className="btn btn-outline">
                    <Download size={16} />
                    Export
                </button>
                <button className="btn btn-primary" onClick={onAddMedicine}>
                    <Plus size={16} />
                    Add Medicine
                </button>
            </div>
        </div>
    );
}

export default TopBar;

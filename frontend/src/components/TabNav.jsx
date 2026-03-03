import { useNavigate, useLocation } from 'react-router-dom';
import { ShoppingCart, Package, ClipboardList, Plus } from 'lucide-react';
import './TabNav.css';

function TabNav({ onNewSale, onNewPurchase }) {
    const navigate = useNavigate();
    const location = useLocation();

    const tabs = [
        { icon: ShoppingCart, label: 'Sales', path: '/' },
        { icon: ClipboardList, label: 'Purchase', path: '#purchase' },
        { icon: Package, label: 'Inventory', path: '/inventory' },
    ];

    return (
        <div className="tab-nav">
            <div className="tab-nav-tabs">
                {tabs.map((tab, index) => {
                    const Icon = tab.icon;
                    const isActive = tab.path === location.pathname;
                    return (
                        <button
                            key={index}
                            className={`tab-item ${isActive ? 'active' : ''}`}
                            onClick={() => {
                                if (tab.path.startsWith('/')) navigate(tab.path);
                            }}
                        >
                            <Icon size={16} />
                            {tab.label}
                        </button>
                    );
                })}
            </div>
            <div className="tab-nav-actions">
                <button className="btn btn-outline btn-sm" onClick={onNewSale}>
                    <Plus size={14} />
                    New Sale
                </button>
                <button className="btn btn-outline btn-sm" onClick={onNewPurchase}>
                    <Plus size={14} />
                    New Purchase
                </button>
            </div>
        </div>
    );
}

export default TabNav;

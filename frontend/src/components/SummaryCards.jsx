import { DollarSign, ShoppingCart, AlertTriangle, RefreshCw } from 'lucide-react';
import './SummaryCards.css';

function SummaryCards({ data, loading }) {
    if (loading) {
        return (
            <div className="summary-cards">
                {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="summary-card skeleton">
                        <div className="skeleton-content"></div>
                    </div>
                ))}
            </div>
        );
    }

    if (!data) return null;

    const cards = [
        {
            icon: DollarSign,
            iconBg: '#10b981',
            label: "Today's Sales",
            value: `₹${Number(data.todays_sales).toLocaleString('en-IN')}`,
            badge: `↗ ${data.sales_growth}%`,
            badgeClass: 'badge-green',
        },
        {
            icon: ShoppingCart,
            iconBg: '#3b82f6',
            label: 'Items Sold Today',
            value: data.items_sold_today,
            badge: `${data.total_orders} Orders`,
            badgeClass: 'badge-blue',
        },
        {
            icon: AlertTriangle,
            iconBg: '#f97316',
            label: 'Low Stock Items',
            value: data.low_stock_count,
            badge: 'Action Needed',
            badgeClass: 'badge-orange',
        },
        {
            icon: RefreshCw,
            iconBg: '#8b5cf6',
            label: 'Purchase Orders',
            value: `₹${Number(data.purchase_orders_total).toLocaleString('en-IN')}`,
            badge: `${data.pending_orders} Pending`,
            badgeClass: 'badge-purple',
        },
    ];

    return (
        <div className="summary-cards">
            {cards.map((card, index) => {
                const Icon = card.icon;
                return (
                    <div key={index} className="summary-card">
                        <div className="summary-card-header">
                            <div className="summary-card-icon" style={{ background: card.iconBg }}>
                                <Icon size={20} color="white" />
                            </div>
                            <span className={`summary-badge ${card.badgeClass}`}>{card.badge}</span>
                        </div>
                        <div className="summary-card-value">{card.value}</div>
                        <div className="summary-card-label">{card.label}</div>
                    </div>
                );
            })}
        </div>
    );
}

export default SummaryCards;

import { NavLink } from 'react-router-dom';
import {
    Search,
    LayoutGrid,
    TrendingUp,
    Package,
    Users,
    UserCircle,
    Link2,
    Plus,
    Sparkles,
    Settings,
} from 'lucide-react';
import './Sidebar.css';

const navItems = [
    { icon: Search, path: '#', label: 'Search' },
    { icon: LayoutGrid, path: '/', label: 'Dashboard' },
    { icon: TrendingUp, path: '#analytics', label: 'Analytics' },
    { icon: Package, path: '/inventory', label: 'Inventory' },
    { icon: Users, path: '#customers', label: 'Customers' },
    { icon: UserCircle, path: '#staff', label: 'Staff' },
    { icon: Link2, path: '#links', label: 'Links' },
    { icon: Plus, path: '#add', label: 'Add' },
    { icon: Sparkles, path: '#ai', label: 'AI' },
];

function Sidebar() {
    return (
        <aside className="sidebar">
            <nav className="sidebar-nav">
                {navItems.map((item, index) => {
                    const Icon = item.icon;
                    if (item.path === '/' || item.path === '/inventory') {
                        return (
                            <NavLink
                                key={index}
                                to={item.path}
                                className={({ isActive }) =>
                                    `sidebar-item ${isActive ? 'active' : ''}`
                                }
                                end={item.path === '/'}
                                title={item.label}
                            >
                                <Icon size={20} />
                            </NavLink>
                        );
                    }
                    return (
                        <button key={index} className="sidebar-item" title={item.label}>
                            <Icon size={20} />
                        </button>
                    );
                })}
            </nav>
            <div className="sidebar-bottom">
                <button className="sidebar-item" title="Settings">
                    <Settings size={20} />
                </button>
            </div>
        </aside>
    );
}

export default Sidebar;

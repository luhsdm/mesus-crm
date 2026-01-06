import React from 'react';
import { 
    RefreshCw, BarChart3, Calendar, LogOut, DollarSign, TrendingUp, 
    Target, Users, UserPlus, Trash2, XCircle, X, Save 
} from 'lucide-react';

const iconMap = {
    'refresh-cw': RefreshCw,
    'bar-chart-3': BarChart3,
    'calendar': Calendar,
    'log-out': LogOut,
    'dollar-sign': DollarSign,
    'trending-up': TrendingUp,
    'target': Target,
    'users': Users,
    'user-plus': UserPlus,
    'trash-2': Trash2,
    'x-circle': XCircle,
    'x': X,
    'save': Save
};

const Icon = ({ name, size = 24, className = "" }) => {
    const LucideIcon = iconMap[name];
    if (!LucideIcon) return null;
    return <LucideIcon size={size} className={className} strokeWidth={2} />;
};

export default Icon;
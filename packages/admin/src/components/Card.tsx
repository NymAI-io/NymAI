import type { ReactNode } from 'react';

interface StatCardProps {
    label: string;
    value: string | number;
    icon: string;
    trend?: {
        direction: 'up' | 'down';
        value: string;
    };
    color?: 'blue' | 'green' | 'orange' | 'red' | 'purple';
}

const COLORS = {
    blue: 'bg-blue-50 text-blue-700 border-blue-100',
    green: 'bg-green-50 text-green-700 border-green-100',
    orange: 'bg-orange-50 text-orange-700 border-orange-100',
    red: 'bg-red-50 text-red-700 border-red-100',
    purple: 'bg-purple-50 text-purple-700 border-purple-100',
};

export function StatCard({ label, value, icon, trend, color = 'blue' }: StatCardProps) {
    return (
        <div className={`p-6 rounded-xl border ${COLORS[color]}`}>
            <div className="flex items-center justify-between mb-4">
                <span className="text-2xl">{icon}</span>
                {trend && (
                    <span className={`text-xs font-medium ${trend.direction === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                        {trend.direction === 'up' ? '↑' : '↓'} {trend.value}
                    </span>
                )}
            </div>
            <p className="text-3xl font-bold mb-1">{value}</p>
            <p className="text-sm opacity-75">{label}</p>
        </div>
    );
}

interface CardProps {
    title?: string;
    children: ReactNode;
    className?: string;
}

export function Card({ title, children, className = '' }: CardProps) {
    return (
        <div className={`bg-white rounded-xl border border-gray-200 shadow-sm ${className}`}>
            {title && (
                <div className="px-6 py-4 border-b border-gray-100">
                    <h3 className="font-semibold text-gray-900">{title}</h3>
                </div>
            )}
            <div className="p-6">
                {children}
            </div>
        </div>
    );
}

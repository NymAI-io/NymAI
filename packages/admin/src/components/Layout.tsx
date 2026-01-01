import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/context';
import { Button } from '@/components/ui/button';
import type { ReactNode } from 'react';
import { LayoutDashboard, Settings, FileText, LogOut, Shield } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LayoutProps {
    children: ReactNode;
}

const NAV_ITEMS = [
    { path: '/', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/settings', label: 'Settings', icon: Settings },
    { path: '/logs', label: 'Logs', icon: FileText },
];

export function Layout({ children }: LayoutProps) {
    const location = useLocation();
    const { user, signOut } = useAuth();

    return (
        <div className="min-h-screen bg-background">
            {/* Header */}
            <header className="border-b">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <div className="flex items-center gap-3">
                            <Shield className="h-6 w-6 text-primary" />
                            <h1 className="text-xl font-bold">NymAI Admin</h1>
                        </div>
                        <div className="flex items-center gap-4">
                            <span className="text-sm text-muted-foreground">{user?.email}</span>
                            <Button variant="ghost" size="sm" onClick={signOut}>
                                <LogOut className="h-4 w-4 mr-2" />
                                Sign Out
                            </Button>
                        </div>
                    </div>
                </div>
            </header>

            <div className="flex">
                {/* Sidebar */}
                <nav className="w-64 border-r min-h-[calc(100vh-64px)]">
                    <div className="p-4 space-y-1">
                        {NAV_ITEMS.map((item) => {
                            const isActive = location.pathname === item.path;
                            const Icon = item.icon;
                            return (
                                <Link
                                    key={item.path}
                                    to={item.path}
                                    className={cn(
                                        "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors",
                                        isActive
                                            ? "bg-primary/10 text-primary"
                                            : "text-muted-foreground hover:bg-muted hover:text-foreground"
                                    )}
                                >
                                    <Icon className="h-5 w-5" />
                                    {item.label}
                                </Link>
                            );
                        })}
                    </div>
                </nav>

                {/* Main content */}
                <main className="flex-1 p-8">
                    <div className="max-w-5xl mx-auto">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}

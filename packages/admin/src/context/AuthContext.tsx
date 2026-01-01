import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { createClient, type User, type Session, type SupabaseClient } from '@supabase/supabase-js';

interface AuthContextType {
    user: User | null;
    session: Session | null;
    isLoading: boolean;
    signIn: () => Promise<void>;
    signOut: () => Promise<void>;
    workspaceId: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabasePublishableKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || '';

let supabase: SupabaseClient | null = null;

function getSupabaseClient(): SupabaseClient {
    if (!supabase) {
        supabase = createClient(supabaseUrl, supabasePublishableKey);
    }
    return supabase;
}

interface AuthProviderProps {
    children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
    const [user, setUser] = useState<User | null>(null);
    const [session, setSession] = useState<Session | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const supabase = getSupabaseClient();

        // Get initial session
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session);
            setUser(session?.user ?? null);
            setIsLoading(false);
        });

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session);
            setUser(session?.user ?? null);
            setIsLoading(false);
        });

        return () => subscription.unsubscribe();
    }, []);

    const signIn = async () => {
        const supabase = getSupabaseClient();
        await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo: window.location.origin,
            },
        });
    };

    const signOut = async () => {
        const supabase = getSupabaseClient();
        await supabase.auth.signOut();
    };

    // Extract workspace ID from user metadata or email domain
    const workspaceId = user?.user_metadata?.workspace_id ||
        (user?.email?.split('@')[1]?.split('.')[0]) ||
        null;

    return (
        <AuthContext.Provider value={{ user, session, isLoading, signIn, signOut, workspaceId }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth(): AuthContextType {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}

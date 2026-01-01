import { createClient, SupabaseClient } from '@supabase/supabase-js';

let supabaseClient: SupabaseClient | null = null;

/**
 * Get the Supabase client singleton.
 * Uses service key for server-side operations.
 * 
 * NOTE: We don't use Database generics here since they cause type issues
 * with dynamic table operations. Types are asserted at the route level.
 */
export function getSupabaseClient(): SupabaseClient {
    if (supabaseClient) {
        return supabaseClient;
    }

    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseSecretKey = process.env.SUPABASE_SECRET_KEY;

    if (!supabaseUrl || !supabaseSecretKey) {
        throw new Error(
            'Missing SUPABASE_URL or SUPABASE_SECRET_KEY environment variables'
        );
    }

    supabaseClient = createClient(supabaseUrl, supabaseSecretKey, {
        auth: {
            autoRefreshToken: false,
            persistSession: false,
        },
    });

    return supabaseClient;
}

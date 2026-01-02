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
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

    // Debug logging for env var issues
    if (!supabaseUrl || !supabaseServiceKey) {
        const details = {
            supabaseUrlDefined: !!supabaseUrl,
            supabaseUrlValue: supabaseUrl ? supabaseUrl.slice(0, 20) + '...' : 'undefined',
            supabaseServiceKeyDefined: !!supabaseServiceKey,
            supabaseServiceKeyValue: supabaseServiceKey ? '[REDACTED]' : 'undefined',
            envVarCount: Object.keys(process.env).length,
        };
        console.error('❌ Supabase env check failed:', JSON.stringify(details, null, 2));

        // Provide specific error message based on the issue
        if (supabaseUrl && supabaseServiceKey === '') {
            throw new Error(
                'SUPABASE_SERVICE_KEY is empty - DigitalOcean secret decryption may have failed. ' +
                'Please re-enter the secret in DigitalOcean console.'
            );
        }
        if (supabaseUrl === '' && supabaseServiceKey) {
            throw new Error(
                'SUPABASE_URL is empty - DigitalOcean secret decryption may have failed. ' +
                'Please re-enter the secret in DigitalOcean console.'
            );
        }
        throw new Error(
            'Missing SUPABASE_URL or SUPABASE_SERVICE_KEY environment variables. ' +
            'Check DigitalOcean app configuration.'
        );
    }

    supabaseClient = createClient(supabaseUrl, supabaseServiceKey, {
        auth: {
            autoRefreshToken: false,
            persistSession: false,
        },
    });

    return supabaseClient;
}

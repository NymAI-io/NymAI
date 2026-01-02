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

    // Debug logging for env var issues
    if (!supabaseUrl || !supabaseSecretKey) {
        const details = {
            supabaseUrlDefined: !!supabaseUrl,
            supabaseUrlValue: supabaseUrl ? supabaseUrl.slice(0, 20) + '...' : 'undefined',
            supabaseSecretKeyDefined: !!supabaseSecretKey,
            supabaseSecretKeyValue: supabaseSecretKey ? '[REDACTED]' : 'undefined',
            envVarCount: Object.keys(process.env).length,
        };
        console.error('❌ Supabase env check failed:', JSON.stringify(details, null, 2));

        // Provide specific error message based on the issue
        if (supabaseUrl && supabaseSecretKey === '') {
            throw new Error(
                'SUPABASE_SECRET_KEY is empty - DigitalOcean secret decryption may have failed. ' +
                'Please re-enter the secret in DigitalOcean console.'
            );
        }
        if (supabaseUrl === '' && supabaseSecretKey) {
            throw new Error(
                'SUPABASE_URL is empty - DigitalOcean secret decryption may have failed. ' +
                'Please re-enter the secret in DigitalOcean console.'
            );
        }
        throw new Error(
            'Missing SUPABASE_URL or SUPABASE_SECRET_KEY environment variables. ' +
            'Check DigitalOcean app configuration.'
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

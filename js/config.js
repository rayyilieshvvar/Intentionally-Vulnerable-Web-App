// Check if Supabase variables are already defined
if (typeof window.supabaseClient === 'undefined') {
    // Supabase configuration
    // For client-side only apps, we need to hardcode these values
    // but we can use a build step to replace them in production
    const SUPABASE_URL = 'https://gsjfkabzjzllrktrjozx.supabase.co';
    const SUPABASE_KEY = '__SUPABASE_KEY__'; // This will be replaced during build
    
    // Initialize the Supabase client
    window.supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_KEY, {
        auth: {
            persistSession: true,
            autoRefreshToken: true,
            detectSessionInUrl: true
        }
    });
}
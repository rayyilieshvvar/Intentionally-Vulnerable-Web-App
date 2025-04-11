// Check if Supabase variables are already defined
if (typeof window.supabaseClient === 'undefined') {
    // Get Supabase credentials from environment variables
    // These will be replaced by Netlify's environment variables in production
    const SUPABASE_URL = process.env.SUPABASE_URL || 'YOUR_LOCAL_DEVELOPMENT_URL';
    const SUPABASE_KEY = process.env.SUPABASE_KEY || 'YOUR_LOCAL_DEVELOPMENT_KEY';
    
    // Initialize the Supabase client
    window.supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_KEY, {
        auth: {
            persistSession: true,
            autoRefreshToken: true,
            detectSessionInUrl: true
        }
    });
}
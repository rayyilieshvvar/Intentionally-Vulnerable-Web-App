// Check if Supabase variables are already defined
if (typeof window.supabaseClient === 'undefined') {
    // For local development, use environment variables if available
    // For production, these will be replaced during Netlify build
    const SUPABASE_URL = '{{SUPABASE_URL}}';
    const SUPABASE_KEY = '{{SUPABASE_KEY}}';
    
    // Initialize the Supabase client
    window.supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
}
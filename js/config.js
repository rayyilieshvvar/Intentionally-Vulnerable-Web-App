// Check if Supabase variables are already defined
if (typeof window.supabaseClient === 'undefined') {
    // Supabase configuration
    const SUPABASE_URL = 'YOUR_SUPABASE_URL';
    const SUPABASE_KEY = 'YOUR_SUPABASE_KEY';
    
    // Initialize the Supabase client
    window.supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
}
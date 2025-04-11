// Check if Supabase variables are already defined
if (typeof window.supabaseClient === 'undefined') {
    // Supabase configuration
    const SUPABASE_URL = 'https://gsjfkabzjzllrktrjozx.supabase.co';
    const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdzamZrYWJ6anpsbHJrdHJqb3p4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQzMDg2OTYsImV4cCI6MjA1OTg4NDY5Nn0.HBcx-2Q_0R8L9035N5Jv-bSa3VXS6BMun6RkYBvE860';
    
    try {
        // Initialize the Supabase client with additional options
        window.supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_KEY, {
            auth: {
                autoRefreshToken: true,
                persistSession: true,
                detectSessionInUrl: true
            }
        });
        console.log('Supabase client initialized successfully');
    } catch (error) {
        console.error('Error initializing Supabase client:', error);
    }
}
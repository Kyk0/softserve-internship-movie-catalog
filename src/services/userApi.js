import { supabase } from "../supabaseClient";

export async function fetchHistory(limit = 20) {
    const {
        data: { session },
    } = await supabase.auth.getSession();
    const token = session?.access_token;

    const res = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/rest/v1/user_movie_views?` +
        `select=movie_id,viewed_at&order=viewed_at.desc&limit=${limit}`,
        {
            headers: {
                apikey: import.meta.env.VITE_SUPABASE_ANON_KEY,
                Authorization: token ? `Bearer ${token}` : "",
            },
        }
    );

    if (!res.ok) {
        throw new Error(`Failed to load history (${res.status})`);
    }
    return res.json();
}
import { supabase } from "../supabaseClient";

const RECOMMEND_URL = `${import.meta.env.VITE_SUPABASE_PROXY_URL}/recommendations`;

export async function fetchRecommendations() {
    const {
        data: { session },
    } = await supabase.auth.getSession();
    const token = session?.access_token;

    const res = await fetch(RECOMMEND_URL, {
        method: "GET",
        headers: {
            Authorization: token ? `Bearer ${token}` : "",
        },
    });

    if (!res.ok) {
        const errBody = await res.json().catch(() => ({}));
        throw new Error(
            errBody.error ||
            errBody.message ||
            `Failed to load recommendations (${res.status})`
        );
    }

    return await res.json();
}
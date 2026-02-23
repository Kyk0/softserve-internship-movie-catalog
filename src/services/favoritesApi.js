import { supabase } from "../supabaseClient";

const FUNCTION_URL = import.meta.env.VITE_FAVORITES_FUNCTION_URL;

async function getToken() {
    const {
        data: { session },
    } = await supabase.auth.getSession();
    return session?.access_token;
}

export async function fetchFavorites() {
    const token = await getToken();
    const res = await fetch(FUNCTION_URL, {
        headers: { Authorization: `Bearer ${token}` },
    });
    const body = await res.json().catch(() => ({}));
    if (!res.ok) {
        throw new Error(
            body.error || body.message || `Failed to load favorites (${res.status})`
        );
    }
    return body;
}

export async function addFavorite(movie) {
    const token = await getToken();
    const res = await fetch(FUNCTION_URL, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
            tmdb_movie_id: movie.id,
            movie_data: movie,
        }),
    });
    const body = await res.json().catch(() => ({}));
    if (!res.ok) {
        throw new Error(
            body.error || body.message || `Failed to add favorite (${res.status})`
        );
    }
    return body;
}

export async function removeFavorite(tmdb_movie_id) {
    const token = await getToken();
    const res = await fetch(FUNCTION_URL, {
        method: "DELETE",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ tmdb_movie_id }),
    });
    const body = await res.json().catch(() => ({}));
    if (!res.ok) {
        throw new Error(
            body.error ||
            body.message ||
            `Failed to remove favorite (${res.status})`
        );
    }
    return body;
}

import { supabase } from "../supabaseClient";

export async function fetchSessions() {
    const { data, error } = await supabase
        .from("sessions")
        .select("*")
        .order("date", { ascending: true })
        .order("time", { ascending: true });
    if (error) throw new Error(error.message);
    return data;
}

export async function addSession({ movieId, date, time, price }) {
    const { data, error } = await supabase
        .from("sessions")
        .insert([
            { movie_id: Number(movieId), date, time, price: Number(price) }
        ]);
    if (error) throw new Error(error.message);
    return data;
}

export async function updateSession(id, { movieId, date, time, price }) {
    const { data, error } = await supabase
        .from("sessions")
        .update({ movie_id: Number(movieId), date, time, price: Number(price) })
        .eq("id", id);
    if (error) throw new Error(error.message);
    return data;
}

export async function deleteSession(id) {
    const { data, error } = await supabase
        .from("sessions")
        .delete()
        .eq("id", id);
    if (error) throw new Error(error.message);
    return data;
}

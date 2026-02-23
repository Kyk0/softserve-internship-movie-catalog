import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY");
const TMDB_API_KEY = Deno.env.get("TMDB_API_KEY");
Deno.serve(async (req)=>{
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, OPTIONS",
        "Access-Control-Allow-Headers": "Authorization, Content-Type"
      }
    });
  }
  const CORS = {
    "Access-Control-Allow-Origin": "*"
  };
  try {
    const authHeader = req.headers.get("Authorization")?.split(" ")[1];
    if (!authHeader) {
      return new Response(JSON.stringify({
        error: "Unauthorized"
      }), {
        status: 401,
        headers: {
          ...CORS,
          "Content-Type": "application/json"
        }
      });
    }
    const anonClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    const { data: { user }, error: authError } = await anonClient.auth.getUser(authHeader);
    if (authError || !user) {
      return new Response(JSON.stringify({
        error: "Unauthorized"
      }), {
        status: 401,
        headers: {
          ...CORS,
          "Content-Type": "application/json"
        }
      });
    }
    const url = new URL(req.url);
    const path = url.pathname.replace("/tmdbProxy", "");
    const movieMatch = path.match(/^\/movie\/(\d+)$/);
    if (!movieMatch || req.method !== "GET") {
      return new Response(JSON.stringify({
        error: "Not Found"
      }), {
        status: 404,
        headers: {
          ...CORS,
          "Content-Type": "application/json"
        }
      });
    }
    const movieId = movieMatch[1];
    const separator = url.search ? '&' : '?';
    const tmdbUrl = `https://api.themoviedb.org/3${path}${url.search}${separator}api_key=${TMDB_API_KEY}`;
    const tmdbRes = await fetch(tmdbUrl);
    const data = await tmdbRes.json();
    if (!tmdbRes.ok) {
      return new Response(JSON.stringify(data), {
        status: tmdbRes.status,
        headers: {
          ...CORS,
          "Content-Type": "application/json"
        }
      });
    }
    const authClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      global: {
        headers: {
          Authorization: `Bearer ${authHeader}`
        }
      }
    });
    const genre_ids = Array.isArray(data.genres) ? data.genres.map((g)=>g.id) : [];
    const release_year = data.release_date ? parseInt(data.release_date.split("-")[0]) : null;
    const rating = typeof data.vote_average === "number" ? data.vote_average : null;
    await authClient.from("user_movie_views").insert([
      {
        user_id: user.id,
        movie_id: Number(movieId),
        genre_ids,
        release_year,
        rating
      }
    ]);
    return new Response(JSON.stringify(data), {
      status: 200,
      headers: {
        ...CORS,
        "Content-Type": "application/json"
      }
    });
  } catch (err) {
    console.error(err);
    return new Response(JSON.stringify({
      error: err.message
    }), {
      status: 500,
      headers: {
        "Content-Type": "application/json",
        ...CORS
      }
    });
  }
});

import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY");
const TMDB_API_KEY = Deno.env.get("TMDB_API_KEY");
const anonClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
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
    const authClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      global: {
        headers: {
          Authorization: `Bearer ${authHeader}`
        }
      }
    });
    const { data: views, error: viewError } = await authClient.from("user_movie_views").select("genre_ids, release_year, rating").eq("user_id", user.id).order("viewed_at", {
      ascending: false
    }).limit(20);
    if (viewError) throw viewError;
    if (!views || views.length === 0) {
      return new Response(JSON.stringify([]), {
        status: 200,
        headers: {
          ...CORS,
          "Content-Type": "application/json"
        }
      });
    }
    const genreCount = {};
    views.forEach((v)=>{
      v.genre_ids.forEach((id)=>{
        genreCount[id] = (genreCount[id] || 0) + 1;
      });
    });
    const topGenres = Object.entries(genreCount).sort(([, a], [, b])=>b - a).slice(0, 3).map(([id])=>id).join(",");
    const years = views.map((v)=>v.release_year).filter(Boolean);
    const avgYear = years.reduce((a, b)=>a + b, 0) / years.length;
    const minYear = Math.floor(avgYear - 5);
    const maxYear = Math.ceil(avgYear + 5);
    const ratings = views.map((v)=>v.rating).filter((r)=>typeof r === "number");
    const avgRating = ratings.reduce((a, b)=>a + b, 0) / ratings.length;
    const minRating = Math.max(0, avgRating - 2);
    const maxRating = Math.min(10, avgRating + 2);
    const params = new URLSearchParams({
      with_genres: topGenres,
      "primary_release_date.gte": `${minYear}-01-01`,
      "primary_release_date.lte": `${maxYear}-12-31`,
      "vote_average.gte": minRating.toFixed(1),
      "vote_average.lte": maxRating.toFixed(1),
      sort_by: "popularity.desc",
      api_key: TMDB_API_KEY
    });
    const page = Math.floor(Math.random() * 5) + 1;
    params.set("page", page.toString());
    const tmdbUrl = `https://api.themoviedb.org/3/discover/movie?${params}`;
    const tmdbRes = await fetch(tmdbUrl);
    const recData = await tmdbRes.json();
    if (!tmdbRes.ok) throw new Error(recData.status_message || "Failed to fetch recommendations");
    const results = recData.results || [];
    for(let i = results.length - 1; i > 0; i--){
      const j = Math.floor(Math.random() * (i + 1));
      [results[i], results[j]] = [
        results[j],
        results[i]
      ];
    }
    const finalList = results.slice(0, 20);
    return new Response(JSON.stringify(finalList), {
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
        ...CORS,
        "Content-Type": "application/json"
      }
    });
  }
});

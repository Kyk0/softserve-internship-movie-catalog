import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
const SUPABASE_KEY = Deno.env.get("SUPABASE_ANON_KEY");
Deno.serve(async (req)=>{
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, DELETE, OPTIONS",
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
    const anonClient = createClient(SUPABASE_URL, SUPABASE_KEY);
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
    const authClient = createClient(SUPABASE_URL, SUPABASE_KEY, {
      global: {
        headers: {
          Authorization: `Bearer ${authHeader}`
        }
      }
    });
    const method = req.method.toUpperCase();
    // GET 
    if (method === "GET") {
      const { data, error } = await authClient.from("favorites").select("movie_data").eq("user_id", user.id);
      if (error) throw error;
      return new Response(JSON.stringify(data), {
        status: 200,
        headers: {
          ...CORS,
          "Content-Type": "application/json"
        }
      });
    }
    // POST 
    if (method === "POST") {
      const { tmdb_movie_id, movie_data } = await req.json();
      const { data, error } = await authClient.from("favorites").insert([
        {
          user_id: user.id,
          tmdb_movie_id,
          movie_data
        }
      ]);
      if (error) throw error;
      return new Response(JSON.stringify(data), {
        status: 201,
        headers: {
          ...CORS,
          "Content-Type": "application/json"
        }
      });
    }
    // DELETE 
    if (method === "DELETE") {
      const { tmdb_movie_id } = await req.json();
      const { data, error } = await authClient.from("favorites").delete().eq("user_id", user.id).eq("tmdb_movie_id", tmdb_movie_id);
      if (error) throw error;
      return new Response(JSON.stringify(data), {
        status: 200,
        headers: {
          ...CORS,
          "Content-Type": "application/json"
        }
      });
    }
    return new Response(JSON.stringify({
      error: "Not Found"
    }), {
      status: 404,
      headers: {
        ...CORS,
        "Content-Type": "application/json"
      }
    });
  } catch (err) {
    console.error(err);
    return new Response(JSON.stringify({
      error: err.message || "Internal server error"
    }), {
      status: 500,
      headers: {
        ...CORS,
        "Content-Type": "application/json"
      }
    });
  }
});

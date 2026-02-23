const API_KEY = import.meta.env.VITE_TMDB_API_KEY;
const BASE_URL = import.meta.env.VITE_TMDB_BASE_URL;

const PROXY_BASE = import.meta.env.VITE_SUPABASE_PROXY_URL;
import { supabase } from '../supabaseClient';

const tmdbApi = {
  // Get popular movies
  getPopularMovies: async (page = 1) => {
    try {
      const response = await fetch(
        `${BASE_URL}/movie/popular?api_key=${API_KEY}&page=${page}`
      );
      return await response.json();
    } catch (error) {
      console.error('Error fetching popular movies:', error);
      throw error;
    }
  },

  // Get movie details
  getMovieDetails: async (movieId) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;
      const response = await fetch(
        `${PROXY_BASE}/tmdbProxy/movie/${movieId}`,
        {
          headers: {
            Authorization: token ? `Bearer ${token}` : ''
          }
        }
      );

      if (!response.ok) {
        throw new Error('Failed to load the movie.');
      }

      const data = await response.json();

      if (!data || data.success === false) {
        throw new Error(data.status_message || 'Movie not found.');
      }

      return data;
    } catch (error) {
      console.error('Error fetching movie details:', error);
      throw error;
    }
  },

  // Search movies
  searchMovies: async (query, page = 1) => {
    try {
      const response = await fetch(
        `${BASE_URL}/search/movie?api_key=${API_KEY}&query=${encodeURIComponent(
          query
        )}&page=${page}`
      );
      return await response.json();
    } catch (error) {
      console.error('Error searching movies:', error);
      throw error;
    }
  },

  // Get movie images
  getMovieImages: async (movieId) => {
    try {
      const response = await fetch(
        `${BASE_URL}/movie/${movieId}/images?api_key=${API_KEY}`
      );
      return await response.json();
    } catch (error) {
      console.error('Error fetching movie images:', error);
      throw error;
    }
  },
  // Get cast
getMovieCredits: async (movieId) => {
  try {
    const response = await fetch(
      `${BASE_URL}/movie/${movieId}/credits?api_key=${API_KEY}`
    );
    if (!response.ok) throw new Error('Failed to load the movie credits.');
    
    const data = await response.json();
    console.log('Movie Credits:', data); 

    if (data && data.cast && Array.isArray(data.cast)) {
      return data; 
    } else {
      console.error('No actors found in the response');
      return { cast: [] }; 
    }
  } catch (error) {
    console.error("Error fetching movie credits:", error);
    return { cast: [] }; 
  }
},
  getMovieTrailer: async (movieId) => {
  try {
    const response = await fetch(
      `${BASE_URL}/movie/${movieId}/videos?api_key=${API_KEY}`
    );
    const data = await response.json();

    // Шукаємо перший трейлер з YouTube
    const trailer = data.results.find(
      (video) =>
        video.type === "Trailer" && video.site === "YouTube"
    );

    return trailer ? `https://www.youtube.com/embed/${trailer.key}` : null;
  } catch (error) {
    console.error("Error fetching trailer:", error);
    return null;
  }
},
  async getMovieDetailsDirect(movieId) {
    const url = `${BASE_URL}/movie/${movieId}?api_key=${API_KEY}`;
    const response = await fetch(url);
    if (!response.ok) throw new Error("Failed to load movie details");
    const data = await response.json();
    if (!data || data.success === false) {
      throw new Error(data.status_message || "Movie not found");
    }
    return data;
  }
};

// no proxy call

export default tmdbApi; 
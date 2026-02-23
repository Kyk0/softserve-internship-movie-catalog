import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { Star } from "lucide-react";
import Skeleton from "../components/Skeleton";
import ErrorMessage from "../components/ErrorMessage";
import tmdbApi from "../services/tmdbApi";
import CommentSection from "../components/CommentSection";
import { getMovieById } from "../services/moviesApi";
import { useAuth } from "../AuthContext.jsx";
import { fetchFavorites, addFavorite, removeFavorite } from "../services/favoritesApi";

const MovieDetails = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [movie, setMovie] = useState(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [cast, setCast] = useState([]);
  const isLocalMovie = id.startsWith('local-');
  const movieId = isLocalMovie ? parseInt(id.replace('local-', '')) : id;

  useEffect(() => {
    const loadMovie = async () => {
      try {
        setIsLoading(true);
        setError(null);

        let movieData;
        if (isLocalMovie) {
          movieData = await getMovieById(movieId);
          if (!movieData) {
            throw new Error('Movie not found');
          }
        } else {
          // Use direct API call for non-authenticated users
          if (!user) {
            movieData = await tmdbApi.getMovieDetailsDirect(movieId);
          } else {
            movieData = await tmdbApi.getMovieDetails(movieId);
          }
          if (!movieData) {
            throw new Error('Movie not found');
          }
        }
        setMovie(movieData);
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    loadMovie();
  }, [id, movieId, isLocalMovie, user]);

  useEffect(() => {
    const loadCredits = async () => {
      if (movie && !isLocalMovie) {
        const credits = await tmdbApi.getMovieCredits(movie.id);
        setCast(credits.cast?.slice(0, 8) || []); // 8 actors
      } else if (movie && isLocalMovie && movie.cast) {
        // For local movies, create a simple cast array from the comma-separated string
        setCast(movie.cast.split(',').map(name => ({
          name: name.trim(),
          character: 'Actor'
        })));
      }
    };

    loadCredits();
  }, [movie, isLocalMovie]);

  useEffect(() => {
    if (!user || !movie) return;
    setError(null);
    fetchFavorites()
      .then(list => setIsFavorite(list.some(f => f.movie_data.id === movie.id)))
      .catch(err => setError(err.message));
  }, [user, movie]);

  useEffect(() => {
    if (!movie || movie.trailer) return;
    if (isLocalMovie) {
      if (movie.trailer_url) {
        setMovie(prev => ({ ...prev, trailer: movie.trailer_url }));
      }
    } else {
      tmdbApi.getMovieTrailer(movie.id).then((url) => {
        setMovie((prev) => ({ ...prev, trailer: url }));
      });
    }
  }, [movie, isLocalMovie]);

  const toggleFavorite = async () => {
    if (!user) return navigate("/login");
    if (isFavorite) {
      await removeFavorite(movie.id);
      setIsFavorite(false);
    } else {
      await addFavorite(movie);
      setIsFavorite(true);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0f172a] text-white px-6 py-10">
        <div className="max-w-6xl mx-auto">
          <Skeleton />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#0f172a] text-white px-6 py-10">
        <div className="max-w-6xl mx-auto">
          <ErrorMessage message={error} />
        </div>
      </div>
    );
  }

  if (!movie) return null;

  return (
    <div className="min-h-screen bg-[#0f172a] text-white px-6 py-10">
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">

        {/* Poster */}
        <img
          src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
          alt={movie.title}
          className="rounded-2xl shadow-lg object-cover w-full h-[450px]"
        />

        {/* Info */}
        <div className="md:col-span-2 space-y-4">
          <h1 className="text-4xl font-bold">{movie.title}</h1>

          {/* Rating + Year */}
          <div className="flex items-center space-x-4 text-sm text-gray-300">
            <span className="bg-blue-600 text-white px-2 py-1 rounded-full flex items-center">
              <Star className="h-4 w-4 mr-1" /> {isLocalMovie ? movie.rating : movie.vote_average.toFixed(1)}
            </span>
            <span>{new Date(movie.release_date).getFullYear()}</span>
            {!isLocalMovie && (
              <>
                <span>•</span>
                <span>{movie.genres?.map(genre => genre.name).join(", ")}</span>
              </>
            )}
          </div>

          {/* Description */}
          <p className="text-gray-300">{movie.overview}</p>

          {/* Runtime - only for TMDB movies */}
          {!isLocalMovie && movie.runtime && (
            <p>
              <span className="text-white font-semibold">Duration:</span>{" "}
              {movie.runtime} minutes
            </p>
          )}

          {/* Favorite Button */}
          <button
            onClick={toggleFavorite}
            className={`mt-4 py-2 px-4 rounded-xl text-white font-semibold transition ${
              isFavorite
                ? "bg-red-600 hover:bg-red-700"
                : "bg-gray-500 hover:bg-gray-600"
            }`}
          >
            {isFavorite ? "Remove from favorites" : "Add to favorites"}
          </button>
        </div>
      </div>

      {/* Trailer */}
      {movie.trailer && (
        <div className="max-w-6xl mx-auto mt-12">
          <h2 className="text-2xl font-semibold mb-2">Trailer</h2>
          <div className="relative pb-[56.25%] h-0 overflow-hidden rounded-lg shadow">
            <iframe
              className="absolute top-0 left-0 w-full h-full"
              src={movie.trailer}
              title="Trailer"
              frameBorder="0"
              allowFullScreen
            />
          </div>
        </div>
      )}

      {/* Cast */}
      {cast.length > 0 && (
        <div className="max-w-6xl mx-auto mt-12">
          <h2 className="text-2xl font-semibold mb-4">Actors</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {cast.map((actor, index) => (
              <div key={isLocalMovie ? index : actor.id} className="flex flex-col items-center text-center">
                {!isLocalMovie && actor.profile_path ? (
                  <img
                    src={`https://image.tmdb.org/t/p/w185${actor.profile_path}`}
                    alt={actor.name}
                    className="w-[120px] h-[180px] object-cover rounded-lg shadow mb-2"
                  />
                ) : (
                  <div className="w-[120px] h-[180px] bg-gray-700 rounded-lg shadow mb-2 flex items-center justify-center">
                    <span className="text-4xl">🎭</span>
                  </div>
                )}
                <p className="text-white font-medium">{actor.name}</p>
                {!isLocalMovie && <p className="text-sm text-gray-400">{actor.character}</p>}
              </div>
            ))}
          </div>
        </div>
        
      )}
      {/* Comments */}
{movie?.id && <CommentSection movieId={movie.id} />}
    </div>
  );
};

export default MovieDetails;

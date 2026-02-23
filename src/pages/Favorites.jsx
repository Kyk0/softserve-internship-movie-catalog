import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Trash2 } from "lucide-react";
import { useAuth } from "../AuthContext.jsx";
import { fetchFavorites, removeFavorite } from "../services/favoritesApi";
import ErrorMessage from '../components/ErrorMessage';

const Favorites = () => {
  const [favorites, setFavorites] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }
    setError(null);
    setLoading(true);
    fetchFavorites()
      .then(data => setFavorites(data.map(f => f.movie_data)))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [user, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0f172a] text-white px-6 py-10">
        <div className="max-w-6xl mx-auto">
          <p>Loading favorites…</p>
        </div>
      </div>
    );
  }

  const removeFromFavorites = async (id) => {
    try {
      await removeFavorite(id);
      setFavorites(prev => prev.filter(movie => movie.id !== id));
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="min-h-screen bg-[#0f172a] text-white px-6 py-10">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold mb-6">Favorite movies</h1>
        {error && <ErrorMessage message={error} />}

        {favorites.length === 0 ? (
          <p className="text-gray-400">No saved movies.</p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
            {favorites.map((movie) => (
              <div
                key={movie.id}
                className="bg-[#1e293b] rounded-xl shadow-md overflow-hidden transition hover:scale-[1.02]"
              >
                <Link to={`/movie/${movie.id}`} className="block">
                  <img
                    src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
                    alt={movie.title}
                    className="w-full h-72 object-cover"
                  />
                  <div className="p-4">
                    <h2 className="text-xl font-semibold text-white">
                      {movie.title}
                    </h2>
                    <div className="mt-2 text-sm text-gray-400">
                      {new Date(movie.release_date).getFullYear()}
                    </div>
                  </div>
                </Link>
                <div className="px-4 pb-4 flex justify-end">
                  <button
                    onClick={() => removeFromFavorites(movie.id)}
                    className="flex items-center gap-1 text-sm text-red-500 hover:underline"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Favorites;

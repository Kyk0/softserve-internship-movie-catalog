import React, { useEffect, useState } from "react";
import { useAuth } from "../AuthContext.jsx";
import { useNavigate } from "react-router-dom";
import { fetchHistory } from "../services/userApi";
import tmdbApi from "../services/tmdbApi";
import MovieCard from "../components/MovieCard";

export default function ProfilePage() {
    const { user, signOut } = useAuth();
    const navigate = useNavigate();
    const [movies, setMovies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!user) {
            navigate("/");
            return;
        }
        let isMounted = true;

        fetchHistory()
            .then(async (hist) => {
                const seen = new Set();
                const uniqueIds = [];
                for (const item of hist) {
                    if (!seen.has(item.movie_id)) {
                        seen.add(item.movie_id);
                        uniqueIds.push(item.movie_id);
                    }
                }
                const details = await Promise.all(
                    uniqueIds.map((id) => tmdbApi.getMovieDetailsDirect(id))
                );
                if (isMounted) {
                    setMovies(details);
                }
            })
            .catch((err) => {
                if (isMounted) setError(err.message);
            })
            .finally(() => {
                if (isMounted) setLoading(false);
            });

        return () => {
            isMounted = false;
        };
    }, [user, navigate]);

    if (!user) return null;

    const handleSignOut = async () => {
        await signOut();
        navigate("/");
    };

    return (
        <div className="min-h-screen bg-gray-900">
            <div className="max-w-screen-lg mx-auto px-4 py-8 space-y-6">
                <div className="flex items-center justify-between">
                    <h1 className="text-3xl font-bold text-white uppercase">
                        Logged in as: {user.email}
                    </h1>
                    <button
                        onClick={handleSignOut}
                        className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                    >
                        Sign Out
                    </button>
                </div>

                <div className="bg-gray-800 text-gray-100 p-6 rounded">
                    <h2 className="text-2xl font-semibold mb-4">Recently Viewed</h2>

                    {loading && <p className="text-gray-400">Loading...</p>}
                    {error && <p className="text-red-500">Error: {error}</p>}
                    {!loading && !error && movies.length === 0 && (
                        <p className="text-gray-400">
                            You haven’t viewed any movies yet.
                        </p>
                    )}
                    {!loading && !error && movies.length > 0 && (
                        <div className="overflow-x-auto py-2">
                            <div className="flex space-x-4">
                                {movies.map((movie) => (
                                    <MovieCard key={movie.id} movie={movie} />
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

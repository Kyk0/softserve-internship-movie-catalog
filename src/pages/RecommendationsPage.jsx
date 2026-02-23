import React, { useEffect, useState, useCallback } from "react";
import { useAuth } from "../AuthContext.jsx";
import { useNavigate } from "react-router-dom";
import { fetchRecommendations } from "../services/recommendApi";
import MovieCard from "../components/MovieCard";

export default function RecommendationsPage() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [movies, setMovies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const loadRecommendations = useCallback(async () => {
        if (!user) return;
        setLoading(true);
        setError(null);
        try {
            const list = await fetchRecommendations();
            setMovies(list);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [user]);

    useEffect(() => {
        if (!user) {
            navigate("/");
            return;
        }
        loadRecommendations();
    }, [user, navigate, loadRecommendations]);

    if (!user) return null;

    return (
        <div className="min-h-screen bg-gray-900">
            <div className="max-w-screen-lg mx-auto px-4 py-8 space-y-6">
                <div className="flex items-center justify-between">
                    <h1 className="text-3xl font-bold text-white">Your Recommendations</h1>
                    <button
                        onClick={loadRecommendations}
                        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                        disabled={loading}
                    >
                        {loading ? "Loading..." : "Refresh"}
                    </button>
                </div>

                {error && <p className="text-red-500">Error: {error}</p>}

                {!loading && !error && movies.length === 0 && (
                    <p className="text-gray-400">No recommendations available.</p>
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
    );
}
import React, { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import Skeleton from "../components/Skeleton";
import ErrorMessage from "../components/ErrorMessage";
import tmdbApi from "../services/tmdbApi";
import { getAllMovies } from "../services/moviesApi";
import Pagination from "../components/Pagination";

export default function Home() {
  const [searchParams] = useSearchParams();
  const searchQuery = searchParams.get("search") || "";
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tmdbMovies, setTmdbMovies] = useState([]);
  const [localMovies, setLocalMovies] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [inputPage, setInputPage] = useState("");

  useEffect(() => {
    const loadMovies = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // Load local movies
        const localMoviesData = await getAllMovies();
        setLocalMovies(localMoviesData);
        
        // Load TMDB movies
        let response;
        if (searchQuery) {
          response = await tmdbApi.searchMovies(searchQuery, page);
        } else {
          response = await tmdbApi.getPopularMovies(page);
        }
        
        // Обмеження для TMDB: максимум 500 сторінок
        const maxPages = 500;
        const realTotalPages = Math.min(response.total_pages || 1, maxPages);
        
        if (page > realTotalPages) {
          setPage(realTotalPages);
          return;
        }
        
        if (!response.results || !Array.isArray(response.results) || response.results.length === 0) {
          if (searchQuery) {
            throw new Error('No movies found');
          } else {
            setTmdbMovies([]);
            setTotalPages(realTotalPages);
            return;
          }
        }
        
        setTmdbMovies(response.results);
        setTotalPages(realTotalPages);
      } catch (err) {
        setError(err.message);
        console.error('Error downloading movies:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadMovies();
  }, [searchQuery, page]);

  const handlePageChange = (newPage) => {
    setPage(newPage);
    setInputPage("");
  };

  const handleInputPageSubmit = (e) => {
    e.preventDefault();
    const pageNumber = parseInt(inputPage);
    if (pageNumber && pageNumber > 0 && pageNumber <= totalPages) {
      setPage(pageNumber);
      setInputPage("");
    }
  };

  const renderMovieCard = (movie, isLocal = false) => (
    <Link
      to={`/movie/${isLocal ? `local-${movie.id}` : movie.id}`}
      key={isLocal ? `local-${movie.id}` : movie.id}
      className="bg-gray-800 rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300"
    >
      {/* Movie Poster */}
      <img
        src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
        alt={movie.title}
        className="w-full h-64 object-cover"
      />

      {/* Movie Details */}
      <div className="p-4">
        <h3 className="text-white font-semibold text-lg mb-2">
          {movie.title}
        </h3>

        <div className="flex justify-between items-center mb-3">
          <span className="text-gray-400 text-sm">
            {new Date(movie.release_date).toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </span>
          <span className="flex items-center bg-blue-500 text-white px-2 py-1 rounded text-sm">
            ★ {isLocal ? movie.rating : movie.vote_average.toFixed(1)}
          </span>
        </div>

        <p className="text-gray-300 text-sm line-clamp-3">
          {movie.overview}
        </p>

        {isLocal && movie.cast && (
          <p className="text-gray-400 text-sm mt-2 line-clamp-1">
            Cast: {movie.cast}
          </p>
        )}
      </div>
    </Link>
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-900">
        <div className="max-w-screen-lg mx-auto px-4 py-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, index) => (
              <div key={index}>
                <Skeleton />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-900">
        <div className="max-w-screen-lg mx-auto px-4 py-8">
          <ErrorMessage message={error} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900">
      <div className="max-w-screen-lg mx-auto px-4 py-8">
        {/* Local Movies Section */}
        {localMovies.length > 0 && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-white mb-6">Special Movies</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {localMovies.map(movie => renderMovieCard(movie, true))}
            </div>
          </div>
        )}

        {/* TMDB Movies Section */}
        <div>
          <h2 className="text-2xl font-bold text-white mb-6">Popular Movies</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tmdbMovies.map(movie => renderMovieCard(movie))}
          </div>
        </div>

        {/* Пагінація */}
        <div className="mt-8">
          <Pagination
            currentPage={page}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
          
          {/* Форма для введення номера сторінки */}
          <form onSubmit={handleInputPageSubmit} className="flex justify-center items-center gap-2 mt-4">
            <input
              type="number"
              min="1"
              max={totalPages}
              value={inputPage}
              onChange={(e) => setInputPage(e.target.value)}
              placeholder="Page number"
              className="px-3 py-2 rounded-lg text-sm bg-gray-800 text-white w-32"
            />
            <button
              type="submit"
              className="px-3 py-2 rounded-lg text-sm font-medium bg-blue-600 text-white hover:bg-blue-700"
            >
              Go
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

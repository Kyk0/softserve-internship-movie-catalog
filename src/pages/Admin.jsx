import React, { useState, useEffect } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext.jsx';
import tmdbApi from '../services/tmdbApi';
import {
  fetchSessions,
  addSession,
  updateSession,
  deleteSession,
} from '../services/sessionsApi';
import {
  getAllMovies,
  addMovie,
  updateMovie,
  deleteMovie,
} from '../services/moviesApi';

export default function Admin() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  const [sessions, setSessions] = useState([]);
  const [movies, setMovies] = useState([]);
  const [isAddingSession, setIsAddingSession] = useState(false);
  const [editingSession, setEditingSession] = useState(null);
  const [sessionForm, setSessionForm] = useState({ movieId: '', date: '', time: '', price: '' });
  const [movieSearch, setMovieSearch] = useState('');
  
  // New state for movie management
  const [activeTab, setActiveTab] = useState('sessions'); // 'sessions' or 'movies'
  const [isAddingMovie, setIsAddingMovie] = useState(false);
  const [editingMovie, setEditingMovie] = useState(null);
  const [movieForm, setMovieForm] = useState({
    title: '',
    overview: '',
    poster_path: '',
    release_date: '',
    rating: '',
    trailer_url: '',
    cast: '',
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);

  useEffect(() => {
    fetchSessions().then(setSessions).catch(console.error);
    loadMovies();
    // Load TMDB movies
    tmdbApi.getPopularMovies(1)
      .then(res => setMovies(prev => [...prev, ...(res.results || [])]))
      .catch(error => console.error('Error loading TMDB movies:', error));
  }, []);

  const loadMovies = async () => {
    try {
      const localMovies = await getAllMovies();
      setMovies(localMovies);
    } catch (error) {
      console.error('Error loading movies:', error);
      setMovies([]);
    }
  };

  const handleSessionFormChange = (e) => {
    setSessionForm({ ...sessionForm, [e.target.name]: e.target.value });
  };

  const handleAddClick = () => {
    setSessionForm({ movieId: '', date: '', time: '', price: '' });
    setEditingSession(null);
    setIsAddingSession(true);
  };

  const handleEditClick = (session) => {
    setSessionForm({
      movieId: session.movie_id,
      date: session.date,
      time: session.time,
      price: session.price,
    });
    setEditingSession(session.id);
    setIsAddingSession(true);
  };

  const handleDeleteClick = async (id) => {
    await deleteSession(id);
    setSessions(await fetchSessions());
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (editingSession) {
      await updateSession(editingSession, sessionForm);
    } else {
      await addSession(sessionForm);
    }
    setIsAddingSession(false);
    setEditingSession(null);
    setSessions(await fetchSessions());
  };

  const filteredMovies = movies.filter((m) =>
    m.title.toLowerCase().includes(movieSearch.toLowerCase())
  );

  // Updated movie management functions
  const handleMovieSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    
    try {
      const results = await tmdbApi.searchMovies(searchQuery);
      setSearchResults(results.results || []);
    } catch (error) {
      console.error('Error searching movies:', error);
      setSearchResults([]);
    }
  };

  const handleAddMovieClick = () => {
    setMovieForm({
      title: '',
      overview: '',
      poster_path: '',
      release_date: '',
      rating: '',
      trailer_url: '',
      cast: '',
    });
    setEditingMovie(null);
    setIsAddingMovie(true);
  };

  const handleEditMovieClick = (movie) => {
    setMovieForm({
      title: movie.title,
      overview: movie.overview,
      poster_path: movie.poster_path,
      release_date: movie.release_date,
      rating: movie.rating || '',
      trailer_url: movie.trailer_url || '',
      cast: movie.cast || '',
    });
    setEditingMovie(movie.id);
    setIsAddingMovie(true);
  };

  const handleMovieFormChange = (e) => {
    setMovieForm({ ...movieForm, [e.target.name]: e.target.value });
  };

  const handleMovieFormSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingMovie) {
        await updateMovie(editingMovie, movieForm);
      } else {
        await addMovie(movieForm);
      }
      await loadMovies();
      setIsAddingMovie(false);
      setEditingMovie(null);
    } catch (error) {
      console.error('Error saving movie:', error);
    }
  };

  const handleDeleteMovie = async (movieId) => {
    try {
      await deleteMovie(movieId);
      await loadMovies();
    } catch (error) {
      console.error('Error deleting movie:', error);
    }
  };

  if (loading) return <div>Loading…</div>;
  if (!user?.user_metadata?.is_admin) return <Navigate to='/' replace />;

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow-md border-b mb-8">
        <div className="max-w-4xl mx-auto px-4 flex justify-between items-center h-16">
          <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">
            Admin Panel
          </h1>
          <button
            onClick={() => navigate('/')}
            className="px-4 py-2 rounded-lg bg-gray-200 text-gray-700 hover:bg-gray-300 font-semibold"
          >
            Logout
          </button>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto p-4">
        {/* Tabs */}
        <div className="flex gap-4 mb-6">
          <button
            onClick={() => setActiveTab('sessions')}
            className={`px-4 py-2 rounded-lg font-semibold ${
              activeTab === 'sessions'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Sessions
          </button>
          <button
            onClick={() => setActiveTab('movies')}
            className={`px-4 py-2 rounded-lg font-semibold ${
              activeTab === 'movies'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Movies
          </button>
        </div>

        {activeTab === 'sessions' ? (
          <>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Sessions</h2>
              <button
                onClick={handleAddClick}
                className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 font-semibold"
              >
                Add Session
              </button>
            </div>

            {isAddingSession && (
                <form onSubmit={handleFormSubmit} className="bg-white p-6 rounded-xl shadow mb-8 space-y-4">
                  <div>
                    <label className="block text-sm font-semibold mb-1">Movie</label>
                    <input
                        type="text"
                        placeholder="Search movie..."
                        value={movieSearch}
                        onChange={(e) => setMovieSearch(e.target.value)}
                        className="w-full mb-2 px-3 py-2 rounded-lg border focus:ring-2 focus:ring-blue-500"
                    />
                    <select
                        name="movieId"
                        value={sessionForm.movieId}
                        onChange={handleSessionFormChange}
                        required
                        className="w-full px-3 py-2 rounded-lg border focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select movie</option>
                      {filteredMovies.map((m) => (
                        <option key={m.id} value={m.id}>
                          {m.title}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="flex gap-4">
                    <div className="flex-1">
                      <label className="block text-sm font-semibold mb-1">Date</label>
                      <input
                          type="date"
                          name="date"
                          value={sessionForm.date}
                          onChange={handleSessionFormChange}
                          required
                          className="w-full px-3 py-2 rounded-lg border focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div className="flex-1">
                      <label className="block text-sm font-semibold mb-1">Time</label>
                      <input
                          type="time"
                          name="time"
                          value={sessionForm.time}
                          onChange={handleSessionFormChange}
                          required
                          className="w-full px-3 py-2 rounded-lg border focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div className="flex-1">
                      <label className="block text-sm font-semibold mb-1">Price (UAH)</label>
                      <input
                          type="number"
                          name="price"
                          value={sessionForm.price}
                          onChange={handleSessionFormChange}
                          required
                          min={1}
                          className="w-full px-3 py-2 rounded-lg border focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                  <div className="flex justify-end gap-2">
                    <button
                        type="button"
                        onClick={() => { setIsAddingSession(false); setEditingSession(null); }}
                        className="px-4 py-2 rounded-lg bg-gray-200 text-gray-700 hover:bg-gray-300 font-semibold"
                    >
                      Cancel
                    </button>
                    <button
                        type="submit"
                        className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 font-semibold"
                    >
                      {editingSession ? 'Save Changes' : 'Add'}
                    </button>
                  </div>
                </form>
            )}

            <div className="space-y-4">
              {sessions.length === 0 ? (
                  <div className="text-gray-500 text-center py-8">No sessions available.</div>
              ) : (
                  sessions.map((session) => {
                    const movie = movies.find((m) => m.id === session.movie_id);
                    return (
                        <div key={session.id} className="bg-white p-4 rounded-xl shadow flex flex-col md:flex-row md:items-center md:gap-6">
                          <div className="flex-1 flex items-center gap-4">
                            {movie && (
                                <img
                                    src={`https://image.tmdb.org/t/p/w200${movie.poster_path}`}
                                    alt={movie.title}
                                    className="w-20 h-28 object-cover rounded-lg shadow"
                                />
                            )}
                            <div>
                              <div className="font-bold text-lg text-gray-900">{movie ? movie.title : 'Movie not found'}</div>
                              <div className="text-gray-500 text-sm">{session.date} • {session.time}</div>
                              <div className="text-blue-600 font-semibold mt-1">{session.price} UAH</div>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <button
                                onClick={() => handleEditClick(session)}
                                className="px-4 py-2 rounded-lg bg-yellow-400 text-gray-900 hover:bg-yellow-500 font-semibold"
                            >
                              Edit
                            </button>
                            <button
                                onClick={() => handleDeleteClick(session.id)}
                                className="px-4 py-2 rounded-lg bg-red-500 text-white hover:bg-red-600 font-semibold"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                    );
                  })
              )}
            </div>
          </>
        ) : (
          <>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Movies</h2>
              <button
                onClick={handleAddMovieClick}
                className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 font-semibold"
              >
                Add Movie
              </button>
            </div>

            {/* Movie search */}
            <form onSubmit={handleMovieSearch} className="mb-6">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search movies..."
                  className="flex-1 px-3 py-2 rounded-lg border focus:ring-2 focus:ring-blue-500"
                />
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 font-semibold"
                >
                  Search
                </button>
              </div>
            </form>

            {/* Movie form */}
            {isAddingMovie && (
              <form onSubmit={handleMovieFormSubmit} className="bg-white p-6 rounded-xl shadow mb-8 space-y-4">
                <div>
                  <label className="block text-sm font-semibold mb-1">Title</label>
                  <input
                    type="text"
                    name="title"
                    value={movieForm.title}
                    onChange={handleMovieFormChange}
                    required
                    className="w-full px-3 py-2 rounded-lg border focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1">Overview</label>
                  <textarea
                    name="overview"
                    value={movieForm.overview}
                    onChange={handleMovieFormChange}
                    required
                    rows="4"
                    className="w-full px-3 py-2 rounded-lg border focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1">Poster URL</label>
                  <input
                    type="text"
                    name="poster_path"
                    value={movieForm.poster_path}
                    onChange={handleMovieFormChange}
                    required
                    className="w-full px-3 py-2 rounded-lg border focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1">Release Date</label>
                  <input
                    type="date"
                    name="release_date"
                    value={movieForm.release_date}
                    onChange={handleMovieFormChange}
                    required
                    className="w-full px-3 py-2 rounded-lg border focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1">Rating (0-10)</label>
                  <input
                    type="number"
                    name="rating"
                    value={movieForm.rating}
                    onChange={handleMovieFormChange}
                    min="0"
                    max="10"
                    step="0.1"
                    className="w-full px-3 py-2 rounded-lg border focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1">Trailer URL (YouTube)</label>
                  <input
                    type="url"
                    name="trailer_url"
                    value={movieForm.trailer_url}
                    onChange={handleMovieFormChange}
                    placeholder="https://www.youtube.com/watch?v=..."
                    className="w-full px-3 py-2 rounded-lg border focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1">Cast (comma-separated)</label>
                  <textarea
                    name="cast"
                    value={movieForm.cast}
                    onChange={handleMovieFormChange}
                    placeholder="Actor 1, Actor 2, Actor 3..."
                    rows="2"
                    className="w-full px-3 py-2 rounded-lg border focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => { setIsAddingMovie(false); setEditingMovie(null); }}
                    className="px-4 py-2 rounded-lg bg-gray-200 text-gray-700 hover:bg-gray-300 font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 font-semibold"
                  >
                    {editingMovie ? 'Save Changes' : 'Add Movie'}
                  </button>
                </div>
              </form>
            )}

            {/* Movie list */}
            <div className="space-y-4">
              {(searchResults.length > 0 ? searchResults : movies).map((movie) => (
                <div key={movie.id} className="bg-white p-4 rounded-xl shadow flex flex-col md:flex-row md:items-center md:gap-6">
                  <div className="flex-1 flex items-center gap-4">
                    {movie.poster_path && (
                      <img
                        src={`https://image.tmdb.org/t/p/w200${movie.poster_path}`}
                        alt={movie.title}
                        className="w-20 h-28 object-cover rounded-lg shadow"
                      />
                    )}
                    <div>
                      <div className="font-bold text-lg text-gray-900">
                        {movie.title} 
                        <span className="ml-2 text-sm font-normal px-2 py-1 rounded-full bg-gray-100">
                          {movie.vote_average !== undefined ? 'TMDB' : 'Local'}
                        </span>
                      </div>
                      <div className="text-gray-500 text-sm line-clamp-2">{movie.overview}</div>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="text-blue-600 font-semibold">{movie.release_date}</div>
                        {movie.rating && (
                          <div className="text-yellow-500 font-semibold">★ {movie.rating}</div>
                        )}
                        {movie.vote_average && (
                          <div className="text-yellow-500 font-semibold">★ {movie.vote_average.toFixed(1)}</div>
                        )}
                      </div>
                      {movie.cast && (
                        <div className="text-gray-500 text-sm mt-1">
                          Cast: {movie.cast}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEditMovieClick(movie)}
                      className="px-4 py-2 rounded-lg bg-yellow-400 text-gray-900 hover:bg-yellow-500 font-semibold"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteMovie(movie.id)}
                      className="px-4 py-2 rounded-lg bg-red-500 text-white hover:bg-red-600 font-semibold"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </main>
    </div>
  );
}
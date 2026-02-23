import { useEffect, useState } from "react";
import tmdbApi from "../services/tmdbApi";
import { fetchSessions } from "../services/sessionsApi";

const getPartOfDay = (time) => {
  if (!time) return '';
  const [h, m] = time.split(":").map(Number);
  const minutes = h * 60 + m;
  if (minutes >= 6 * 60 && minutes < 13 * 60) return "morning";
  if (minutes >= 13 * 60 && minutes < 18 * 60) return "afternoon";
  if (minutes >= 18 * 60 && minutes < 24 * 60) return "evening";
  return '';
};

const Sessions = () => {
  const [sessions, setSessions] = useState([]);
  const [movies, setMovies] = useState([]);
  const [filteredSessions, setFilteredSessions] = useState([]);
  const [genres, setGenres] = useState([]);
  const [filters, setFilters] = useState({ date: "", genre: "", partOfDay: "" });

  useEffect(() => {
    fetchSessions()
        .then(data => {
          console.log("Fetched sessions:", data);
          setSessions(data);
        })
        .catch((err) => console.error("Failed to load sessions:", err));

    tmdbApi.getPopularMovies(1).then((res) => {
      setMovies(res.results || []);
      const genreSet = new Set();
      (res.results || []).forEach((m) =>
          (m.genre_ids || []).forEach((id) => genreSet.add(id))
      );
      setGenres(Array.from(genreSet));
    });
  }, []);

  useEffect(() => {
    let result = sessions
        .map((session) => {
          const movie = movies.find(
              (m) => String(m.id) === String(session.movie_id)
          );
          return { ...session, movie };
        })
        .filter((s) => s.movie);

    if (filters.date) {
      result = result.filter((s) => s.date === filters.date);
    }
    if (filters.genre) {
      result = result.filter(
          (s) =>
              s.movie.genre_ids &&
              s.movie.genre_ids.includes(Number(filters.genre))
      );
    }
    if (filters.partOfDay) {
      result = result.filter(
          (s) => getPartOfDay(s.time) === filters.partOfDay
      );
    }
    setFilteredSessions(result);
  }, [filters, sessions, movies]);

  const handleChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  // Для select жанрів — отримати назви жанрів з TMDB (можна покращити, якщо потрібно)
  const genreNames = {
    28: 'Action', 12: 'Adventure', 16: 'Animation', 35: 'Comedy', 80: 'Crime', 99: 'Documentary', 18: 'Drama', 10751: 'Family', 14: 'Fantasy', 36: 'History', 27: 'Horror', 10402: 'Music', 9648: 'Mystery', 10749: 'Romance', 878: 'Science Fiction', 10770: 'TV Movie', 53: 'Thriller', 10752: 'War', 37: 'Western'
  };

  return (
    <div className="min-h-screen bg-[#0f172a] text-white px-6 py-10">
      <div className="max-w-6xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold">Sessions</h1>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <input
            type="date"
            name="date"
            value={filters.date}
            onChange={handleChange}
            className="bg-gray-800 text-white p-2 rounded-lg"
          />

          <select
            name="genre"
            value={filters.genre}
            onChange={handleChange}
            className="bg-gray-800 text-white p-2 rounded-lg"
          >
            <option value="">All genres</option>
            {genres.map((g) => (
              <option key={g} value={g}>{genreNames[g] || g}</option>
            ))}
          </select>

          <select
            name="partOfDay"
            value={filters.partOfDay}
            onChange={handleChange}
            className="bg-gray-800 text-white p-2 rounded-lg"
          >
            <option value="">Any time</option>
            <option value="morning">Morning</option>
            <option value="afternoon">Afternoon</option>
            <option value="evening">Evening</option>
          </select>
        </div>

        {/* List of sessions */}
        <div className="grid grid-cols-1 gap-6">
          {filteredSessions.length > 0 ? (
            filteredSessions.map((session, index) => (
              <div
                key={`${session.movie.id}-${index}`}
                className="bg-gray-800 p-4 rounded-xl shadow flex flex-col md:flex-row items-center gap-4"
              >
                <img
                  src={`https://image.tmdb.org/t/p/w200${session.movie.poster_path}`}
                  alt={session.movie.title}
                  className="w-28 h-40 object-cover rounded-lg"
                />
                <div className="flex-1">
                  <h2 className="text-xl font-bold">{session.movie.title}</h2>
                  <p className="text-gray-300">
                    {session.movie.genre_ids.map((id) => genreNames[id]).join(", ")}
                  </p>
                  <p>
                    📅 {session.date} — 🕒 {session.time} — 💸 {session.price} UAH
                  </p>
                </div>
              </div>
            ))
          ) : (
            <p className="text-gray-400">No sessions found for the given filters.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Sessions;

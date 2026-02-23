const LOCAL_STORAGE_KEY = 'local_movies';

export const getLocalMovies = () => {
  const movies = localStorage.getItem(LOCAL_STORAGE_KEY);
  return movies ? JSON.parse(movies) : [];
};

export const saveLocalMovies = (movies) => {
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(movies));
};

export const addMovie = async (movie) => {
  const movies = getLocalMovies();
  const newMovie = {
    ...movie,
    id: Date.now(),
    created_at: new Date().toISOString(),
  };
  movies.push(newMovie);
  saveLocalMovies(movies);
  return newMovie;
};

export const updateMovie = async (id, movieData) => {
  const movies = getLocalMovies();
  const index = movies.findIndex(m => m.id === id);
  if (index === -1) throw new Error('Movie not found');
  
  movies[index] = {
    ...movies[index],
    ...movieData,
    updated_at: new Date().toISOString(),
  };
  saveLocalMovies(movies);
  return movies[index];
};

export const deleteMovie = async (id) => {
  const movies = getLocalMovies();
  const filteredMovies = movies.filter(m => m.id !== id);
  saveLocalMovies(filteredMovies);
};

export const getMovieById = async (id) => {
  const movies = getLocalMovies();
  return movies.find(m => m.id === id);
};

export const getAllMovies = async () => {
  return getLocalMovies();
}; 
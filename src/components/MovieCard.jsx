import React from "react";
import { Link } from "react-router-dom";

export default function MovieCard({ movie }) {
    return (
        <Link
            to={`/movie/${movie.id}`}
            className="flex-shrink-0 w-48 bg-gray-800 rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300"
        >
            <div className="w-full h-0 pb-[150%] relative">
                <img
                    src={`https://image.tmdb.org/t/p/w300${movie.poster_path}`}
                    alt={movie.title}
                    className="absolute top-0 left-0 w-full h-full object-cover"
                />
            </div>
            <div className="p-3">
                <h3 className="text-white font-semibold text-md mb-1">
                    {movie.title}
                </h3>
                <div className="flex justify-between items-center mb-2">
          <span className="text-gray-400 text-xs">
            {new Date(movie.release_date).toLocaleDateString(undefined, {
                year: "numeric",
            })}
          </span>
                    <span className="flex items-center bg-blue-500 text-white px-1 py-0.5 rounded text-xs">
            ★ {movie.vote_average.toFixed(1)}
          </span>
                </div>
                <p className="text-gray-300 text-xs line-clamp-2">
                    {movie.overview}
                </p>
            </div>
        </Link>
    );
}
import React from "react";
import {useNavigate, useLocation, useSearchParams} from "react-router-dom";

export default function Search() {
  const [searchParams] = useSearchParams();
  const query = searchParams.get("search") || "";

  const navigate = useNavigate();
  const location = useLocation();

  const handleSearch = (e) => {
    const value = e.target.value;
    const params = new URLSearchParams(location.search);
    if (value) {
      params.set("search", value);
    } else {
      params.delete("search");
    }
    navigate(`/?${params.toString()}`, { replace: true });
  };

  return (
    <div className="relative">
      <input
        type="text"
        placeholder="Search movies..."
        value={query}
        onChange={handleSearch}
        className="bg-gray-700 text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-64 transition-all"
      />
      <svg
        className="w-5 h-5 absolute right-3 top-3 text-gray-400"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
        />
      </svg>
    </div>
  );
}

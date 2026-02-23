import React from "react";
import { Link, NavLink } from "react-router-dom";
import Search from "./Search.jsx";
import { useAuth } from "../AuthContext.jsx";

export default function Navbar() {
    const { user } = useAuth();

    const linkClasses = ({ isActive }) =>
        `flex items-center text-lg font-medium text-white hover:text-blue-400 px-3 py-2 rounded ${
            isActive ? "bg-gray-700" : ""
        }`;

    return (
        <nav className="w-full bg-gray-800 text-gray-200 font-mono">
            <div className="max-w-screen-lg mx-auto flex items-center justify-between px-4 py-3">
                <Link to="/" className="text-2xl font-bold text-white mr-8">
                    CINEPOST
                </Link>

                <div className="flex items-center space-x-2">
                    <NavLink to="/" className={linkClasses} end>
                        Home
                    </NavLink>
                    <NavLink to="/sessions" className={linkClasses}>
                        Sessions
                    </NavLink>
                    <NavLink to="/favorites" className={linkClasses}>
                        Favorites
                    </NavLink>
                    <NavLink to="/recommendations" className={linkClasses}>
                        Recommendations
                    </NavLink>
                </div>

                <div className="flex items-center space-x-4 pl-2">
                    <Search />
                    {user ? (
                        <NavLink to="/profile" className={linkClasses}>
                            Profile
                        </NavLink>
                    ) : (
                        <NavLink to="/login" className={linkClasses}>
                            Sign<span className="text-transparent">_</span>In
                        </NavLink>
                    )}
                </div>
            </div>
        </nav>
    );
}
import { Link } from "react-router-dom";

export default function Footer() {
    return (
        <footer className="bg-gray-800 text-gray-300 py-5 font-mono">
            <div className="max-w-screen-lg mx-auto px-4 flex justify-between items-center">
                <p className="text-sm">
                    © {new Date().getFullYear()} Team 8. All rights reserved.
                </p>
                <Link to="/" className="text-lg font-semibold hover:text-white transition">
                    CINEPOST
                </Link>
            </div>
        </footer>
    );
}
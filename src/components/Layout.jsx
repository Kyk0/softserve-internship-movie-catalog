import React from "react";
import { Outlet } from "react-router-dom";
import Navbar from "./Navbar.jsx";
import Footer from "./Footer.jsx";
//
export default function Layout() {
  return (
    <div>
      <Navbar />
      <main className="flex flex-col min-h-screen bg-white">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}

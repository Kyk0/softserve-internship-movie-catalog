import React from "react";
import { createBrowserRouter, RouterProvider, Navigate } from "react-router-dom";

import Layout from "./components/Layout.jsx";
import Home from "./pages/Home.jsx";
import MovieDetails from "./pages/MovieDetails.jsx";
import Favorites from "./pages/Favorites.jsx";
//import SearchResults from "./pages/SearchResults.jsx";
import Sessions from "./pages/Sessions.jsx";
import Admin from "./pages/Admin.jsx";

import AuthPage from './pages/AuthPage.jsx';
import ProfilePage from './pages/ProfilePage.jsx';
import { useAuth } from './AuthContext.jsx';
import RecommendationsPage from "./pages/RecommendationsPage.jsx";

function App() {
  const { user, loading } = useAuth();
  if (loading) return <div>Loading…</div>;

  const router = createBrowserRouter([

    {
      path: '/login',
      element: user ? <Navigate to='/' /> : <AuthPage />
    },
    {
      path: '/',
      element: <Layout />,
      children: [
        { path: '/', element: <Home /> },
        { path: 'favorites', element: <Favorites /> },
        { path: 'sessions', element: <Sessions /> },
        // { path: '/search', element: <SearchResults /> },
        { path: 'movie/:id', element: <MovieDetails /> },
        {
          path: "recommendations",
          element: user ? <RecommendationsPage /> : <Navigate to="/login" />,
        },
        {
          path: 'admin',
          element: user?.user_metadata?.is_admin
              ? <Admin />
              : <Navigate to='/' replace />,
        },
        {
          path: 'profile',
          element: user ? <ProfilePage /> : <Navigate to='/login' />
        }
      ]
    }
  ]);

  return <RouterProvider router={router} />;
}

export default App;

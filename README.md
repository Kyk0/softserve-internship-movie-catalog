# Movie Catalog

A modern web application for browsing and managing your movie collection. Built with React and Supabase, this application provides a seamless experience for movie enthusiasts to discover, track, and organize their favorite films.

## 👥 Development Team (Team 8)

- Yurii Ivankiv - Team Lead
- Georgii Bryzh - Developer
- Kyrylo Kolesnichenko - Developer
- Kyrylo Kvas - Developer
- Denis Ivashchenko - Developer

## 🎬 Features

### Core Features
- User authentication and authorization
- Browse and search movies
- Create and manage personal movie collections
- Responsive design for all devices
- Modern and intuitive user interface
- Real-time updates with Supabase

### Main Pages

1. **Home Page**
   - Display of current movies and new releases
   - "More Details" button for movie page navigation

2. **Movie Page**
   - Add to favorites functionality
   - Detailed information including:
     - Movie poster
     - Description
     - Genre
     - Rating
     - Release year
     - Trailer
     - Cast information

3. **Search System**
   - Search by title

4. **Schedule Page**
   - View movie schedules
   - Filter by:
     - Time
     - Date
     - Genre

5. **Favorites Page**
   - Display saved movies
   - Quick access to favorite content

6. **Admin Panel**
   - Add, edit, and delete movies and sessions
   - Manage ticket prices

7. **Personalization (Optional)**
   - User registration and login for ticket booking
   - Personalized recommendations based on user preferences

## 🚀 Technologies

- **Frontend:**
  - React 19
  - Redux Toolkit for state management
  - React Router for navigation
  - Tailwind CSS for styling
  - React Hook Form for form handling
  - TMDB API

- **Backend:**
  - Supabase for backend services
  - Supabase Auth for authentication
  - Supabase Database for data storage

- **Development Tools:**
  - Vite for fast development and building
  - ESLint for code linting
  - TypeScript for type safety

## 📦 Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/movie-catalog.git
   cd movie-catalog
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the root directory and add your Supabase credentials:
   ```
    VITE_TMDB_API_KEY=write-your-tmdb-api-key
    VITE_TMDB_BASE_URL=https://api.themoviedb.org/3
    VITE_SUPABASE_URL=https://write-your-supabase-project-url.supabase.co
    VITE_SUPABASE_ANON_KEY=write-your-supabase-anon-key
    VITE_FAVORITES_FUNCTION_URL=https://write-your-supabase-project-url.supabase.co/functions/v1/favorites
    VITE_SUPABASE_PROXY_URL=https://write-your-supabase-project-url.supabase.co/functions/v1/

   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

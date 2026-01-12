import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

// Импорты страниц
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import ReportsPage from "./pages/ReportsPage";
import MoviesPage from "./pages/MoviesPage";

// !!! ВАЖНО: Добавляем импорты для новых страниц
import MovieDetails from "./pages/MovieDetails";
import Reservation from "./pages/Reservation";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Перенаправление с главной на логин (или на фильмы, если хочешь) */}
        <Route path="/" element={<Navigate to="/login" />} />

        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/reports" element={<ReportsPage />} />

        {/* Страница со списком фильмов */}
        <Route path="/movies" element={<MoviesPage />} />

        {/* !!! ВАЖНО: Маршруты для деталей и бронирования */}
        <Route path="/movie/:movieId" element={<MovieDetails />} />
        <Route path="/reservation/:screeningId" element={<Reservation />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import API from "../api";

const MovieDetails = () => {
  const { movieId } = useParams();
  const navigate = useNavigate();
  const [movie, setMovie] = useState(null);
  const [screenings, setScreenings] = useState([]);

  useEffect(() => {
    API.get(`/movies/${movieId}`)
      .then((res) => setMovie(res.data))
      .catch((err) => console.error(err));

    API.get(`/screenings`)
      .then((res) => {
        const movieScreenings = res.data.filter(
          (s) => s.movie_id === parseInt(movieId)
        );
        setScreenings(movieScreenings);
      })
      .catch((err) => console.error(err));
  }, [movieId]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user_id");
    localStorage.removeItem("user_role");
    navigate("/login");
  };

  if (!movie) return <div className="text-center mt-5">Ładowanie...</div>;

  return (
    <div className="container mt-5">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <Link to="/movies" className="btn btn-outline-secondary">
          &larr; Wróć do repertuaru
        </Link>
        <button onClick={handleLogout} className="btn btn-danger">
          Wyloguj się
        </button>
      </div>

      <div className="card shadow-lg border-0 overflow-hidden">
        <div className="row g-0">
          {/* ЛЕВАЯ КОЛОНКА: БОЛЬШОЙ ПЛАКАТ */}
          <div className="col-md-4">
            <img
              src={movie.image_url || "https://via.placeholder.com/400x600"}
              className="img-fluid h-100"
              alt={movie.title}
              style={{ objectFit: "cover", minHeight: "500px" }}
            />
          </div>

          {/* ПРАВАЯ КОЛОНКА: ОПИСАНИЕ И СЕАНСЫ */}
          <div className="col-md-8 p-4 d-flex flex-column">
            <h1 className="display-4 fw-bold">{movie.title}</h1>
            <p className="text-muted fs-5">
              Czas trwania: {movie.duration_minutes} min.
            </p>
            <p className="lead flex-grow-1">{movie.description}</p>

            <hr />

            <h3 className="mb-3">Najbliższe seanse:</h3>
            {screenings.length === 0 ? (
              <div className="alert alert-warning">
                Brak zaplanowanych seansów.
              </div>
            ) : (
              <div className="d-flex flex-wrap gap-3">
                {screenings.map((screening) => (
                  <Link
                    key={screening.id}
                    to={`/reservation/${screening.id}`}
                    className="btn btn-success btn-lg px-4 py-3"
                  >
                    {/* ЗДЕСЬ МЫ ДЕЛАЕМ КРАСИВУЮ ДАТУ И ВРЕМЯ */}
                    {/* Пример результата: 20.06 18:00 */}
                    <div className="fw-bold">
                      {new Date(screening.start_time).toLocaleString("pl-PL", {
                        day: "2-digit",
                        month: "2-digit",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </div>
                    <small>{screening.price} PLN</small>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MovieDetails;

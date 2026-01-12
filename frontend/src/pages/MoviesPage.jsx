import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import API from "../api";

const MoviesPage = () => {
  const [movies, setMovies] = useState([]);

  useEffect(() => {
    API.get("/movies")
      .then((res) => {
        console.log("Filmy pobrane z bazy:", res.data); // <--- Посмотрите в консоль (F12)
        setMovies(res.data);
      })
      .catch((err) => console.error(err));
  }, []);

  return (
    <div className="container mt-5">
      <h2 className="mb-4 text-center">Repertuar Kina</h2>
      <div className="row">
        {movies.map((movie) => (
          <div key={movie.id} className="col-md-3 mb-4">
            <div className="card h-100 shadow-sm border-0">
              {/* КАРТИНКА */}
              <img
                src={movie.image_url}
                className="card-img-top"
                alt={movie.title}
                style={{
                  height: "350px",
                  objectFit: "cover",
                  backgroundColor: "#eee",
                }}
                onError={(e) => {
                  e.target.src =
                    "https://upload.wikimedia.org/wikipedia/commons/6/65/No-Image-Placeholder.svg";
                }} // Запасная картинка, если ссылка битая
              />

              <div className="card-body d-flex flex-column">
                <h5 className="card-title fw-bold">{movie.title}</h5>
                <p className="card-text text-muted small">
                  Czas trwania: {movie.duration_minutes} min
                </p>
                <div className="mt-auto">
                  <Link
                    to={`/movie/${movie.id}`}
                    className="btn btn-primary w-100"
                  >
                    Zobacz seanse
                  </Link>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MoviesPage;

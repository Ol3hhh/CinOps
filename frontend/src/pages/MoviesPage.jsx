import React from 'react';
import { useNavigate } from 'react-router-dom';

const MoviesPage = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user_role');
    navigate('/login');
  };

  return (
    <div className="container mt-5">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1>Movie Listings (Client)</h1>
        <button onClick={handleLogout} className="btn btn-outline-danger">Logout</button>
      </div>
      
      <div className="alert alert-info">
        Welcome! A list of movies available for booking will appear here soon.
      </div>

      <div className="row">
        <div className="col-md-4">
          <div className="card">
             <div className="card-body">
                <h5 className="card-title">Sample Movie</h5>
                <p className="card-text">Movie description...</p>
                <button className="btn btn-primary">Book</button>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MoviesPage;
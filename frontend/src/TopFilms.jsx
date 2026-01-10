import React, { useEffect, useState } from 'react';
import axios from 'axios';

const TopFilms = () => {
  const [films, setFilms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // URL uses the service name 'backend' defined in docker-compose or localhost for tests
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';

    axios.get(`${apiUrl}/api/films`)
      .then(response => {
        setFilms(response.data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching data:', err);
        setError(err);
        setLoading(false);
      });
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error fetching data</div>;

  return (
    <div>
      <h2>Top Films</h2>
      <table>
        <thead>
          <tr>
            <th>Title</th>
            <th>Release Date</th>
            <th>Box Office</th>
          </tr>
        </thead>
        <tbody>
          {films.map((film, index) => (
            <tr key={index}>
              <td>{film.title}</td>
              <td>{film.release_date}</td>
              <td>{film.box_office}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default TopFilms;
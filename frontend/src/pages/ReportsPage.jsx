import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const ReportsPage = () => {
  const navigate = useNavigate();
  const [topFilms, setTopFilms] = useState([]);
  const [expiredReservations, setExpiredReservations] = useState([]);
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    const fetchReports = async () => {
      try {
        const config = {
          headers: { Authorization: `Bearer ${token}` }
        };

        const [resFilms, resExpired, resSales] = await Promise.all([
          axios.get('http://localhost:5000/api/reports/top-films', config),
          axios.get('http://localhost:5000/api/reports/expired-reservations', config),
          axios.get('http://localhost:5000/api/reports/screening-sales', config)
        ]);

        setTopFilms(resFilms.data);
        setExpiredReservations(resExpired.data);
        setSales(resSales.data);
        setLoading(false);

      } catch (err) {
        console.error("Error fetching reports", err);
        setError("Failed to fetch data. Make sure you have Admin privileges.");
        setLoading(false);
      }
    };

    fetchReports();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user_role');
    navigate('/login');
  };

  if (loading) return <div className="text-center mt-5">Loading reports...</div>;

  return (
    <div className="container mt-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1>Reports Dashboard (Admin)</h1>
        <button onClick={handleLogout} className="btn btn-danger">Logout</button>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      <div className="row">
        <div className="col-md-6 mb-4">
          <div className="card shadow h-100">
            <div className="card-header bg-primary text-white">Top 5 Movies (Revenue)</div>
            <div className="card-body">
              {topFilms.length === 0 ? <p>No data available</p> : (
                <ul className="list-group">
                  {topFilms.map((film, index) => (
                    <li key={index} className="list-group-item d-flex justify-content-between align-items-center">
                      {film.title}
                      <span className="badge bg-primary rounded-pill">{film.total_revenue} PLN</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>

        <div className="col-md-6 mb-4">
          <div className="card shadow h-100">
            <div className="card-header bg-warning text-dark">Expired Reservations</div>
            <div className="card-body">
                {expiredReservations.length === 0 ? <p>No expired reservations</p> : (
                  <table className="table table-sm">
                    <thead><tr><th>ID</th><th>Client</th><th>Date</th></tr></thead>
                    <tbody>
                      {expiredReservations.map((res, index) => (
                        <tr key={index}>
                          <td>{res.id}</td>
                          <td>{res.user_email}</td>
                          <td>{res.created_at}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
            </div>
          </div>
        </div>

        <div className="col-12 mb-4">
          <div className="card shadow">
            <div className="card-header bg-success text-white">Sales by Screening</div>
            <div className="card-body">
              {sales.length === 0 ? <p>No sales data available</p> : (
                 <table className="table table-striped">
                 <thead>
                   <tr>
                     <th>Movie</th>
                     <th>Time</th>
                     <th>Tickets Sold</th>
                     <th>Revenue</th>
                   </tr>
                 </thead>
                 <tbody>
                   {sales.map((item, index) => (
                     <tr key={index}>
                       <td>{item.movie_title}</td>
                       <td>{item.screening_time}</td>
                       <td>{item.tickets_sold}</td>
                       <td><strong>{item.total_income} PLN</strong></td>
                     </tr>
                   ))}
                 </tbody>
               </table>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportsPage;
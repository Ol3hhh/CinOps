import { useEffect, useState } from "react";
import API from "../api";
import { Link } from "react-router-dom";
import { Card, Button, Row, Col, Badge } from "react-bootstrap";

const Repertoire = () => {
  const [films, setFilms] = useState([]);

  useEffect(() => {
    // Pobieramy filmy z backendu
    API.get("/films")
      .then((res) => setFilms(res.data))
      .catch((err) => console.error(err));
  }, []);

  // Dla uproszczenia zakładamy, że każdy film ma seans ID=1.
  // W pełnej wersji tutaj byłaby lista dat seansów.
  const mockScreeningId = 1;

  return (
    <div>
      <h2 className="mb-4">Dzisiejszy Repertuar</h2>
      <Row xs={1} md={2} lg={3} className="g-4">
        {films.map((film) => (
          <Col key={film.id}>
            <Card className="h-100 shadow-sm border-0">
              <Card.Body>
                <div className="d-flex justify-content-between align-items-start">
                  <Card.Title>{film.title}</Card.Title>
                  <Badge bg="info">{film.duration_minutes} min</Badge>
                </div>
                <Card.Text className="text-muted mt-2">
                  {film.description}
                </Card.Text>
                <Link to={`/reservation/${mockScreeningId}`}>
                  <Button variant="outline-primary" className="w-100 mt-3">
                    Rezerwuj Bilet
                  </Button>
                </Link>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>
    </div>
  );
};

export default Repertoire;

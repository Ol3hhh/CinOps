def test_top_films_endpoint(client):
    """Sprawdza czy raport Top Films działa i zwraca listę"""
    response = client.get("/api/reports/top-films")

    assert response.status_code == 200

    data = response.get_json()
    assert isinstance(data, list)

    if len(data) > 0:
        assert "title" in data[0]
        assert "revenue" in data[0]


def test_screening_sales_endpoint(client):
    """Sprawdza raport sprzedaży biletów"""
    response = client.get("/api/reports/screening-sales")

    assert response.status_code == 200
    data = response.get_json()
    assert isinstance(data, list)


    if len(data) > 0:
        assert "tickets_sold" in data[0]


def test_expired_reservations_structure(client):
    """
    Sprawdza ten raport, który naprawialiśmy (aliasy client, date, id).
    """
    response = client.get("/api/reports/expired-reservations")

    assert response.status_code == 200
    data = response.get_json()
    assert isinstance(data, list)


    if len(data) > 0:
        row = data[0]
        assert "client" in row
        assert "date" in row
        assert "id" in row

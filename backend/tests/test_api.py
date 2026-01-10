def test_top_films_endpoint(client):
    """Sprawdza czy raport Top Films działa i zwraca listę"""
    response = client.get("/api/reports/top-films")

    # Czy serwer odpowiedział OK (200)?
    assert response.status_code == 200

    # Czy dostaliśmy dane w formacie JSON?
    data = response.get_json()
    assert isinstance(data, list)

    # Opcjonalnie: sprawdź czy dane mają sens
    if len(data) > 0:
        assert "title" in data[0]
        # --- ZMIANA TUTAJ ---
        # Było: assert 'total_revenue' in data[0]
        assert "revenue" in data[0]


def test_screening_sales_endpoint(client):
    """Sprawdza raport sprzedaży biletów"""
    response = client.get("/api/reports/screening-sales")

    assert response.status_code == 200
    data = response.get_json()
    assert isinstance(data, list)

    # Sprawdzamy czy struktura kluczy się zgadza
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

    # Jeśli mamy dane w bazie (a dodawaliśmy je!), sprawdźmy czy pola są poprawne dla Frontendu
    if len(data) > 0:
        row = data[0]
        # To jest kluczowe! Sprawdzamy czy aliasy działają
        assert "client" in row
        assert "date" in row
        assert "id" in row

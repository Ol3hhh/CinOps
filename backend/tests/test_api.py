import pytest
from unittest.mock import patch, MagicMock
from __init__ import app 

@pytest.fixture
def client():
    app.config['TESTING'] = True
    with app.test_client() as client:
        yield client

@patch('psycopg2.connect')
def test_top_films_endpoint(mock_connect, client):
    mock_conn = MagicMock()
    mock_cursor = MagicMock()
    
    mock_connect.return_value = mock_conn
    mock_conn.cursor.return_value = mock_cursor
    mock_cursor.__enter__.return_value = mock_cursor
    
    fake_data = [
        {'title': 'Movie 1', 'release_date': '2023-01-01', 'box_office': 1000},
        {'title': 'Movie 2', 'release_date': '2023-01-02', 'box_office': 2000}
    ]
    mock_cursor.fetchall.return_value = fake_data

    response = client.get("/api/reports/top-films")

    assert response.status_code == 200
    data = response.get_json()
    assert len(data) == 2
    assert data[0]['title'] == 'Movie 1'

@patch('psycopg2.connect')
def test_screening_sales_endpoint(mock_connect, client):
    mock_conn = MagicMock()
    mock_cursor = MagicMock()
    mock_connect.return_value = mock_conn
    mock_conn.cursor.return_value = mock_cursor
    mock_cursor.__enter__.return_value = mock_cursor

    mock_cursor.fetchall.return_value = [
        {'screening_id': 1, 'tickets_sold': 50, 'total_revenue': 500}
    ]

    response = client.get("/api/reports/screening-sales")

    assert response.status_code == 200
    assert len(response.get_json()) > 0

@patch('psycopg2.connect')
def test_expired_reservations_structure(mock_connect, client):
    mock_conn = MagicMock()
    mock_cursor = MagicMock()
    mock_connect.return_value = mock_conn
    mock_conn.cursor.return_value = mock_cursor
    mock_cursor.__enter__.return_value = mock_cursor

    mock_cursor.fetchall.return_value = [
        {'id': 101, 'client': 'Jan Kowalski', 'date': '2023-10-10'}
    ]

    response = client.get("/api/reports/expired-reservations")
    
    assert response.status_code == 200
    data = response.get_json()
    assert 'client' in data[0]
    assert 'date' in data[0]
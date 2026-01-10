from flask import Blueprint, jsonify, request
from backend.db import get_db_connection
from psycopg2.extras import RealDictCursor
from datetime import datetime

reports_bp = Blueprint('reports', __name__)

@reports_bp.route("/api/reports/top-films", methods=["GET"])
def get_top_films():
    """
    Raport: Najlepiej zarabiające filmy.
    Poprawka: Zmieniono domyślny rok na 2026 (zgodnie z czasem kontenera).
    """

    date_from = request.args.get('date_from', '2024-01-01')
    date_to = request.args.get('date_to', '2027-12-31')

    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    

    sql = """
        SELECT m.title, COUNT(t.id) as tickets_sold, SUM(t.price) as revenue
        FROM Movie m
        JOIN Screening s ON m.id = s.movie_id
        JOIN Ticket t ON s.id = t.screening_id
        WHERE s.start_time BETWEEN %s AND %s
          AND t.status = 'paid'
        GROUP BY m.id, m.title
        ORDER BY revenue DESC
        LIMIT 10;
    """
    
    cur.execute(sql, (date_from, date_to))
    results = cur.fetchall()
    
    cur.close()
    conn.close()
    return jsonify(results), 200

@reports_bp.route("/api/reports/expired-reservations", methods=["GET"])
def get_expired_reservations():
    """
    Raport: Wygasłe rezerwacje.
    Poprawka: Aliasy id, client, date są wymagane przez Frontend.
    """
    conn = get_db_connection()
    try:
        cur = conn.cursor(cursor_factory=RealDictCursor)
        
        
        query = """
            SELECT 
                t.id as id,
                u.email as client,
                t.expiration_time as date
            FROM Ticket t
            JOIN App_User u ON t.user_id = u.id
            WHERE t.status = 'reserved' 
              AND t.expiration_time < NOW()
            ORDER BY t.expiration_time DESC;
        """
        
        cur.execute(query)
        results = cur.fetchall()
        
        return jsonify(results), 200
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        conn.close()

@reports_bp.route("/api/reports/screening-sales", methods=["GET"])
def get_screening_sales_report():
    """
    Raport: Sprzedaż wg Seansów.
    Wersja poprawiona: Nie wymaga screening_id, zwraca listę topowych seansów.
    """
    conn = get_db_connection()
    try:
        cur = conn.cursor(cursor_factory=RealDictCursor)
        

        query = """
            SELECT 
                s.id as screening_id,
                m.title as movie_title,
                s.start_time,
                COUNT(t.id) as tickets_sold,
                COALESCE(SUM(t.price), 0) as total_revenue
            FROM Screening s
            JOIN Movie m ON s.movie_id = m.id
            LEFT JOIN Ticket t ON s.id = t.screening_id AND t.status = 'paid'
            GROUP BY s.id, m.title, s.start_time
            ORDER BY s.start_time DESC
            LIMIT 10;
        """
        
        cur.execute(query)
        results = cur.fetchall()
        
        return jsonify(results), 200
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        conn.close()
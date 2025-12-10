from flask import Blueprint, jsonify, request
from backend.db import get_db_connection
from psycopg2.extras import RealDictCursor

reports_bp = Blueprint('reports', __name__)

@reports_bp.route("/api/reports/top-films", methods=["GET"])
def get_top_films():
    """
    Raport: Najlepiej zarabiające filmy (na podstawie biletów).
    Params: ?date_from=2025-01-01&date_to=2025-12-31
    """
    date_from = request.args.get('date_from', '2025-01-01')
    date_to = request.args.get('date_to', '2025-12-31')

    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    
    # Movie -> Screening -> Ticket
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
    Zapytanie 2: Rezerwacje przeterminowane (nieopłacone).
    Wyszukuje bilety ze statusem 'reserved', których czas ważności minął.
    """
    conn = get_db_connection()
    try:
        cur = conn.cursor(cursor_factory=RealDictCursor)
        
        # Logika: status = 'reserved' AND expiration_time < NOW()
        # Wyciągamy też o ile minut przekroczono czas (dla celów informacyjnych)
        query = """
            SELECT 
                t.id AS ticket_id, 
                u.email, 
                t.screening_id, 
                t.reservation_date, 
                t.expiration_time,
                EXTRACT(EPOCH FROM (NOW() - t.expiration_time))/60 AS minutes_overdue
            FROM Ticket t
            JOIN App_User u ON t.user_id = u.id
            WHERE t.status = 'reserved'
              AND t.expiration_time < NOW()
        """
        
        cur.execute(query)
        expired_tickets = cur.fetchall()
        
        return jsonify(expired_tickets), 200
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        conn.close()

@reports_bp.route("/api/reports/screening-sales", methods=["GET"])
def get_screening_sales_report():
    """
    Zapytanie 3 (z dokumentacji): Raport zamówień gastronomicznych dla seansu.
    Zwraca liczbę zamówień, średnią wartość i najlepiej sprzedające się produkty.
    Params: ?screening_id=1&limit=5
    """
    screening_id = request.args.get('screening_id')
    limit = request.args.get('limit', 5)

    if not screening_id:
        return jsonify({"error": "Missing screening_id"}), 400

    conn = get_db_connection()
    try:
        cur = conn.cursor(cursor_factory=RealDictCursor)
        
        # Zapytanie odwzorowujące logikę z PDF (Etap 2, str. 8-9),
        # ale dostosowane do angielskich nazw tabel w init.sql.
        query = """
            SELECT 
                p.name as product_name,
                SUM(oi.quantity) as total_sold,
                COUNT(DISTINCT fo.id) as orders_containing_product,
                COALESCE(ROUND(AVG(fo.total_amount), 2), 0) as avg_order_value_context
            FROM Food_Order fo
            LEFT JOIN Order_Item oi ON oi.order_id = fo.id
            LEFT JOIN Product p ON p.id = oi.product_id
            WHERE fo.screening_id = %s
            GROUP BY p.name
            ORDER BY total_sold DESC
            LIMIT %s;
        """
        
        cur.execute(query, (screening_id, limit))
        results = cur.fetchall()
        
        return jsonify(results), 200
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        conn.close()
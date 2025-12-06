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
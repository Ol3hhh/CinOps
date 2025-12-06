from flask import Blueprint, jsonify
from backend.db import get_db_connection
from psycopg2.extras import RealDictCursor

movies_bp = Blueprint('movies', __name__)

@movies_bp.route("/api/films", methods=["GET"])
def get_all_films():
    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    cur.execute("SELECT id, title, duration_minutes, description FROM Movie;")
    films = cur.fetchall()
    cur.close()
    conn.close()
    return jsonify(films), 200
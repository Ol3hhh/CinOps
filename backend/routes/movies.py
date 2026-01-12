from flask import Blueprint, jsonify, request
from backend.db import get_db_connection
from psycopg2.extras import RealDictCursor

movies_bp = Blueprint("movies", __name__)


# 1. СПИСОК ВСЕХ ФИЛЬМОВ
@movies_bp.route("/api/movies", methods=["GET"])
def get_all_movies():
    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)

    # ВАЖНО: Добавлено поле image_url в запрос!
    cur.execute(
        "SELECT id, title, duration_minutes, description, image_url FROM Movie;"
    )

    films = cur.fetchall()
    cur.close()
    conn.close()
    return jsonify(films), 200


# 2. ДЕТАЛИ ОДНОГО ФИЛЬМА
@movies_bp.route("/api/movies/<int:movie_id>", methods=["GET"])
def get_movie_details(movie_id):
    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)

    # SELECT * берет ВСЕ колонки, включая image_url (если база обновлена)
    cur.execute("SELECT * FROM Movie WHERE id = %s", (movie_id,))
    movie = cur.fetchone()
    cur.close()
    conn.close()

    if movie is None:
        return jsonify({"error": "Movie not found"}), 404

    return jsonify(movie), 200


# 3. ВСЕ СЕАНСЫ
@movies_bp.route("/api/screenings", methods=["GET"])
def get_all_screenings():
    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    cur.execute("SELECT * FROM Screening ORDER BY start_time ASC;")
    screenings = cur.fetchall()
    cur.close()
    conn.close()
    return jsonify(screenings), 200


# 4. ДЕТАЛИ СЕАНСА
@movies_bp.route("/api/screenings/<int:screening_id>", methods=["GET"])
def get_screening_details(screening_id):
    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    cur.execute("SELECT * FROM Screening WHERE id = %s", (screening_id,))
    screening = cur.fetchone()
    cur.close()
    conn.close()
    if not screening:
        return jsonify({"error": "Screening not found"}), 404
    return jsonify(screening), 200


# 5. ЗАНЯТЫЕ МЕСТА
@movies_bp.route("/api/screenings/<int:screening_id>/seats", methods=["GET"])
def get_taken_seats(screening_id):
    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    try:
        cur.execute(
            """
            UPDATE Ticket 
            SET status = 'cancelled' 
            WHERE screening_id = %s 
              AND status = 'reserved' 
              AND expiration_time < NOW()
        """,
            (screening_id,),
        )
        conn.commit()

        cur.execute(
            """
            SELECT seat_id FROM Ticket 
            WHERE screening_id = %s 
            AND status IN ('reserved', 'paid', 'occupied')
        """,
            (screening_id,),
        )
        taken_seats = [row["seat_id"] for row in cur.fetchall()]
        return jsonify(taken_seats), 200
    except Exception as e:
        conn.rollback()
        return jsonify({"error": str(e)}), 500
    finally:
        cur.close()
        conn.close()

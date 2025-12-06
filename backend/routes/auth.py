from flask import Blueprint, jsonify, request
from backend.db import get_db_connection
from psycopg2.extras import RealDictCursor

auth_bp = Blueprint('auth', __name__)

@auth_bp.route("/api/register", methods=["POST"])
def register():
    data = request.get_json()
    conn = get_db_connection()
    try:
        cur = conn.cursor()
        cur.execute(
            """
            INSERT INTO App_User (first_name, last_name, email, password_hash, role)
            VALUES (%s, %s, %s, %s, 'Client')
            RETURNING id;
            """,
            (data.get('first_name'), data.get('last_name'), data.get('email'), data.get('password'))
        )
        user_id = cur.fetchone()[0]
        conn.commit()
        cur.close()
        conn.close()
        return jsonify({"message": "User registered", "user_id": user_id}), 201
    except Exception as e:
        conn.rollback()
        return jsonify({"error": str(e)}), 400

@auth_bp.route("/api/login", methods=["POST"])
def login():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')

    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    
    cur.execute("SELECT id, role, password_hash FROM App_User WHERE email = %s", (email,))
    user = cur.fetchone()
    cur.close()
    conn.close()

    if user and user['password_hash'] == password:
        return jsonify({"message": "Login successful", "user_id": user['id'], "role": user['role']}), 200
    else:
        return jsonify({"error": "Invalid credentials"}), 401
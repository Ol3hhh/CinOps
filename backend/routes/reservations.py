from flask import Blueprint, jsonify, request
from backend.db import get_db_connection
from psycopg2.extras import RealDictCursor

reservations_bp = Blueprint("reservations", __name__)


# --- TRANSAKCJA A: Rezerwacja miejsca ---
@reservations_bp.route("/api/reservations", methods=["POST"])
def create_reservation():
    """
    WB.01 / Transakcja A: Rezerwacja miejsca.
    Body JSON:
    {
        "user_id": 1,
        "screening_id": 1,
        "seat_id": 5
    }
    """
    data = request.get_json()
    user_id = data.get("user_id")
    screening_id = data.get("screening_id")
    seat_id = data.get("seat_id")

    # Walidacja danych wejściowych
    if not all([user_id, screening_id, seat_id]):
        return jsonify({"error": "Missing required fields"}), 400

    conn = get_db_connection()
    try:
        cur = conn.cursor(cursor_factory=RealDictCursor)

        # 1. Sprawdź cenę seansu (potrzebna do biletu)
        cur.execute("SELECT price FROM Screening WHERE id = %s", (screening_id,))
        screening = cur.fetchone()
        if not screening:
            return jsonify({"error": "Screening not found"}), 404
        price = screening["price"]

        # 2. Sprawdź dostępność miejsca (czy nie jest zarezerwowane/opłacone/zajęte)
        # Logika z PDF: SELECT COUNT(*) ... WHERE status IN (...)
        cur.execute(
            """
            SELECT COUNT(*) as count
            FROM Ticket
            WHERE screening_id = %s
              AND seat_id = %s
              AND status IN ('reserved', 'paid', 'occupied')
        """,
            (screening_id, seat_id),
        )

        if cur.fetchone()["count"] > 0:
            return jsonify({"error": "Seat is already taken"}), 409  # Conflict

        # 3. Utwórz rezerwację (INSERT)
        # Status 'reserved', expiration_time = NOW + 10 minut
        cur.execute(
            """
            INSERT INTO Ticket (screening_id, user_id, seat_id, status, price, reservation_date, expiration_time)
            VALUES (%s, %s, %s, 'reserved', %s, NOW(), NOW() + INTERVAL '10 minutes')
            RETURNING id, expiration_time;
        """,
            (screening_id, user_id, seat_id, price),
        )

        new_ticket = cur.fetchone()
        conn.commit()

        return (
            jsonify(
                {
                    "message": "Reservation successful",
                    "ticket_id": new_ticket["id"],
                    "expiration_time": new_ticket["expiration_time"],
                }
            ),
            201,
        )

    except Exception as e:
        conn.rollback()
        return jsonify({"error": str(e)}), 500
    finally:
        conn.close()


# --- TRANSAKCJA B: Opłacenie biletu ---
@reservations_bp.route("/api/payments", methods=["POST"])
def pay_for_ticket():
    """
    Transakcja B: Opłacenie biletu + finalizacja.
    Body JSON:
    {
        "ticket_id": 10,
        "amount": 25.00,
        "payment_method": "blik"
    }
    """
    data = request.get_json()
    ticket_id = data.get("ticket_id")
    amount = data.get("amount")
    payment_method = data.get("payment_method", "card")

    conn = get_db_connection()
    try:
        cur = conn.cursor(cursor_factory=RealDictCursor)

        # Rozpoczęcie transakcji

        cur.execute(
            "SELECT status, price FROM Ticket WHERE id = %s FOR UPDATE", (ticket_id,)
        )
        ticket = cur.fetchone()

        if not ticket:
            return jsonify({"error": "Ticket not found"}), 404

        if ticket["status"] != "reserved":
            return (
                jsonify(
                    {
                        "error": f"Ticket status is '{ticket['status']}', expected 'reserved'"
                    }
                ),
                400,
            )

        if float(ticket["price"]) != float(amount):
            return jsonify({"error": "Incorrect payment amount"}), 400

        # 2. Rejestracja transakcji płatniczej
        cur.execute(
            """
            INSERT INTO Payment_Transaction (ticket_id, amount, payment_method, payment_date)
            VALUES (%s, %s, %s, NOW())
        """,
            (ticket_id, amount, payment_method),
        )

        # 3. Aktualizacja statusu biletu na 'paid'
        cur.execute(
            """
            UPDATE Ticket
            SET status = 'paid'
            WHERE id = %s
        """,
            (ticket_id,),
        )

        # 4. Zatwierdzenie całej transakcji
        conn.commit()

        return jsonify({"message": "Payment successful, ticket confirmed"}), 200

    except Exception as e:
        conn.rollback()
        return jsonify({"error": str(e)}), 500
    finally:
        conn.close()


@reservations_bp.route("/api/screenings/<int:screening_id>/seats", methods=["GET"])
def get_taken_seats(screening_id):
    """Zwraca listę ID miejsc, które są już zajęte dla danego seansu"""
    conn = get_db_connection()
    try:
        cur = conn.cursor(cursor_factory=RealDictCursor)
        # Pobieramy seat_id z tabeli Ticket, gdzie status to reserved/paid/occupied
        query = """
            SELECT seat_id 
            FROM Ticket 
            WHERE screening_id = %s 
              AND status IN ('reserved', 'paid', 'occupied')
        """
        cur.execute(query, (screening_id,))
        rows = cur.fetchall()
        # Zwracamy płaską listę ID, np. [1, 5, 88]
        taken_seats = [row["seat_id"] for row in rows]
        return jsonify(taken_seats), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        conn.close()

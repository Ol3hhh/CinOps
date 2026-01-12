from flask import Blueprint, jsonify, request
from backend.db import get_db_connection

orders_bp = Blueprint("orders", __name__)


@orders_bp.route("/api/orders", methods=["POST"])
def submit_bar_order():
    """
    Tworzenie nowego zamówienia (Transakcja C)
    ---
    tags:
      - Zamówienia
    parameters:
      - name: body
        in: body
        required: true
        schema:
          type: object
          properties:
            user_id:
              type: integer
              example: 1
            screening_id:
              type: integer
              example: 1
            items:
              type: array
              items:
                type: object
                properties:
                  product_id:
                    type: integer
                    example: 1
                  quantity:
                    type: integer
                    example: 2
    responses:
      201:
        description: Zamówienie utworzone
      400:
        description: Błąd danych
    """
    data = request.get_json()

    user_id = data.get("user_id")
    screening_id = data.get("screening_id")
    items = data.get("items")

    if not items:
        return jsonify({"error": "Koszyk jest pusty"}), 400

    conn = get_db_connection()
    try:
        cur = conn.cursor()
        cur.execute(
            """
            INSERT INTO Food_Order (user_id, screening_id, order_date, status, total_amount)
            VALUES (%s, %s, NOW(), 'new', 0)
            RETURNING id;
            """,
            (user_id, screening_id),
        )
        order_id = cur.fetchone()[0]

        total_amount = 0.0

        for item in items:
            cur.execute(
                "SELECT price FROM Product WHERE id = %s", (item["product_id"],)
            )
            res = cur.fetchone()
            if not res:
                raise Exception(f"Produkt ID {item['product_id']} nie istnieje")

            unit_price = res[0]
            quantity = item["quantity"]
            item_value = unit_price * quantity
            total_amount += float(item_value)

            cur.execute(
                """
                INSERT INTO Order_Item (order_id, product_id, quantity, unit_price)
                VALUES (%s, %s, %s, %s)
                """,
                (order_id, item["product_id"], quantity, unit_price),
            )

        cur.execute(
            "UPDATE Food_Order SET total_amount = %s WHERE id = %s",
            (total_amount, order_id),
        )

        conn.commit()
        cur.close()
        conn.close()

        return (
            jsonify(
                {
                    "message": "Zamówienie przyjęte",
                    "order_id": order_id,
                    "total_amount": total_amount,
                }
            ),
            201,
        )

    except Exception as e:
        conn.rollback()
        if conn:
            conn.close()
        print(f"DEBUG SQL Error: {e}")
        return jsonify({"error": str(e)}), 400


@orders_bp.route("/api/products", methods=["GET"])
def get_products():
    """Pobiera listę dostępnych produktów gastronomicznych"""
    conn = get_db_connection()
    try:
        cur = conn.cursor(cursor_factory=RealDictCursor)
        cur.execute("SELECT id, name, price FROM Product")
        products = cur.fetchall()
        return jsonify(products), 200
    finally:
        conn.close()

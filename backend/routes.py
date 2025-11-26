from flask import Flask, jsonify, request
from backend import app


@app.route("/")
def main():
    return "<h1>Hello</h1>"

@app.route("/api/health", methods=["GET"])
def health_check():
    return jsonify({"status": "ok", "service": "CineOps Backend"}), 200

@app.route("/api/register", methods=["POST"])
def register():
    data = request.get_json()
    return jsonify({"message": "User registration successful", "user_data": data}), 201

@app.route("/api/login", methods=["POST"])
def login():
    data = request.get_json()
    return jsonify({"token": "generated_jwt_token", "user_id": 1}), 200

@app.route("/api/films", methods=["GET"])
def get_all_films():
    return jsonify([{"id": 1, "title": "Incepcja", "duration": 148}]), 200

@app.route("/api/films/<int:film_id>", methods=["GET"])
def get_film_details(film_id):
    return jsonify({"id": film_id, "title": "Film A", "description": "Fantastyka"}), 200

@app.route("/api/tickets", methods=["POST"])
def create_reservation():
    data = request.get_json()
    return jsonify({"message": "Reservation created", "reservation_id": 101}), 201

@app.route("/api/orders", methods=["POST"])
def submit_bar_order():
    data = request.get_json()
    return jsonify({"message": "Order placed", "order_id": 202}), 201

@app.route("/api/payment", methods=["POST"])
def handle_payment():
    data = request.get_json()
    return jsonify({"message": "Payment successful", "transaction_id": "TX12345"}), 200

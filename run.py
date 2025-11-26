from flask import Flask, jsonify, request
from backend import app
import backend.routes

if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0", port=5000)


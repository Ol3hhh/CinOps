from flask import Flask
from backend.config import Config
from backend.routes.auth import auth_bp
from backend.routes.movies import movies_bp
from backend.routes.orders import orders_bp
from backend.routes.reports import reports_bp

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    app.register_blueprint(auth_bp)
    app.register_blueprint(movies_bp)
    app.register_blueprint(orders_bp)
    app.register_blueprint(reports_bp)

    return app
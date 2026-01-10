import pytest
import sys
import os

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "../..")))

from backend import create_app  # noqa: E402


@pytest.fixture
def client():
    """
    Tworzy instancję aplikacji specjalnie dla testów.
    """
    flask_app = create_app()
    flask_app.config["TESTING"] = True

    with flask_app.test_client() as client:
        yield client

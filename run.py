# run.py
from dotenv import load_dotenv
import os
from backend import create_app

load_dotenv()

app = create_app()

if __name__ == "__main__":
    # --- DODAJ TO: ---
    print("\n--- DOSTĘPNE ADRESY (ROUTES) ---")
    for rule in app.url_map.iter_rules():
        print(f"{rule.endpoint}: {rule}")
    print("--------------------------------\n")
    # -----------------
    
    app.run(debug=True, host="0.0.0.0", port=5000)
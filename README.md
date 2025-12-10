# CinOps

🎬 CineOps: Cinema Management System (Flask/React/PostgreSQL). Full IaaS deployment on Ubuntu server with automated CI/CD pipeline.

# System Zarządzania Kinem (Cinema Management System) - Backend

Projekt realizowany w ramach kursu **Bazy Danych (2025/2026)**.
Aplikacja backendowa typu REST API obsługująca kluczowe procesy biznesowe kina: zarządzanie repertuarem, rezerwację miejsc z blokadą współbieżną, płatności oraz obsługę baru.

## 👥 Zespół Projektowy

- **Mariia Bulai** (282655)
- **Oleh Marushchak** (280065)
- **Grupa:** ŚR TP 17:05
- **Prowadzący:** mgr inż. Michał Jaroszczuk

---

## 🛠️ Stack Technologiczny

- **Backend:** Python 3.13 + Flask
- **Baza Danych:** PostgreSQL 15
- **Konteneryzacja:** Docker + Docker Compose
- **ORM/Driver:** Psycopg2 (Native SQL queries for performance & transaction control)

---

## 🚀 Instrukcja Uruchomienia

Wymagane środowisko: **Docker Desktop**.

### 1. Uruchomienie aplikacji

Aby zbudować obrazy i uruchomić kontenery, wykonaj w terminalu:
docker-compose up --build
Aplikacja wystartuje pod adresem: http://localhost:5000.

### 2. Inicjalizacja Danych

Baza danych jest automatycznie zasilana przy pierwszym starcie skryptem init.sql, który tworzy:

- Strukturę tabel (zgodną z diagramem ERD).
- Przykładowe dane (Filmy: "Diuna", Sala A).
- Automatycznie generuje 100 miejsc w sali.

### 3. Dokumentacja API

Aplikacja realizuje 3 główne transakcje biznesowe oraz zaawansowane raportowanie.

- POST/api/register Rejestracja nowego klienta
- POST/api/login Logowanie (zwraca user_id i rolę)
- GET/api/films Pobiera listę dostępnych filmów
- POST/api/reservations Rezerwacja. Sprawdza dostępność i blokuje miejsce
- POST/api/payments Płatność. Używa FOR UPDATE do zmiany statusu
- POST/api/orders Zamówienie barowe przypisane do seansu
- GET/api/reports/top-films Ranking finansowy filmów
- GET/api/reports/expired-reservations Lista wygasłych rezerwacji
- GET/api/reports/screening-sales Statystyki sprzedaży barowej (wymaga ?screening_id=1)

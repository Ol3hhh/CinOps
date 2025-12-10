# CinOps

🎬 **CineOps: Cinema Management System** (Flask/React/PostgreSQL) — full IaaS deployment on an Ubuntu server with automated CI/CD pipeline.

# Cinema Management System – Backend

Project completed as part of the **Database Systems course (2025/2026)**.
A backend **REST API** application supporting core cinema business processes: repertoire management, seat reservations with concurrency-safe locking, payments, and bar service.

## 👥 Project Team

* **Mariia Bulai**
* **Oleh Marushchak** 

---

## 🛠️ Technology Stack

* **Backend:** Python 3.13 + Flask
* **Database:** PostgreSQL 15
* **Containerization:** Docker + Docker Compose
* **ORM/Driver:** Psycopg2 (native SQL queries for performance and transaction control)

---

## 🚀 Setup Instructions

Required environment: **Docker**

### 1. Start the application

To build images and start containers, run in your terminal in cloned directory:

```bash
docker-compose up --build
```

The application will be available at:
👉 **[http://localhost:5000](http://localhost:5000)**

### 2. Data Initialization

The database is automatically initialized on first launch using the `init.sql` script, which creates:

* the full table structure (aligned with the ERD diagram),
* sample data (e.g., the movie “Dune”, Hall A),
* automatically generates 100 seats in the hall.

### 3. API Documentation

The application handles 3 major business transactions and advanced reporting.

#### 🔐 Users

* **POST /api/register** – register a new client
* **POST /api/login** – login (returns `user_id` and role)

#### 🎬 Repertoire

* **GET /api/films** – retrieves a list of available films

#### 🎟️ Reservations & Payments

* **POST /api/reservations** – seat reservation, availability check, and lock
* **POST /api/payments** – payment processing, uses `FOR UPDATE` for safe status updates

#### 🍿 Bar

* **POST /api/orders** – bar order associated with a specific screening

#### 📊 Reports

* **GET /api/reports/top-films** – revenue ranking of films
* **GET /api/reports/expired-reservations** – list of expired reservations
* **GET /api/reports/screening-sales?screening_id=1** – bar sales statistics for a screening

---



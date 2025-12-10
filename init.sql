-- TWORZENIE TABEL (Bez zmian)
CREATE TABLE App_User (
    id SERIAL PRIMARY KEY,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'Client' CHECK (role IN ('Client', 'Admin', 'Cashier', 'Bartender', 'Manager'))
);

CREATE TABLE Movie (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    duration_minutes INT NOT NULL,
    description TEXT
);

CREATE TABLE Genre (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL
);

CREATE TABLE Movie_Genre (
    id SERIAL PRIMARY KEY,
    movie_id INT REFERENCES Movie(id) ON DELETE CASCADE,
    genre_id INT REFERENCES Genre(id) ON DELETE CASCADE
);

CREATE TABLE Room (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    total_rows INT NOT NULL,      
    seats_per_row INT NOT NULL    
);

CREATE TABLE Seat (
    id SERIAL PRIMARY KEY,
    room_id INT REFERENCES Room(id) ON DELETE CASCADE,
    row_number INT NOT NULL,
    seat_number INT NOT NULL,
    CONSTRAINT unique_seat_in_room UNIQUE (room_id, row_number, seat_number)
);

CREATE TABLE Screening (
    id SERIAL PRIMARY KEY,
    movie_id INT REFERENCES Movie(id) ON DELETE CASCADE,
    room_id INT REFERENCES Room(id) ON DELETE CASCADE,
    start_time TIMESTAMP NOT NULL,
    price DECIMAL(10, 2) NOT NULL
);

CREATE TABLE Ticket (
    id SERIAL PRIMARY KEY,
    screening_id INT REFERENCES Screening(id) ON DELETE CASCADE,
    user_id INT REFERENCES App_User(id),
    seat_id INT REFERENCES Seat(id),
    status VARCHAR(50) NOT NULL CHECK (status IN ('reserved', 'paid', 'occupied', 'cancelled')),
    price DECIMAL(10, 2) NOT NULL,
    reservation_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expiration_time TIMESTAMP 
);

CREATE TABLE Payment_Transaction (
    id SERIAL PRIMARY KEY,
    ticket_id INT REFERENCES Ticket(id),
    payment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    amount DECIMAL(10, 2) NOT NULL,
    payment_method VARCHAR(50) DEFAULT 'card'
);

CREATE TABLE Product (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL, 
    price DECIMAL(10, 2) NOT NULL
);

CREATE TABLE Food_Order ( 
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES App_User(id),
    screening_id INT REFERENCES Screening(id), 
    order_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(50) DEFAULT 'new', 
    total_amount DECIMAL(10, 2) DEFAULT 0.00
);

CREATE TABLE Order_Item (
    id SERIAL PRIMARY KEY,
    order_id INT REFERENCES Food_Order(id) ON DELETE CASCADE,
    product_id INT REFERENCES Product(id),
    quantity INT NOT NULL,
    unit_price DECIMAL(10, 2) NOT NULL 
);

-- DANE TESTOWE (POPRAWIONE)

-- 1. Użytkownik
INSERT INTO App_User (first_name, last_name, email, password_hash, role) 
VALUES ('Jan', 'Testowy', 'jan@test.pl', 'haslo123', 'Client');

-- 2. Filmy
INSERT INTO Genre (name) VALUES ('Sci-Fi'), ('Drama');
INSERT INTO Movie (title, duration_minutes, description) 
VALUES ('Incepcja', 148, 'Sen w śnie'), ('Matrix', 136, 'Wybierz pigułkę');

-- 3. Sala
INSERT INTO Room (name, total_rows, seats_per_row) VALUES ('Sala A', 10, 10);

-- 4. AUTOMATYCZNE GENEROWANIE 100 MIEJSC (Naprawa błędu 500)
DO $$
BEGIN
   FOR r IN 1..10 LOOP
       FOR s IN 1..10 LOOP
           INSERT INTO Seat (room_id, row_number, seat_number) VALUES (1, r, s);
       END LOOP;
   END LOOP;
END $$;

-- 5. Seans
INSERT INTO Screening (movie_id, room_id, start_time, price) 
VALUES (1, 1, NOW() + INTERVAL '1 day', 25.00);

-- 6. Produkty
INSERT INTO Product (name, price) VALUES ('Popcorn M', 15.00), ('Cola 0.5', 9.00), ('Nachos', 22.00);
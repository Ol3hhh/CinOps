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
    description TEXT,
    image_url TEXT
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
INSERT INTO Genre (name) VALUES ('Sci-Fi'), ('Akcja'), ('Animacja'), ('Dramat');

INSERT INTO Movie (title, duration_minutes, description, image_url) VALUES 
('Incepcja', 148, 'Światowej sławy filmowiec Christopher Nolan wyreżyserował film z 
gwiazdorską obsadą, który zabiera widzów w podróż dookoła ziemskiego globu oraz w głąb intymnego 
i nieskończonego świata snów. Dom Cobb (Leonardo DiCaprio) jest niezwykle sprawnym złodziejem, 
mistrzem w wydobywaniu wartościowych sekretów ukrytych głęboko w świadomości podczas fazy snu, 
kiedy umysł jest najbardziej wrażliwy. Wyjątkowe umiejętności Cobba uczyniły z niego ważnego gracza 
w świecie szpiegostwa przemysłowego, ale i najbardziej poszukiwanego zbiega, a za swoją pozycję 
zapłacił utratą wszystkiego, co kocha. Teraz Cobb otrzymuje szansę na odkupienie. Za sprawą 
jednego, ostatniego zadania może odzyskać stracone życie. Musi tylko wraz ze swym zespołem dokonać 
rzeczy niemożliwej: zamiast skraść myśl, zaszczepić ją w śpiącym umyśle. Jeśli im się to uda, 
dokonają zbrodni doskonałej. Jednak nawet najbardziej precyzyjne planowanie nie jest w stanie 
przygotować ich na spotkanie z niezwykłym przeciwnikiem, który potrafi przewidzieć każdy ich ruch. 
Wróg, którego tylko Cobb mógł się spodziewać.', 'https://upload.wikimedia.org/wikipedia/en/2/2e/Inception_%282010%29_theatrical_poster.jpg'),
('Matrix', 136, 'Neo (Keanu Reeves) jest genialnym hakerem. Pewnego dnia nawiązuje z nim kontakt 
tajemniczy Morfeusz (Laurence Fishburne) - człowiek, który obiecuje przekazać mu wiedzę o 
rzeczywistości, w jakiej żyje. Prawdę o dwóch światach: prawdziwym i wygenerowanym, który ma tylko 
udawać rzeczywistość. Neo przystaje do grupy Morfeusza i zaczyna dostrzegać, że świat, w którym 
egzystował to fikcja, a jego życiem cały czas ktoś kierował. Kolejne stopnie wtajemniczenia 
stawiają przed Neo nowe pytania. Czym jest Matrix i komu służy? I jaką rolę w planie Morfeusza ma 
do spełnienia on sam?', 'https://m.media-amazon.com/images/M/MV5BNzQzOTk3OTAtNDQ0Zi00ZTVkLWI0MTEtMDllZjNkYzNjNTc4XkEyXkFqcGdeQXVyNjU0OTQ0OTY@._V1_.jpg'),
('Kot w Butach: Ostatnie życzenie', 100, 'Kochany przez wszystkich, uwielbiający mleko, 
awanturniczy i nieustraszony Kot w Butach powraca w nowej przygodzie i przekonuje się, że 
zamiłowanie do ryzyka odcisnęło na nim piętno. Zapominając się, zużył już osiem z dziewięciu żyć. 
Teraz chce je odzyskać, dlatego zapuszcza się do Czarnego Lasu, by odnaleźć mityczną Gwiazdkę 
Życzeń i przeżyć swoją najzuchwalszą przygodę. Mając już tylko jedno życie, będzie musiał ukorzyć 
się i poprosić o pomoc byłą partnerkę Kitty Kociłapkę. Po drodze dołączy do nich gadatliwy i wesoły 
piesek Perro. Tej trójce bohaterów wciąż będą deptać po piętach najstraszniejsze baśniowe postaci, 
w tym Złotowłosa i Trzy Misie.', 'https://m.media-amazon.com/images/M/MV5BNjMyMDBjMGUtNDUzZi00Nza2LTk1ZTYtZTE1NjkyNDY0ZDJEXkEyXkFqcGdeQXVyMTMxODk2OTU@._V1_.jpg'),
('Interstellar', 169, 'Historia grupy badaczy, którzy dzięki nowo odkrytemu tunelowi czasoprzestrzennemu pokonują 
granice do tej pory przekraczające ludzkie możliwości podróżowania w innym wymiarze.
Film oparty jest na teorii naukowej opracowanej przez fizyka z Caltech Kipa Thorne', 
'https://upload.wikimedia.org/wikipedia/en/b/bc/Interstellar_film_poster.jpg'),
('Skazani na Shawshank', 142, 'Film nakręcony na podstawie książki mistrza horrorów Stephena Kinga. 
Andy Dufresne (Tim Robbins), dobrze zarabiający bankier z Nowej Anglii, zostaje oskarżony o 
podwójne zabójstwo - swojej żony i jej kochanka. Uparcie twierdzi, że jest niewinny, ale dzięki 
niezbitym dowodom zostaje skazany na podwójne dożywocie w więzieniu Shawshank. Shawshank rządzi 
hipokryta i fanatyk biblijny, naczelnik Norton (Bob Gunton), a wraz z nim sadystyczni strażnicy. 
Andy już po kilku dniach poznaje brutalną, więzienną rzeczywistość, ale dzięki wrodzonej 
inteligencji, sprytowi oraz pomocy przyjaciela Ellisa Boyda "Reda" Reddinga (Morgan Freeman) 
udaje mu się zachować nadzieję, która pozwoli dokonać zemsty.', 
'https://m.media-amazon.com/images/M/MV5BNDE3ODcxYzMtY2YzZC00NmNlLWJiNDMtZDViZWM2MzIxZDYwXkEyXkFqcGdeQXVyNjAwNDUxODI@._V1_.jpg'),
('Mroczny Rycerz', 152, 'W nowym filmie Batman podejmuje szeroko zakrojoną walkę z przestępczością.
 Z pomocą porucznika Jima Gordona i prokuratora okręgowego Harveya Denta zabiera się za 
 rozpracowywanie istniejących organizacji przestępczych nękających mieszkańców miasta. 
 Współpraca przynosi efekty, ale bohaterowie wkrótce padną ofiarą chaosu, który rozpęta rosnący w 
 siłę genialny przestępca, znany przerażonym mieszkańcom Gotham jako Joker.', 
'https://m.media-amazon.com/images/M/MV5BMTMxNTMwODM0NF5BMl5BanBnXkFtZTcwODAyMTk2Mw@@._V1_.jpg'),
('Forrest Gump', 142, '"Forrest Gump" to romantyczna historia, w której Tom Hanks wcielił się w 
tytułową postać - nierozgarniętego młodego człowieka o wielkim sercu i zdolności do odnajdywania 
się w największych wydarzeniach w historii USA, począwszy od swego dzieciństwa w latach 50-tych. 
Po tym, jak staje się gwiazdą footballu, odznaczonym bohaterem wojennym i odnoszącym sukcesy 
biznesmenem, główny bohater zyskuje status osobistości, lecz nigdy nie rezygnuje z poszukiwania 
tego, co dla niego najważniejsze - miłości swej przyjaciółki, Jenny Curran.
Forrest jest małym chłopcem, kiedy jego ojciec porzuca rodzinę, a matka utrzymuje siebie i 
syna biorąc pod swój dach lokatorów. Kiedy okazuje się, że jej chłopiec ma bardzo niski iloraz 
inteligencji, pozostaje nieustraszona w swoim przekonaniu, że ma on takie same możliwości, jak każdy inny. To prawda - takie same, a nawet dużo większe. W całym swym życiu Forrest niezamierzenie znajduje się twarzą w twarz z wieloma legendarnymi postaciami lat 50-tych, 60-tych i 70-tych. Wiedzie go to na boisko piłki nożnej, poprzez dżungle Wietnamu, Waszyngton, Chiny, Nowy Jork, do Luizjany i w wiele innych miejsc, a wszystko to relacjonuje on w swych poruszających i wstrząsających opowieściach przypadkowo spotkanym osobom.', 
'https://m.media-amazon.com/images/M/MV5BNWIwODRlZTUtY2U3ZS00Yzg1LWJhNzYtMmZiYmEyNmU1NjMzXkEyXkFqcGdeQXVyMTQxNzMzNDI@._V1_.jpg'),
('Król Lew', 88, 'Młody lew Simba musi odzyskać tron i uratować Królestwo po śmierci ojca.', 'https://m.media-amazon.com/images/M/MV5BYTYxNGMyZTYtMjE3MS00MzNjLWFjNmYtMDk3N2FmM2JiM2M1XkEyXkFqcGdeQXVyNjY5NDU4NzI@._V1_.jpg');
-- 3. Sala
INSERT INTO Room (name, total_rows, seats_per_row) VALUES ('Sala Główna', 10, 12);
INSERT INTO Room (name, total_rows, seats_per_row) VALUES ('Sala B', 10, 12);

DO $$
BEGIN
   FOR r IN 1..10 LOOP
       FOR s IN 1..10 LOOP
           INSERT INTO Seat (room_id, row_number, seat_number) VALUES (1, r, s);
       END LOOP;
   END LOOP;
END $$;

-- 5. Seans
INSERT INTO Screening (movie_id, room_id, start_time, price) VALUES 
(1, 1, '2026-01-20 18:00:00', 30.00), -- Incepcja
(1, 1, '2026-01-21 14:00:00', 30.00), -- Incepcja
(2, 2, '2026-01-20 20:30:00', 25.00), -- Matrix
(3, 2, '2026-01-22 10:00:00', 20.00), -- Kot w Butach
(4, 1, '2026-01-22 19:00:00', 28.00); -- Interstellar

-- 6. Produkty
INSERT INTO Product (name, price) VALUES ('Popcorn M', 15.00), ('Cola 0.5', 9.00), ('Nachos', 22.00);
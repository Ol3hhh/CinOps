import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import API from "../api";

const Reservation = () => {
  const { screeningId } = useParams();
  const navigate = useNavigate();

  // СОСТОЯНИЕ
  const [step, setStep] = useState(1); // 1 = Выбор мест, 2 = Оплата
  const [takenSeats, setTakenSeats] = useState([]); // Занятые (чужие)
  const [selectedSeats, setSelectedSeats] = useState([]); // Выбранные (нами)
  const [reservedTicketIds, setReservedTicketIds] = useState([]); // ID созданных билетов

  const [snacks, setSnacks] = useState({ popcorn: 0, cola: 0, nachos: 0 });
  const [loading, setLoading] = useState(true);
  const [ticketPrice, setTicketPrice] = useState(0);

  // ТАЙМЕР
  const [expirationTime, setExpirationTime] = useState(null); // Время окончания от сервера
  const [timeLeft, setTimeLeft] = useState(null); // Сколько секунд осталось

  const SNACK_PRICES = { popcorn: 15, cola: 10, nachos: 20 };
  const userId = localStorage.getItem("user_id");

  // --- ЗАГРУЗКА ДАННЫХ (ЭТАП 1) ---
  const loadData = async () => {
    try {
      const seatsRes = await API.get(`/screenings/${screeningId}/seats`);
      setTakenSeats(seatsRes.data);

      const screeningRes = await API.get(`/screenings/${screeningId}`);
      setTicketPrice(parseFloat(screeningRes.data.price));

      setLoading(false);
    } catch (err) {
      console.error("Ошибка загрузки:", err);
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [screeningId]);

  // --- ЛОГИКА ТАЙМЕРА (ЭТАП 2) ---
  useEffect(() => {
    if (step === 2 && expirationTime) {
      const interval = setInterval(() => {
        const now = new Date();
        const end = new Date(expirationTime);
        const diffInSeconds = Math.floor((end - now) / 1000);

        if (diffInSeconds <= 0) {
          clearInterval(interval);
          alert("Czas na płatność minął! Rezerwacja została anulowana.");
          window.location.reload(); // Перезагрузка сбрасывает все
        } else {
          setTimeLeft(diffInSeconds);
        }
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [step, expirationTime]);

  const formatTime = (seconds) => {
    if (seconds === null) return "--:--";
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  };

  // --- ОБРАБОТЧИКИ ---

  const handleSeatClick = (seatId) => {
    if (step !== 1) return; // Нельзя менять места на этапе оплаты
    if (takenSeats.includes(seatId)) return;

    if (selectedSeats.includes(seatId)) {
      setSelectedSeats(selectedSeats.filter((id) => id !== seatId));
    } else {
      setSelectedSeats([...selectedSeats, seatId]);
    }
  };

  const updateSnack = (type, delta) => {
    if (step !== 1) return; // Нельзя менять еду на этапе оплаты
    setSnacks((prev) => ({
      ...prev,
      [type]: Math.max(0, prev[type] + delta),
    }));
  };

  const totalPrice =
    selectedSeats.length * ticketPrice +
    snacks.popcorn * SNACK_PRICES.popcorn +
    snacks.cola * SNACK_PRICES.cola +
    snacks.nachos * SNACK_PRICES.nachos;

  // ШАГ 1 -> ШАГ 2: РЕЗЕРВАЦИЯ (БРОНЬ)
  const handleReserve = async () => {
    if (!userId) {
      alert("Musisz być zalogowany!");
      return;
    }
    if (selectedSeats.length === 0) return;

    try {
      const tickets = [];
      let serverExpiration = null;

      // Отправляем запрос на каждое место
      for (const seatId of selectedSeats) {
        const res = await API.post("/reservations", {
          user_id: parseInt(userId),
          screening_id: screeningId,
          seat_id: seatId,
        });
        // Сохраняем ID созданного билета и время истечения
        tickets.push(res.data.ticket_id);
        serverExpiration = res.data.expiration_time;
      }

      setReservedTicketIds(tickets);
      setExpirationTime(serverExpiration); // Устанавливаем таймер от сервера!
      setStep(2); // ПЕРЕХОДИМ К ОПЛАТЕ
    } catch (err) {
      if (err.response && err.response.status === 409) {
        alert("BŁĄD! Ktoś zajął wybrane miejsce.");
        loadData(); // Обновляем карту
        setSelectedSeats([]);
      } else {
        alert("Błąd rezerwacji.");
        console.error(err);
      }
    }
  };

  // ШАГ 2 -> ФИНАЛ: ОПЛАТА
  const handlePay = async () => {
    try {
      // Оплачиваем каждый билет
      for (const ticketId of reservedTicketIds) {
        await API.post("/payments", {
          ticket_id: ticketId,
          amount: ticketPrice, // В реальном проекте сумма должна проверяться на бэке
          payment_method: "blik",
        });
      }

      alert("Płatność przyjęta! Dziękujemy.");
      navigate("/movies"); // Возвращаем к фильмам
    } catch (err) {
      console.error(err);
      alert("Błąd płatności.");
    }
  };

  // --- ОТРИСОВКА ЗАЛА ---
  const renderSala = () => {
    let rows = [];
    let seatCounter = 1;

    for (let r = 1; r <= 10; r++) {
      let seatsInRow = [];
      for (let s = 1; s <= 12; s++) {
        const currentId = seatCounter++;
        const isTaken = takenSeats.includes(currentId);
        const isSelected = selectedSeats.includes(currentId);

        let colorClass = "btn-outline-primary";
        if (isTaken) colorClass = "btn-secondary disabled";
        if (isSelected) colorClass = "btn-success";

        seatsInRow.push(
          <button
            key={currentId}
            className={`btn m-1 ${colorClass}`}
            style={{
              width: "35px",
              height: "35px",
              padding: 0,
              fontSize: "12px",
            }}
            onClick={() => handleSeatClick(currentId)}
            disabled={isTaken || step === 2} // Блокируем на этапе оплаты
          >
            {s}
          </button>
        );
      }
      rows.push(
        <div
          key={r}
          className="d-flex justify-content-center mb-1"
          style={{ marginLeft: r % 2 === 0 ? "20px" : "0" }}
        >
          <span className="me-2 mt-1 text-muted small">Rząd {r}</span>
          {seatsInRow}
        </div>
      );
    }
    return rows;
  };

  if (loading) return <div className="text-center mt-5">Ładowanie sali...</div>;

  return (
    <div className="container mt-4 mb-5">
      {/* ВЕРХНЯЯ ПАНЕЛЬ */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        {step === 1 ? (
          <Link to="/movies" className="btn btn-outline-secondary">
            &larr; Powrót do repertuaru
          </Link>
        ) : (
          <div className="alert alert-warning w-100 text-center fw-bold">
            ⚠️ Masz czas na dokonanie płatności! Nie odświeżaj strony.
          </div>
        )}

        {step === 2 && (
          <div className="text-danger fw-bold fs-3 ms-3">
            {formatTime(timeLeft)}
          </div>
        )}
      </div>

      <div className="row">
        <div className="col-lg-8">
          <h3 className="text-center mb-3">
            {step === 1 ? "Wybierz Miejsca" : "Potwierdzenie i Płatność"}
          </h3>

          {/* Если шаг 2 - можно скрыть экран и показать только список */}
          <div
            className={`border p-4 bg-light rounded shadow-sm overflow-auto ${
              step === 2 ? "opacity-50" : ""
            }`}
          >
            <div
              className="bg-dark text-white text-center p-2 mb-4 rounded mx-auto"
              style={{ width: "80%" }}
            >
              EKRAN
            </div>
            {renderSala()}
          </div>
        </div>

        <div className="col-lg-4">
          <div className="card shadow sticky-top" style={{ top: "20px" }}>
            <div
              className={`card-header text-white ${
                step === 1 ? "bg-primary" : "bg-danger"
              }`}
            >
              {step === 1 ? "Twoja Rezerwacja" : "Do Zapłaty"}
            </div>

            <div className="card-body">
              <h5>
                Bilety: {selectedSeats.length} x {ticketPrice.toFixed(2)} PLN
              </h5>
              <hr />

              <h6>Przekąski:</h6>
              {["popcorn", "cola", "nachos"].map((item) => (
                <div
                  key={item}
                  className="d-flex justify-content-between align-items-center mb-2"
                >
                  <span className="text-capitalize">
                    {item === "popcorn" ? "🍿" : item === "cola" ? "🥤" : "🌮"}{" "}
                    {item}
                  </span>
                  <div>
                    <button
                      className="btn btn-sm btn-outline-danger"
                      onClick={() => updateSnack(item, -1)}
                      disabled={step === 2}
                    >
                      -
                    </button>
                    <span className="mx-2">{snacks[item]}</span>
                    <button
                      className="btn btn-sm btn-outline-success"
                      onClick={() => updateSnack(item, 1)}
                      disabled={step === 2}
                    >
                      +
                    </button>
                  </div>
                </div>
              ))}

              <hr />
              <h3 className="text-end text-success">
                Suma: {totalPrice.toFixed(2)} PLN
              </h3>

              {step === 1 ? (
                <button
                  onClick={handleReserve}
                  className="btn btn-primary w-100 mt-3 btn-lg"
                  disabled={selectedSeats.length === 0}
                >
                  REZERWUJĘ
                </button>
              ) : (
                <button
                  onClick={handlePay}
                  className="btn btn-success w-100 mt-3 btn-lg"
                >
                  OPŁACAM TERAZ
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reservation;

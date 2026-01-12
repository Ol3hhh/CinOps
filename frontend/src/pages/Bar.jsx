import { useEffect, useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import API from "../api";
import { Form, Button, ListGroup, Alert } from "react-bootstrap";

const Bar = () => {
  const [products, setProducts] = useState([]);
  const [successMsg, setSuccessMsg] = useState(null);

  useEffect(() => {
    API.get("/products").then((res) => setProducts(res.data));
  }, []);

  const formik = useFormik({
    initialValues: { items: {} },
    onSubmit: (values) => {
      const orderItems = Object.keys(values.items)
        .filter((id) => values.items[id] > 0)
        .map((id) => ({
          product_id: parseInt(id),
          quantity: values.items[id],
        }));

      // WALIDACJA: Pusty koszyk
      if (orderItems.length === 0) {
        alert("Twój koszyk jest pusty!");
        return;
      }

      API.post("/orders", {
        user_id: 1,
        screening_id: 1,
        items: orderItems,
      })
        .then(() => setSuccessMsg("Zamówienie wysłane do baru!"))
        .catch((err) => alert("Błąd: " + err.message));
    },
  });

  return (
    <div className="col-md-8 mx-auto">
      <h2 className="mb-4">Bar Kinowy 🍿</h2>
      {successMsg && <Alert variant="success">{successMsg}</Alert>}

      <Form onSubmit={formik.handleSubmit}>
        <ListGroup className="mb-4 shadow-sm">
          {products.map((p) => (
            <ListGroup.Item
              key={p.id}
              className="d-flex justify-content-between align-items-center"
            >
              <div>
                <h5 className="mb-0">{p.name}</h5>
                <small className="text-muted">{p.price} PLN</small>
              </div>
              <Form.Control
                type="number"
                min="0"
                max="10"
                style={{ width: "80px" }}
                name={`items.${p.id}`}
                onChange={formik.handleChange}
                defaultValue={0}
              />
            </ListGroup.Item>
          ))}
        </ListGroup>
        <Button type="submit" variant="primary" size="lg" className="w-100">
          Zamów
        </Button>
      </Form>
    </div>
  );
};

export default Bar;

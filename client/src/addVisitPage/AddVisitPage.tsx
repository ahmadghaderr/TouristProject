import { ChangeEvent, FormEvent, useState } from "react";
import Navbar from "../Navbar/Navbar";
import Select from "../components/Select";
import apiClient from "../api/client";
import { CATEGORY_OPTIONS, getVisitTypeVisibility } from "../constants/visit";
import type { SelectOption } from "../components/Select";
import type { Visit, VisitFormData } from "../types";
import "./addVisitPage.css";

const VISIT_TYPE_OPTIONS: SelectOption[] = [
  { value: "full-days", label: "Full day tour" },
  { value: "arrival-departure", label: "Arrival and departure" },
  { value: "mixed", label: "Mixed" },
];

const EMPTY_FORM: VisitFormData = {
  name: "",
  hotel: "",
  car: "",
  type: "",
  category: "",
  dateFrom: "",
  dateTo: "",
  pricePerDay: "",
  totalDays: "",
  arrivalPrice: "",
  departurePrice: "",
  fullPricePackages: "",
};

const NUMERIC_FIELDS = [
  "pricePerDay",
  "totalDays",
  "arrivalPrice",
  "departurePrice",
  "fullPricePackages",
] as const;

const AddVisitPage = () => {
  const [formData, setFormData] = useState<VisitFormData>(EMPTY_FORM);
  const [message, setMessage] = useState("");
  const [visitResult, setVisitResult] = useState<Visit | null>(null);
  const [showModal, setShowModal] = useState(false);
  const today = new Date().toISOString().split("T")[0];

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (formData.dateTo && formData.dateTo < today) {
      setMessage("Date To cannot be in the past.");
      return;
    }

    const dataToSend: Record<string, unknown> = { ...formData };
    NUMERIC_FIELDS.forEach((key) => {
      dataToSend[key] = formData[key] !== "" ? Number(formData[key]) : undefined;
    });

    if (formData.type === "full-days") {
      dataToSend.arrivalPrice = undefined;
      dataToSend.departurePrice = undefined;
    } else if (formData.type === "arrival-departure") {
      dataToSend.pricePerDay = undefined;
      dataToSend.totalDays = undefined;
    }

    try {
      const res = await apiClient.post<Visit>("/visit/create", dataToSend);
      setMessage("Visit created successfully!");
      setVisitResult(res.data);
      setShowModal(true);
      setFormData(EMPTY_FORM);
    } catch {
      setMessage("Error creating visit.");
      setVisitResult(null);
    }
  };

  const closeModal = () => setShowModal(false);
  const { showFullDaysFields, showArrivalDepartureFields } = getVisitTypeVisibility(formData.type);

  return (
    <div>
      <Navbar />

      <div className="add-visit-page">
        <div
          className="visit-photo-panel"
          style={{
            backgroundImage: `linear-gradient(180deg, rgba(21,24,27,0.88) 0%, rgba(21,24,27,0.25) 45%, rgba(21,24,27,0.05) 100%), url(${process.env.PUBLIC_URL}/images/rangeRoverImage.jpg)`,
          }}
        >
          <div className="visit-photo-overlay">
            <span className="visit-photo-headline">Log the visitor. We'll handle the calendar.</span>
          </div>
        </div>

        <div className="form-container">
          <h2>Add Visit</h2>
          <span className="panel-rule"></span>

          {message ? (
            <div className={message.indexOf("successfully") !== -1 ? "message-box success" : "message-box error"}>
              {message}
            </div>
          ) : null}

          <form onSubmit={handleSubmit}>
            <label>Category</label>
            <Select
              name="category"
              value={formData.category}
              onChange={handleChange}
              required
              placeholder="Select category"
              options={CATEGORY_OPTIONS}
            />

            <label>Visitor name</label>
            <input type="text" name="name" value={formData.name} onChange={handleChange} required />

            <label>Hotel</label>
            <input type="text" name="hotel" value={formData.hotel} onChange={handleChange} required />

            <label>Car</label>
            <input type="text" name="car" value={formData.car} onChange={handleChange} required />

            <label>Visit type</label>
            <Select
              name="type"
              value={formData.type}
              onChange={handleChange}
              required
              placeholder="Select visit type"
              options={VISIT_TYPE_OPTIONS}
            />

            <label>Arrival</label>
            <input type="datetime-local" name="dateFrom" value={formData.dateFrom} onChange={handleChange} />

            <label>Departure</label>
            <input
              type="datetime-local"
              name="dateTo"
              value={formData.dateTo}
              onChange={handleChange}
              min={today + "T00:00"}
              required
            />

            {showFullDaysFields ? (
              <input
                type="number"
                name="pricePerDay"
                placeholder="Price Per Day"
                value={formData.pricePerDay}
                onChange={handleChange}
                required={formData.type !== "mixed"}
              />
            ) : null}
            {showFullDaysFields ? (
              <input
                type="number"
                name="totalDays"
                placeholder="Total Days"
                value={formData.totalDays}
                onChange={handleChange}
                required={formData.type !== "mixed"}
              />
            ) : null}

            {showArrivalDepartureFields ? (
              <input
                type="number"
                name="arrivalPrice"
                placeholder="Arrival Price"
                value={formData.arrivalPrice}
                onChange={handleChange}
                required={formData.type !== "mixed"}
              />
            ) : null}
            {showArrivalDepartureFields ? (
              <input
                type="number"
                name="departurePrice"
                placeholder="Departure Price"
                value={formData.departurePrice}
                onChange={handleChange}
                required={formData.type !== "mixed"}
              />
            ) : null}

            <input
              type="number"
              name="fullPricePackages"
              placeholder="Full Package Price (optional)"
              value={formData.fullPricePackages}
              onChange={handleChange}
            />

            <button type="submit">Create Visit</button>
          </form>

          {visitResult ? (
            <div className="result-container">
              <h3>Created Visit</h3>
              <div className="result-item">
                <span className="result-label">Name:</span>
                <span className="result-value">{visitResult.name}</span>
              </div>
              <div className="result-item">
                <span className="result-label">Category:</span>
                <span className="result-value">{visitResult.category}</span>
              </div>
              <div className="result-item">
                <span className="result-label">Hotel:</span>
                <span className="result-value">{visitResult.hotel}</span>
              </div>
              <div className="result-item">
                <span className="result-label">Car:</span>
                <span className="result-value">{visitResult.car}</span>
              </div>
              <div className="result-item">
                <span className="result-label">Type:</span>
                <span className="result-value">{visitResult.type}</span>
              </div>
              <div className="result-item">
                <span className="result-label">Date From:</span>
                <span className="result-value">{visitResult.dateFrom ? visitResult.dateFrom.split("T")[0] : "-"}</span>
              </div>
              <div className="result-item">
                <span className="result-label">Date To:</span>
                <span className="result-value">{visitResult.dateTo ? visitResult.dateTo.split("T")[0] : "-"}</span>
              </div>

              {visitResult.pricePerDay || visitResult.totalDays ? (
                <div className="result-item">
                  <span className="result-label">Price Per Day:</span>
                  <span className="result-value">{visitResult.pricePerDay}</span>
                </div>
              ) : null}
              {visitResult.pricePerDay || visitResult.totalDays ? (
                <div className="result-item">
                  <span className="result-label">Total Days:</span>
                  <span className="result-value">{visitResult.totalDays}</span>
                </div>
              ) : null}

              {visitResult.arrivalPrice || visitResult.departurePrice ? (
                <div className="result-item">
                  <span className="result-label">Arrival Price:</span>
                  <span className="result-value">{visitResult.arrivalPrice}</span>
                </div>
              ) : null}
              {visitResult.arrivalPrice || visitResult.departurePrice ? (
                <div className="result-item">
                  <span className="result-label">Departure Price:</span>
                  <span className="result-value">{visitResult.departurePrice}</span>
                </div>
              ) : null}

              {visitResult.fullPricePackages ? (
                <div className="result-item">
                  <span className="result-label">Full Package Price:</span>
                  <span className="result-value">{visitResult.fullPricePackages}</span>
                </div>
              ) : null}
            </div>
          ) : null}
        </div>
      </div>

      {showModal && visitResult ? (
        <div className="visit-modal-overlay" onClick={closeModal}>
          <div className="visit-modal" onClick={(e) => e.stopPropagation()}>
            <div className="visit-modal-icon">Done</div>
            <h2>Visit Created Successfully</h2>
            <p className="visit-modal-subtitle">
              {visitResult.name} at {visitResult.hotel}
            </p>

            <div className="visit-modal-links">
              {visitResult.arrivalEventLink ? (
                <a
                  href={visitResult.arrivalEventLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="visit-modal-calendar-link"
                >
                  View Arrival on Google Calendar
                </a>
              ) : null}
              {visitResult.departureEventLink ? (
                <a
                  href={visitResult.departureEventLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="visit-modal-calendar-link"
                >
                  View Departure on Google Calendar
                </a>
              ) : null}
              {!visitResult.arrivalEventLink && !visitResult.departureEventLink ? (
                <p className="visit-modal-no-calendar">Calendar sync did not complete for this visit.</p>
              ) : null}
            </div>

            <button className="visit-modal-close" onClick={closeModal}>
              Close
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default AddVisitPage;

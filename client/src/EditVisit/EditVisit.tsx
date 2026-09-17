import { ChangeEvent, FormEvent, useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import moment from "moment";
import Navbar from "../Navbar/Navbar";
import FormGroup from "../components/FormGroup";
import Select from "../components/Select";
import ErrorMessage from "../components/ErrorMessage";
import apiClient from "../api/client";
import { CATEGORY_OPTIONS, getVisitTypeVisibility } from "../constants/visit";
import { getErrorMessage } from "../utils/errors";
import type { SelectOption } from "../components/Select";
import type { VisitFormData } from "../types";
import "./EditVisit.css";

const VISIT_TYPE_OPTIONS: SelectOption[] = [
  { value: "full-days", label: "Full Days" },
  { value: "arrival-departure", label: "Arrival & Departure" },
  { value: "mixed", label: "Mixed" },
];

interface EditVisitFormData extends VisitFormData {
  isPaid: boolean;
}

const EMPTY_FORM: EditVisitFormData = {
  name: "",
  hotel: "",
  car: "",
  type: "full-days",
  category: "",
  dateFrom: "",
  dateTo: "",
  pricePerDay: "",
  totalDays: "",
  arrivalPrice: "",
  departurePrice: "",
  fullPricePackages: "",
  isPaid: false,
};

const EditVisit = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [formData, setFormData] = useState<EditVisitFormData>(EMPTY_FORM);
  const [originalPaid, setOriginalPaid] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const fetchVisit = async () => {
      try {
        const res = await apiClient.get(`/visit/visitor/${id}`);
        setFormData({
          name: res.data.name || "",
          hotel: res.data.hotel || "",
          car: res.data.car || "",
          type: res.data.type || "full-days",
          category: res.data.category || "",
          dateFrom: res.data.dateFrom ? moment(res.data.dateFrom).format("YYYY-MM-DDTHH:mm") : "",
          dateTo: res.data.dateTo ? moment(res.data.dateTo).format("YYYY-MM-DDTHH:mm") : "",
          pricePerDay: res.data.pricePerDay ?? "",
          totalDays: res.data.totalDays ?? "",
          arrivalPrice: res.data.arrivalPrice ?? "",
          departurePrice: res.data.departurePrice ?? "",
          fullPricePackages: res.data.fullPricePackages ?? "",
          isPaid: res.data.isPaid || false,
        });
        setOriginalPaid(res.data.isPaid || false);
      } catch {
        setMessage("Failed to load visit data.");
      }
    };
    fetchVisit();
  }, [id]);

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    setFormData((prev) => ({
      ...prev,
      [name]: e.target.type === "checkbox" ? checked : value,
    }));
  };

  const handleUpdate = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      if (formData.isPaid !== originalPaid) {
        await apiClient.put(`/visit/mark-paid/${id}`, {});
      }
      const { isPaid, ...rest } = formData;
      await apiClient.put(`/visit/edit/${id}`, rest);
      navigate("/visit-dashboard");
    } catch (err) {
      setMessage(getErrorMessage(err, "Error updating visit."));
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this visit?")) return;
    try {
      await apiClient.delete(`/visit/delete/${id}`);
      navigate("/visit-dashboard");
    } catch (err) {
      setMessage(getErrorMessage(err, "Error deleting visit."));
    }
  };

  const { showFullDaysFields, showArrivalDepartureFields } = getVisitTypeVisibility(formData.type);

  return (
    <>
      <Navbar />
      <div className="edit-visit-page">
        <div
          className="visit-photo-panel"
          style={{
            backgroundImage: `linear-gradient(180deg, rgba(21,24,27,0.15) 0%, rgba(21,24,27,0.88) 100%), url(${process.env.PUBLIC_URL}/images/hotelImage.jpg)`,
          }}
        >
          <div className="visit-photo-overlay">
            <span className="visit-photo-headline">Update this pickup or drop-off</span>
          </div>
        </div>

        <div className="edit-visit-container">
          <h2>Edit Visit</h2>
          <span className="panel-rule"></span>
          {message ? <ErrorMessage message={message} /> : null}
          <form className="edit-visit-form" onSubmit={handleUpdate}>
            <FormGroup label="Name">
              <input name="name" value={formData.name} onChange={handleChange} required />
            </FormGroup>
            <FormGroup label="Hotel">
              <input name="hotel" value={formData.hotel} onChange={handleChange} required />
            </FormGroup>
            <FormGroup label="Car">
              <input name="car" value={formData.car} onChange={handleChange} required />
            </FormGroup>
            <FormGroup label="Visit Type">
              <Select name="type" value={formData.type} onChange={handleChange} options={VISIT_TYPE_OPTIONS} />
            </FormGroup>
            <FormGroup label="Category">
              <Select
                name="category"
                value={formData.category}
                onChange={handleChange}
                required
                placeholder="Select Category"
                options={CATEGORY_OPTIONS}
              />
            </FormGroup>
            <FormGroup label="Date From">
              <input type="datetime-local" name="dateFrom" value={formData.dateFrom} onChange={handleChange} />
            </FormGroup>
            <FormGroup label="Date To">
              <input type="datetime-local" name="dateTo" value={formData.dateTo} onChange={handleChange} />
            </FormGroup>

            {showFullDaysFields ? (
              <>
                <FormGroup label="Price Per Day">
                  <input type="number" name="pricePerDay" value={formData.pricePerDay} onChange={handleChange} />
                </FormGroup>
                <FormGroup label="Total Days">
                  <input type="number" name="totalDays" value={formData.totalDays} onChange={handleChange} />
                </FormGroup>
              </>
            ) : null}

            {showArrivalDepartureFields ? (
              <>
                <FormGroup label="Arrival Price">
                  <input type="number" name="arrivalPrice" value={formData.arrivalPrice} onChange={handleChange} />
                </FormGroup>
                <FormGroup label="Departure Price">
                  <input type="number" name="departurePrice" value={formData.departurePrice} onChange={handleChange} />
                </FormGroup>
              </>
            ) : null}

            <FormGroup label="Full Price Packages">
              <input
                type="number"
                name="fullPricePackages"
                value={formData.fullPricePackages}
                placeholder="(Optional)"
                onChange={handleChange}
              />
            </FormGroup>

            <FormGroup label="Mark as Paid" className="paid-toggle">
              <label className="paid-switch">
                <input type="checkbox" name="isPaid" checked={formData.isPaid} onChange={handleChange} />
                <span className="slider"></span>
              </label>
            </FormGroup>

            <div className="button-group">
              <button type="submit" className="update-btn">
                Update Visit
              </button>
              <button type="button" className="delete-btn" onClick={handleDelete}>
                Delete Visit
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default EditVisit;

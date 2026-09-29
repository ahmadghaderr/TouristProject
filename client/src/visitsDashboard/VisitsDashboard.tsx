import { useEffect, useState } from "react";
import moment from "moment-timezone";
import { useNavigate } from "react-router-dom";
import DatePicker from "react-datepicker";
import { FaCheck, FaEdit } from "react-icons/fa";
import "react-datepicker/dist/react-datepicker.css";
import Navbar from "../Navbar/Navbar";
import Icon from "../components/Icon";
import LoadingSpinner from "../components/LoadingSpinner";
import ErrorMessage from "../components/ErrorMessage";
import SummaryStats from "../components/SummaryStats";
import Select from "../components/Select";
import apiClient from "../api/client";
import { CATEGORY_OPTIONS } from "../constants/visit";
import { findVisitIssues, isVisitUrgent } from "../utils/visit";
import type { Visit } from "../types";
import "./visitsDashboard.css";

type DateRange = [Date | null, Date | null];

const VisitsDashboard = () => {
  const [visits, setVisits] = useState<Visit[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [categoryFilter, setCategoryFilter] = useState("");
  const [dateRange, setDateRange] = useState<DateRange>([null, null]);
  const [rangeStart, rangeEnd] = dateRange;
  const navigate = useNavigate();

  const fetchVisits = async () => {
    setLoading(true);
    try {
      const response = await apiClient.get<Visit[]>("/visit/all");
      setVisits(response.data);
      setError(null);
    } catch {
      setError("Error loading visits");
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchVisits();
  }, []);

  const handleMarkAsPaid = async (visitId: string) => {
    try {
      await apiClient.put(`/visit/mark-paid/${visitId}`, {});
      setVisits(visits.map((visit) => (visit._id === visitId ? { ...visit, isPaid: true } : visit)));
    } catch {
      alert("Failed to mark as paid");
    }
  };

  const filteredVisits = visits.filter((visit) => {
    const matchesCategory = !categoryFilter || visit.category === categoryFilter;

    let matchesDateRange = true;
    if (rangeStart || rangeEnd) {
      if (!visit.dateFrom) {
        matchesDateRange = false;
      } else {
        const d = moment(visit.dateFrom);
        if (rangeStart && d.isBefore(moment(rangeStart).startOf("day"))) matchesDateRange = false;
        if (rangeEnd && d.isAfter(moment(rangeEnd).endOf("day"))) matchesDateRange = false;
      }
    }

    return matchesCategory && matchesDateRange;
  });

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} />;

  return (
    <>
      <Navbar />

      <div
        className="dashboard-banner"
        style={{
          backgroundImage: `linear-gradient(180deg, rgba(21,24,27,0.15) 0%, rgba(21,24,27,0.75) 75%, var(--color-bg) 100%), url(${process.env.PUBLIC_URL}/images/BeirutImage.jpg)`,
        }}
      ></div>

      <div className="visits-dashboard-container">
        <div className="dashboard-header">
          <h1>Visit Manifest</h1>
          <span className="panel-rule"></span>
          <SummaryStats
            stats={[
              {
                label: "Total",
                value: `$${filteredVisits.reduce((sum, v) => sum + (v.totalCost || 0), 0)}`,
              },
              {
                label: "Paid",
                value: `$${filteredVisits.filter((v) => v.isPaid).reduce((sum, v) => sum + (v.totalCost || 0), 0)}`,
                className: "paid",
              },
              {
                label: "Unpaid",
                value: `$${filteredVisits.filter((v) => !v.isPaid).reduce((sum, v) => sum + (v.totalCost || 0), 0)}`,
                className: "unpaid",
              },
            ]}
          />
        </div>

        <div className="filters">
          <div className="filter-group">
            <label>Category</label>
            <Select
              className="filter-select"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              placeholder="All Categories"
              options={CATEGORY_OPTIONS}
            />
          </div>

          <div className="filter-group">
            <label>Date range</label>
            <DatePicker
              selectsRange
              startDate={rangeStart}
              endDate={rangeEnd}
              onChange={(update) => setDateRange(update as DateRange)}
              isClearable
              placeholderText="All dates"
              className="filter-select"
              dateFormat="MMM d, yyyy"
            />
          </div>
        </div>

        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Category</th>
                <th>Hotel</th>
                <th>Car</th>
                <th>Type</th>
                <th>Date From</th>
                <th>Date To</th>
                <th>Registered</th>
                <th>Total Cost</th>
                <th>Status</th>
                <th>Issues</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredVisits.length === 0 ? (
                <tr>
                  <td colSpan={12} className="empty-state">
                    No visits available.
                  </td>
                </tr>
              ) : null}
              {filteredVisits.map((visit) => {
                const issues = findVisitIssues(visit);
                const urgent = isVisitUrgent(visit);
                return (
                  <tr key={visit._id} className={`${issues.length > 0 ? "has-issues" : ""} ${urgent ? "urgent" : ""}`}>
                    <td>{visit.name || "-"}</td>
                    <td>{visit.category || "-"}</td>
                    <td>{visit.hotel || "-"}</td>
                    <td>{visit.car || "-"}</td>
                    <td className="type-cell">{visit.type || "-"}</td>
                    <td>{visit.dateFrom ? moment(visit.dateFrom).format("MMM D, YYYY") : "-"}</td>
                    <td className={urgent ? "urgent-cell" : ""}>
                      {visit.dateTo ? moment(visit.dateTo).format("MMM D, YYYY") : "-"}
                    </td>
                    <td>{visit.createdAt ? moment(visit.createdAt).format("MMM D, YYYY") : "-"}</td>
                    <td className="total-cost">${visit.totalCost?.toFixed(2) || "-"}</td>
                    <td>
                      <span className={`status-indicator ${visit.isPaid ? "paid" : "unpaid"}`}>
                        <span className="status-dot"></span>
                        {visit.isPaid ? "Paid" : "Unpaid"}
                      </span>
                    </td>
                    <td className="issues-cell">
                      {issues.length > 0 ? (
                        <span className="issues-indicator">
                          {issues.length} issue{issues.length > 1 ? "s" : ""}
                        </span>
                      ) : (
                        "-"
                      )}
                    </td>
                    <td className="actions-cell">
                      <button className="edit-btn" onClick={() => navigate(`/edit-visit/${visit._id}`)}>
                        <Icon icon={FaEdit} /> Edit
                      </button>
                      <button
                        className={`mark-paid-btn ${visit.isPaid ? "paid-state" : ""}`}
                        onClick={() => !visit.isPaid && handleMarkAsPaid(visit._id)}
                        disabled={visit.isPaid}
                      >
                        <Icon icon={FaCheck} /> {visit.isPaid ? "Paid" : "Mark Paid"}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
};

export default VisitsDashboard;
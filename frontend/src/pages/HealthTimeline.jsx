
import { useEffect, useMemo, useState } from "react";
import {
  Activity,
  CalendarDays,
  ClipboardList,
  FileText,
  Pill,
  Search,
  Stethoscope,
  HeartPulse,
  RefreshCw,
} from "lucide-react";

import { getMyMedicalRecords } from "../services/medicalRecordService";
import { getMyMedications } from "../services/medicationService";
import { getMyMedicalHistory } from "../services/medicalHistoryService";

import "./HealthTimeline.css";

const categories = [
  "All",
  "Medical Records",
  "Medications",
  "Medical History",
];

function HealthTimeline() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  const loadTimeline = async () => {
    try {
      setLoading(true);
      setError("");

      const results = await Promise.allSettled([
        getMyMedicalRecords(),
        getMyMedications(),
        getMyMedicalHistory(),
      ]);

      const failedRequests = results.filter(
        (result) => result.status === "rejected"
      );

      if (failedRequests.length === results.length) {
        throw new Error("Unable to load your health timeline.");
      }

      const records =
        results[0].status === "fulfilled"
          ? results[0].value.medicalRecords || []
          : [];

      const medications =
        results[1].status === "fulfilled"
          ? results[1].value.medications || []
          : [];

      const history =
        results[2].status === "fulfilled"
          ? results[2].value.medicalHistory || []
          : [];

      const recordEvents = records.map((item) => ({
        id: `record-${item._id}`,
        category: "Medical Records",
        title: item.title,
        description: item.description || item.diagnosis || "",
        date: item.recordDate || item.createdAt,
        detail: item.recordType || "Medical Record",
        facility: item.hospitalName || "",
        icon: "record",
      }));

      const medicationEvents = medications.map((item) => ({
        id: `medication-${item._id}`,
        category: "Medications",
        title: item.medicationName,
        description: item.purpose || item.instructions || "",
        date: item.startDate || item.createdAt,
        detail: `${item.dosage} • ${item.frequency}`,
        facility: item.prescribingDoctor || "",
        status: item.status,
        icon: "medication",
      }));

      const historyEvents = history.map((item) => ({
        id: `history-${item._id}`,
        category: "Medical History",
        title: item.conditionName,
        description: item.description || item.treatment || "",
        date: item.diagnosisDate || item.createdAt,
        detail: "Medical Condition",
        facility: item.diagnosedBy || item.hospitalName || "",
        status: item.status,
        icon: "history",
      }));

      const combinedEvents = [
        ...recordEvents,
        ...medicationEvents,
        ...historyEvents,
      ];

      combinedEvents.sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
      );

      setEvents(combinedEvents);

      if (failedRequests.length > 0) {
        setError(
          "Some timeline categories could not be loaded. Displaying the available information."
        );
      }
    } catch (err) {
      setError(
        err.message || "Unable to load your health timeline."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTimeline();
  }, []);

  const filteredEvents = useMemo(() => {
    const search = searchTerm.toLowerCase().trim();

    return events.filter((event) => {
      const matchesCategory =
        selectedCategory === "All" ||
        event.category === selectedCategory;

      const searchableText = [
        event.title,
        event.description,
        event.detail,
        event.facility,
        event.status,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      const matchesSearch = searchableText.includes(search);

      return matchesCategory && matchesSearch;
    });
  }, [events, searchTerm, selectedCategory]);

  const formatDate = (date) => {
    if (!date) return "Date not available";

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return "Date not available";
    }

    return parsedDate.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  };

  const getIcon = (icon) => {
    switch (icon) {
      case "medication":
        return <Pill size={20} />;
      case "history":
        return <HeartPulse size={20} />;
      default:
        return <FileText size={20} />;
    }
  };

  const getCategoryClass = (category) => {
    switch (category) {
      case "Medications":
        return "medication";
      case "Medical History":
        return "history";
      default:
        return "record";
    }
  };

  const groupedEvents = useMemo(() => {
    const groups = [];

    filteredEvents.forEach((event) => {
      const date = new Date(event.date);
      const key = Number.isNaN(date.getTime())
        ? "Unknown date"
        : date.toLocaleDateString("en-IN", {
            month: "long",
            year: "numeric",
          });

      const existingGroup = groups.find((group) => group.label === key);

      if (existingGroup) {
        existingGroup.events.push(event);
      } else {
        groups.push({
          label: key,
          events: [event],
          timestamp: Number.isNaN(date.getTime()) ? 0 : date.getTime(),
        });
      }
    });

    return groups;
  }, [filteredEvents]);

  return (
    <div className="health-timeline-page">
      <div className="health-timeline-header">
        <div>
          <span className="health-timeline-eyebrow">
            YOUR HEALTH JOURNEY
          </span>
          <h1>Health Timeline</h1>
          <p>
            Explore your medical history, treatments and health events
            in chronological order.
          </p>
        </div>

        <button
          type="button"
          className="health-timeline-refresh"
          onClick={loadTimeline}
          disabled={loading}
        >
          <RefreshCw size={17} />
          Refresh
        </button>
      </div>

      <div className="health-timeline-stats">
        <div className="health-timeline-stat-card">
          <div className="health-timeline-stat-icon total">
            <Activity size={21} />
          </div>
          <div>
            <span>Total Events</span>
            <strong>{events.length}</strong>
          </div>
        </div>

        <div className="health-timeline-stat-card">
          <div className="health-timeline-stat-icon records">
            <ClipboardList size={21} />
          </div>
          <div>
            <span>Medical Records</span>
            <strong>
              {events.filter((event) => event.category === "Medical Records").length}
            </strong>
          </div>
        </div>

        <div className="health-timeline-stat-card">
          <div className="health-timeline-stat-icon medications">
            <Pill size={21} />
          </div>
          <div>
            <span>Medications</span>
            <strong>
              {events.filter((event) => event.category === "Medications").length}
            </strong>
          </div>
        </div>

        <div className="health-timeline-stat-card">
          <div className="health-timeline-stat-icon conditions">
            <HeartPulse size={21} />
          </div>
          <div>
            <span>Medical History</span>
            <strong>
              {events.filter((event) => event.category === "Medical History").length}
            </strong>
          </div>
        </div>
      </div>

      <div className="health-timeline-toolbar">
        <div className="health-timeline-search">
          <Search size={18} />
          <input
            type="text"
            placeholder="Search your health journey..."
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
          />
        </div>

        <div className="health-timeline-filters">
          {categories.map((category) => (
            <button
              key={category}
              type="button"
              className={
                selectedCategory === category ? "active" : ""
              }
              onClick={() => setSelectedCategory(category)}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div className="health-timeline-error">
          {error}
        </div>
      )}

      {loading ? (
        <div className="health-timeline-empty">
          <RefreshCw size={25} />
          <p>Loading your health timeline...</p>
        </div>
      ) : filteredEvents.length === 0 ? (
        <div className="health-timeline-empty">
          <div className="health-timeline-empty-icon">
            <CalendarDays size={30} />
          </div>
          <h3>
            {events.length === 0
              ? "Your health timeline is empty"
              : "No matching events found"}
          </h3>
          <p>
            {events.length === 0
              ? "Your medical records, medications and medical history will appear here."
              : "Try another search term or category filter."}
          </p>
        </div>
      ) : (
        <div className="health-timeline-content">
          {groupedEvents.map((group) => (
            <section className="health-timeline-month" key={group.label}>
              <h2>{group.label}</h2>

              <div className="health-timeline-events">
                {group.events.map((event) => (
                  <article
                    className="health-timeline-event"
                    key={event.id}
                  >
                    <div
                      className={`health-timeline-event-icon ${getCategoryClass(
                        event.category
                      )}`}
                    >
                      {getIcon(event.icon)}
                    </div>

                    <div className="health-timeline-event-card">
                      <div className="health-timeline-event-top">
                        <div>
                          <span className="health-timeline-event-category">
                            {event.category}
                          </span>
                          <h3>{event.title || "Untitled event"}</h3>
                        </div>

                        {event.status && (
                          <span className="health-timeline-event-status">
                            {event.status}
                          </span>
                        )}
                      </div>

                      <div className="health-timeline-event-date">
                        <CalendarDays size={15} />
                        {formatDate(event.date)}
                      </div>

                      {event.detail && (
                        <p className="health-timeline-event-detail">
                          <Stethoscope size={15} />
                          {event.detail}
                        </p>
                      )}

                      {event.description && (
                        <p className="health-timeline-event-description">
                          {event.description}
                        </p>
                      )}

                      {event.facility && (
                        <p className="health-timeline-event-facility">
                          {event.facility}
                        </p>
                      )}
                    </div>
                  </article>
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}

export default HealthTimeline;

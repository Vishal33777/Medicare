import React, { useEffect, useMemo, useState } from "react";
import { serviceAppointmentsStyles } from "../assets/dummyStyles";
import {
  Loader2,
  SearchIcon,
  XIcon,
  CheckCircle,
  XCircle,
  User,
  Phone,
  BadgeIndianRupee,
  Calendar,
  Clock,
} from "lucide-react";

const API_BASE = import.meta.env.VITE_BACKEND_URL;

function formatTwo(n) {
  return String(n).padStart(2, "0");
}

function formatDateNice(dateStr) {
  if (!dateStr) return "";

  const d = new Date(`${dateStr}T00:00:00`);

  if (Number.isNaN(d.getTime())) return dateStr;

  return d.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function getTodayISO() {
  const d = new Date();

  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(
    2,
    "0",
  )}-${String(d.getDate()).padStart(2, "0")}`;
}

function isDateBefore(aDateStr, bDateStr) {
  if (!aDateStr || !bDateStr) return false;

  const a = new Date(`${aDateStr}T00:00:00`);
  const b = new Date(`${bDateStr}T00:00:00`);

  return a.getTime() < b.getTime();
}

function parseTimeToParts(timeStr) {
  if (!timeStr) {
    return {
      hour: 12,
      minute: 0,
      ampm: "AM",
    };
  }

  const value = String(timeStr).trim();

  const m = value.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)?$/i);

  if (!m) {
    return {
      hour: 12,
      minute: 0,
      ampm: "AM",
    };
  }

  let hh = Number(m[1]);
  const mm = Number(m[2]);
  const providedAmpm = m[3]?.toUpperCase();

  if (!providedAmpm) {
    return {
      hour: hh % 12 === 0 ? 12 : hh % 12,
      minute: mm,
      ampm: hh >= 12 ? "PM" : "AM",
    };
  }

  return {
    hour: hh,
    minute: mm,
    ampm: providedAmpm,
  };
}

function timePartsToInputValue(a) {
  const hour = Number(a?.hour || 12);
  const minute = Number(a?.minute || 0);
  const ampm = String(a?.ampm || "AM").toUpperCase();

  let hh24 = hour % 12;

  if (ampm === "PM") {
    hh24 += 12;
  }

  if (ampm === "AM" && hour === 12) {
    hh24 = 0;
  }

  return `${formatTwo(hh24)}:${formatTwo(minute)}`;
}

function formatTimeDisplay(a) {
  return `${formatTwo(a.hour)}:${formatTwo(a.minute)} ${a.ampm}`;
}

function StatusBadge({ status }) {
  const classes = serviceAppointmentsStyles.statusBadge(status);

  return (
    <span className={classes}>
      {status === "Confirmed" && <CheckCircle className="h-4 w-4" />}

      {status === "Canceled" && <XCircle className="h-4 w-4" />}

      {status}
    </span>
  );
}

function Toast({ toasts, removeToast }) {
  return (
    <div className={serviceAppointmentsStyles.toastContainer}>
      {toasts.map((t) => (
        <div key={t.id} className={serviceAppointmentsStyles.toast}>
          <div className={serviceAppointmentsStyles.toastContent}>
            <div className="mt-0.5">
              <Loader2 className={serviceAppointmentsStyles.toastSpinner} />
            </div>

            <div className={serviceAppointmentsStyles.toastText}>
              <div className={serviceAppointmentsStyles.toastTitle}>
                {t.title}
              </div>

              <div className={serviceAppointmentsStyles.toastMessage}>
                {t.message}
              </div>
            </div>

            <button
              type="button"
              onClick={() => removeToast(t.id)}
              className={serviceAppointmentsStyles.toastCloseButton}
            >
              ✕
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

function StatusSelect({ appointment, onChange, disabled }) {
  const terminal =
    appointment.status === "Completed" || appointment.status === "Canceled";

  const options = [
    "Pending",
    "Confirmed",
    "Rescheduled",
    "Completed",
    "Canceled",
  ];

  return (
    <select
      value={appointment.status}
      onChange={(e) => onChange(e.target.value)}
      disabled={terminal || disabled}
      className={serviceAppointmentsStyles.statusSelect(terminal)}
    >
      {options.map((status) => (
        <option key={status} value={status}>
          {status}
        </option>
      ))}
    </select>
  );
}

function RescheduleButton({ appointment, onReschedule, disabled }) {
  const terminal =
    appointment.status === "Completed" || appointment.status === "Canceled";

  const [editing, setEditing] = useState(false);

  const [date, setDate] = useState(appointment.date || getTodayISO());

  const [time, setTime] = useState(timePartsToInputValue(appointment));

  useEffect(() => {
    const baseDate = appointment.date || "";

    setDate(
      baseDate && !isDateBefore(baseDate, getTodayISO())
        ? baseDate
        : getTodayISO(),
    );

    setTime(timePartsToInputValue(appointment));
  }, [
    appointment.date,
    appointment.hour,
    appointment.minute,
    appointment.ampm,
  ]);

  function save() {
    if (!date || !time) {
      alert("Please select both date and time.");
      return;
    }

    if (isDateBefore(date, getTodayISO())) {
      alert("Please choose today or a future date.");
      return;
    }

    onReschedule(date, time);
    setEditing(false);
  }

  function cancel() {
    setDate(
      appointment.date && !isDateBefore(appointment.date, getTodayISO())
        ? appointment.date
        : getTodayISO(),
    );

    setTime(timePartsToInputValue(appointment));
    setEditing(false);
  }

  if (!editing) {
    return (
      <div className="flex justify-end">
        <button
          type="button"
          onClick={() => setEditing(true)}
          disabled={terminal || disabled}
          className={serviceAppointmentsStyles.rescheduleButton(terminal)}
        >
          Reschedule
        </button>
      </div>
    );
  }

  return (
    <div className={serviceAppointmentsStyles.rescheduleEditContainer}>
      <input
        type="date"
        value={date}
        min={getTodayISO()}
        onChange={(e) => setDate(e.target.value)}
        className={serviceAppointmentsStyles.rescheduleDateInput}
      />

      <input
        type="time"
        value={time}
        onChange={(e) => setTime(e.target.value)}
        className={serviceAppointmentsStyles.rescheduleTimeInput}
      />

      <div className={serviceAppointmentsStyles.rescheduleActions}>
        <button
          type="button"
          onClick={save}
          className={serviceAppointmentsStyles.rescheduleSaveButton}
        >
          Save
        </button>

        <button
          type="button"
          onClick={cancel}
          className={serviceAppointmentsStyles.rescheduleCancelButton}
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

const ServiceAppointmentPage = () => {
  const [appointments, setAppointments] = useState([]);
  const [toasts, setToasts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  const [statusFilter, setStatusFilter] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search.trim());
    }, 220);

    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    fetchAppointments();
  }, []);

  function pushToast(title, message) {
    const id = Date.now() + Math.random();

    setToasts((prev) => [
      ...prev,
      {
        id,
        title,
        message,
      },
    ]);
  }

  function removeToast(id) {
    setToasts((prev) => prev.filter((x) => x.id !== id));
  }

  useEffect(() => {
    if (!toasts.length) return;

    const timers = toasts.map((toast) =>
      setTimeout(() => {
        setToasts((prev) => prev.filter((x) => x.id !== toast.id));
      }, 3000),
    );

    return () => {
      timers.forEach(clearTimeout);
    };
  }, [toasts]);

  async function fetchAppointments() {
    setLoading(true);
    setError(null);

    try {
      if (!API_BASE) {
        throw new Error("VITE_BACKEND_URL is not configured.");
      }

      const res = await fetch(`${API_BASE}/api/service-appointments?limit=500`);

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));

        throw new Error(
          body?.message || `Failed to fetch appointments (${res.status})`,
        );
      }

      const body = await res.json();

      const list = Array.isArray(body?.appointments)
        ? body.appointments
        : Array.isArray(body?.items)
          ? body.items
          : Array.isArray(body?.data)
            ? body.data
            : [];

      const normalized = list
        .map((a) => {
          let timeStr = "";

          if (a.time) {
            timeStr = a.time;
          } else if (a.slot?.time) {
            timeStr = a.slot.time;
          } else if (a.hour !== undefined && a.minute !== undefined) {
            timeStr = `${formatTwo(a.hour || 12)}:${formatTwo(
              a.minute || 0,
            )} ${a.ampm || "AM"}`;
          } else if (a.rescheduledTo?.time) {
            timeStr = a.rescheduledTo.time;
          }

          const parsed = parseTimeToParts(timeStr);

          return {
            id: a._id || a.id,

            patientName:
              a.patientName || a.name || a.raw?.patientName || "Unknown",

            gender: a.gender || a.raw?.gender || "",

            mobile: a.mobile || a.phone || "",

            age: a.age || a.raw?.age || "",

            serviceName:
              a.serviceName ||
              a.service ||
              a.raw?.serviceName ||
              (a.notes || "").slice(0, 40),

            fees: a.fees ?? a.fee ?? a.payment?.amount ?? 0,

            date: a.date || a.slot?.date || a.rescheduledTo?.date || "",

            hour: parsed.hour,
            minute: parsed.minute,
            ampm: parsed.ampm,

            status: a.status || a.payment?.status || "Pending",

            raw: a,
          };
        })
        .filter((a) => a.id);

      setAppointments(normalized);
    } catch (err) {
      console.error("fetchAppointments:", err);

      setError(err.message || "Failed to load appointments");

      setAppointments([]);
    } finally {
      setLoading(false);
    }
  }

  function extractUpdated(body) {
    return body?.data || body?.appointment || body || {};
  }

  async function changeStatusRemote(id, newStatus) {
    const old = appointments.find((a) => a.id === id);

    if (!old) return;

    if (old.status === "Completed" || old.status === "Canceled") {
      pushToast(
        "Cannot change status",
        `Appointment #${id} is already ${old.status}.`,
      );

      return;
    }

    const previousStatus = old.status;

    setAppointments((prev) =>
      prev.map((a) =>
        a.id === id
          ? {
              ...a,
              status: newStatus,
            }
          : a,
      ),
    );

    try {
      const res = await fetch(`${API_BASE}/api/service-appointments/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status: newStatus,
        }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));

        throw new Error(
          body?.message || `Status update failed (${res.status})`,
        );
      }

      const body = await res.json();
      const updated = extractUpdated(body);

      setAppointments((prev) =>
        prev.map((a) =>
          a.id === id
            ? {
                ...a,
                status: updated.status || newStatus,
                raw: updated || a.raw,
              }
            : a,
        ),
      );

      pushToast("Status updated", `Appointment #${id} is now ${newStatus}`);
    } catch (err) {
      console.error("changeStatusRemote:", err);

      setAppointments((prev) =>
        prev.map((a) =>
          a.id === id
            ? {
                ...a,
                status: previousStatus,
              }
            : a,
        ),
      );

      pushToast("Update failed", err.message || "Failed to update status");
    }
  }

  async function rescheduleRemote(id, dateStr, time24) {
    const appt = appointments.find((a) => a.id === id);

    if (!appt) return;

    if (isDateBefore(dateStr, getTodayISO())) {
      pushToast("Invalid date", "Please choose today or a future date.");

      return;
    }

    const [hh, mm] = time24.split(":").map(Number);

    const hour12 = hh % 12 === 0 ? 12 : hh % 12;

    const ampm = hh >= 12 ? "PM" : "AM";

    const timeStr = `${formatTwo(hour12)}:${formatTwo(mm)} ${ampm}`;

    setAppointments((prev) =>
      prev.map((a) =>
        a.id === id
          ? {
              ...a,
              date: dateStr,
              hour: hour12,
              minute: mm,
              ampm,
              status: "Rescheduled",
            }
          : a,
      ),
    );

    try {
      const res = await fetch(`${API_BASE}/api/service-appointments/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          rescheduledTo: {
            date: dateStr,
            time: timeStr,
          },
          status: "Rescheduled",
        }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));

        throw new Error(body?.message || `Reschedule failed (${res.status})`);
      }

      const body = await res.json();
      const updated = extractUpdated(body);

      const finalDate = updated.date || updated.rescheduledTo?.date || dateStr;

      const finalTime = updated.time || updated.rescheduledTo?.time || timeStr;

      const parsed = parseTimeToParts(finalTime);

      setAppointments((prev) =>
        prev.map((a) =>
          a.id === id
            ? {
                ...a,
                date: finalDate,
                hour: parsed.hour,
                minute: parsed.minute,
                ampm: parsed.ampm,
                status: updated.status || "Rescheduled",
                raw: updated || a.raw,
              }
            : a,
        ),
      );

      pushToast(
        "Rescheduled",
        `Appointment #${id} moved to ${formatDateNice(finalDate)} ${finalTime}`,
      );
    } catch (err) {
      console.error("rescheduleRemote:", err);

      pushToast("Reschedule failed", err.message || "Failed to reschedule");

      await fetchAppointments();
    }
  }

  async function cancelRemote(id) {
    const appt = appointments.find((a) => a.id === id);

    if (!appt) return;

    if (appt.status === "Canceled" || appt.status === "Completed") {
      return;
    }

    const confirmed = window.confirm(
      `Mark appointment for ${appt.patientName} on ${formatDateNice(
        appt.date,
      )} as CANCELED?`,
    );

    if (!confirmed) return;

    setAppointments((prev) =>
      prev.map((a) =>
        a.id === id
          ? {
              ...a,
              status: "Canceled",
            }
          : a,
      ),
    );

    try {
      const res = await fetch(
        `${API_BASE}/api/service-appointments/${id}/cancel`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        },
      );

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));

        throw new Error(body?.message || `Cancel failed (${res.status})`);
      }

      const body = await res.json();
      const updated = extractUpdated(body);

      setAppointments((prev) =>
        prev.map((a) =>
          a.id === id
            ? {
                ...a,
                status: updated.status || "Canceled",
                raw: updated || a.raw,
              }
            : a,
        ),
      );

      pushToast("Canceled", `Appointment #${id} canceled`);
    } catch (err) {
      console.error("cancelRemote:", err);

      pushToast("Cancel failed", err.message || "Failed to cancel");

      await fetchAppointments();
    }
  }

  const filtered = useMemo(() => {
    const q = debouncedSearch.toLowerCase();

    return appointments
      .filter((a) => {
        if (!q) return true;

        return (
          (a.patientName || "").toLowerCase().includes(q) ||
          (a.serviceName || "").toLowerCase().includes(q) ||
          (a.mobile || "").toLowerCase().includes(q)
        );
      })
      .filter((a) => (statusFilter ? a.status === statusFilter : true));
  }, [appointments, debouncedSearch, statusFilter]);

  function getTimestamp(a) {
    if (!a.date) {
      return Number.MAX_SAFE_INTEGER;
    }

    try {
      const [y, m, d] = a.date.split("-").map(Number);

      let hour = Number(a.hour) || 0;

      if (String(a.ampm).toUpperCase() === "PM" && hour !== 12) {
        hour += 12;
      }

      if (String(a.ampm).toUpperCase() === "AM" && hour === 12) {
        hour = 0;
      }

      return new Date(y, m - 1, d, hour, Number(a.minute) || 0).getTime();
    } catch {
      return Number.MAX_SAFE_INTEGER;
    }
  }

  const displayList = useMemo(() => {
    return filtered.slice().sort((a, b) => getTimestamp(a) - getTimestamp(b));
  }, [filtered]);

  return (
    <div className={serviceAppointmentsStyles.container}>
      <header className={serviceAppointmentsStyles.headerContainer}>
        <div className={serviceAppointmentsStyles.headerTitleContainer}>
          <h1 className={serviceAppointmentsStyles.headerTitle}>
            Appointments
          </h1>

          <p className={serviceAppointmentsStyles.headerSubtitle}>
            Manage patient bookings - quick search & status controls
          </p>
        </div>

        <div className={serviceAppointmentsStyles.searchContainer}>
          <div className={serviceAppointmentsStyles.searchInputWrapper}>
            <label className={serviceAppointmentsStyles.searchLabel}>
              <span className="sr-only">Search Appointments</span>

              <div className="flex items-center gap-2 relative w-full">
                <div className={serviceAppointmentsStyles.searchIconContainer}>
                  <SearchIcon
                    className={serviceAppointmentsStyles.searchIcon}
                  />
                </div>

                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search by patients or service..."
                  className={serviceAppointmentsStyles.searchInput}
                />

                {search && (
                  <button
                    type="button"
                    onClick={() => setSearch("")}
                    className={serviceAppointmentsStyles.clearSearchButton}
                  >
                    <XIcon
                      className={serviceAppointmentsStyles.clearSearchIcon}
                    />
                  </button>
                )}
              </div>
            </label>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className={serviceAppointmentsStyles.statusFilterSelect}
            >
              <option value="">All</option>
              <option value="Pending">Pending</option>
              <option value="Confirmed">Confirmed</option>
              <option value="Rescheduled">Rescheduled</option>
              <option value="Completed">Completed</option>
              <option value="Canceled">Canceled</option>
            </select>
          </div>

          <div className="flex items-center gap-70 mt-3">
            <span className={serviceAppointmentsStyles.resultCount}>
              {displayList.length} result
              {displayList.length !== 1 ? "s" : ""}
            </span>

            <button
              type="button"
              onClick={fetchAppointments}
              disabled={loading}
              className={serviceAppointmentsStyles.refreshButton}
            >
              {loading ? "Refreshing..." : "Refresh"}
            </button>
          </div>
        </div>
      </header>

      {loading ? (
        <div className={serviceAppointmentsStyles.loadingContainer}>
          <Loader2 className="animate-spin" />
          Loading appointments...
        </div>
      ) : error ? (
        <div className={serviceAppointmentsStyles.errorContainer}>{error}</div>
      ) : (
        <div className={serviceAppointmentsStyles.gridContainer}>
          {displayList.length === 0 ? (
            <div className={serviceAppointmentsStyles.noResultsContainer}>
              <div className={serviceAppointmentsStyles.noResultsIcon}>
                <SearchIcon />
              </div>

              <div className={serviceAppointmentsStyles.noResultsText}>
                No appointments match your search
              </div>

              <div className={serviceAppointmentsStyles.noResultsSubtext}>
                Try a different patient name or service
              </div>
            </div>
          ) : (
            displayList.map((a) => {
              const isLocked =
                a.status === "Completed" || a.status === "Canceled";

              return (
                <article
                  key={a.id}
                  className={serviceAppointmentsStyles.article}
                >
                  <div className={serviceAppointmentsStyles.cardInner}>
                    <div>
                      <div className={serviceAppointmentsStyles.cardHeader}>
                        <div
                          className={
                            serviceAppointmentsStyles.patientInfoContainer
                          }
                        >
                          <div
                            className={serviceAppointmentsStyles.patientAvatar}
                          >
                            <User
                              className={
                                serviceAppointmentsStyles.patientAvatarIcon
                              }
                            />
                          </div>

                          <div>
                            <div
                              className={serviceAppointmentsStyles.patientName}
                            >
                              {a.patientName}
                            </div>

                            <div
                              className={
                                serviceAppointmentsStyles.patientDetails
                              }
                            >
                              {a.gender || "N/A"} • {a.age || "N/A"} yrs
                            </div>
                          </div>
                        </div>

                        <div
                          className={serviceAppointmentsStyles.statusContainer}
                        >
                          <StatusBadge status={a.status} />

                          <div className="mt-1">
                            <StatusSelect
                              appointment={a}
                              onChange={(status) =>
                                changeStatusRemote(a.id, status)
                              }
                            />
                          </div>
                        </div>
                      </div>

                      <div
                        className={serviceAppointmentsStyles.detailsContainer}
                      >
                        <div className={serviceAppointmentsStyles.detailItem}>
                          <Phone
                            className={serviceAppointmentsStyles.detailIcon}
                          />

                          <span
                            className={serviceAppointmentsStyles.detailText}
                          >
                            {a.mobile || "N/A"}
                          </span>
                        </div>

                        <div className={serviceAppointmentsStyles.detailItem}>
                          <BadgeIndianRupee
                            className={serviceAppointmentsStyles.detailIcon}
                          />

                          <span className={serviceAppointmentsStyles.feesText}>
                            Fees: ₹{a.fees}
                          </span>
                        </div>

                        <div className={serviceAppointmentsStyles.detailItem}>
                          <Calendar
                            className={serviceAppointmentsStyles.detailIcon}
                          />

                          <span
                            className={serviceAppointmentsStyles.detailText}
                          >
                            Date: {formatDateNice(a.date)}
                          </span>
                        </div>

                        <div className={serviceAppointmentsStyles.detailItem}>
                          <Clock
                            className={serviceAppointmentsStyles.detailIcon}
                          />

                          <span
                            className={serviceAppointmentsStyles.detailText}
                          >
                            Time: {formatTimeDisplay(a)}
                          </span>
                        </div>

                        <div className={serviceAppointmentsStyles.serviceText}>
                          Service:{" "}
                          <span
                            className={serviceAppointmentsStyles.serviceName}
                          >
                            {a.serviceName || "N/A"}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className={serviceAppointmentsStyles.actionsContainer}>
                      <div
                        className={
                          serviceAppointmentsStyles.actionsInnerContainer
                        }
                      >
                        <div className="flex-1">
                          <RescheduleButton
                            appointment={a}
                            onReschedule={(date, time) =>
                              rescheduleRemote(a.id, date, time)
                            }
                          />
                        </div>

                        <div className="ml-3">
                          <button
                            type="button"
                            onClick={() => cancelRemote(a.id)}
                            disabled={isLocked}
                            className={serviceAppointmentsStyles.cancelButton(
                              isLocked,
                            )}
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </article>
              );
            })
          )}
        </div>
      )}

      <Toast toasts={toasts} removeToast={removeToast} />

      <div className={serviceAppointmentsStyles.legendContainer}>
        <div className={serviceAppointmentsStyles.legendItem}>
          <div
            className={`${serviceAppointmentsStyles.legendDot} bg-amber-400`}
          />
          <span>Pending</span>
        </div>

        <div className={serviceAppointmentsStyles.legendItem}>
          <div
            className={`${serviceAppointmentsStyles.legendDot} bg-emerald-400`}
          />
          <span>Confirmed</span>
        </div>

        <div className={serviceAppointmentsStyles.legendItem}>
          <div
            className={`${serviceAppointmentsStyles.legendDot} bg-red-400`}
          />
          <span>Canceled</span>
        </div>

        <div className={serviceAppointmentsStyles.legendItem}>
          <div
            className={`${serviceAppointmentsStyles.legendDot} bg-sky-400`}
          />
          <span>Completed</span>
        </div>

        <div className={serviceAppointmentsStyles.legendItem}>
          <div
            className={`${serviceAppointmentsStyles.legendDot} bg-indigo-400`}
          />
          <span>Rescheduled</span>
        </div>

        <style>{serviceAppointmentsStyles.animatedBorderStyle}</style>
      </div>
    </div>
  );
};

export default ServiceAppointmentPage;

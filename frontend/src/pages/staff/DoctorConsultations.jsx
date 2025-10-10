// frontend/src/pages/staff/DoctorConsultations.jsx
import { useEffect, useState } from "react";
import api from "../../api";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// react-big-calendar imports
import { Calendar, dateFnsLocalizer, Views } from "react-big-calendar";
import { format, parse, startOfWeek, getDay } from "date-fns";
import enUS from "date-fns/locale/en-US";
import "react-big-calendar/lib/css/react-big-calendar.css";

//  Setup localizer
const locales = { "en-US": enUS };
const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: () => startOfWeek(new Date(), { weekStartsOn: 1 }),
  getDay,
  locales,
});

export default function DoctorConsultations() {
  const [consultations, setConsultations] = useState([]);
  const [appointments, setAppointments] = useState([]); // store doctor's approved appts
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  // Calendar state
  const [currentView, setCurrentView] = useState(Views.MONTH);
  const [currentDate, setCurrentDate] = useState(new Date());

  // Approve modal state
  const [selectedConsultation, setSelectedConsultation] = useState(null);
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [minTime, setMinTime] = useState(""); // min time buffer
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [timeError, setTimeError] = useState("");

  // Reject modal state
  const [rejectingConsultation, setRejectingConsultation] = useState(null);
  const [rejectNote, setRejectNote] = useState("");
  const [rejecting, setRejecting] = useState(false);

  const getToken = () =>
    localStorage.getItem("staffToken") ||
    localStorage.getItem("token") ||
    localStorage.getItem("authToken");

  // Fetch pending consultations
  const fetchConsultations = async () => {
    try {
      setLoading(true);
      const token = getToken();
      const res = await api.get("/consultations/pending", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setConsultations(res.data || []);
    } catch (e) {
      setErr(e?.response?.data?.message || e.message);
    } finally {
      setLoading(false);
    }
  };

  // Fetch doctor's approved appointments
  const fetchAppointments = async () => {
    try {
      const token = getToken();
      const res = await api.get("/appointments/my", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAppointments(res.data || []);
    } catch (e) {
      console.error("Error fetching appointments", e);
    }
  };

  useEffect(() => {
    fetchConsultations();
    fetchAppointments();
  }, []);

  // 30-min buffer & time validation
  useEffect(() => {
    const todayStr = new Date().toISOString().split("T")[0];
    if (date === todayStr) {
      const bufferMinutes = 30;
      const nowWithBuffer = new Date(new Date().getTime() + bufferMinutes * 60000);
      const bufferedTime = nowWithBuffer.toTimeString().slice(0, 5);

      setMinTime(bufferedTime);

      if (time && time < bufferedTime) {
        setTimeError(`Please select a time after ${bufferedTime}.`);
      } else {
        setTimeError("");
      }
    } else {
      setMinTime("");
      setTimeError("");
    }
  }, [date, time]);

  // Approve consultation
  const handleApprove = async (e) => {
    e.preventDefault();
    if (!date || !time) {
      toast.error("Please select a date and time");
      return;
    }
    if (timeError || checkTimeConflict(new Date(`${date}T${time}`))) {
      toast.error("Please fix time selection errors before submitting.");
      return;
    }

    try {
      setSubmitting(true);
      const token = getToken();

      // get doctor profile
      const resDoctor = await api.get("/doctors/my", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const doctorId = resDoctor.data._id;
      localStorage.setItem("doctorId", doctorId);

      const isoDate = new Date(`${date}T${time}`).toISOString();

      await api.patch(
        `/consultations/${selectedConsultation._id}`,
        {
          status: "Approved",
          doctorId,
          date: isoDate,
          responseNotes: notes,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      toast.success("Consultation approved and appointment created");
      setSelectedConsultation(null);
      setDate("");
      setTime("");
      setNotes("");
      fetchConsultations();
      fetchAppointments();
    } catch (e) {
      toast.error("Failed to approve consultation");
    } finally {
      setSubmitting(false);
    }
  };

  // Reject consultation
  const handleRejectConfirm = async () => {
    if (!rejectNote.trim()) {
      toast.error("Please enter a reason for rejection");
      return;
    }
    try {
      setRejecting(true);
      const token = getToken();
      await api.patch(
        `/consultations/${rejectingConsultation._id}`,
        { status: "Rejected", responseNotes: rejectNote },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.info("Consultation rejected");
      setRejectingConsultation(null);
      setRejectNote("");
      fetchConsultations();
    } catch (e) {
      toast.error("Failed to reject consultation");
    } finally {
      setRejecting(false);
    }
  };

  // Calendar handlers
  const handleViewChange = (view) => setCurrentView(view);
  const handleNavigate = (newDate) => setCurrentDate(newDate);

  // Map appointments into calendar events
  const events = appointments.map((a) => ({
    title: `${a.elder?.fullName || "Elder"} (${a.status})`,
    start: new Date(a.date),
    end: new Date(new Date(a.date).getTime() + 30 * 60000), // 30 mins
    status: a.status,
  }));

  // --- Helper: check time conflict ---
  const checkTimeConflict = (selectedDateTime) => {
    const duration = 30; // 30 min appointment
    return appointments.some((a) => {
      const start = new Date(a.date);
      const end = new Date(start.getTime() + duration * 60000);
      return selectedDateTime >= start && selectedDateTime < end;
    });
  };

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold text-orange-600">Doctor Dashboard</h1>
      <p className="text-gray-600">Manage and respond to consultation requests</p>

      {/* Consultations Table */}
      <section className="rounded-lg border shadow">
        <div className="bg-orange-500 text-white p-3 rounded-t-lg font-semibold">
          Pending Consultation Requests
        </div>
        <div className="p-4">
          {loading && <p className="text-orange-500">Loading consultations…</p>}
          {err && <p className="text-red-500">{err}</p>}

          {!loading && consultations.length === 0 && (
            <p className="text-gray-500">No pending consultations found.</p>
          )}

          {!loading && consultations.length > 0 && (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="bg-gray-100">
                  <tr>
                    <Th>Elder</Th>
                    <Th>Caretaker</Th>
                    <Th>Reason</Th>
                    <Th>Priority</Th>
                    <Th>Requested On</Th>
                    <Th>Action</Th>
                  </tr>
                </thead>
                <tbody>
                  {consultations.map((c, idx) => (
                    <tr
                      key={c._id}
                      className={idx % 2 === 0 ? "bg-white" : "bg-gray-50"}
                    >
                      <Td>{c.elder?.fullName || "—"}</Td>
                      <Td>{c.caretaker?.staff?.name || "—"}</Td>
                      <Td>{c.reason}</Td>
                      <Td>{c.priority}</Td>
                      <Td>
                        {c.requestDate
                          ? new Date(c.requestDate).toLocaleString()
                          : "—"}
                      </Td>
                      <Td>
                        <button
                          className="px-3 py-1 bg-green-500 text-white rounded-lg hover:bg-green-600 mr-2"
                          onClick={() => setSelectedConsultation(c)}
                        >
                          Approve
                        </button>
                        <button
                          className="px-3 py-1 bg-red-500 text-white rounded-lg hover:bg-red-600"
                          onClick={() => setRejectingConsultation(c)}
                        >
                          Reject
                        </button>
                      </Td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>

      {/* Calendar Section */}
      <section className="rounded-lg border shadow p-4">
        <h2 className="text-xl font-bold mb-3"> Appointment Calendar</h2>
        <Calendar
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
          style={{ height: 500 }}
          views={[Views.MONTH, Views.WEEK, Views.DAY, Views.AGENDA]}
          view={currentView}
          date={currentDate}
          onView={handleViewChange}
          onNavigate={handleNavigate}
          eventPropGetter={(event) => {
            let bg = "#3b82f6"; // default blue
            if (event.status?.toLowerCase() === "approved") bg = "#22c55e";
            else if (event.status?.toLowerCase() === "rejected") bg = "#ef4444";
            else if (event.status?.toLowerCase() === "pending") bg = "#f59e0b";
            return { style: { backgroundColor: bg, borderRadius: "6px", color: "white" } };
          }}
        />
      </section>
      

      {/* Approve Modal */}
{selectedConsultation && (
  <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 overflow-auto p-4">
    <div className="bg-white rounded-xl p-6 w-full max-w-2xl shadow-xl">
      <h2 className="text-lg font-semibold mb-4">Approve Consultation</h2>
      <form onSubmit={handleApprove} className="space-y-3">
        {/* Date Input */}
        <div>
          <label className="block text-sm">Date</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            min={new Date().toISOString().split("T")[0]}
            className="w-full border rounded-lg p-2"
            required
          />
        </div>

        {/* Time Input */}
        <div>
          <label className="block text-sm">Time</label>
          <input
            type="time"
            value={time}
            onChange={(e) => setTime(e.target.value)}
            min={minTime}
            className="w-full border rounded-lg p-2"
            required
          />
          {minTime && (
            <p className="text-xs text-gray-500 mt-1">
              Minimum time: {minTime} (30-minute buffer)
            </p>
          )}
          {timeError && (
            <p className="text-xs text-red-500 mt-1">⚠️ {timeError}</p>
          )}
          {date && time && checkTimeConflict(new Date(`${date}T${time}`)) && (
            <p className="text-xs text-red-500 mt-1">
              ⚠️ This time conflicts with an existing appointment (30-min)
            </p>
          )}
        </div>

        {/* Notes */}
        <div>
          <label className="block text-sm">Notes</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full border rounded-lg p-2"
            placeholder="Optional notes"
          />
        </div>

        {/* Mini Calendar */}
        <div className="mt-4">
          <h3 className="font-semibold mb-2">Existing Appointments</h3>
          <div className="border rounded-lg h-64 overflow-auto">
            <Calendar
              localizer={localizer}
              events={appointments.map((a) => ({
                title: `${a.elder?.fullName || "Elder"} (${a.status})`,
                start: new Date(a.date),
                end: new Date(new Date(a.date).getTime() + 30 * 60000),
                status: a.status,
              }))}
              startAccessor="start"
              endAccessor="end"
              defaultView={Views.WEEK}
              views={[Views.WEEK, Views.DAY]}
              toolbar={false} // hide toolbar
              style={{ height: "100%" }}
              eventPropGetter={(event) => {
                let bg = "#ef4444"; // red for occupied
                if (event.status?.toLowerCase() === "approved") bg = "#22c55e";
                return {
                  style: { backgroundColor: bg, borderRadius: "4px", color: "white", fontSize: "0.75rem" },
                };
              }}
            />
          </div>
        </div>

        {/* Buttons */}
        <div className="flex justify-end gap-2 mt-4">
          <button
            type="button"
            onClick={() => setSelectedConsultation(null)}
            className="px-3 py-1 border rounded-lg"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting || timeError || checkTimeConflict(new Date(`${date}T${time}`))}
            className="px-3 py-1 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
          >
            {submitting ? "Submitting…" : "Confirm"}
          </button>
        </div>
      </form>
    </div>
  </div>
)}


      {/* Reject Modal */}
      {rejectingConsultation && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-[400px] shadow-xl">
            <h2 className="text-lg font-semibold mb-4">Reject Consultation</h2>
            <textarea
              value={rejectNote}
              onChange={(e) => setRejectNote(e.target.value)}
              className="w-full border rounded-lg p-2 mb-3"
              placeholder="Enter rejection reason"
              rows={3}
            />
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setRejectingConsultation(null)}
                className="px-3 py-1 border rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleRejectConfirm}
                disabled={rejecting}
                className="px-3 py-1 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                {rejecting ? "Rejecting…" : "Confirm Reject"}
              </button>
            </div>
          </div>
        </div>
      )}

      <ToastContainer />
    </div>
  );
}

// ---------- SMALL COMPONENTS
function Th({ children }) {
  return <th className="px-3 py-2 font-semibold text-left">{children}</th>;
}
function Td({ children, className = "" }) {
  return <td className={`px-3 py-2 ${className}`}>{children}</td>;
}

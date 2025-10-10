import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../api";
import {
  FaClipboardList,
  FaCalendarAlt,
  FaClock,
  FaExclamationTriangle,
  FaHeartbeat,
  FaStethoscope,
  FaCheckCircle,
} from "react-icons/fa";

export default function DoctorDashboard() {
  const [appointmentsCount, setAppointmentsCount] = useState(0);
  const [pendingConsultationsCount, setPendingConsultationsCount] = useState(0);
  const [urgentConsultationsCount, setUrgentConsultationsCount] = useState(0);
  const [nextAppointment, setNextAppointment] = useState(null);
  const [doctorName, setDoctorName] = useState("Doctor");
  const [appointments, setAppointments] = useState([]);
  const [completedConsultationsCount, setCompletedConsultationsCount] = useState(0);
  const [todaysPatientsCount, setTodaysPatientsCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const getToken = () =>
    localStorage.getItem("staffToken") ||
    localStorage.getItem("token") ||
    localStorage.getItem("authToken");

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const token = getToken();

        // Fetch doctor profile
        const resDoctor = await api.get("/doctors/my", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setDoctorName(resDoctor.data?.name || resDoctor.data?.fullName || "Doctor");

        // Fetch appointments
        const resAppointments = await api.get("/appointments/my", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const allAppointments = resAppointments.data || [];
        setAppointments(allAppointments);
        setAppointmentsCount(allAppointments.length);

        // Today's patients
        const today = new Date().toISOString().split("T")[0];
        const todaysPatients = allAppointments.filter(a => a.date.startsWith(today));
        setTodaysPatientsCount(todaysPatients.length);

        // Completed consultations
        const completed = allAppointments.filter(a => a.status === "Completed");
        setCompletedConsultationsCount(completed.length);

        // Next appointment
        const futureAppointments = allAppointments
          .filter(a => new Date(a.date) > new Date())
          .sort((a, b) => new Date(a.date) - new Date(b.date));
        setNextAppointment(
          futureAppointments.length > 0
            ? new Date(futureAppointments[0].date)
            : null
        );

        // Pending consultations
        const resConsultations = await api.get("/consultations/pending", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const consultations = resConsultations.data || [];
        setPendingConsultationsCount(consultations.length);

        // Urgent consultations
        const urgent = consultations.filter(c => c.priority === "Urgent");
        setUrgentConsultationsCount(urgent.length);
      } catch (err) {
        console.error("Error fetching dashboard data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="p-6 bg-gray-50 min-h-screen flex flex-col">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 bg-white p-5 rounded-2xl shadow-md">
        <div>
          <h1 className="text-3xl font-bold text-orange-600">
            Welcome back, {doctorName}
          </h1>
          <p className="text-gray-600 mt-1">{today}</p>
        </div>
        <div className="mt-4 md:mt-0">
          <p className="text-gray-700 italic">
            "Every consultation is a chance to heal a life."
          </p>
        </div>
      </div>

      {loading ? (
        <p>Loading dashboard...</p>
      ) : (
        <>
          {/* Dashboard Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
            <DashboardCard
              title="Appointments"
              value={appointmentsCount}
              color="from-green-400 to-green-600"
              icon={<FaCalendarAlt size={32} />}
              to="/staff/doctor-dashboard/appointments"
            />
            <DashboardCard
              title="Today's Patients"
              value={todaysPatientsCount}
              color="from-teal-400 to-teal-600"
              icon={<FaHeartbeat size={32} />}
              to="/staff/doctor-dashboard/appointments"
            />
            <DashboardCard
              title="Completed Consultations"
              value={completedConsultationsCount}
              color="from-indigo-400 to-indigo-600"
              icon={<FaCheckCircle size={32} />}
              to="/staff/doctor-dashboard/consultations"
            />
            <DashboardCard
              title="Pending Consultations"
              value={pendingConsultationsCount}
              color="from-blue-400 to-blue-600"
              icon={<FaClipboardList size={32} />}
              to="/staff/doctor-dashboard/consultations"
            />
            <DashboardCard
              title="Urgent Consultations"
              value={urgentConsultationsCount}
              color="from-red-400 to-red-600"
              icon={<FaExclamationTriangle size={32} />}
              to="/staff/doctor-dashboard/consultations"
            />
            <DashboardCard
              title="Next Appointment"
              value={
                nextAppointment ? nextAppointment.toLocaleString() : "No upcoming"
              }
              color="from-purple-400 to-purple-600"
              icon={<FaClock size={32} />}
              highlight
              to="/staff/doctor-dashboard/appointments"
            />
          </div>

          {/* Overview Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 flex-grow">
            <div className="bg-white rounded-2xl p-6 shadow-md">
              <h2 className="text-xl font-semibold text-gray-800 mb-3 flex items-center gap-2">
                <FaStethoscope className="text-orange-500" />
                Quick Overview
              </h2>
              <p className="text-gray-700">
                You have <b>{appointmentsCount}</b> appointments and{" "}
                <b>{pendingConsultationsCount}</b> consultations pending today.
              </p>
              <p className="text-gray-700 mt-2">
                There are <b>{urgentConsultationsCount}</b> urgent cases requiring priority review.
              </p>
              <p className="text-gray-700 mt-2">
                {nextAppointment
                  ? `Your next appointment is scheduled for ${nextAppointment.toLocaleString()}.`
                  : "You currently have no upcoming appointments."}
              </p>
            </div>

            <div className="bg-gradient-to-r from-orange-400 to-orange-600 text-white rounded-2xl p-6 shadow-md">
              <h2 className="text-xl font-semibold mb-3 flex items-center gap-2">
                <FaHeartbeat />
                Health Insights
              </h2>
              <p>
                Keep an eye on patient vitals and ensure timely follow-ups. Review consultation records regularly to detect any recurring issues.
              </p>
              <p className="mt-3 text-sm opacity-90 italic">
                Tip: Reviewing urgent cases first helps balance workload and improves care quality.
              </p>
            </div>
          </div>

          {/* Recent Appointments */}
          <div className="bg-white rounded-2xl p-6 shadow-md mt-6">
            <h2 className="text-xl font-semibold mb-4">Upcoming Appointments</h2>
            {appointments.length === 0 ? (
              <p className="text-gray-600">No appointments scheduled.</p>
            ) : (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b">
                    <th className="py-2 px-3">Patient</th>
                    <th className="py-2 px-3">Date & Time</th>
                    <th className="py-2 px-3">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {appointments.slice(0, 5).map((a) => (
                    <tr key={a.id} className="border-b">
                      <td className="py-2 px-3">{a.patientName}</td>
                      <td className="py-2 px-3">{new Date(a.date).toLocaleString()}</td>
                      <td className="py-2 px-3">{a.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </>
      )}
    </div>
  );
}

function DashboardCard({ title, value, color, icon, highlight, to }) {
  const CardContent = (
    <div
      className={`flex items-center justify-between rounded-2xl shadow-lg p-6 bg-gradient-to-r ${color} text-white transform transition hover:scale-105 cursor-pointer ${
        highlight ? "lg:col-span-2" : ""
      }`}
    >
      <div>
        <p className="text-lg font-medium">{title}</p>
        <p className="text-2xl font-bold mt-2">{value}</p>
      </div>
      <div className="opacity-90">{icon}</div>
    </div>
  );

  return to ? <Link to={to}>{CardContent}</Link> : CardContent;
}

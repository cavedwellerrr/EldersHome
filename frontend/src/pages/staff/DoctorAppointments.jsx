import { useEffect, useState } from "react";
import api from "../../api";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { jsPDF } from "jspdf";

export default function DoctorAppointments() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  // Prescription modal state
  const [showModal, setShowModal] = useState(false);
  const [selectedAppt, setSelectedAppt] = useState(null);
  const [drugs, setDrugs] = useState([{ name: "", dosage: "", frequency: "", duration: "" }]);
  const [notes, setNotes] = useState("");
  const [savedPrescription, setSavedPrescription] = useState(null);

  const getToken = () =>
    localStorage.getItem("staffToken") ||
    localStorage.getItem("token") ||
    localStorage.getItem("authToken");

  //  Fetch doctor’s appointments
  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const token = getToken();
      const res = await api.get("/appointments/my", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const upcoming = (res.data || []).filter(
        (a) => a.status !== "completed" && new Date(a.date) > new Date()
      );
      setAppointments(upcoming);
    } catch (e) {
      setErr(e?.response?.data?.message || e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  //  Save Prescription
  const handleSavePrescription = async () => {
    try {
      const token = getToken();
      const payload = {
        elder: selectedAppt.elder?._id || selectedAppt.elder,
        doctor: selectedAppt.doctor?._id || selectedAppt.doctor,
        caretaker: selectedAppt.caretaker?._id || selectedAppt.caretaker,
        drugs,
        notes,
      };
      console.log("Saving prescription:", payload);

      const res = await api.post("/prescriptions", payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // Link prescription to appointment
      await api.patch(`/appointments/${selectedAppt._id}`, { prescription: res.data._id }, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setSavedPrescription(res.data);
      toast.success("Prescription saved successfully");
    } catch (e) {
      console.error("Save failed:", e.response?.data || e.message);
      toast.error("Failed to save prescription");
    }
  };

  //  Download PDF
  const downloadPrescriptionPDF = (prescription) => {
    const doc = new jsPDF();

    doc.setFontSize(18);
    doc.text("Prescription", 14, 20);

    doc.setFontSize(12);
    doc.text(`Elder: ${selectedAppt.elder?.fullName || "—"}`, 14, 40);
    doc.text(`Caretaker: ${prescription.caretaker?.name || "—"}`, 14, 50); 
 doc.text(`Doctor: ${prescription.doctor?.staff?.name || "—"}`, 14, 60);
  doc.text(`Specialization: ${prescription.doctor?.specialization || "—"}`, 14, 70);
    doc.text(`Date: ${new Date().toLocaleDateString()}`, 14, 80);

    let y = 90;
    doc.text("Medicines:", 14, y);
    y += 10;

    (prescription.drugs || []).forEach((drug, i) => {
      doc.text(`${i + 1}. ${drug.name} - ${drug.dosage}, ${drug.frequency} for ${drug.duration}`, 14, y);
      y += 10;
    });

    doc.text("Notes:", 14, y + 10);
    doc.text(prescription.notes || "—", 14, y + 20);

    doc.text("____________________", 140, 250);
    doc.text("Doctor's Signature", 145, 260);

    doc.save(`Prescription_${prescription._id}.pdf`);
  };

  //  Mark appointment as completed
  const handleComplete = async (appointmentId) => {
    try {
      const token = getToken();
      await api.patch(`/appointments/${appointmentId}`, { status: "completed" }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("Appointment marked as completed");
      fetchAppointments();
    } catch (e) {
      toast.error("Failed to update appointment");
    }
  };

  //  Handle adding/removing medicines
  const handleDrugChange = (index, field, value) => {
    const newDrugs = [...drugs];
    newDrugs[index][field] = value;
    setDrugs(newDrugs);
  };

  const addDrugRow = () => setDrugs([...drugs, { name: "", dosage: "", frequency: "", duration: "" }]);
  const removeDrugRow = (index) => {
    if (drugs.length === 1) return;
    setDrugs(drugs.filter((_, i) => i !== index));
  };

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold text-orange-600">Doctor Dashboard</h1>
      <p className="text-gray-600">Manage your upcoming appointments</p>

      <section className="rounded-lg border shadow">
        <div className="bg-orange-500 text-white p-3 rounded-t-lg font-semibold">Upcoming Appointments</div>
        <div className="p-4">
          {loading && <p className="text-orange-500">Loading appointments…</p>}
          {err && <p className="text-red-500">{err}</p>}
          {!loading && appointments.length === 0 && <p className="text-gray-500">No upcoming appointments.</p>}

          {!loading && appointments.length > 0 && (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="bg-gray-100">
                  <tr>
                    <Th>Elder</Th>
                    <Th>Caretaker</Th>
                    <Th>Date & Time</Th>
                    <Th>Actions</Th>
                  </tr>
                </thead>
                <tbody>
                  {appointments.map((a, idx) => (
                    <tr key={a._id} className={idx % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                      <Td>{a.elder?.fullName || "—"}</Td>
                      <Td>{a.caretaker?.name || "—"}</Td>
                      <Td>{a.date ? new Date(a.date).toLocaleString() : "—"}</Td>
                      <Td className="space-x-2">
                        <button className="px-3 py-1 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                          onClick={() => { setSelectedAppt(a); setShowModal(true); setSavedPrescription(null); }}>
                          Add Prescription
                        </button>
                        <button className="px-3 py-1 bg-green-500 text-white rounded-lg hover:bg-green-600"
                          onClick={() => handleComplete(a._id)}>
                          Mark Completed
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

      {/* Prescription Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white rounded-lg shadow-lg p-6 w-[600px] max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">Add Prescription</h2>

            {drugs.map((drug, i) => (
              <div key={i} className="flex space-x-2 mb-2">
                <input className="border p-2 w-1/4" placeholder="Name" value={drug.name}
                  onChange={(e) => handleDrugChange(i, "name", e.target.value)} />
                <input className="border p-2 w-1/4" placeholder="Dosage" value={drug.dosage}
                  onChange={(e) => handleDrugChange(i, "dosage", e.target.value)} />
                <input className="border p-2 w-1/4" placeholder="Frequency" value={drug.frequency}
                  onChange={(e) => handleDrugChange(i, "frequency", e.target.value)} />
                <input className="border p-2 w-1/4" placeholder="Duration" value={drug.duration}
                  onChange={(e) => handleDrugChange(i, "duration", e.target.value)} />
                <button className="px-2 bg-red-500 text-white rounded" onClick={() => removeDrugRow(i)}>✕</button>
              </div>
            ))}
            <button className="mb-4 px-3 py-1 bg-gray-200 rounded hover:bg-gray-300" onClick={addDrugRow}>
              + Add Medicine
            </button>

            <textarea className="border w-full p-2 mb-4" placeholder="Notes (optional)" value={notes}
              onChange={(e) => setNotes(e.target.value)} />

            <div className="flex justify-end space-x-2">
              <button className="px-3 py-1 bg-gray-300 rounded"
                onClick={() => { setShowModal(false); setSavedPrescription(null); setDrugs([{ name: "", dosage: "", frequency: "", duration: "" }]); setNotes(""); }}>
                Close
              </button>
              {!savedPrescription ? (
                <button className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
                  onClick={handleSavePrescription}>
                  Save Prescription
                </button>
              ) : (
                <button className="px-3 py-1 bg-purple-600 text-white rounded hover:bg-purple-700"
                  onClick={() => downloadPrescriptionPDF(savedPrescription)}>
                  Download Prescription
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      <ToastContainer />
    </div>
  );
}

function Th({ children }) { return <th className="px-3 py-2 font-semibold text-left">{children}</th>; }
function Td({ children, className = "" }) { return <td className={`px-3 py-2 ${className}`}>{children}</td>; }

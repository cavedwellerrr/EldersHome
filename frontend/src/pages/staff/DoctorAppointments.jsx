import { useEffect, useState } from "react";
import api from "../../api";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { jsPDF } from "jspdf";
import QRCode from "qrcode";

export default function DoctorAppointments() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  // Prescription modal state
  const [showModal, setShowModal] = useState(false);
  const [selectedAppt, setSelectedAppt] = useState(null);
  const [drugs, setDrugs] = useState([
    { name: "", dosage: "", frequency: "", duration: "", form: "" },
  ]);
  const [notes, setNotes] = useState("");
  const [savedPrescription, setSavedPrescription] = useState(null);
  const [prescriptions, setPrescriptions] = useState([]);
  const [editingPrescription, setEditingPrescription] = useState(null); // NEW: Track editing state

  const getToken = () =>
    localStorage.getItem("staffToken") ||
    localStorage.getItem("token") ||
    localStorage.getItem("authToken");

  //  Fetch doctor's appointments
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

  //  Save Prescription
  const handleSavePrescription = async () => {
    // 🩺 Validation loop
    for (let i = 0; i < drugs.length; i++) {
      const drug = drugs[i];

      //  Check if form is selected
      if (!drug.form || drug.form.trim() === "") {
        toast.error(`Please select a form for medicine #${i + 1}`);
        return;
      }

      // Frequency check: number between 1-4
      const freq = Number(drug.frequency);
      if (isNaN(freq) || freq < 1 || freq > 4) {
        toast.error(`Frequency for medicine #${i + 1} must be a number between 1 and 4`);
        return;
      }

      // Duration check: number between 1-10
      const dur = Number(drug.duration);
      if (isNaN(dur) || dur < 1 || dur > 10) {
        toast.error(`Duration for medicine #${i + 1} must be a number between 1 and 10 days`);
        return;
      }

      //  Optional safety check: total doses
      if (freq * dur > 30) {
        toast.error(
          `Total doses for medicine #${i + 1} seem high (${freq} × ${dur} = ${freq * dur}). Please check.`
        );
        return;
      }
    }

    try {
      const token = getToken();
      const payload = {
        elder: selectedAppt.elder?._id || selectedAppt.elder,
        doctor: selectedAppt.doctor?._id || selectedAppt.doctor,
        caretaker: selectedAppt.caretaker?._id || selectedAppt.caretaker,
        drugs, // includes name, dosage, frequency, duration, form
        notes,
      };
      console.log("Saving prescription:", payload);

      //  Save prescription
      const res = await api.post("/prescriptions", payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      //  Link prescription to appointment
      await api.patch(
        `/appointments/${selectedAppt._id}`,
        { prescription: res.data._id },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setSavedPrescription(res.data);
      toast.success("Prescription saved successfully");
      fetchPrescriptions(); // Refresh the list
    } catch (e) {
      console.error("Save failed:", e.response?.data || e.message);
      toast.error("Failed to save prescription");
    }
  };

  const fetchPrescriptions = async () => {
    try {
      const token = getToken();
      const res = await api.get("/prescriptions/doctor/my", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setPrescriptions(res.data || []);
    } catch (e) {
      toast.error("Failed to load prescriptions");
    }
  };

  useEffect(() => {
    fetchAppointments();
    fetchPrescriptions();
  }, []);

  const handleDeletePrescription = async (id) => {
    if (!window.confirm("Are you sure you want to delete this prescription?")) return;

    try {
      const token = getToken();
      await api.delete(`/prescriptions/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("Prescription deleted successfully!");
      setPrescriptions((prev) => prev.filter((p) => p._id !== id));
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to delete prescription");
    }
  };

  // NEW: Edit Prescription - Opens modal with existing data
  const handleEditPrescription = (prescription) => {
    setEditingPrescription(prescription);
    setDrugs(prescription.drugs || [{ name: "", dosage: "", frequency: "", duration: "", form: "" }]);
    setNotes(prescription.notes || "");
    setShowModal(true);
  };

  // NEW: Update Prescription - Sends PATCH request
  const handleUpdatePrescription = async () => {
    // Validation loop
    for (let i = 0; i < drugs.length; i++) {
      const drug = drugs[i];

      if (!drug.form || drug.form.trim() === "") {
        toast.error(`Please select a form for medicine #${i + 1}`);
        return;
      }

      const freq = Number(drug.frequency);
      if (isNaN(freq) || freq < 1 || freq > 4) {
        toast.error(`Frequency for medicine #${i + 1} must be a number between 1 and 4`);
        return;
      }

      const dur = Number(drug.duration);
      if (isNaN(dur) || dur < 1 || dur > 10) {
        toast.error(`Duration for medicine #${i + 1} must be a number between 1 and 10 days`);
        return;
      }

      if (freq * dur > 30) {
        toast.error(
          `Total doses for medicine #${i + 1} seem high (${freq} × ${dur} = ${freq * dur}). Please check.`
        );
        return;
      }
    }

    try {
      const token = getToken();
      const payload = { drugs, notes };
      
      const res = await api.patch(`/prescriptions/${editingPrescription._id}`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      toast.success("Prescription updated successfully");
      setPrescriptions((prev) =>
        prev.map((p) => (p._id === editingPrescription._id ? res.data : p))
      );
      setShowModal(false);
      setEditingPrescription(null);
      setDrugs([{ name: "", dosage: "", frequency: "", duration: "", form: "" }]);
      setNotes("");
    } catch (e) {
      console.error("Update failed:", e.response?.data || e.message);
      toast.error("Failed to update prescription");
    }
  };

  const downloadPrescriptionPDF = (prescription) => {
    const ORANGE = "#F97316";
    const doc = new jsPDF({ unit: "pt", format: "a4" });
    const width = doc.internal.pageSize.getWidth();
    const margin = 40;
    let y = 40;

    // Header bar
    doc.setFillColor(ORANGE);
    doc.rect(0, 0, width, 80, "F");

    // Title
    doc.setFontSize(20);
    doc.setTextColor("#ffffff");
    doc.setFont("helvetica", "bold");
    doc.text("Elders Care Home", margin, 30);
    doc.text("Prescription", margin, 50);

    // Subtitle
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text("Doctor-issued digital prescription", margin, 68);

    y = 110;
    doc.setTextColor("#000");

    // Elder Details
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("Elder Details", margin, y);
    doc.setFont("helvetica", "normal");
    doc.text(`Name: ${prescription.elder?.fullName || "—"}`, margin, y + 18);

    y += 38;
    doc.setFont("helvetica", "bold");
    doc.text("Caretaker Details", margin, y);
    doc.setFont("helvetica", "normal");
    doc.text(`Name: ${prescription.caretaker?.name || "—"}`, margin, y + 18);

    y += 38;
    doc.setFont("helvetica", "bold");
    doc.text("Doctor Details", margin, y);
    doc.setFont("helvetica", "normal");
    doc.text(`Name: ${prescription.doctor?.staff?.name || "—"}`, margin, y + 18);
    doc.text(`Specialization: ${prescription.doctor?.specialization || "—"}`, margin, y + 36);

    // Date
    y += 56;
    doc.setFont("helvetica", "bold");
    doc.text("Date & Time", margin, y);
    doc.setFont("helvetica", "normal");
    const now = new Date();
    doc.text(`${now.toLocaleDateString()} ${now.toLocaleTimeString()}`, margin, y + 18);

    // Divider
    y += 36;
    doc.setDrawColor(ORANGE);
    doc.setLineWidth(1);
    doc.line(margin, y, width - margin, y);

    // Medicines section
    y += 24;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.setTextColor(ORANGE);
    doc.text("Medicines", margin, y);

    y += 20;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);
    doc.setTextColor("#000");

    const drugs = prescription.drugs || [];
    if (drugs.length === 0) {
      doc.text("No medicines prescribed.", margin, y);
      y += 20;
    } else {
      drugs.forEach((drug, i) => {
        const text = `${i + 1}. ${drug.name || "—"} (${drug.form || "—"}) - ${drug.dosage || "—"}, ${drug.frequency || "—"} times/day for ${drug.duration || "—"} days`;
        doc.text(text, margin, y);
        y += 18;
      });
    }

    // Notes
    y += 20;
    doc.setFont("helvetica", "bold");
    doc.setTextColor(ORANGE);
    doc.text("Notes", margin, y);
    y += 16;
    doc.setFont("helvetica", "normal");
    doc.setTextColor("#000");
    const wrappedNotes = doc.splitTextToSize(prescription.notes || "—", width - margin * 2);
    doc.text(wrappedNotes, margin, y);
    y += wrappedNotes.length * 14;

    // Signature line
    y += 60;
    doc.setDrawColor("#aaa");
    doc.line(width - 250, y, width - margin, y);
    doc.setFontSize(10);
    doc.text("Doctor's Signature", width - 230, y + 14);

    // QR Code
    const qrData = `Prescription ID: ${prescription._id || "N/A"}\nElder: ${prescription.elder?.fullName || "—"}\nOne-time use only\nIssued: ${new Date().toLocaleDateString()}`;
    QRCode.toDataURL(qrData, { width: 100 }, (err, qrUrl) => {
      if (!err) {
        doc.addImage(qrUrl, "PNG", margin, y - 40, 80, 80);
        // Footer
        doc.setFontSize(8);
        doc.setTextColor("#888");
        doc.text("Generated by Elders Home System — For authorized medical use only", margin, 820);
        doc.save(`Prescription_${prescription._id || Date.now()}.pdf`);
      }
    });
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

  const addDrugRow = () => setDrugs([...drugs, { name: "", dosage: "", frequency: "", duration: "", form: "" }]);
  const removeDrugRow = (index) => {
    if (drugs.length === 1) return;
    setDrugs(drugs.filter((_, i) => i !== index));
  };

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold text-orange-600">Doctor Appointments</h1>
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
                          onClick={() => { setSelectedAppt(a); setShowModal(true); setSavedPrescription(null); setEditingPrescription(null); }}>
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
          <div className="bg-white rounded-lg shadow-lg p-6 w-[1200px] max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">
              {editingPrescription ? "Edit Prescription" : "Add Prescription"}
            </h2>

            {drugs.map((drug, i) => (
              <div key={i} className="flex space-x-2 mb-2">
                <input className="border p-2 w-1/4" placeholder="Name" value={drug.name}
                  onChange={(e) => handleDrugChange(i, "name", e.target.value)} />
                <input className="border p-2 w-1/4" placeholder="Dosage(in scale)" value={drug.dosage}
                  onChange={(e) => handleDrugChange(i, "dosage", e.target.value)} />
                <select
                  className="border p-2 w-1/5"
                  value={drug.form}
                  onChange={(e) => handleDrugChange(i, "form", e.target.value)}
                >
                  <option value="">Select Form</option>
                  <option value="Tablet">Tablet</option>
                  <option value="Capsule">Capsule</option>
                  <option value="Syrup">Syrup</option>
                  <option value="Injection">Injection</option>
                  <option value="Cream">Cream</option>
                  <option value="Drops">Drops</option>
                  <option value="Other">Other</option>
                </select>

                <input className="border p-2 w-1/4" placeholder="Frequency(times per day)" value={drug.frequency}
                  onChange={(e) => handleDrugChange(i, "frequency", e.target.value)} />
                <input className="border p-2 w-1/4" placeholder="Duration(days)" value={drug.duration}
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
                onClick={() => { 
                  setShowModal(false); 
                  setSavedPrescription(null); 
                  setEditingPrescription(null);
                  setDrugs([{ name: "", dosage: "", frequency: "", duration: "", form: "" }]); 
                  setNotes(""); 
                }}>
                Close
              </button>
              {editingPrescription ? (
                <button className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700"
                  onClick={handleUpdatePrescription}>
                  Update Prescription
                </button>
              ) : !savedPrescription ? (
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

      <section className="rounded-lg border shadow">
        <div className="bg-orange-500 text-white p-3 rounded-t-lg font-semibold">
          My Issued Prescriptions
        </div>
        <div className="p-4 overflow-x-auto">
          {prescriptions.length > 0 ? (
            <table className="min-w-full text-sm">
              <thead className="bg-gray-100">
                <tr>
                  <Th>Elder</Th>
                  <Th>Date</Th>
                  <Th>Notes</Th>
                  <Th>Medicines</Th>
                  <Th>Actions</Th>
                </tr>
              </thead>
              <tbody>
                {prescriptions.map((p, idx) => (
                  <tr key={p._id} className={idx % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                    <Td>{p.elder?.fullName || "—"}</Td>
                    <Td>{new Date(p.createdAt).toLocaleString()}</Td>
                    <Td>{p.notes || "—"}</Td>
                    <Td>
                      {p.drugs?.map((d, i) => (
                        <div key={i}>
                          {d.name} – {d.dosage}, {d.frequency} for {d.duration}
                        </div>
                      ))}
                    </Td>
                    <Td className="space-x-2">
                      <button
                        onClick={() => handleEditPrescription(p)}
                        className="px-2 py-1 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => downloadPrescriptionPDF(p)}
                        className="px-2 py-1 bg-purple-500 text-white rounded-lg hover:bg-purple-600"
                      >
                        Download
                      </button>
                      <button
                        onClick={() => handleDeletePrescription(p._id)}
                        className="px-2 py-1 bg-red-500 text-white rounded-lg hover:bg-red-600"
                      >
                        Delete
                      </button>
                    </Td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="text-gray-500 text-center">No prescriptions found</p>
          )}
        </div>
      </section>

      <ToastContainer />
    </div>
  );
}

function Th({ children }) { return <th className="px-3 py-2 font-semibold text-left">{children}</th>; }
function Td({ children, className = "" }) { return <td className={`px-3 py-2 ${className}`}>{children}</td>; }
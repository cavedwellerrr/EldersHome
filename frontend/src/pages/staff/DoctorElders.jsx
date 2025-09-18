// frontend/src/pages/staff/DoctorElder.jsx
import { useEffect, useState } from "react";
import api from "../../api";

const DoctorElder = () => {
  const [elders, setElders] = useState([]);
  const [filteredElders, setFilteredElders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [genderFilter, setGenderFilter] = useState("All");
  const [sortOption, setSortOption] = useState("nameAsc");

  // ✅ fetch elders
  const fetchActiveElders = async () => {
    try {
      setLoading(true);
      let token =
        localStorage.getItem("staffToken") ||
        localStorage.getItem("token") ||
        localStorage.getItem("authToken");

      if (!token) {
        setError("No staff token found. Please log in as staff.");
        setLoading(false);
        return;
      }

      const res = await api.get("/elders/active", {
        headers: { Authorization: `Bearer ${token}` },
      });

      setElders(res.data);
      setFilteredElders(res.data);
    } catch (err) {
      console.error("Error fetching elders:", err);
      setError("Failed to fetch active elders. Check login/permissions.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActiveElders();
  }, []);

  // ✅ filtering & sorting
  useEffect(() => {
    let data = [...elders];

    if (searchTerm.trim() !== "") {
      data = data.filter((elder) =>
        elder.fullName.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    if (genderFilter !== "All") {
      data = data.filter((elder) => elder.gender === genderFilter);
    }
    switch (sortOption) {
      case "nameAsc":
        data.sort((a, b) => a.fullName.localeCompare(b.fullName));
        break;
      case "nameDesc":
        data.sort((a, b) => b.fullName.localeCompare(a.fullName));
        break;
      case "dobAsc":
        data.sort(
          (a, b) => new Date(a.dob).getTime() - new Date(b.dob).getTime()
        );
        break;
      case "dobDesc":
        data.sort(
          (a, b) => new Date(b.dob).getTime() - new Date(a.dob).getTime()
        );
        break;
      default:
        break;
    }
    setFilteredElders(data);
  }, [searchTerm, genderFilter, sortOption, elders]);

  if (loading) {
    return <p className="text-orange-500 font-semibold">Loading elders...</p>;
  }

  if (error) {
    return <p className="text-red-500 font-semibold">{error}</p>;
  }

  // ✅ reset filters
  const handleReset = () => {
    setSearchTerm("");
    setGenderFilter("All");
    setSortOption("nameAsc");
  };

  return (
    <div className="p-6 space-y-6">
      {/* Page Header */}
      <h1 className="text-3xl font-bold text-orange-600">All Elders</h1>
      <p className="text-gray-600">View all active elders and their details</p>

      {/* Elders Table */}
      <section className="rounded-lg border shadow">
        <div className="bg-orange-500 text-white p-3 rounded-t-lg font-semibold">
          All Elders
        </div>
        <div className="p-4 overflow-x-auto">
          {/* Filters */}
          <div className="flex flex-col md:flex-row gap-3 mb-4">
            <input
              type="text"
              placeholder="Search by name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="p-2 border rounded-lg w-full md:w-1/3"
            />
            <select
              value={genderFilter}
              onChange={(e) => setGenderFilter(e.target.value)}
              className="p-2 border rounded-lg"
            >
              <option value="All">All Genders</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
            <select
              value={sortOption}
              onChange={(e) => setSortOption(e.target.value)}
              className="p-2 border rounded-lg"
            >
              <option value="nameAsc">Sort: Name (A → Z)</option>
              <option value="nameDesc">Sort: Name (Z → A)</option>
              <option value="dobAsc">Sort: DOB (Oldest)</option>
              <option value="dobDesc">Sort: DOB (Youngest)</option>
            </select>
            <button
              onClick={handleReset}
              className="px-3 py-1 bg-gray-400 text-white rounded-lg hover:bg-gray-500"
            >
              Reset
            </button>
            <button
              onClick={fetchActiveElders}
              className="px-3 py-1 bg-orange-500 text-white rounded-lg hover:bg-orange-600"
            >
              Refresh
            </button>
          </div>

          {/* Table */}
          <table className="min-w-full text-sm">
            <thead className="bg-gray-100">
              <tr>
                <Th>Name</Th>
                <Th>DOB</Th>
                <Th>Gender</Th>
                <Th>Medical Notes</Th>
                <Th>Guardian</Th>
                <Th>Caretaker</Th>
              </tr>
            </thead>
            <tbody>
              {filteredElders.length > 0 ? (
                filteredElders.map((elder, idx) => (
                  <tr
                    key={elder._id}
                    className={idx % 2 === 0 ? "bg-white" : "bg-gray-50"}
                  >
                    <Td>{elder.fullName}</Td>
                    <Td>
                      {elder.dob
                        ? new Date(elder.dob).toLocaleDateString()
                        : "—"}
                    </Td>
                    <Td>{elder.gender}</Td>
                    <Td>
                      <div className="flex flex-col">
                        <span className="text-gray-700">
                          {elder.medicalNotes || "No notes"}
                        </span>
                        {elder.medicalNotesFile ? (() => {
                          const filePath = elder.medicalNotesFile.startsWith("uploads/")
                            ? elder.medicalNotesFile
                            : `uploads/${elder.medicalNotesFile}`;
                          const fileUrl = `http://localhost:5000/${filePath}`;
                          return (
                            <a
                              href={fileUrl}
                              download
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:underline mt-1"
                            >
                              Download File
                            </a>
                          );
                        })() : (
                          <span className="text-gray-400 mt-1">No File</span>
                        )}
                      </div>
                    </Td>
                    <Td>{elder.guardian?.name || "N/A"}</Td>
                    <Td>{elder.caretaker?.name || "Not Assigned"}</Td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="6"
                    className="text-center p-6 text-gray-500 font-medium"
                  >
                    No elders match your search/filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};

export default DoctorElder;

// ---------- SMALL COMPONENTS ----------
function Th({ children }) {
  return <th className="px-3 py-2 font-semibold text-left">{children}</th>;
}
function Td({ children, className = "" }) {
  return <td className={`px-3 py-2 ${className}`}>{children}</td>;
}

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

  // ✅ fetch elders (wrapped in function for refresh)
  const fetchActiveElders = async () => {
    try {
      setLoading(true);
      let token = localStorage.getItem("staffToken");
      if (!token) {
        token =
          localStorage.getItem("token") || localStorage.getItem("authToken");
      }

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
    <div className="p-6 bg-white rounded-2xl shadow-lg">
      <h2 className="text-3xl font-bold text-orange-600 mb-6 text-center">
        Activated Elders
      </h2>

      {/* Filters + Actions */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        {/* Search */}
        <input
          type="text"
          placeholder="Search by name..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-orange-400 w-full md:w-1/3"
        />

        {/* Gender Filter */}
        <select
          value={genderFilter}
          onChange={(e) => setGenderFilter(e.target.value)}
          className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-orange-400 w-full md:w-1/4"
        >
          <option value="All">All Genders</option>
          <option value="Male">Male</option>
          <option value="Female">Female</option>
          <option value="Other">Other</option>
        </select>

        {/* Sort Filter */}
        <select
          value={sortOption}
          onChange={(e) => setSortOption(e.target.value)}
          className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-orange-400 w-full md:w-1/4"
        >
          <option value="nameAsc">Sort by Name (A → Z)</option>
          <option value="nameDesc">Sort by Name (Z → A)</option>
          <option value="dobAsc">Sort by DOB (Oldest First)</option>
          <option value="dobDesc">Sort by DOB (Youngest First)</option>
        </select>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <button
            onClick={handleReset}
            className="bg-orange-400 hover:bg-orange-500 text-white px-4 py-2 rounded-lg shadow transition"
          >
            Reset Filters
          </button>
          <button
            onClick={fetchActiveElders}
            className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg shadow transition"
          >
            Refresh
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse rounded-xl overflow-hidden shadow-md">
          <thead className="bg-gradient-to-r from-orange-300 to-orange-500 text-white">
            <tr>
              <th className="p-3 text-left rounded-tl-xl">Name</th>
              <th className="p-3 text-left">DOB</th>
              <th className="p-3 text-left">Gender</th>
              <th className="p-3 text-left">Medical Notes</th>
              <th className="p-3 text-left">Guardian</th>
              <th className="p-3 text-left rounded-tr-xl">Caretaker</th>
            </tr>
          </thead>
          <tbody>
            {filteredElders.length > 0 ? (
              filteredElders.map((elder, index) => (
                <tr
                  key={elder._id}
                  className={`transition ${
                    index % 2 === 0 ? "bg-orange-50" : "bg-white"
                  } hover:bg-orange-100`}
                >
                  <td className="p-3 border-b border-gray-200">
                    {elder.fullName}
                  </td>
                  <td className="p-3 border-b border-gray-200">
                    {new Date(elder.dob).toLocaleDateString()}
                  </td>
                  <td className="p-3 border-b border-gray-200">{elder.gender}</td>

                  {/* ✅ Medical Notes: show text + file download */}
                  <td className="p-3 border-b border-gray-200">
                    <div className="flex flex-col">
                      <span className="text-gray-700">
                        {elder.medicalNotes || "No notes"}
                      </span>
                      {elder.medicalNotesFile ? (() => {
                        // Smart check: ensure URL starts with "uploads/"
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
                  </td>

                  <td className="p-3 border-b border-gray-200">
                    {elder.guardian?.name || "N/A"}
                  </td>
                  <td className="p-3 border-b border-gray-200">
                    {elder.caretaker?.name || "Not Assigned"}
                  </td>
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
    </div>
  );
};

export default DoctorElder;

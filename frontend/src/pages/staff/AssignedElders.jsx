
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api"; // baseURL: http://localhost:5000/api

export default function AssignedElders() {
  const [elders, setElders] = useState([]);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [q, setQ] = useState("");
  const navigate = useNavigate();

  const filtered = useMemo(() => {
    if (!q.trim()) return elders;
    const s = q.toLowerCase();
    return elders.filter((e) =>
      [e?.fullName, e?.room?.room_id]
        .filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(s))
    );
  }, [q, elders]);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setErr("");
      try {
        const token = localStorage.getItem("staffToken");
        if (!token) {
          setErr("You are not logged in as staff. Please log in first.");
          setLoading(false);
          return;
        }
        const res = await api.get("/caretaker/elders/my", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setElders(res.data?.elders || []);
        setCount(res.data?.count ?? (res.data?.elders?.length || 0));
      } catch (e) {
        const msg = e?.response?.data?.message || e?.message || "Failed to load assigned elders";
        setErr(msg);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-white">
      <div className="max-w-7xl mx-auto p-6 lg:p-8">
        {/* Header Section */}
        <div className="mb-8">
          <div className="bg-white rounded-2xl shadow-lg border border-orange-100 p-6 lg:p-8">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-2">
                  Assigned Elders
                </h1>
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 bg-orange-500 rounded-full"></div>
                  <p className="text-gray-600 font-medium">
                    {count ? `${count} residents assigned` : "Loading..."}
                  </p>
                </div>
              </div>

              {/* Search Bar */}
              <div className="relative w-full lg:w-96">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-orange-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <input
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="Search by name or room..."
                  className="w-full pl-12 pr-4 py-3 border-2 border-orange-200 rounded-xl focus:border-orange-500 focus:outline-none focus:ring-4 focus:ring-orange-100 transition-all duration-200 bg-white shadow-sm text-gray-900 placeholder-gray-500"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="bg-white rounded-2xl shadow-lg border border-orange-100 p-8 text-center">
            <div className="flex items-center justify-center space-x-3">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
              <span className="text-gray-600 font-medium">Loading assigned elders...</span>
            </div>
          </div>
        )}

        {/* Error State */}
        {!loading && err && (
          <div className="bg-gradient-to-r from-red-50 to-orange-50 border-2 border-red-200 rounded-2xl p-6 shadow-lg">
            <div className="flex items-center space-x-3">
              <div className="flex-shrink-0">
                <svg className="h-6 w-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-red-800">Error</h3>
                <p className="text-red-700">{err}</p>
              </div>
            </div>
          </div>
        )}

        {/* No Results State */}
        {!loading && !err && filtered.length === 0 && (
          <div className="bg-white rounded-2xl shadow-lg border border-orange-100 p-12 text-center">
            <div className="flex flex-col items-center space-y-4">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center">
                <svg className="h-8 w-8 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No elders found</h3>
                <p className="text-gray-600">
                  {q.trim() ? `No results match "${q}"` : "You don't have any assigned elders yet."}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Results Table */}
        {!loading && !err && filtered.length > 0 && (
          <div className="bg-white rounded-2xl shadow-lg border border-orange-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="bg-gradient-to-r from-orange-500 to-orange-600 text-white">
                    <Th>
                      <div className="flex items-center space-x-2">
                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        <span>Resident Name</span>
                      </div>
                    </Th>
                    <Th>
                      <div className="flex items-center space-x-2">
                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                        <span>Room</span>
                      </div>
                    </Th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-orange-100">
                  {filtered.map((e, index) => (
                    <tr
                      key={e._id}
                      className="hover:bg-gradient-to-r hover:from-orange-50 hover:to-white cursor-pointer transition-all duration-200 group"
                      onClick={() =>
                        navigate(`/staff/caretaker-dashboard/elders/${e._id}`)
                      }
                      title="Click to view profile"
                    >
                      <Td className="font-semibold text-gray-900 group-hover:text-orange-700">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-orange-500 rounded-full flex items-center justify-center text-white font-bold">
                            {e?.fullName?.charAt(0)?.toUpperCase() || "?"}
                          </div>
                          <div>
                            <div className="font-semibold">{e?.fullName || "—"}</div>
                            <div className="text-sm text-gray-500">Resident #{index + 1}</div>
                          </div>
                        </div>
                      </Td>
                      <Td>
                        <div className="flex items-center space-x-2">
                          <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                            <svg className="h-4 w-4 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                            </svg>
                          </div>
                          <div>
                            <div className="font-medium text-gray-900">{e?.room?.room_id || "—"}</div>
                            <div className="text-sm text-gray-500">Room Number</div>
                          </div>
                        </div>
                      </Td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Footer */}
            <div className="bg-gray-50 px-6 py-4 border-t border-orange-100">
              <p className="text-sm text-gray-600 flex items-center justify-between">
                <span>Showing {filtered.length} of {count} assigned residents</span>
                <span className="flex items-center space-x-1">
                  <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                  <span>Click any row to view details</span>
                </span>
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function Th({ children }) {
  return (
    <th className="text-left px-6 py-4 text-sm font-semibold tracking-wider uppercase">
      {children}
    </th>
  );
}

function Td({ children, className = "" }) {
  return (
    <td className={`px-6 py-4 text-sm ${className}`}>
      {children}
    </td>
  );
}
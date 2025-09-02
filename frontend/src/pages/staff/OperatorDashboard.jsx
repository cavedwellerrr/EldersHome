import React, { useEffect, useState } from "react";
import { getPendingRequests, approveRequest, rejectRequest } from "../../services/operatorService";


const OperatorDashboard = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const data = await getPendingRequests();
      setRequests(data);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  const handleApprove = async (id) => {
  try {
    await approveRequest(id);
    fetchRequests(); // refresh list
  } catch (err) {
    console.error(err);
  }
};

const handleReject = async (id) => {
  try {
    await rejectRequest(id);
    fetchRequests(); // refresh list
  } catch (err) {
    console.error(err);
  }
};

  if (loading) return <p>Loading...</p>;

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Pending Elder Requests</h2>
      {requests.length === 0 ? (
        <p>No pending requests.</p>
      ) : (
        <table className="table-auto border">
          <thead>
            <tr>
              <th className="border px-2">Name</th>
              <th className="border px-2">Age</th>
              <th className="border px-2">Guardian</th>
              <th className="border px-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {requests.map((r) => (
              <tr key={r._id}>
                <td className="border px-2">{r.elderName}</td>
                <td className="border px-2">{r.age}</td>
                <td className="border px-2">{r.guardianName}</td>
                <td className="border px-2 space-x-2">
                  <button
                    onClick={() => handleApprove(r._id)}
                    className="bg-green-500 text-white px-2 rounded"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => handleReject(r._id)}
                    className="bg-red-500 text-white px-2 rounded"
                  >
                    Reject
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default OperatorDashboard;

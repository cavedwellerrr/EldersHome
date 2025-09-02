import React, { useEffect, useState, useContext } from "react";
import axios from "axios";
import { AuthContext } from "../../context/AuthContext";

const ElderRequests = () => {
  const { auth } = useContext(AuthContext);
  const [requests, setRequests] = useState([]);

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const res = await axios.get("/api/operator/requests/pending", {
          headers: { Authorization: `Bearer ${auth.token}` },
        });
        setRequests(res.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchRequests();
  }, [auth.token]);

  const handleApprove = async (id) => {
    try {
      await axios.put(`/api/operator/request/${id}/approve`, {}, {
        headers: { Authorization: `Bearer ${auth.token}` },
      });
      setRequests(requests.filter((req) => req._id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  const handleReject = async (id) => {
    try {
      await axios.put(`/api/operator/request/${id}/reject`, {}, {
        headers: { Authorization: `Bearer ${auth.token}` },
      });
      setRequests(requests.filter((req) => req._id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Pending Elder Requests</h2>
      <table className="w-full border">
        <thead>
          <tr>
            <th className="border px-2 py-1">Name</th>
            <th className="border px-2 py-1">Age</th>
            <th className="border px-2 py-1">Actions</th>
          </tr>
        </thead>
        <tbody>
          {requests.map((req) => (
            <tr key={req._id}>
              <td className="border px-2 py-1">{req.name}</td>
              <td className="border px-2 py-1">{req.age}</td>
              <td className="border px-2 py-1 space-x-2">
                <button
                  className="bg-green-600 text-white px-2 rounded"
                  onClick={() => handleApprove(req._id)}
                >
                  Approve
                </button>
                <button
                  className="bg-red-600 text-white px-2 rounded"
                  onClick={() => handleReject(req._id)}
                >
                  Reject
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ElderRequests;

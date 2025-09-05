// // src/pages/staff/AssignedElders.jsx
// import React, { useEffect, useState } from "react";
// import { useNavigate } from "react-router-dom";
// import api from "../../api";

// function ageFromDob(dob) {
//   if (!dob) return "-";
//   const d = new Date(dob);
//   const diff = Date.now() - d.getTime();
//   const a = new Date(diff);
//   return Math.abs(a.getUTCFullYear() - 1970);
// }

// const AssignedElders = () => {
//   const nav = useNavigate();
//   const [elders, setElders] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState("");
//   const [seeding, setSeeding] = useState(false);

//   const loadElders = async () => {
//     try {
//       setError("");
//       setLoading(true);
//       const token = localStorage.getItem("token");
//       if (!token) throw new Error("Not authenticated");
//       const res = await api.get("/caretaker/elders/my-elders", {
//         headers: { Authorization: `Bearer ${token}` },
//       });
//       // Expect each item to include: _id, fullName, dob, roomAssigned, status, guardian { name, email, phone }
//       setElders(res.data?.data || []);
//     } catch (err) {
//       setError(err.response?.data?.message || err.message || "Failed to load elders");
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     loadElders();
//   }, []);

//   const handleSeed = async () => {
//     try {
//       setSeeding(true);
//       const token = localStorage.getItem("token");
//       if (!token) throw new Error("Not authenticated");
//       await api.post(
//         "/caretaker/elders/seed-one",
//         {},
//         { headers: { Authorization: `Bearer ${token}` } }
//       );
//       await loadElders();
//     } catch (err) {
//       setError(err.response?.data?.message || err.message || "Failed to seed elder");
//     } finally {
//       setSeeding(false);
//     }
//   };

//   if (loading) {
//     return (
//       <div className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
//         {Array.from({ length: 6 }).map((_, i) => (
//           <div key={i} className="border rounded-lg p-4 bg-white shadow-sm animate-pulse">
//             <div className="h-5 w-3/4 bg-gray-200 rounded mb-2" />
//             <div className="h-4 w-1/2 bg-gray-200 rounded mb-1" />
//             <div className="h-4 w-1/3 bg-gray-200 rounded mb-4" />
//             <div className="h-9 w-full bg-gray-200 rounded" />
//           </div>
//         ))}
//       </div>
//     );
//   }

//   return (
//     <div className="p-4">
//       <div className="flex items-start justify-between gap-3 mb-4">
//         <h1 className="text-2xl font-semibold">My Assigned Elders</h1>
//         <div className="flex gap-2">
//           <button
//             onClick={handleSeed}
//             className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-60"
//             disabled={seeding}
//           >
//             {seeding ? "Adding..." : "Add Sample Elder"}
//           </button>
//           <button
//             onClick={loadElders}
//             className="px-4 py-2 rounded border hover:bg-gray-50"
//             title="Refresh list"
//           >
//             Refresh
//           </button>
//         </div>
//       </div>

//       {error && (
//         <div className="mb-4 p-3 rounded border border-red-200 bg-red-50 text-red-700">
//           {error}
//         </div>
//       )}

//       {elders.length === 0 ? (
//         <div className="text-gray-600">
//           No elders assigned. You can use <span className="font-medium">Add Sample Elder</span> to
//           seed one.
//         </div>
//       ) : (
//         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
//           {elders.map((elder) => (
//             <div
//               key={elder._id}
//               className="border rounded-lg p-4 bg-white shadow-sm hover:shadow-md transition cursor-pointer"
//               onClick={() => nav(`/staff/caretaker-dashboard/elder/${elder._id}`)}
//               role="button"
//               tabIndex={0}
//               onKeyDown={(e) => {
//                 if (e.key === "Enter") nav(`/staff/caretaker-dashboard/elder/${elder._id}`);
//               }}
//             >
//               <div className="flex items-center justify-between">
//                 <div className="font-medium text-lg">{elder.fullName}</div>
//                 {elder.status && (
//                   <span className="text-xs px-2 py-0.5 rounded-full border bg-gray-50">
//                     {elder.status}
//                   </span>
//                 )}
//               </div>

//               {elder.dob && (
//                 <div className="text-sm text-gray-600">
//                   DOB: {new Date(elder.dob).toLocaleDateString()} • Age: {ageFromDob(elder.dob)}
//                 </div>
//               )}

//               {elder.roomAssigned ? (
//                 <div className="text-sm text-gray-700 mt-1">Room: {elder.roomAssigned}</div>
//               ) : (
//                 <div className="text-sm text-gray-500 mt-1">Room: Not assigned</div>
//               )}

//               {elder.guardian && (
//                 <div className="mt-3 text-sm">
//                   <div className="font-semibold">Guardian</div>
//                   <div className="text-gray-700">{elder.guardian.name || "-"}</div>
//                   {elder.guardian.email && (
//                     <div className="text-gray-600">{elder.guardian.email}</div>
//                   )}
//                   {elder.guardian.phone && (
//                     <div className="text-gray-600">{elder.guardian.phone}</div>
//                   )}
//                 </div>
//               )}

//               <button
//                 className="mt-4 w-full py-2 rounded bg-black text-white hover:opacity-90"
//                 onClick={(e) => {
//                   e.stopPropagation();
//                   nav(`/staff/caretaker-dashboard/elder/${elder._id}`);
//                 }}
//               >
//                 View Profile
//               </button>
//             </div>
//           ))}
//         </div>
//       )}
//     </div>
//   );
// };

// export default AssignedElders;

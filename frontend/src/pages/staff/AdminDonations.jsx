import React, { useEffect, useState, useCallback, useRef } from "react";
import api from "../../api";
import { ToastContainer, toast } from "react-toastify";
import { saveAs } from "file-saver";
import jsPDF from "jspdf";
import "jspdf-autotable";
import { Line, Bar } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, BarElement, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from "chart.js";
ChartJS.register(CategoryScale, LinearScale, PointElement, BarElement, LineElement, Title, Tooltip, Legend);

const AdminDonations = () => {
  const [donations, setDonations] = useState([]);
  const [donors, setDonors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [stats, setStats] = useState({
    totalDonations: 0,
    totalAmount: 0,
    pendingCount: 0,
    receivedCount: 0
  });
  const [updating, setUpdating] = useState(new Set());
  const [deleting, setDeleting] = useState(new Set());
  const [donationSearchTerm, setDonationSearchTerm] = useState("");
  const [donationMonthFilter, setDonationMonthFilter] = useState("");
  const [donorSearchTerm, setDonorSearchTerm] = useState("");
  const [donorMonthFilter, setDonorMonthFilter] = useState("");
  const intervalRef = useRef(null);
  const previousCountRef = useRef(0);

  // Filter functions
  const getFilteredDonations = useCallback(() => {
    return donations.filter(donation => {
      const matchesSearch = !donationSearchTerm ||
        donation.donorName?.toLowerCase().includes(donationSearchTerm.toLowerCase()) ||
        donation.donorEmail?.toLowerCase().includes(donationSearchTerm.toLowerCase());

      const matchesMonth = !donationMonthFilter ||
        new Date(donation.createdAt).toISOString().substr(0, 7) === donationMonthFilter;

      return matchesSearch && matchesMonth;
    });
  }, [donations, donationSearchTerm, donationMonthFilter]);

  const getFilteredDonors = useCallback(() => {
    return donors.filter(donor => {
      const matchesSearch = !donorSearchTerm ||
        donor.donorName?.toLowerCase().includes(donorSearchTerm.toLowerCase());

      const matchesMonth = !donorMonthFilter ||
        (donor.donationDate && new Date(donor.donationDate).toISOString().substr(0, 7) === donorMonthFilter);

      return matchesSearch && matchesMonth;
    });
  }, [donors, donorSearchTerm, donorMonthFilter]);

  const filteredDonations = getFilteredDonations();
  const filteredDonors = getFilteredDonors();

  const fetchDonations = useCallback(async (showToast = false) => {
    try {
      const donationsRes = await api.get("/donations");
      const { donations: donationsData, stats } = donationsRes.data;

      if (showToast && previousCountRef.current > 0 && donationsData.length > previousCountRef.current) {
        toast.info("New donation received!");
      }

      previousCountRef.current = donationsData.length;
      setDonations(donationsData);
      setStats(stats);

    } catch (err) {
      console.error("Fetch donations error:", err);
      if (!showToast) {
        setError(err.response?.data?.message || "Error fetching donations");
        toast.error(err.response?.data?.message || "Error fetching donations");
      }
    }
  }, []);

  const fetchDonors = useCallback(async () => {
    try {
      const donorsRes = await api.get("/donors");
      setDonors(donorsRes.data);
    } catch (err) {
      console.error("Fetch donors error:", err);
    }
  }, []);

  const fetchAllData = useCallback(async (showToast = false) => {
    try {
      await Promise.all([
        fetchDonations(showToast),
        fetchDonors()
      ]);
    } catch (err) {
      console.error("Fetch error:", err);
    } finally {
      if (!showToast) {
        setLoading(false);
      }
    }
  }, [fetchDonations, fetchDonors]);

  useEffect(() => {
    fetchAllData(false);

    intervalRef.current = setInterval(() => {
      fetchAllData(true);
    }, 30000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [fetchAllData]);

  //cash donations chart
  const CashDonationsChart = ({ donations }) => {
    const [range, setRange] = React.useState("month");

    const getCutoffDate = () => {
      const now = new Date();
      switch (range) {
        case "month":
          return new Date(now.getFullYear(), now.getMonth(), 1);
        case "3months":
          return new Date(now.getFullYear(), now.getMonth() - 2, 1);
        case "6months":
          return new Date(now.getFullYear(), now.getMonth() - 5, 1);
        case "year":
          return new Date(now.getFullYear() - 1, now.getMonth() + 1, 1);
        case "all":
        default:
          return null;
      }
    };

    const { labels, dataValues } = React.useMemo(() => {
      const cutoff = getCutoffDate();

      // Filter for cash donations that are received
      const cashDonations = donations.filter(
        (d) =>
          d.donationType === "cash" &&
          d.status === "received" &&
          (!cutoff || new Date(d.createdAt) >= cutoff)
      );

      // Determine grouping method based on range
      const shouldGroupByMonth = ["3months", "6months", "year"].includes(range);
      const shouldGroupByDay = range === "month";

      const grouped = cashDonations.reduce((acc, d) => {
        let key;
        if (shouldGroupByDay) {
          // Group by day for current month
          key = new Date(d.createdAt).toLocaleDateString();
        } else if (shouldGroupByMonth) {
          // Group by month (YYYY-MM format)
          const date = new Date(d.createdAt);
          key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        } else {
          // Group by individual date for "all" time
          key = new Date(d.createdAt).toLocaleDateString();
        }
        acc[key] = (acc[key] || 0) + d.amount;
        return acc;
      }, {});

      // Generate complete range of periods
      let allPeriods = Object.keys(grouped);

      if (shouldGroupByDay && cutoff) {
        // Generate all days in current month
        const now = new Date();
        const periods = [];
        const current = new Date(cutoff);

        while (current <= now && current.getMonth() === cutoff.getMonth()) {
          periods.push(current.toLocaleDateString());
          current.setDate(current.getDate() + 1);
        }

        allPeriods = periods;
      } else if (shouldGroupByMonth && cutoff) {
        // Generate all months in range
        const now = new Date();
        const periods = [];
        const current = new Date(cutoff);

        while (current <= now) {
          const periodKey = `${current.getFullYear()}-${String(current.getMonth() + 1).padStart(2, '0')}`;
          periods.push(periodKey);
          current.setMonth(current.getMonth() + 1);
        }

        allPeriods = periods;
      }

      const sortedPeriods = allPeriods.sort((a, b) => {
        if (shouldGroupByDay || range === "all") {
          return new Date(a) - new Date(b);
        }
        return a.localeCompare(b);
      });

      // Format labels for display
      const formattedLabels = sortedPeriods.map(period => {
        if (shouldGroupByDay) {
          // Format as "Dec 15" for days
          return new Date(period).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric'
          });
        } else if (shouldGroupByMonth) {
          // Format as "Dec 2024" for months
          const [year, month] = period.split('-');
          return new Date(year, month - 1).toLocaleDateString('en-US', {
            month: 'short',
            year: 'numeric'
          });
        }
        return period;
      });

      return {
        labels: formattedLabels,
        dataValues: sortedPeriods.map((period) => grouped[period] || 0),
      };
    }, [donations, range]);

    const data = {
      labels,
      datasets: [
        {
          label: "Cash Donations Received ",
          data: dataValues,
          backgroundColor: "rgba(249, 115, 22, 0.8)", // Orange-500 with opacity
          borderColor: "rgba(249, 115, 22, 1)", // Orange-500
          borderWidth: 2,
          borderRadius: 4,
          borderSkipped: false,
        },
      ],
    };

    const options = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: "top",
          labels: {
            color: "#374151", // Gray-700
            font: {
              size: 14,
              weight: "600"
            },
            usePointStyle: true,
            pointStyle: 'rect'
          }
        },
        title: {
          display: false // We're using the custom title above
        },
        tooltip: {
          backgroundColor: "rgba(31, 41, 55, 0.9)", // Gray-800 with opacity
          titleColor: "#ffffff",
          bodyColor: "#ffffff",
          borderColor: "rgba(249, 115, 22, 1)",
          borderWidth: 1,
          cornerRadius: 8,
          callbacks: {
            label: function (context) {
              return `Amount: $ ${Number(context.parsed.y).toLocaleString()}`;
            }
          }
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          grid: {
            color: "rgba(229, 231, 235, 0.8)", // Gray-200 with opacity
            drawBorder: false,
          },
          ticks: {
            color: "#6B7280", // Gray-500
            font: {
              size: 12
            },
            callback: function (value) {
              return '$ ' + Number(value).toLocaleString();
            }
          }
        },
        x: {
          grid: {
            display: false,
          },
          ticks: {
            color: "#6B7280", // Gray-500
            font: {
              size: 12
            },
            maxRotation: 45,
          }
        }
      },
      interaction: {
        intersect: false,
        mode: 'index'
      }
    };

    return (
      <div>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-800">Donation Trends</h3>
            <p className="text-sm text-gray-600">Visualize your cash donation patterns</p>
          </div>
          <select
            value={range}
            onChange={(e) => setRange(e.target.value)}
            className="select select-bordered bg-white border-orange-200 focus:border-orange-500 focus:outline-none text-gray-700 font-medium rounded-lg shadow-sm"
          >
            <option value="month">Current Month</option>
            <option value="3months">Last 3 Months</option>
            <option value="6months">Last 6 Months</option>
            <option value="year">Last Year</option>
            <option value="all">All Time</option>
          </select>
        </div>
        <div style={{ height: '400px' }}>
          <Bar data={data} options={options} />
        </div>
        {dataValues.every(val => val === 0) && (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-orange-100 rounded-full mx-auto mb-4 flex items-center justify-center">
              <svg className="w-8 h-8 text-orange-500" fill="currentColor" viewBox="0 0 24 24">
                <path d="M9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4z" />
              </svg>
            </div>
            <p className="text-gray-500">No cash donations received in this period</p>
          </div>
        )}
      </div>
    );
  };

  //status changes
  const handleStatusChange = async (id, newStatus) => {
    if (updating.has(id)) return;

    setUpdating(prev => new Set(prev).add(id));

    try {
      const response = await api.put(`/donations/${id}`, { status: newStatus });

      setDonations((prev) =>
        prev.map((donation) =>
          donation._id === id ? { ...donation, ...response.data.donation } : donation
        )
      );

      setTimeout(() => fetchAllData(false), 100);

      toast.success(`Status updated to "${newStatus}"`);
    } catch (err) {
      console.error("Status update error:", err);
      toast.error(err.response?.data?.message || "Error updating status");
    } finally {
      setUpdating(prev => {
        const newSet = new Set(prev);
        newSet.delete(id);
        return newSet;
      });
    }
  };

  //adding to donor list
  const handleAddToDonorList = async (id, checked) => {
    if (updating.has(id)) return;

    setUpdating(prev => new Set(prev).add(id));

    try {
      const response = await api.put(`/donations/${id}`, { addToDonorList: checked });

      setDonations((prev) =>
        prev.map((donation) =>
          donation._id === id ? { ...donation, ...response.data.donation } : donation
        )
      );

      setTimeout(fetchDonors, 500);

      toast.success(
        checked ? "Added to donor list ✅" : "Removed from donor list ❌"
      );
    } catch (err) {
      console.error("Donor list update error:", err);
      toast.error(err.response?.data?.message || "Error updating donor list");

      setDonations((prev) =>
        prev.map((donation) =>
          donation._id === id ? { ...donation, addToDonorList: !checked } : donation
        )
      );
    } finally {
      setUpdating(prev => {
        const newSet = new Set(prev);
        newSet.delete(id);
        return newSet;
      });
    }
  };

  //handling donation deletion
  const handleDeleteDonation = async (id) => {
    const donation = donations.find(d => d._id === id);
    const confirmMessage = donation?.donationType === 'cash'
      ? "Are you sure you want to delete this donation? The cash amount will remain in your total records."
      : "Are you sure you want to delete this donation?";

    if (!window.confirm(confirmMessage)) return;
    if (updating.has(id) || deleting.has(id)) return;

    setDeleting(prev => new Set(prev).add(id));

    try {
      await api.delete(`/donations/${id}`);

      setDonations(prevDonations => prevDonations.filter(d => d._id !== id));

      await fetchAllData(false);

      toast.success("Donation deleted successfully");

      await fetchDonors();
    } catch (err) {
      console.error("Delete donation error:", err);

      await fetchAllData(false);

      toast.error(err.response?.data?.message || "Error deleting donation");
    } finally {
      setDeleting(prev => {
        const newSet = new Set(prev);
        newSet.delete(id);
        return newSet;
      });
    }
  };

  //download csv
  const downloadDonorListCSV = () => {
    if (filteredDonors.length === 0) {
      toast.warn("No donors to export");
      return;
    }

    const headers = ["#", "Name", "Donation Date"];
    const rows = filteredDonors.map((d, index) => [
      index + 1,
      d.donorName,
      d.donationDate ? new Date(d.donationDate).toLocaleDateString() : "-",
    ]);
    const csvContent = [headers, ...rows].map((e) => e.join(",")).join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    saveAs(blob, "donor_list.csv");
  };

  //download pdf
  const downloadDonorListPDF = () => {
    if (filteredDonors.length === 0) {
      toast.warn("No donors to export");
      return;
    }

    try {
      const doc = new jsPDF();
      doc.setFontSize(18);
      doc.text("Our Monthly Donors", 14, 20);

      if (!doc.autoTable) {
        throw new Error("autoTable plugin not loaded");
      }

      const tableColumn = ["#", "Name", "Donation Date"];
      const tableRows = filteredDonors.map((donor, index) => [
        index + 1,
        donor.donorName,
        donor.donationDate ? new Date(donor.donationDate).toLocaleDateString() : "-",
      ]);

      doc.autoTable({
        head: [tableColumn],
        body: tableRows,
        startY: 30,
        styles: { fontSize: 10 },
        headStyles: { fillColor: [245, 101, 57], textColor: 255 },
        alternateRowStyles: { fillColor: [255, 247, 237] },
      });

      doc.save("monthly_donor_list.pdf");
    } catch (err) {
      console.error("PDF generation error:", err);
      toast.error(`Error generating PDF: ${err.message}`);
    }
  };

  //delete donor
  const handleDeleteDonor = async (donorId) => {
    if (!window.confirm("Are you sure you want to remove this donor from the public list?")) return;

    try {
      await api.delete(`/donors/${donorId}`);
      setDonors((prev) => prev.filter((d) => d._id !== donorId));
      toast.success("Donor removed from list successfully");
    } catch (err) {
      console.error("Delete donor error:", err);
      toast.error(err.response?.data?.message || "Error removing donor");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-white flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-xl font-semibold text-gray-700">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-white flex items-center justify-center">
        <div className="text-center space-y-4 p-8">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto">
            <svg className="w-8 h-8 text-red-500" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
            </svg>
          </div>
          <p className="text-xl font-semibold text-red-600">{error}</p>
          <button
            onClick={() => {
              setError("");
              setLoading(true);
              fetchAllData(false);
            }}
            className="btn bg-orange-500 hover:bg-orange-600 text-white border-orange-500"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-white">
      <ToastContainer />

      {/* Header Section */}
      <div className="bg-white shadow-sm border-b border-orange-100">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                  </svg>
                </div>
                Donations Dashboard
              </h1>
              <p className="text-gray-600 mt-2">Manage and track all donations in real-time</p>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm text-gray-600 font-medium">Live Updates</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-orange-100 hover:shadow-xl transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Donations</p>
                <p className="text-3xl font-bold text-gray-900">{stats.totalDonations}</p>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-orange-500" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg border border-orange-100 hover:shadow-xl transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Amount</p>
                <p className="text-3xl font-bold text-green-600">${stats.totalAmount.toLocaleString()}</p>
                <p className="text-xs text-gray-500 mt-1">Permanently tracked total</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-green-500" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M11.8 10.9c-2.27-.59-3-1.2-3-2.15 0-1.09 1.01-1.85 2.7-1.85 1.78 0 2.44.85 2.5 2.1h2.21c-.07-1.72-1.12-3.3-3.21-3.81V3h-3v2.16c-1.94.42-3.5 1.68-3.5 3.61 0 2.31 1.91 3.46 4.7 4.13 2.5.6 3 1.48 3 2.41 0 .69-.49 1.79-2.7 1.79-2.06 0-2.87-.92-2.98-2.1h-2.2c.12 2.19 1.76 3.42 3.68 3.83V21h3v-2.15c1.95-.37 3.5-1.5 3.5-3.55 0-2.84-2.43-3.81-4.7-4.4z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg border border-orange-100 hover:shadow-xl transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending</p>
                <p className="text-3xl font-bold text-yellow-600">{stats.pendingCount}</p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-yellow-500" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M7.07,18.28C7.5,17.38 10.12,16.5 12,16.5C13.88,16.5 16.5,17.38 16.93,18.28C15.57,19.36 13.86,20 12,20C10.14,20 8.43,19.36 7.07,18.28M18.36,16.83C16.93,15.09 13.46,14.5 12,14.5C10.54,14.5 7.07,15.09 5.64,16.83C4.62,15.5 4,13.82 4,12C4,7.59 7.59,4 12,4C16.41,4 20,7.59 20,12C20,13.82 19.38,15.5 18.36,16.83M12,6C10.06,6 8.5,7.56 8.5,9.5C8.5,11.44 10.06,13 12,13C13.94,13 15.5,11.44 15.5,9.5C15.5,7.56 13.94,6 12,6M12,11A1.5,1.5 0 0,1 10.5,9.5A1.5,1.5 0 0,1 12,8A1.5,1.5 0 0,1 13.5,9.5A1.5,1.5 0 0,1 12,11Z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg border border-orange-100 hover:shadow-xl transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Received</p>
                <p className="text-3xl font-bold text-green-600">{stats.receivedCount}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-green-500" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* {Cash Donations Chart} */}
        <div className="bg-white rounded-2xl shadow-xl border border-orange-100 overflow-hidden">
          <div className="bg-gradient-to-r from-orange-500 to-orange-600 px-6 py-4">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M11.8 10.9c-2.27-.59-3-1.2-3-2.15 0-1.09 1.01-1.85 2.7-1.85 1.78 0 2.44.85 2.5 2.1h2.21c-.07-1.72-1.12-3.3-3.21-3.81V3h-3v2.16c-1.94.42-3.5 1.68-3.5 3.61 0 2.31 1.91 3.46 4.7 4.13 2.5.6 3 1.48 3 2.41 0 .69-.49 1.79-2.7 1.79-2.06 0-2.87-.92-2.98-2.1h-2.2c.12 2.19 1.76 3.42 3.68 3.83V21h3v-2.15c1.95-.37 3.5-1.5 3.5-3.55 0-2.84-2.43-3.81-4.7-4.4z" />
                  </svg>
                  Cash Donations Analytics
                </h2>
                <p className="text-orange-100 mt-1">Track received cash donations over time</p>
              </div>
            </div>
          </div>
          <div className="p-6">
            <CashDonationsChart donations={donations} />
          </div>
        </div>

        {/* Donations Table */}
        <div className="bg-white rounded-2xl shadow-xl border border-orange-100 overflow-hidden">
          <div className="bg-gradient-to-r from-orange-500 to-orange-600 px-6 py-4">
            <h2 className="text-2xl font-bold text-white flex items-center gap-3">
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
              </svg>
              All Donations ({filteredDonations.length})
            </h2>
            <p className="text-orange-100 mt-1">Manage and track donation status</p>
          </div>

          <div className="px-6 py-4 bg-gray-50 border-b border-gray-200 flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search by donor name or email..."
                  value={donationSearchTerm}
                  onChange={(e) => setDonationSearchTerm(e.target.value)}
                  className="input input-bordered w-full bg-white border-gray-300 focus:border-orange-500 pl-10"
                />
                <svg
                  className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
            <div className="sm:w-48">
              <select
                value={donationMonthFilter}
                onChange={(e) => setDonationMonthFilter(e.target.value)}
                className="select select-bordered w-full bg-white border-gray-300 focus:border-orange-500"
              >
                <option value="">All Months</option>
                {Array.from(new Set(donations.map(d => new Date(d.createdAt).toISOString().substr(0, 7))))
                  .sort((a, b) => b.localeCompare(a))
                  .map(month => {
                    const date = new Date(month + '-01');
                    const monthName = date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
                    return (
                      <option key={month} value={month}>{monthName}</option>
                    );
                  })
                }
              </select>
            </div>
            {(donationSearchTerm || donationMonthFilter) && (
              <button
                onClick={() => {
                  setDonationSearchTerm("");
                  setDonationMonthFilter("");
                }}
                className="btn btn-outline btn-sm border-gray-300 hover:bg-gray-100 text-gray-600"
              >
                Clear
              </button>
            )}
          </div>

          <div className="overflow-x-auto">
            <table className="table w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left font-semibold text-gray-700">Donor</th>
                  <th className="text-left font-semibold text-gray-700">Contact</th>
                  <th className="text-left font-semibold text-gray-700">Type</th>
                  <th className="text-left font-semibold text-gray-700">Amount/Item</th>
                  <th className="text-center font-semibold text-gray-700">Qty</th>
                  <th className="text-center font-semibold text-gray-700">Public</th>
                  <th className="text-center font-semibold text-gray-700">Status</th>
                  <th className="text-center font-semibold text-gray-700">Payment ID</th>
                  <th className="text-center font-semibold text-gray-700">Donor List</th>
                  <th className="text-center font-semibold text-gray-700">Date</th>
                  <th className="text-center font-semibold text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredDonations.map((donation, index) => (
                  <tr key={donation._id} className={`hover:bg-orange-50 transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
                    <td className="font-medium text-gray-900">{donation.donorName}</td>
                    <td className="text-gray-600 max-w-[150px] truncate">{donation.donorEmail}</td>
                    <td>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${donation.donationType === 'cash'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-blue-100 text-blue-700'
                        }`}>
                        {donation.donationType === 'cash' ? '💰 Cash' : '📦 Item'}
                      </span>
                    </td>
                    <td className="font-semibold text-gray-900">
                      {donation.donationType === "cash"
                        ? `$${Number(donation.amount || 0).toLocaleString()}`
                        : donation.itemName}
                    </td>
                    <td className="text-center text-gray-600">
                      {donation.donationType === "item" ? donation.quantity : "-"}
                    </td>
                    <td className="text-center">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${donation.listAcknowledgment
                        ? 'bg-green-100 text-green-700'
                        : 'bg-gray-100 text-gray-700'
                        }`}>
                        {donation.listAcknowledgment ? "Yes" : "No"}
                      </span>
                    </td>
                    <td className="text-center">
                      <select
                        value={donation.status}
                        onChange={(e) =>
                          handleStatusChange(donation._id, e.target.value)
                        }
                        disabled={updating.has(donation._id) || deleting.has(donation._id)}
                        className={`select select-bordered select-sm bg-white border-orange-200 focus:border-orange-500 rounded-lg ${updating.has(donation._id) || deleting.has(donation._id) ? 'opacity-50 cursor-not-allowed' : ''
                          }`}
                      >
                        <option value="pending">⏳ Pending</option>
                        <option value="received">✅ Received</option>
                      </select>
                    </td>
                    <td className="text-center text-gray-600 text-sm max-w-[150px] break-words">
                      {donation.paymentId || "-"}
                    </td>
                    <td className="text-center">
                      <button
                        onClick={() =>
                          handleAddToDonorList(donation._id, true)
                        }
                        disabled={updating.has(donation._id) || deleting.has(donation._id)}
                        className={`btn btn-sm bg-green-100 hover:bg-green-200 text-green-600 border-green-200 hover:border-green-300 rounded-lg transition-all duration-200 ${updating.has(donation._id) || deleting.has(donation._id)
                          ? 'opacity-50 cursor-not-allowed'
                          : ''
                          }`}
                        title="Add to donor list"
                      >
                        {updating.has(donation._id) ? (
                          <div className="w-4 h-4 border-2 border-green-600 border-t-transparent rounded-full animate-spin"></div>
                        ) : (
                          "Add"
                        )}
                      </button>
                    </td>
                    <td className="text-center text-gray-600 text-sm">
                      {new Date(donation.createdAt).toLocaleDateString()}
                    </td>
                    <td className="text-center">
                      <button
                        onClick={() => handleDeleteDonation(donation._id)}
                        disabled={updating.has(donation._id) || deleting.has(donation._id)}
                        className={`btn btn-sm bg-red-100 hover:bg-red-200 text-red-600 border-red-200 hover:border-red-300 rounded-lg transition-all duration-200 ${updating.has(donation._id) || deleting.has(donation._id) ? 'opacity-50 cursor-not-allowed' : ''
                          }`}
                        title="Delete donation"
                      >
                        {deleting.has(donation._id) ? (
                          <div className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin"></div>
                        ) : (
                          "🗑️"
                        )}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredDonations.length === 0 && donations.length > 0 && (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full mx-auto mb-4 flex items-center justify-center">
                <svg className="w-8 h-8 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                  <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                </svg>
              </div>
              <p className="text-gray-500 text-lg">No donations match your search criteria</p>
              <button
                onClick={() => {
                  setDonationSearchTerm("");
                  setDonationMonthFilter("");
                }}
                className="btn btn-outline btn-sm mt-3 border-gray-300 hover:bg-gray-100 text-gray-600"
              >
                Clear Filters
              </button>
            </div>
          )}

          {donations.length === 0 && (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-orange-100 rounded-full mx-auto mb-4 flex items-center justify-center">
                <svg className="w-8 h-8 text-orange-500" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                </svg>
              </div>
              <p className="text-gray-500 text-lg">No donations yet</p>
            </div>
          )}
        </div>

        {/* Donor List Section */}
        <div className="bg-white rounded-2xl shadow-xl border border-orange-100 overflow-hidden">
          <div className="bg-gradient-to-r from-orange-500 to-orange-600 px-6 py-4 flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M16 4c0-1.11.89-2 2-2s2 .89 2 2-.89 2-2 2-2-.89-2-2zm4 18v-6h2.5l-2.54-7.63A2.99 2.99 0 0 0 16.85 6c-.47 0-.91.17-1.25.47L14 7.75V12c0 1.11-.89 2-2 2s-2-.89-2-2V5c0-1.11.89-2 2-2s2 .89 2 2v3l4.05-2.76c.85-.58 2-.58 2.85 0L22 8v14h-2z" />
                </svg>
                Public Donor List ({filteredDonors.length})
              </h2>
              <p className="text-orange-100 mt-1">Export and manage public donor recognition</p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={downloadDonorListCSV}
                className="btn bg-white text-orange-600 hover:bg-orange-50 border-white hover:border-orange-100 rounded-lg shadow-lg transition-all duration-200"
              >
                📄 CSV
              </button>
              <button
                onClick={downloadDonorListPDF}
                className="btn bg-orange-700 text-white hover:bg-orange-800 border-orange-700 hover:border-orange-800 rounded-lg shadow-lg transition-all duration-200"
              >
                📑 PDF
              </button>
            </div>
          </div>

          <div className="px-6 py-4 bg-gray-50 border-b border-gray-200 flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search by donor name..."
                  value={donorSearchTerm}
                  onChange={(e) => setDonorSearchTerm(e.target.value)}
                  className="input input-bordered w-full bg-white border-gray-300 focus:border-orange-500 pl-10"
                />
                <svg
                  className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
            <div className="sm:w-48">
              <select
                value={donorMonthFilter}
                onChange={(e) => setDonorMonthFilter(e.target.value)}
                className="select select-bordered w-full bg-white border-gray-300 focus:border-orange-500"
              >
                <option value="">All Months</option>
                {Array.from(new Set(donors.filter(d => d.donationDate).map(d => new Date(d.donationDate).toISOString().substr(0, 7))))
                  .sort((a, b) => b.localeCompare(a))
                  .map(month => {
                    const date = new Date(month + '-01');
                    const monthName = date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
                    return (
                      <option key={month} value={month}>{monthName}</option>
                    );
                  })
                }
              </select>
            </div>
            {(donorSearchTerm || donorMonthFilter) && (
              <button
                onClick={() => {
                  setDonorSearchTerm("");
                  setDonorMonthFilter("");
                }}
                className="btn btn-outline btn-sm border-gray-300 hover:bg-gray-100 text-gray-600"
              >
                Clear
              </button>
            )}
          </div>

          <div className="overflow-x-auto">
            <table className="table w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left font-semibold text-gray-700">#</th>
                  <th className="text-left font-semibold text-gray-700">Donor Name</th>
                  <th className="text-center font-semibold text-gray-700">Donation Date</th>
                  <th className="text-center font-semibold text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredDonors.map((donor, index) => (
                  <tr key={donor._id} className={`hover:bg-orange-50 transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
                    <td className="font-semibold text-gray-700">{index + 1}</td>
                    <td>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gradient-to-br from-orange-400 to-orange-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                          {donor.donorName.charAt(0).toUpperCase()}
                        </div>
                        <span className="font-medium text-gray-900">{donor.donorName}</span>
                      </div>
                    </td>
                    <td className="text-center text-gray-600">
                      {donor.donationDate
                        ? new Date(donor.donationDate).toLocaleDateString()
                        : "-"}
                    </td>
                    <td className="text-center">
                      <button
                        onClick={() => handleDeleteDonor(donor._id)}
                        className="btn btn-sm bg-red-100 hover:bg-red-200 text-red-600 border-red-200 hover:border-red-300 rounded-lg transition-all duration-200"
                        title="Remove from donor list"
                      >
                        🗑️
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredDonors.length === 0 && donors.length > 0 && (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full mx-auto mb-4 flex items-center justify-center">
                <svg className="w-8 h-8 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                  <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                </svg>
              </div>
              <p className="text-gray-500 text-lg">No donors match your search criteria</p>
              <button
                onClick={() => {
                  setDonorSearchTerm("");
                  setDonorMonthFilter("");
                }}
                className="btn btn-outline btn-sm mt-3 border-gray-300 hover:bg-gray-100 text-gray-600"
              >
                Clear Filters
              </button>
            </div>
          )}

          {donors.length === 0 && (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-orange-100 rounded-full mx-auto mb-4 flex items-center justify-center">
                <svg className="w-8 h-8 text-orange-500" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M16 4c0-1.11.89-2 2-2s2 .89 2 2-.89 2-2 2-2-.89-2-2zm4 18v-6h2.5l-2.54-7.63A2.99 2.99 0 0 0 16.85 6c-.47 0-.91.17-1.25.47L14 7.75V12c0 1.11-.89 2-2 2s-2-.89-2-2V5c0-1.11.89-2 2-2s2 .89 2 2v3l4.05-2.76c.85-.58 2-.58 2.85 0L22 8v14h-2z" />
                </svg>
              </div>
              <p className="text-gray-500 text-lg">No public donors yet</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDonations;
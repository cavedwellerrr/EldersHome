import React, { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { Users, UserCheck, UserX, TrendingUp, Calendar, Download, FileText, FileSpreadsheet } from 'lucide-react';

const SimplifiedElderDashboard = () => {
  const [dashboardData, setDashboardData] = useState({
    totalActiveElders: 0,
    totalDisabledElders: 0,
    activeGenderDistribution: [],
    disabledGenderDistribution: [],
    activeAgeGroups: [],
    disabledAgeGroups: [],
    monthlyActiveRegistrations: [],
    monthlyDisabledRegistrations: []
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedView, setSelectedView] = useState('active'); // 'active' or 'disabled'
  const [downloading, setDownloading] = useState({ csv: false, pdf: false });

  // Fetch dashboard data
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const token = localStorage.getItem('staffToken');
        const response = await fetch('http://localhost:5000/api/elders/dashboard/active-disabled-stats', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          setDashboardData(data);
        } else {
          // Fallback mock data
          setDashboardData({
            totalActiveElders: 156,
            totalDisabledElders: 89,
            activeGenderDistribution: [
              { name: 'Male', value: 82, color: '#3B82F6' },
              { name: 'Female', value: 68, color: '#EC4899' },
              { name: 'Other', value: 6, color: '#10B981' }
            ],
            disabledGenderDistribution: [
              { name: 'Male', value: 45, color: '#3B82F6' },
              { name: 'Female', value: 42, color: '#EC4899' },
              { name: 'Other', value: 2, color: '#10B981' }
            ],
            activeAgeGroups: [
              { ageGroup: '60-65', count: 28 },
              { ageGroup: '66-70', count: 42 },
              { ageGroup: '71-75', count: 38 },
              { ageGroup: '76-80', count: 32 },
              { ageGroup: '81-85', count: 12 },
              { ageGroup: '85+', count: 4 }
            ],
            disabledAgeGroups: [
              { ageGroup: '60-65', count: 15 },
              { ageGroup: '66-70', count: 22 },
              { ageGroup: '71-75', count: 25 },
              { ageGroup: '76-80', count: 18 },
              { ageGroup: '81-85', count: 7 },
              { ageGroup: '85+', count: 2 }
            ],
            monthlyActiveRegistrations: [
              { month: 'Jan', count: 12 },
              { month: 'Feb', count: 8 },
              { month: 'Mar', count: 18 },
              { month: 'Apr', count: 15 },
              { month: 'May', count: 22 },
              { month: 'Jun', count: 25 },
              { month: 'Jul', count: 20 },
              { month: 'Aug', count: 28 },
              { month: 'Sep', count: 8 }
            ],
            monthlyDisabledRegistrations: [
              { month: 'Jan', count: 8 },
              { month: 'Feb', count: 12 },
              { month: 'Mar', count: 6 },
              { month: 'Apr', count: 10 },
              { month: 'May', count: 9 },
              { month: 'Jun', count: 7 },
              { month: 'Jul', count: 11 },
              { month: 'Aug', count: 15 },
              { month: 'Sep', count: 11 }
            ]
          });
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // Refresh dashboard data
  const refreshDashboard = async () => {
    setRefreshing(true);
    try {
      const token = localStorage.getItem('staffToken');
      const response = await fetch('http://localhost:5000/api/elders/dashboard/active-disabled-stats', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setDashboardData(data);
      }
    } catch (error) {
      console.error('Error refreshing dashboard:', error);
    } finally {
      setRefreshing(false);
    }
  };

  // Download CSV
  const downloadCSV = async () => {
    setDownloading(prev => ({ ...prev, csv: true }));
    try {
      const token = localStorage.getItem('staffToken');
      const response = await fetch('http://localhost:5000/api/elders/download/csv', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = `elders-data-${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error('Error downloading CSV:', error);
    } finally {
      setDownloading(prev => ({ ...prev, csv: false }));
    }
  };

  // Download PDF
  const downloadPDF = async () => {
    setDownloading(prev => ({ ...prev, pdf: true }));
    try {
      const token = localStorage.getItem('staffToken');
      const response = await fetch('http://localhost:5000/api/elders/download/pdf', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = `elders-report-${new Date().toISOString().split('T')[0]}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error('Error downloading PDF:', error);
    } finally {
      setDownloading(prev => ({ ...prev, pdf: false }));
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Get current view data
  const currentGenderData = selectedView === 'active' 
    ? dashboardData.activeGenderDistribution 
    : dashboardData.disabledGenderDistribution;
  
  const currentAgeData = selectedView === 'active'
    ? dashboardData.activeAgeGroups
    : dashboardData.disabledAgeGroups;

  const currentMonthlyData = selectedView === 'active'
    ? dashboardData.monthlyActiveRegistrations
    : dashboardData.monthlyDisabledRegistrations;

  const currentTotal = selectedView === 'active'
    ? dashboardData.totalActiveElders
    : dashboardData.totalDisabledElders;

  // Combined monthly data for LineChart
  const monthlyData = dashboardData.monthlyActiveRegistrations.map((active, index) => ({
    month: active.month,
    active: active.count,
    disabled: dashboardData.monthlyDisabledRegistrations[index]?.count || 0
  }));

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Elder Statistics Dashboard</h1>
              <p className="text-gray-600">Active and disabled elders overview and analytics</p>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={refreshDashboard}
                disabled={refreshing}
                className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              >
                <svg 
                  className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                {refreshing ? 'Refreshing...' : 'Refresh'}
              </button>
            </div>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-green-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm font-medium">Active Elders</p>
                <p className="text-3xl font-bold text-gray-900">{dashboardData.totalActiveElders}</p>
              </div>
              <UserCheck className="h-12 w-12 text-green-500" />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-red-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm font-medium">Pending Review</p>
                <p className="text-3xl font-bold text-gray-900">{dashboardData.totalDisabledElders}</p>
              </div>
              <UserX className="h-12 w-12 text-red-500" />
            </div>
          </div>
        </div>

        {/* Download Section */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
            <Download className="h-5 w-5 mr-2 text-blue-500" />
            Download Elder Data
          </h2>
          <div className="flex flex-wrap gap-4">
            <button
              onClick={downloadCSV}
              disabled={downloading.csv}
              className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
              <FileSpreadsheet className="h-5 w-5 mr-2" />
              {downloading.csv ? 'Downloading CSV...' : 'Download as CSV'}
            </button>
            <button
              onClick={downloadPDF}
              disabled={downloading.pdf}
              className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
              <FileText className="h-5 w-5 mr-2" />
              {downloading.pdf ? 'Downloading PDF...' : 'Download as PDF'}
            </button>
          </div>
        </div>

        {/* View Toggle */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Elder Analytics</h2>
            <div className="flex bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setSelectedView('active')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  selectedView === 'active'
                    ? 'bg-green-600 text-white shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Active Elders ({dashboardData.totalActiveElders})
              </button>
              <button
                onClick={() => setSelectedView('disabled')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  selectedView === 'disabled'
                    ? 'bg-red-600 text-white shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Pending Reviews ({dashboardData.totalDisabledElders})
              </button>
            </div>
          </div>

          {/* Charts Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Gender Distribution Pie Chart */}
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Gender Distribution - {selectedView === 'active' ? 'Active' : 'Disabled'} Elders
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={currentGenderData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {currentGenderData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Age Groups Bar Chart */}
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Age Distribution - {selectedView === 'active' ? 'Active' : 'Pending Review'} Elders
              </h3>
              {currentAgeData.length === 0 || currentAgeData.every(item => item.count === 0) ? (
                <div className="text-center text-gray-500 py-12">
                  No age data available for {selectedView === 'active' ? 'active' : 'pending review'} elders
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={currentAgeData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="ageGroup" />
                    <YAxis />
                    <Tooltip />
                    <Bar 
                      dataKey="count" 
                      fill={selectedView === 'active' ? '#10B981' : '#EF4444'} 
                      radius={[4, 4, 0, 0]} 
                    />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>
        </div>

        {/* Registration Trends */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
            <TrendingUp className="h-5 w-5 mr-2 text-blue-500" />
            Monthly Registration Trends
          </h2>
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="active"
                stroke="#10B981"
                strokeWidth={3}
                name="Active Elders"
                dot={{ fill: '#10B981', strokeWidth: 2, r: 6 }}
              />
              <Line
                type="monotone"
                dataKey="disabled"
                stroke="#EF4444"
                strokeWidth={3}
                name="Disabled Elders"
                dot={{ fill: '#EF4444', strokeWidth: 2, r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default SimplifiedElderDashboard;
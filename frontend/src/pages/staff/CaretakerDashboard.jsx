import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  Utensils,
  Calendar,
  Home,
  UserCheck,
  Clock,
  TrendingUp,
  AlertCircle,
  Plus,
  ArrowRight,
  Activity
} from 'lucide-react';
import api from '../../api';

function CaretakerDashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    assignedElders: 0,
    totalMeals: 0,
    upcomingEvents: 0,
    pendingTasks: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        const token = localStorage.getItem("staffToken");
        if (!token) return;

        // Load assigned elders count
        const eldersRes = await api.get("/caretaker/elders/my", {
          headers: { Authorization: `Bearer ${token}` },
        });

        // Load meals count
        const mealsRes = await api.get("/meals");

        setStats({
          assignedElders: eldersRes.data?.count || eldersRes.data?.elders?.length || 0,
          totalMeals: Array.isArray(mealsRes.data) ? mealsRes.data.length : mealsRes.data?.data?.length || mealsRes.data?.meals?.length || 0,
          upcomingEvents: 0, // Placeholder for future implementation
          pendingTasks: 0 // Placeholder for future implementation
        });
      } catch (error) {
        console.error("Error loading dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  const quickActions = [
    {
      title: "Assigned Elders",
      description: "View and manage your assigned residents",
      icon: Users,
      color: "orange",
      path: "/staff/caretaker-dashboard/assigned-elders",
      count: stats.assignedElders
    },
    {
      title: "Meal Management",
      description: "Manage meals and dietary preferences",
      icon: Utensils,
      color: "green",
      path: "/staff/caretaker-dashboard/meals",
      count: stats.totalMeals
    },
    {
      title: "Events & Activities",
      description: "View and manage upcoming events",
      icon: Calendar,
      color: "blue",
      path: "/staff/caretaker-dashboard/events",
      count: stats.upcomingEvents
    },
    {
      title: "Consultations",
      description: "Schedule and manage consultations",
      icon: UserCheck,
      color: "purple",
      path: "/staff/caretaker-dashboard/consultations",
      count: stats.pendingTasks
    }
  ];

  const upcomingTasks = [
    {
      title: "Morning Medication Round",
      time: "08:00 AM",
      type: "medication",
      priority: "high"
    },
    {
      title: "Lunch Service",
      time: "12:00 PM",
      type: "meal",
      priority: "medium"
    },
    {
      title: "Evening Check-in",
      time: "06:00 PM",
      type: "check-in",
      priority: "medium"
    }
  ];

  const StatCard = ({ title, value, icon: Icon, color, trend }) => (
    <div className="bg-white rounded-2xl shadow-lg border border-orange-100 p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
          <p className="text-3xl font-bold text-gray-900">{value}</p>
          {trend && (
            <div className="flex items-center mt-2">
              <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
              <span className="text-sm text-green-600 font-medium">{trend}</span>
            </div>
          )}
        </div>
        <div className={`w-12 h-12 bg-gradient-to-br from-${color}-100 to-${color}-200 rounded-xl flex items-center justify-center`}>
          <Icon className={`w-6 h-6 text-${color}-600`} />
        </div>
      </div>
    </div>
  );

  const QuickActionCard = ({ action }) => {
    const Icon = action.icon;
    return (
      <div
        className="bg-white rounded-2xl shadow-lg border border-orange-100 p-6 hover:shadow-xl transition-all duration-200 cursor-pointer group"
        onClick={() => navigate(action.path)}
      >
        <div className="flex items-start justify-between mb-4">
          <div className={`w-12 h-12 bg-gradient-to-br from-${action.color}-100 to-${action.color}-200 rounded-xl flex items-center justify-center`}>
            <Icon className={`w-6 h-6 text-${action.color}-600`} />
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-2xl font-bold text-gray-900">{action.count}</span>
            <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-orange-500 transition-colors" />
          </div>
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">{action.title}</h3>
        <p className="text-sm text-gray-600 leading-relaxed">{action.description}</p>
      </div>
    );
  };

  const TaskItem = ({ task }) => (
    <div className="flex items-center justify-between p-4 bg-white rounded-xl border border-orange-100 hover:shadow-md transition-all duration-200">
      <div className="flex items-center space-x-3">
        <div className={`w-3 h-3 rounded-full ${task.priority === 'high' ? 'bg-red-500' :
          task.priority === 'medium' ? 'bg-orange-500' : 'bg-green-500'
          }`}></div>
        <div>
          <h4 className="font-medium text-gray-900">{task.title}</h4>
          <p className="text-sm text-gray-600">{task.type}</p>
        </div>
      </div>
      <div className="flex items-center space-x-2">
        <Clock className="w-4 h-4 text-gray-400" />
        <span className="text-sm font-medium text-gray-600">{task.time}</span>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-white">
        <div className="max-w-7xl mx-auto p-6 lg:p-8">
          <div className="bg-white rounded-2xl shadow-lg border border-orange-100 p-8 text-center">
            <div className="flex items-center justify-center space-x-3">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
              <span className="text-gray-600 font-medium">Loading dashboard...</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-white">
      <div className="max-w-7xl mx-auto p-6 lg:p-8">
        {/* Header Section */}
        <div className="mb-8">
          <div className="bg-white rounded-2xl shadow-lg border border-orange-100 p-6 lg:p-8">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-2">
                  Caretaker Dashboard
                </h1>
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 bg-orange-500 rounded-full"></div>
                  <p className="text-gray-600 font-medium">
                    Welcome back! Here's your daily overview
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-orange-500 rounded-full flex items-center justify-center">
                  <Activity className="h-5 w-5 text-white" />
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">Active Status</p>
                  <p className="text-xs text-green-600 font-medium">Online</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="mb-8">
          <div className="bg-white rounded-2xl shadow-lg border border-orange-100 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
              <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-4 h-4 text-orange-600" />
              </div>
              Overview Statistics
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatCard
                title="Assigned Elders"
                value={stats.assignedElders}
                icon={Users}
                color="orange"
                trend="+2 this week"
              />
              <StatCard
                title="Total Meals"
                value={stats.totalMeals}
                icon={Utensils}
                color="green"
                trend="+5 new meals"
              />
              <StatCard
                title="Upcoming Events"
                value={stats.upcomingEvents}
                icon={Calendar}
                color="blue"
              />
              <StatCard
                title="Pending Tasks"
                value={stats.pendingTasks}
                icon={AlertCircle}
                color="red"
              />
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <div className="bg-white rounded-2xl shadow-lg border border-orange-100 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
              <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                <Plus className="w-4 h-4 text-orange-600" />
              </div>
              Quick Actions
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {quickActions.map((action, index) => (
                <QuickActionCard key={index} action={action} />
              ))}
            </div>
          </div>
        </div>

        {/* Today's Schedule */}
        <div className="mb-8">
          <div className="bg-white rounded-2xl shadow-lg border border-orange-100 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
              <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                <Clock className="w-4 h-4 text-orange-600" />
              </div>
              Today's Schedule
            </h2>
            <div className="space-y-3">
              {upcomingTasks.map((task, index) => (
                <TaskItem key={index} task={task} />
              ))}
            </div>
            <div className="mt-6 text-center">
              <button className="text-orange-600 hover:text-orange-700 font-medium text-sm flex items-center justify-center mx-auto">
                View Full Schedule
                <ArrowRight className="w-4 h-4 ml-1" />
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-white rounded-2xl shadow-lg border border-orange-100 p-6">
          <div className="text-center">
            <p className="text-sm text-gray-600">
              Need help? Contact your supervisor or check the staff handbook for guidelines.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CaretakerDashboard;

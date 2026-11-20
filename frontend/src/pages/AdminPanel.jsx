import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  Brain, Users, FileText, ArrowLeft, Search, ChevronDown, ChevronUp,
  Shield, Activity, Clock, User, Mail, TrendingUp, AlertTriangle,
  CheckCircle, XCircle, Eye, BarChart3, RefreshCw
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getAdminUsers, getAdminUserReports, getAdminStats, getAdminAssessments } from '../services/api';

/* ─────────────────────────────────────────────
   Admin Panel Page (Aether Neuro-Editorial)
   ───────────────────────────────────────────── */
const AdminPanel = () => {
  const navigate = useNavigate();
  const { user, isAdmin, login } = useAuth();

  const [stats, setStats] = useState({ total_users: 0, total_assessments: 0 });
  const [users, setUsers] = useState([]);
  const [allAssessments, setAllAssessments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedUser, setExpandedUser] = useState(null);
  const [userReports, setUserReports] = useState({});
  const [activeTab, setActiveTab] = useState('users'); // 'users' | 'reports'
  const [reportsLoading, setReportsLoading] = useState({});

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [statsRes, usersRes, assessmentsRes] = await Promise.all([
        getAdminStats(),
        getAdminUsers(),
        getAdminAssessments(),
      ]);
      setStats(statsRes);
      setUsers(usersRes.users || []);
      setAllAssessments(assessmentsRes.assessments || []);
    } catch (err) {
      console.error('Error loading admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadUserReports = async (userId) => {
    if (userReports[userId]) return;
    setReportsLoading((p) => ({ ...p, [userId]: true }));
    try {
      const res = await getAdminUserReports(userId);
      setUserReports((p) => ({ ...p, [userId]: res.assessments || [] }));
    } catch (err) {
      console.error('Error loading reports:', err);
    } finally {
      setReportsLoading((p) => ({ ...p, [userId]: false }));
    }
  };

  const toggleUser = (userId) => {
    if (expandedUser === userId) {
      setExpandedUser(null);
    } else {
      setExpandedUser(userId);
      loadUserReports(userId);
    }
  };

  const filteredUsers = users.filter(
    (u) =>
      u.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getSeverityBadge = (severity) => {
    switch (severity?.toLowerCase()) {
      case 'high':
        return 'text-[#8b4e33] bg-[#8b4e33]/12 border-[#8b4e33]/30';
      case 'moderate':
        return 'text-[#783f25] bg-[#feae8c]/25 border-[#feae8c]/50';
      case 'mild':
        return 'text-[#33302b] bg-[#ebe8e1] border-[#e5e2db]';
      default:
        return 'text-[#4b463f] bg-[#f6f3ec] border-[#e5e2db]';
    }
  };

  const getConfidenceColor = (conf) => {
    if (conf >= 0.8) return 'text-[#8b4e33]';
    if (conf >= 0.5) return 'text-[#783f25]';
    return 'text-[#4b463f]';
  };

  // ── Admin access check ─────────────────────────────────────────────
  if (!user) {
    return (
      <div className="min-h-screen bg-[#fcf9f2] flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white border border-[#e5e2db] rounded-3xl p-8 text-center space-y-6 shadow-sm">
          <div className="w-16 h-16 bg-[#33302b] text-[#fcf9f2] rounded-2xl flex items-center justify-center mx-auto shadow-sm">
            <Shield className="w-8 h-8 text-[#8b4e33]" />
          </div>
          <div>
            <h2 className="font-['Outfit'] text-2xl font-semibold text-[#1c1c18] tracking-tight">Admin Authentication</h2>
            <p className="text-xs text-[#4b463f] mt-1.5 leading-relaxed">Please sign in to view persistent user data and diagnostic reports.</p>
          </div>
          
          <div className="space-y-3 pt-2">
            <button
              onClick={async () => {
                await login("Administrator", "admin@neurosync.app");
                loadData();
              }}
              className="w-full bg-[#33302b] hover:bg-[#1c1c18] text-[#fcf9f2] py-3.5 rounded-full font-semibold text-xs uppercase tracking-widest shadow-sm transition-all active:scale-[0.98]"
            >
              Sign In As Admin
            </button>
            <button
              onClick={() => navigate('/')}
              className="w-full bg-[#f6f3ec] hover:bg-[#ebe8e1] text-[#33302b] border border-[#e5e2db] py-3.5 rounded-full font-semibold text-xs uppercase tracking-widest transition"
            >
              Back to Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fcf9f2] text-[#1c1c18] font-['Plus_Jakarta_Sans']">
      {/* Background Glow */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-[#fcf9f2]" />
        <div className="absolute -top-32 -left-32 w-[500px] h-[500px] rounded-full bg-[#ffdbcd]/30 blur-3xl" />
        <div className="absolute top-1/3 -right-40 w-[600px] h-[600px] rounded-full bg-[#ebe8e1]/40 blur-3xl" />
      </div>

      {/* Header */}
      <header className="relative z-50 px-6 sm:px-10 py-5 flex items-center justify-between backdrop-blur-xl bg-[#fcf9f2]/85 border-b border-[#e5e2db]/70">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/')}
            className="p-2.5 bg-[#f6f3ec] hover:bg-[#ebe8e1] rounded-full border border-[#e5e2db] text-[#33302b] transition"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-[#33302b] rounded-full text-[#fcf9f2] shadow-sm">
              <Shield className="w-4 h-4 text-[#8b4e33]" />
            </div>
            <div>
              <h1 className="font-['Outfit'] text-lg font-semibold text-[#1c1c18] tracking-tight">Admin Panel</h1>
              <p className="text-[10px] text-[#7c766e] uppercase tracking-wider font-semibold">Neuro Sync Dashboard</p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={loadData} className="p-2.5 bg-[#f6f3ec] hover:bg-[#ebe8e1] rounded-full border border-[#e5e2db] transition">
            <RefreshCw className={`w-4 h-4 text-[#33302b] ${loading ? 'animate-spin' : ''}`} />
          </button>
          <div className="flex items-center gap-2 bg-[#f1eee7] border border-[#e5e2db] px-4 py-2 rounded-full">
            <User className="w-4 h-4 text-[#8b4e33]" />
            <span className="text-xs font-semibold text-[#33302b]">{user.name}</span>
          </div>
        </div>
      </header>

      <main className="relative z-10 max-w-7xl mx-auto px-6 py-8 space-y-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white border border-[#e5e2db] rounded-2xl p-6 space-y-2 shadow-sm"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 bg-[#f6f3ec] rounded-xl text-[#8b4e33]">
                <Users className="w-5 h-5" />
              </div>
              <span className="text-xs font-semibold text-[#7c766e] uppercase tracking-wider">Total Users</span>
            </div>
            <p className="font-['Outfit'] text-4xl font-normal text-[#1c1c18]">{stats.total_users}</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white border border-[#e5e2db] rounded-2xl p-6 space-y-2 shadow-sm"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 bg-[#f6f3ec] rounded-xl text-[#33302b]">
                <FileText className="w-5 h-5" />
              </div>
              <span className="text-xs font-semibold text-[#7c766e] uppercase tracking-wider">Total Reports</span>
            </div>
            <p className="font-['Outfit'] text-4xl font-normal text-[#1c1c18]">{stats.total_assessments}</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white border border-[#e5e2db] rounded-2xl p-6 space-y-2 shadow-sm"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 bg-[#f6f3ec] rounded-xl text-[#8b4e33]">
                <Activity className="w-5 h-5" />
              </div>
              <span className="text-xs font-semibold text-[#7c766e] uppercase tracking-wider">System Status</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-[#8b4e33] animate-pulse" />
              <p className="text-base font-semibold text-[#8b4e33]">Online</p>
            </div>
          </motion.div>
        </div>

        {/* Tab Switcher */}
        <div className="flex gap-2.5">
          <button
            onClick={() => setActiveTab('users')}
            className={`px-6 py-2.5 rounded-full text-xs font-semibold uppercase tracking-wider transition-all ${
              activeTab === 'users'
                ? 'bg-[#33302b] text-[#fcf9f2] shadow-sm'
                : 'bg-[#f6f3ec] text-[#4b463f] hover:bg-[#ebe8e1] border border-[#e5e2db]'
            }`}
          >
            <Users className="w-3.5 h-3.5 inline-block mr-2" />
            Users ({filteredUsers.length})
          </button>
          <button
            onClick={() => setActiveTab('reports')}
            className={`px-6 py-2.5 rounded-full text-xs font-semibold uppercase tracking-wider transition-all ${
              activeTab === 'reports'
                ? 'bg-[#33302b] text-[#fcf9f2] shadow-sm'
                : 'bg-[#f6f3ec] text-[#4b463f] hover:bg-[#ebe8e1] border border-[#e5e2db]'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5 inline-block mr-2" />
            All Reports ({allAssessments.length})
          </button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#7c766e]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name or email..."
            className="w-full bg-[#f6f3ec] border border-[#e5e2db] rounded-full pl-12 pr-5 py-3 text-sm text-[#1c1c18] placeholder:text-[#cdc5bc] focus:border-[#33302b] focus:outline-none transition-colors"
          />
        </div>

        {/* Users Tab */}
        {activeTab === 'users' && (
          <div className="space-y-3">
            {loading ? (
              <div className="text-center py-16">
                <RefreshCw className="w-6 h-6 text-[#8b4e33] mx-auto animate-spin" />
                <p className="text-xs text-[#7c766e] mt-3">Loading users...</p>
              </div>
            ) : filteredUsers.length === 0 ? (
              <div className="text-center py-16">
                <Users className="w-10 h-10 text-[#cdc5bc] mx-auto" />
                <p className="text-xs text-[#7c766e] mt-3">No users found</p>
              </div>
            ) : (
              filteredUsers.map((u, idx) => (
                <motion.div
                  key={u.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.02 }}
                  className="bg-white border border-[#e5e2db] rounded-2xl overflow-hidden shadow-sm"
                >
                  {/* User Row */}
                  <button
                    onClick={() => toggleUser(u.id)}
                    className="w-full flex items-center justify-between p-5 hover:bg-[#f6f3ec]/60 transition text-left"
                  >
                    <div className="flex items-center gap-4">
                      {u.picture ? (
                        <img src={u.picture} alt={u.name} className="w-10 h-10 rounded-full border border-[#e5e2db]" />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-[#33302b] flex items-center justify-center text-[#fcf9f2] font-semibold text-sm">
                          {u.name?.charAt(0)?.toUpperCase() || '?'}
                        </div>
                      )}
                      <div>
                        <p className="text-sm font-semibold text-[#1c1c18]">{u.name}</p>
                        <div className="flex items-center gap-3 mt-0.5">
                          <span className="text-xs text-[#7c766e] flex items-center gap-1">
                            <Mail className="w-3 h-3" /> {u.email}
                          </span>
                          <span className={`text-[10px] px-2.5 py-0.5 rounded-full border font-semibold uppercase tracking-wider ${
                            u.auth_method === 'google'
                              ? 'text-[#8b4e33] bg-[#ffdbcd]/30 border-[#ffdbcd]'
                              : 'text-[#4b463f] bg-[#f6f3ec] border-[#e5e2db]'
                          }`}>
                            {u.auth_method || 'manual'}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-[11px] text-[#7c766e]">Reports</p>
                        <p className="text-base font-bold text-[#8b4e33]">{u.assessment_count || 0}</p>
                      </div>
                      <div className="text-right hidden sm:block">
                        <p className="text-[11px] text-[#7c766e]">Joined</p>
                        <p className="text-xs font-medium text-[#33302b]">
                          {new Date(u.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      {expandedUser === u.id ? (
                        <ChevronUp className="w-4 h-4 text-[#7c766e]" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-[#7c766e]" />
                      )}
                    </div>
                  </button>

                  {/* Expanded Reports */}
                  <AnimatePresence>
                    {expandedUser === u.id && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25 }}
                        className="border-t border-[#e5e2db] overflow-hidden"
                      >
                        <div className="p-5 space-y-3 bg-[#f6f3ec]/60">
                          <h4 className="text-[11px] font-semibold text-[#7c766e] uppercase tracking-wider">Assessment Reports</h4>
                          {reportsLoading[u.id] ? (
                            <div className="text-center py-6">
                              <RefreshCw className="w-4 h-4 text-[#8b4e33] mx-auto animate-spin" />
                            </div>
                          ) : !userReports[u.id] || userReports[u.id].length === 0 ? (
                            <p className="text-xs text-[#7c766e] py-4">No assessments yet.</p>
                          ) : (
                            userReports[u.id].map((report) => (
                              <div
                                key={report.id}
                                className="bg-white border border-[#e5e2db] rounded-xl p-4 space-y-3"
                              >
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-3">
                                    <span className={`text-xs px-3 py-1 rounded-full border font-semibold uppercase tracking-wider ${getSeverityBadge(report.severity)}`}>
                                      {report.severity}
                                    </span>
                                    <span className="text-sm font-semibold text-[#1c1c18]">{report.prediction}</span>
                                  </div>
                                  <div className="flex items-center gap-3">
                                    <span className={`text-sm font-bold ${getConfidenceColor(report.confidence)}`}>
                                      {(report.confidence * 100).toFixed(1)}%
                                    </span>
                                    <span className="text-[10px] text-[#7c766e] flex items-center gap-1">
                                      <Clock className="w-3 h-3" />
                                      {new Date(report.created_at).toLocaleString()}
                                    </span>
                                  </div>
                                </div>

                                {/* Behavioral Scores */}
                                {report.behavioral_scores && (
                                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2">
                                    {report.behavioral_scores.inattention_score != null && (
                                      <div className="bg-[#f6f3ec] rounded-lg p-2.5">
                                        <p className="text-[10px] text-[#7c766e] uppercase tracking-wider">Inattention</p>
                                        <p className="text-sm font-semibold text-[#8b4e33]">
                                          {(report.behavioral_scores.inattention_score * 100).toFixed(0)}%
                                        </p>
                                      </div>
                                    )}
                                    {report.behavioral_scores.hyperactivity_score != null && (
                                      <div className="bg-[#f6f3ec] rounded-lg p-2.5">
                                        <p className="text-[10px] text-[#7c766e] uppercase tracking-wider">Hyperactivity</p>
                                        <p className="text-sm font-semibold text-[#33302b]">
                                          {(report.behavioral_scores.hyperactivity_score * 100).toFixed(0)}%
                                        </p>
                                      </div>
                                    )}
                                    {report.behavioral_scores.dsm5_presentation && (
                                      <div className="bg-[#f6f3ec] rounded-lg p-2.5 col-span-2">
                                        <p className="text-[10px] text-[#7c766e] uppercase tracking-wider">DSM-5 Presentation</p>
                                        <p className="text-sm font-semibold text-[#1c1c18]">{report.behavioral_scores.dsm5_presentation}</p>
                                      </div>
                                    )}
                                  </div>
                                )}
                              </div>
                            ))
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ))
            )}
          </div>
        )}

        {/* Reports Tab */}
        {activeTab === 'reports' && (
          <div className="space-y-3">
            {loading ? (
              <div className="text-center py-16">
                <RefreshCw className="w-6 h-6 text-[#8b4e33] mx-auto animate-spin" />
                <p className="text-xs text-[#7c766e] mt-3">Loading reports...</p>
              </div>
            ) : allAssessments.length === 0 ? (
              <div className="text-center py-16">
                <FileText className="w-10 h-10 text-[#cdc5bc] mx-auto" />
                <p className="text-xs text-[#7c766e] mt-3">No assessment reports yet</p>
              </div>
            ) : (
              allAssessments
                .filter(
                  (a) =>
                    a.user_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    a.user_email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    a.prediction?.toLowerCase().includes(searchQuery.toLowerCase())
                )
                .map((a, idx) => (
                  <motion.div
                    key={a.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.02 }}
                    className="bg-white border border-[#e5e2db] rounded-2xl p-5 shadow-sm"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        {a.user_picture ? (
                          <img src={a.user_picture} alt={a.user_name} className="w-9 h-9 rounded-full border border-[#e5e2db]" />
                        ) : (
                          <div className="w-9 h-9 rounded-full bg-[#33302b] flex items-center justify-center text-[#fcf9f2] font-semibold text-xs">
                            {a.user_name?.charAt(0)?.toUpperCase() || '?'}
                          </div>
                        )}
                        <div>
                          <p className="text-sm font-semibold text-[#1c1c18]">{a.user_name}</p>
                          <p className="text-xs text-[#7c766e]">{a.user_email}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className={`text-xs px-3 py-1 rounded-full border font-semibold uppercase tracking-wider ${getSeverityBadge(a.severity)}`}>
                          {a.severity}
                        </span>
                        <div className="text-right">
                          <p className="text-sm font-semibold text-[#1c1c18]">{a.prediction}</p>
                          <p className={`text-xs font-semibold ${getConfidenceColor(a.confidence)}`}>
                            {(a.confidence * 100).toFixed(1)}% confidence
                          </p>
                        </div>
                        <span className="text-[10px] text-[#7c766e] hidden sm:block">
                          {new Date(a.created_at).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                ))
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default AdminPanel;

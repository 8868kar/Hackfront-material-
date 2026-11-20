import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine, Legend,
} from 'recharts';
import {
  ArrowLeft, TrendingDown, TrendingUp, Minus, Brain,
  Trash2, ClipboardList, Moon, Activity, Zap, Target,
} from 'lucide-react';

const STORAGE_KEY = 'adhd_assessment_history';

const ProgressPage = () => {
  const navigate = useNavigate();
  const [history, setHistory] = React.useState([]);

  React.useEffect(() => {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      try { setHistory(JSON.parse(raw)); } catch (e) { setHistory([]); }
    }
  }, []);

  const clearHistory = () => {
    if (window.confirm('Clear all assessment history?')) {
      localStorage.removeItem(STORAGE_KEY);
      setHistory([]);
    }
  };

  // Prepare chart data — most recent 10 entries
  const chartData = [...history]
    .slice(-10)
    .map((entry, i) => ({
      index: i + 1,
      date: new Date(entry.date).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }),
      Risk: Math.round(entry.result.confidence * 100),
      Focus: Math.round(((11 - entry.inputData.focus_level) / 10) * 100),
      Stress: Math.round(((entry.inputData.stress_level - 1) / 9) * 100),
      Sleep: Math.round((entry.inputData.sleep_hours / 16) * 100),
    }));

  // Trend calculation between last two
  const getTrend = (key) => {
    if (chartData.length < 2) return 'neutral';
    const prev = chartData[chartData.length - 2][key];
    const curr = chartData[chartData.length - 1][key];
    if (curr < prev - 1) return 'improved';
    if (curr > prev + 1) return 'worsened';
    return 'neutral';
  };

  const latest = history[history.length - 1];
  const severityColor = (s) =>
    s === 'High' ? 'text-rose-600' : s === 'Moderate' ? 'text-slate-600' : 'text-emerald-600';
  const severityBg = (s) =>
    s === 'High' ? 'bg-rose-50 border-rose-200' : s === 'Moderate' ? 'bg-indigo-50/50 border-indigo-100' : 'bg-emerald-50 border-emerald-200';

  const TrendIcon = ({ trend }) => {
    if (trend === 'improved') return <TrendingDown className="w-4 h-4 text-emerald-600" />;
    if (trend === 'worsened') return <TrendingUp className="w-4 h-4 text-rose-500" />;
    return <Minus className="w-4 h-4 text-slate-400" />;
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    return (
      <div className="bg-white border border-[#e5e2db] rounded-2xl p-4 shadow-sm text-xs">
        <p className="font-semibold text-[#1c1c18] uppercase tracking-wider mb-2">{label}</p>
        {payload.map(p => (
          <div key={p.name} className="flex items-center gap-2 mb-1">
            <div className="w-2 h-2 rounded-full" style={{ background: p.color }} />
            <span className="text-[#4b463f] font-medium">{p.name}</span>
            <span className="font-bold text-[#1c1c18] ml-1">{p.value}%</span>
          </div>
        ))}
      </div>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-[#fcf9f2] text-[#1c1c18] font-['Plus_Jakarta_Sans'] py-12 px-4"
    >
      <div className="max-w-5xl mx-auto space-y-10">

        {/* ── HEADER ── */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <button
              onClick={() => navigate('/')}
              className="p-2.5 bg-[#f6f3ec] hover:bg-[#ebe8e1] border border-[#e5e2db] rounded-full text-[#33302b] transition-colors"
            >
              <ArrowLeft className="w-4 h-4 text-[#33302b]" />
            </button>
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wider text-[#8b4e33]">Your Journey</p>
              <h1 className="font-['Outfit'] text-3xl font-semibold text-[#1c1c18] tracking-tight">Progress Tracker</h1>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/assessment')}
              className="px-6 py-2.5 bg-[#33302b] hover:bg-[#1c1c18] text-[#fcf9f2] rounded-full font-semibold uppercase tracking-wider text-xs shadow-sm transition-all"
            >
              + New Assessment
            </button>
            {history.length > 0 && (
              <button
                onClick={clearHistory}
                className="p-2.5 border border-[#e5e2db] bg-[#f6f3ec] hover:bg-[#ebe8e1] rounded-full text-[#7c766e] hover:text-[#ba1a1a] transition-all group"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* ── EMPTY STATE ── */}
        {history.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-28 border border-dashed border-[#e5e2db] rounded-3xl bg-white"
          >
            <Brain className="w-14 h-14 text-[#8b4e33] mx-auto mb-5" />
            <h2 className="font-['Outfit'] text-2xl font-semibold text-[#1c1c18] tracking-tight mb-2">No History Yet</h2>
            <p className="text-[#4b463f] text-sm mb-6">Complete your first assessment to start tracking your progress.</p>
            <button
              onClick={() => navigate('/assessment')}
              className="px-8 py-3 bg-[#33302b] hover:bg-[#1c1c18] text-[#fcf9f2] rounded-full font-semibold uppercase tracking-wider text-xs shadow-sm transition-all"
            >
              Start First Assessment
            </button>
          </motion.div>
        )}

        {history.length > 0 && (
          <>
            {/* ── LATEST RESULT BANNER ── */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-8 rounded-3xl border border-[#e5e2db] bg-white shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-6"
            >
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wider text-[#8b4e33] mb-1">Latest Result</p>
                <h2 className="font-['Outfit'] text-3xl font-semibold text-[#1c1c18] tracking-tight">
                  {latest.result.prediction}
                </h2>
                <p className="text-xs text-[#4b463f] font-medium mt-1">
                  {Math.round(latest.result.confidence * 100)}% confidence · {latest.result.severity} severity ·{' '}
                  {new Date(latest.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                </p>
              </div>
              <div className="flex flex-col gap-1 text-right">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-[#7c766e]">Total Assessments</p>
                <span className="font-['Outfit'] text-4xl font-light text-[#33302b]">{history.length}</span>
              </div>
            </motion.div>

            {/* ── TREND METRICS ── */}
            {chartData.length >= 2 && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { key: 'Risk', label: 'ADHD Risk', icon: <Brain className="w-4 h-4" />, invertColor: true },
                  { key: 'Focus', label: 'Focus (inv.)', icon: <Target className="w-4 h-4" />, invertColor: false },
                  { key: 'Stress', label: 'Stress', icon: <Zap className="w-4 h-4" />, invertColor: true },
                  { key: 'Sleep', label: 'Sleep', icon: <Moon className="w-4 h-4" />, invertColor: false },
                ].map(({ key, label, icon, invertColor }) => {
                  const trend = getTrend(key);
                  const effective = invertColor
                    ? (trend === 'improved' ? 'improved' : trend === 'worsened' ? 'worsened' : 'neutral')
                    : (trend === 'improved' ? 'worsened' : trend === 'worsened' ? 'improved' : 'neutral');
                  return (
                    <div key={key} className="p-5 rounded-2xl border border-[#e5e2db] bg-white shadow-sm flex flex-col gap-3">
                      <div className="flex items-center justify-between">
                        <span className="text-[#8b4e33]">{icon}</span>
                        <TrendIcon trend={effective} />
                      </div>
                      <div>
                        <p className="text-[10px] font-semibold uppercase tracking-wider text-[#7c766e]">{label}</p>
                        <p className="font-['Outfit'] text-2xl font-semibold text-[#1c1c18]">{chartData[chartData.length - 1][key]}%</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* ── TREND CHART ── */}
            {chartData.length >= 2 ? (
              <div className="p-8 rounded-3xl border border-[#e5e2db] bg-white shadow-sm">
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-wider text-[#8b4e33]">Over Time</p>
                    <h3 className="font-['Outfit'] text-2xl font-semibold text-[#1c1c18] tracking-tight">Behavioral Trends</h3>
                  </div>
                  <Activity className="w-5 h-5 text-[#8b4e33]" />
                </div>
                <div className="w-full h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData}>
                      <CartesianGrid stroke="#ebe8e1" strokeDasharray="4 4" />
                      <XAxis dataKey="date" tick={{ fill: '#7c766e', fontSize: 10, fontWeight: 600 }} tickLine={false} axisLine={false} />
                      <YAxis domain={[0, 100]} tick={{ fill: '#7c766e', fontSize: 10 }} tickLine={false} axisLine={false} tickFormatter={v => `${v}%`} />
                      <Tooltip content={<CustomTooltip />} />
                      <Legend wrapperStyle={{ fontSize: 10, fontWeight: 600, textTransform: 'uppercase', paddingTop: 16 }} />
                      <ReferenceLine y={50} stroke="#e5e2db" strokeDasharray="4 4" />
                      <Line type="monotone" dataKey="Risk" stroke="#8b4e33" strokeWidth={2.5} dot={{ r: 4, fill: '#8b4e33', strokeWidth: 0 }} activeDot={{ r: 6 }} />
                      <Line type="monotone" dataKey="Focus" stroke="#33302b" strokeWidth={2.5} dot={{ r: 4, fill: '#33302b', strokeWidth: 0 }} activeDot={{ r: 6 }} />
                      <Line type="monotone" dataKey="Stress" stroke="#feae8c" strokeWidth={2.5} dot={{ r: 4, fill: '#feae8c', strokeWidth: 0 }} activeDot={{ r: 6 }} />
                      <Line type="monotone" dataKey="Sleep" stroke="#7c766e" strokeWidth={2.5} dot={{ r: 4, fill: '#7c766e', strokeWidth: 0 }} activeDot={{ r: 6 }} strokeDasharray="5 3" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            ) : (
              <div className="p-8 rounded-[2rem] border border-dashed border-indigo-100 bg-indigo-50/50/40 text-center text-sm text-slate-600 font-semibold">
                Complete at least 2 assessments to see trend charts.
              </div>
            )}

            {/* ── HISTORY LOG ── */}
            <div>
              <div className="flex items-center gap-3 mb-6">
                <ClipboardList className="w-5 h-5 text-indigo-600" />
                <h3 className="text-xl font-black text-slate-900 uppercase tracking-tighter">Assessment History</h3>
              </div>
              <div className="space-y-4">
                {[...history].reverse().map((entry, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.04 }}
                    className="p-6 rounded-3xl border border-slate-200 bg-white hover:border-amber-300 hover:shadow-md transition-all group flex flex-col sm:flex-row sm:items-center justify-between gap-6"
                  >
                    <div className="flex items-center gap-5">
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-xs uppercase border ${severityBg(entry.result.severity)} ${severityColor(entry.result.severity)}`}>
                        {entry.result.severity?.charAt(0)}
                      </div>
                      <div>
                        <p className="font-black text-slate-900 text-lg tracking-tight">
                          {entry.result.prediction}
                        </p>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-0.5">
                          {new Date(entry.date).toLocaleString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-6 flex-wrap">
                      <Stat label="Confidence" value={`${Math.round(entry.result.confidence * 100)}%`} />
                      <Stat label="Sleep" value={`${entry.inputData.sleep_hours}h`} />
                      <Stat label="Focus" value={entry.inputData.focus_level} />
                      <Stat label="Stress" value={entry.inputData.stress_level} />
                      <button
                        onClick={() => navigate('/result', { state: { result: entry.result, inputData: entry.inputData } })}
                        className="px-5 py-2 text-[10px] font-black uppercase tracking-widest border border-indigo-100 rounded-xl text-indigo-600 hover:bg-indigo-600 hover:text-white transition-all"
                      >
                        View
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </motion.div>
  );
};

const Stat = ({ label, value }) => (
  <div className="text-center">
    <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">{label}</p>
    <p className="font-black text-slate-900 text-sm">{value}</p>
  </div>
);

export default ProgressPage;

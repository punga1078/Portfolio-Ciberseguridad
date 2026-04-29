import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Activity, ShieldCheck, Target, Clock, TerminalSquare } from 'lucide-react';

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/api/dashboard`, {
          credentials: 'include',
        });
        if (res.ok) {
          const json = await res.json();
          setData(json);
        }
      } catch (error) {
        console.error("Error al cargar datos del dashboard", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  const metrics = data?.metrics || {};
  const activities = data?.recent_activity || [];

  const statCards = [
    { title: "Alertas Activas", value: metrics.active_alerts, icon: Activity, color: "text-red-400", bg: "bg-red-400/10" },
    { title: "Sistemas Asegurados", value: metrics.secured_systems, icon: ShieldCheck, color: "text-emerald-400", bg: "bg-emerald-400/10" },
    { title: "CTFs Resueltos", value: metrics.resolved_ctfs, icon: Target, color: "text-blue-400", bg: "bg-blue-400/10" },
    { title: "Uptime (Días)", value: metrics.uptime_days, icon: Clock, color: "text-purple-400", bg: "bg-purple-400/10" },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, idx) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: idx * 0.1 }}
            className="bg-slate-900/50 backdrop-blur-md border border-slate-800 p-6 rounded-2xl flex items-center gap-4"
          >
            <div className={`p-4 rounded-xl ${stat.bg}`}>
              <stat.icon className={`w-6 h-6 ${stat.color}`} />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-400">{stat.title}</p>
              <h3 className="text-2xl font-bold text-white mt-1">{stat.value}</h3>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Terminal / Activity Log */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="bg-slate-900/50 backdrop-blur-md border border-slate-800 rounded-2xl overflow-hidden"
      >
        <div className="bg-slate-950 px-6 py-4 border-b border-slate-800 flex items-center gap-3">
          <TerminalSquare className="w-5 h-5 text-slate-400" />
          <h3 className="text-lg font-semibold text-white">Registro de Actividad (SOC)</h3>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            {activities.map((act) => (
              <div key={act.id} className="flex items-start gap-4 p-4 rounded-lg bg-slate-950/50 border border-slate-800/50">
                <div className="mt-1">
                  {act.type.includes('SUCCESS') && <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]" />}
                  {act.type.includes('SCAN') && <div className="w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.8)]" />}
                  {act.type.includes('ALERT') && <div className="w-2 h-2 rounded-full bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.8)]" />}
                </div>
                <div className="flex-1">
                  <p className="text-sm text-slate-300 font-mono">{act.message}</p>
                  <p className="text-xs text-slate-500 mt-1">{act.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  );
}

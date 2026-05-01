import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Activity, ShieldCheck, Target, Clock, TerminalSquare, Globe, AlertTriangle, Download, Zap } from 'lucide-react';

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
    
    // 📡 CONEXIÓN WEBSOCKET PARA TIEMPO REAL
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const host = window.location.host;
    const wsUrl = `${protocol}//${host}/ws/threat-map`;
    
    const socket = new WebSocket(wsUrl);

    socket.onmessage = (event) => {
      const msg = JSON.parse(event.data);
      if (msg.type === 'NEW_ATTACK') {
        setData(prev => {
          if (!prev) return prev;
          
          // Actualizar métricas
          const newMetrics = {
            ...prev.metrics,
            active_alerts: prev.metrics.active_alerts + 1
          };

          // Actualizar lista de actividad
          const newActivity = [
            {
              id: Date.now(),
              type: 'ALERT_HONEYPOT',
              message: `¡INTRUSIÓN EN VIVO! ${msg.data.path} desde ${msg.data.ip} (${msg.data.country})`,
              time: 'Justo ahora'
            },
            ...prev.recent_activity
          ].slice(0, 10);

          // Actualizar estadísticas de países (simplificado)
          const newStats = [...prev.honeypot_stats];
          const countryIdx = newStats.findIndex(s => s[0] === msg.data.country);
          if (countryIdx > -1) {
            newStats[countryIdx] = [msg.data.country, newStats[countryIdx][1] + 1];
          } else {
            newStats.push([msg.data.country, 1]);
          }

          return {
            ...prev,
            metrics: newMetrics,
            recent_activity: newActivity,
            honeypot_stats: newStats.sort((a, b) => b[1] - a[1])
          };
        });
      }
    };

    socket.onclose = () => console.log("WebSocket desconectado. Reintentando...");

    return () => socket.close();
  }, []);

  const handleExport = () => {
    window.open(`${import.meta.env.VITE_API_URL}/api/honeypot/export`, '_blank');
  };

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  const metrics = data?.metrics || {};
  const activities = data?.recent_activity || [];
  const honeypot_stats = data?.honeypot_stats || [];

  const statCards = [
    { title: "Intrusiones Detectadas", value: metrics.active_alerts, icon: AlertTriangle, color: "text-red-400", bg: "bg-red-400/10" },
    { title: "IPs Únicas (Blocklist)", value: metrics.secured_systems, icon: ShieldCheck, color: "text-emerald-400", bg: "bg-emerald-400/10" },
    { title: "Investigaciones", value: metrics.resolved_ctfs, icon: Target, color: "text-blue-400", bg: "bg-blue-400/10" },
    { title: "Comentarios", value: metrics.uptime_days, icon: Clock, color: "text-purple-400", bg: "bg-purple-400/10" },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, idx) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: idx * 0.1 }}
            className="bg-slate-900/50 backdrop-blur-md border border-slate-800 p-6 rounded-2xl flex items-center gap-4 group hover:border-slate-700 transition-all shadow-lg"
          >
            <div className={`p-4 rounded-xl ${stat.bg} group-hover:scale-110 transition-transform`}>
              <stat.icon className={`w-6 h-6 ${stat.color}`} />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-400">{stat.title}</p>
              <h3 className="text-2xl font-bold text-white mt-1">{stat.value}</h3>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Terminal / Activity Log */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="lg:col-span-2 bg-slate-900/50 backdrop-blur-md border border-slate-800 rounded-2xl overflow-hidden shadow-xl"
        >
          <div className="bg-slate-950 px-6 py-4 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <TerminalSquare className="w-5 h-5 text-emerald-400" />
              <h3 className="text-lg font-semibold text-white">Live Intrusion Feed (SOC)</h3>
            </div>
            <div className="flex gap-1.5">
              <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              <div className="w-2 h-2 rounded-full bg-slate-700" />
              <div className="w-2 h-2 rounded-full bg-slate-700" />
            </div>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {activities.length === 0 ? (
                <p className="text-center text-slate-600 py-10 italic">No se han detectado intentos de intrusión recientemente.</p>
              ) : (
                activities.map((act) => (
                  <div key={act.id} className="flex items-start gap-4 p-4 rounded-lg bg-slate-950/50 border border-slate-800/50 hover:border-red-500/30 transition-all group">
                    <div className="mt-1">
                      {act.type === 'ALERT_HONEYPOT' && <div className="w-2 h-2 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.8)] animate-pulse" />}
                      {act.type === 'SCAN_COMPLETE' && <div className="w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.8)]" />}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-slate-300 font-mono group-hover:text-white transition-colors">{act.message}</p>
                      <p className="text-xs text-slate-500 mt-1 uppercase tracking-tighter">{act.time}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </motion.div>

        {/* Global Threat Map (Simplified Heatmap) */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-slate-900/50 backdrop-blur-md border border-slate-800 rounded-2xl overflow-hidden shadow-xl"
        >
          <div className="bg-slate-950 px-6 py-4 border-b border-slate-800 flex items-center gap-3">
            <Globe className="w-5 h-5 text-blue-400" />
            <h3 className="text-lg font-semibold text-white">Mapa de Amenazas</h3>
          </div>
          <div className="p-6">
            <div className="space-y-6">
              {honeypot_stats.length === 0 ? (
                <div className="py-12 text-center text-slate-600">
                  <Globe className="w-12 h-12 mx-auto mb-4 opacity-20" />
                  <p>Esperando telemetría global...</p>
                </div>
              ) : (
                honeypot_stats.map(([country, count], idx) => (
                  <div key={country} className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-300 font-medium">{country}</span>
                      <span className="text-red-400 font-bold">{count} attks</span>
                    </div>
                    <div className="w-full bg-slate-950 rounded-full h-1.5 overflow-hidden border border-slate-800">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.min((count / metrics.active_alerts) * 100, 100)}%` }}
                        className="bg-gradient-to-r from-red-600 to-amber-500 h-full shadow-[0_0_10px_rgba(220,38,38,0.5)]"
                      />
                    </div>
                  </div>
                ))
              )}
            </div>
            
            <div className="mt-8 p-4 bg-red-500/5 border border-red-500/10 rounded-xl">
              <p className="text-[10px] text-slate-500 uppercase tracking-widest text-center leading-tight">
                Telemetría en tiempo real capturada vía Honeypot traps. <br />
                Logs persistidos en Loki & Database.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

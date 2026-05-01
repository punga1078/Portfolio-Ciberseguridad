import { useState, useEffect } from 'react';
import { ComposableMap, Geographies, Geography, Marker, ZoomableGroup } from 'react-simple-maps';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Globe, Zap, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

const geoUrl = "https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world.geojson";

export default function ThreatMap() {
  const [attacks, setAttacks] = useState([]);
  const [stats, setStats] = useState({ total: 0, latestCountry: 'N/A' });

  useEffect(() => {
    // 1. Cargar historial inicial
    const fetchHistory = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/api/honeypot/history`);
        if (res.ok) {
          const data = await res.json();
          const mapped = data.map(e => ({
            id: e.id,
            ip: e.ip,
            path: e.path,
            country: e.country,
            lat: e.lat || 0,
            lon: e.lon || 0,
            time: 'Hace poco'
          }));
          setAttacks(mapped);
          setStats({
            total: mapped.length > 0 ? mapped.length : 0,
            latestCountry: mapped.length > 0 ? mapped[0].country : 'N/A'
          });
        }
      } catch (err) {
        console.error("Error cargando historial", err);
      }
    };
    fetchHistory();

    // 2. Conectar WebSocket
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const host = window.location.host;
    const wsUrl = `${protocol}//${host}/ws/threat-map`;
    
    const socket = new WebSocket(wsUrl);

    socket.onmessage = (event) => {
      const msg = JSON.parse(event.data);
      if (msg.type === 'NEW_ATTACK') {
        setAttacks(prev => [{ ...msg.data, id: Date.now() }, ...prev].slice(0, 20));
        setStats(prev => ({
          total: prev.total + 1,
          latestCountry: msg.data.country
        }));
      }
    };

    return () => socket.close();
  }, []);

  return (
    <div className="fixed inset-0 bg-[#020617] text-slate-200 overflow-hidden select-none">
      {/* HUD de Seguridad */}
      <div className="absolute top-6 left-6 z-30 space-y-4">
        <Link to="/" className="flex items-center gap-3 bg-slate-900/90 backdrop-blur-xl border border-slate-800 p-4 rounded-2xl hover:border-emerald-500/50 transition-all group shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
          <Shield className="w-8 h-8 text-emerald-400 group-hover:scale-110 transition-transform" />
          <div>
            <h1 className="font-bold text-white tracking-wider uppercase text-sm">SecOps Global</h1>
            <p className="text-[10px] text-emerald-500 font-mono animate-pulse">● LIVE THREAT TELEMETRY</p>
          </div>
        </Link>

        <div className="bg-slate-900/90 backdrop-blur-xl border border-slate-800 p-6 rounded-2xl space-y-4 w-64 shadow-2xl">
          <div className="flex justify-between items-end border-b border-slate-800 pb-2">
            <span className="text-[10px] uppercase text-slate-500 font-bold tracking-widest">Total Attacks</span>
            <span className="text-2xl font-black text-red-500 font-mono tracking-tighter">{stats.total.toLocaleString()}</span>
          </div>
          <div className="flex justify-between items-end">
            <span className="text-[10px] uppercase text-slate-500 font-bold tracking-widest">Last Origin</span>
            <span className="text-xs font-bold text-white uppercase truncate ml-4">{stats.latestCountry}</span>
          </div>
        </div>
      </div>

      {/* Registro Lateral de Ataques */}
      <div className="absolute top-6 right-6 z-30 w-72 bottom-20 hidden lg:block overflow-hidden">
        <div className="bg-slate-900/90 backdrop-blur-xl border border-slate-800 rounded-2xl h-full flex flex-col shadow-2xl overflow-hidden">
          <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/50">
            <span className="text-xs font-bold uppercase tracking-widest text-slate-400 flex items-center gap-2">
              <Zap className="w-3 h-3 text-amber-500" /> Live Feed
            </span>
            <div className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-3 font-mono">
            <AnimatePresence>
              {attacks.map((attack) => (
                <motion.div
                  key={attack.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0 }}
                  className="text-[10px] p-2 bg-slate-950/50 border-l-2 border-red-500 rounded-r-md"
                >
                  <div className="text-red-400 font-bold">INTRUSION DETECTED</div>
                  <div className="text-slate-400 mt-1">SRC: {attack.ip}</div>
                  <div className="text-slate-300 font-bold mt-1 uppercase">GEO: {attack.country}</div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* MAPA MUNDIAL */}
      <div className="w-full h-full cursor-grab active:cursor-grabbing bg-[#020617]">
        <ComposableMap
          projectionConfig={{ scale: 160 }}
          style={{ width: "100%", height: "100%" }}
        >
          <ZoomableGroup 
            zoom={1} 
            maxZoom={5}
            translateExtent={[
              [-100, -100],
              [900, 500],
            ]}
          >
            <Geographies geography={geoUrl}>
              {({ geographies }) => {
                if (geographies.length === 0) return (
                  <text x="400" y="200" fill="#ef4444" textAnchor="middle">
                    ERROR: No se pudo cargar el mapa mundi. Revisa la consola.
                  </text>
                );
                return geographies.map((geo) => (
                  <Geography
                    key={geo.rsmKey}
                    geography={geo}
                    fill="#1e293b"
                    stroke="#059669"
                    strokeWidth={0.8}
                    style={{
                      default: { outline: "none" },
                      hover: { fill: "#334155", outline: "none" },
                      pressed: { outline: "none" }
                    }}
                  />
                ));
              }}
            </Geographies>
            
            <AnimatePresence>
              {attacks.map((attack) => (
                (attack.lat !== 0 && attack.lon !== 0) && (
                  <Marker key={attack.id} coordinates={[attack.lon, attack.lat]}>
                    <motion.g
                      initial={{ opacity: 0, scale: 0 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0 }}
                    >
                      <circle r={10} fill="rgba(239, 68, 68, 0.4)" className="animate-ping" />
                      <circle r={3} fill="#ef4444" className="shadow-[0_0_15px_#ef4444]" />
                      
                      {attacks[0]?.id === attack.id && (
                        <motion.text
                          initial={{ opacity: 0, y: 15 }}
                          animate={{ opacity: 1, y: -12 }}
                          textAnchor="middle"
                          style={{ fontSize: "10px", fill: "#fff", fontWeight: "black", textTransform: "uppercase", pointerEvents: "none", textShadow: "0 0 5px #000" }}
                        >
                          {attack.country}
                        </motion.text>
                      )}
                    </motion.g>
                  </Marker>
                )
              ))}
            </AnimatePresence>
          </ZoomableGroup>
        </ComposableMap>
      </div>

      {/* Footer / Info */}
      <div className="absolute bottom-6 left-6 z-30 flex gap-8 text-[10px] font-mono text-slate-500 uppercase tracking-widest bg-slate-900/80 backdrop-blur-xl px-6 py-3 rounded-2xl border border-slate-800 shadow-2xl">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-red-500 shadow-[0_0_10px_#ef4444]" /> Active Exploits
        </div>
        <div className="hidden sm:block text-emerald-500/50">SYSTEMS MONITORING: ACTIVE</div>
      </div>
    </div>
  );
}

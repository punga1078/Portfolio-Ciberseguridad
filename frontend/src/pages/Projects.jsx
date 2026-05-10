import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Code, Terminal, Shield, Search, LogOut, LayoutDashboard, Globe } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useAuth } from '../context/AuthContext';

export default function Projects() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const fetchProjects = async (query = '') => {
    setLoading(true);
    try {
      const url = query ? `/api/projects?q=${encodeURIComponent(query)}` : '/api/projects';
      const res = await fetch(`${import.meta.env.VITE_API_URL}${url}`);
      if (res.ok) {
        const data = await res.json();
        setProjects(data);
      }
    } catch (error) {
      console.error("Error al obtener los proyectos:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchProjects(searchQuery);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 relative overflow-hidden">
      <Helmet>
        <title>Investigaciones & Writeups | Facundo Cáceres</title>
        <meta name="description" content="Archivo público de vulnerabilidades analizadas, resoluciones de CTFs y herramientas de ciberseguridad desarrolladas." />
        <meta property="og:title" content="Investigaciones & Writeups | Security Portfolio" />
      </Helmet>

      {/* Elementos decorativos */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-600/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-600/10 rounded-full blur-[100px] pointer-events-none" />

      {/* Header Público */}
      <header className="h-16 border-b border-slate-800 bg-slate-900/50 backdrop-blur-md flex items-center justify-between px-8 z-10 relative">
        <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
          <Shield className="w-6 h-6 text-slate-100" />
          <span className="font-bold text-lg text-white">Portfolio</span>
        </Link>
        <nav className="flex items-center gap-6">
          <Link to="/" className="text-sm font-medium text-slate-400 hover:text-white transition-colors">
            Sobre Mí
          </Link>
          <Link to="/threat-map" className="text-sm font-medium text-emerald-400 hover:text-emerald-300 transition-colors flex items-center gap-2">
            <Globe className="w-4 h-4" />
            Threat Map
          </Link>
          
          {user ? (
            <div className="flex items-center gap-4">
              {user.rol === 'admin' && (
                <Link to="/dashboard" className="flex items-center gap-2 text-sm font-medium text-emerald-400 hover:text-emerald-300 transition-colors">
                  <LayoutDashboard className="w-4 h-4" />
                  Dashboard
                </Link>
              )}
              <button 
                onClick={handleLogout}
                className="flex items-center gap-2 text-sm font-medium text-slate-400 hover:text-red-400 transition-colors border border-slate-800 px-4 py-1.5 rounded-md hover:bg-red-500/5"
              >
                <LogOut className="w-4 h-4" />
                Salir
              </button>
            </div>
          ) : (
            <Link to="/login" className="text-sm font-medium text-slate-400 hover:text-white transition-colors border border-slate-800 px-4 py-1.5 rounded-md hover:bg-slate-800/50">
              Login
            </Link>
          )}
        </nav>
      </header>

      {/* Contenido Principal */}
      <main className="max-w-5xl mx-auto py-12 px-6 z-10 relative">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-10"
        >
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 tracking-tight">Investigaciones y <span className="text-emerald-400">Writeups</span></h1>
          <p className="text-slate-400 max-w-2xl mx-auto">
            Archivo público de vulnerabilidades analizadas, resoluciones de CTFs y herramientas de ciberseguridad desarrolladas.
          </p>
        </motion.div>

        <form onSubmit={handleSearch} className="max-w-2xl mx-auto mb-12 flex flex-col sm:flex-row gap-3">
          <input 
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar por tecnología, CVE, vulnerabilidad o herramienta..."
            className="flex-1 bg-slate-900/50 backdrop-blur-sm border border-slate-700 rounded-xl px-5 py-3 text-white focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 outline-none transition-all placeholder-slate-500"
          />
          <button type="submit" className="bg-emerald-600 hover:bg-emerald-500 text-white px-8 py-3 rounded-xl font-medium transition-colors flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20">
            <Search className="w-5 h-5" />
            Buscar
          </button>
        </form>

        {loading ? (
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
          </div>
        ) : projects.length === 0 ? (
          <div className="text-center py-12 bg-slate-900/30 rounded-2xl border border-slate-800">
            <Terminal className="w-12 h-12 text-slate-500 mx-auto mb-3" />
            <p className="text-slate-400">El repositorio de investigaciones está vacío actualmente.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {projects.map((project, idx) => (
              <motion.div
                key={project.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: idx * 0.1 }}
                className="bg-slate-900/50 backdrop-blur-md border border-slate-800 rounded-2xl p-6 hover:border-emerald-500/30 hover:bg-slate-800/50 transition-all group"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className={`p-2 rounded-lg ${project.project_type === 'writeup' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-blue-500/10 text-blue-400'}`}>
                    {project.project_type === 'writeup' ? <BookOpen className="w-5 h-5" /> : <Code className="w-5 h-5" />}
                  </div>
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                    {project.project_type}
                  </span>
                </div>
                
                <h3 className="text-xl font-bold text-white mb-2 group-hover:text-emerald-300 transition-colors">
                  {project.title}
                </h3>
                
                <div className="text-slate-400 text-sm line-clamp-3 mb-4">
                  {project.content}
                </div>
                
                {project.tags && project.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-6">
                    {project.tags.map((tag, i) => (
                      <span key={i} className="text-xs px-2 py-1 bg-slate-800/50 text-slate-300 rounded border border-slate-700/50">
                        #{tag.name}
                      </span>
                    ))}
                  </div>
                )}
                
                <Link to={`/projects/${project.slug}`} className="text-sm font-medium text-emerald-400 hover:text-emerald-300 flex items-center gap-1 transition-colors mt-auto pt-2">
                  Leer reporte completo →
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

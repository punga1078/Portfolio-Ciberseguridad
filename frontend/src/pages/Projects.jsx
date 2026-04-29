import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Code, Terminal, Shield } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Projects() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/api/projects`);
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

    fetchProjects();
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 relative overflow-hidden">
      {/* Elementos decorativos */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-600/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-600/10 rounded-full blur-[100px] pointer-events-none" />

      {/* Header Público */}
      <header className="h-16 border-b border-slate-800 bg-slate-900/50 backdrop-blur-md flex items-center justify-between px-8 z-10 relative">
        <div className="flex items-center gap-2">
          <Shield className="w-6 h-6 text-emerald-400" />
          <span className="font-bold text-lg text-white">Security Portfolio</span>
        </div>
        <nav className="flex items-center gap-4">
          <Link to="/login" className="text-sm font-medium text-slate-400 hover:text-white transition-colors">
            Acceso Autorizado
          </Link>
        </nav>
      </header>

      {/* Contenido Principal */}
      <main className="max-w-5xl mx-auto py-12 px-6 z-10 relative">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 tracking-tight">Investigaciones y <span className="text-emerald-400">Writeups</span></h1>
          <p className="text-slate-400 max-w-2xl mx-auto">
            Archivo público de vulnerabilidades analizadas, resoluciones de CTFs y herramientas de ciberseguridad desarrolladas.
          </p>
        </motion.div>

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
                
                <div className="text-slate-400 text-sm line-clamp-3 mb-6">
                  {project.content}
                </div>
                
                <Link to={`/projects/${project.id}`} className="text-sm font-medium text-emerald-400 hover:text-emerald-300 flex items-center gap-1 transition-colors">
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

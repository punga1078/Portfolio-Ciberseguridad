import { useState } from 'react';
import { motion } from 'framer-motion';
import { FileText, Save, ShieldAlert } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function DashboardProjects() {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [type, setType] = useState('writeup');
  const [message, setMessage] = useState(null);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/projects`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ title, content, project_type: type })
      });

      if (res.ok) {
        setMessage({ type: 'success', text: 'Publicación creada exitosamente.' });
        setTitle('');
        setContent('');
      } else {
        const errorData = await res.json();
        setMessage({ type: 'error', text: errorData.detail || 'Error al crear la publicación.' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Error de conexión con el servidor.' });
    } finally {
      setLoading(false);
    }
  };

  if (user?.rol !== 'Administrador Security') {
    return (
      <div className="p-8 text-center text-red-400">
        <ShieldAlert className="w-12 h-12 mx-auto mb-4" />
        <h2 className="text-xl font-bold">Acceso Denegado</h2>
        <p>Solo los administradores pueden redactar nuevas publicaciones.</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-slate-900/50 backdrop-blur-md border border-slate-800 rounded-2xl p-8"
      >
        <div className="flex items-center gap-3 mb-8">
          <div className="p-3 bg-emerald-500/10 rounded-xl">
            <FileText className="w-6 h-6 text-emerald-400" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">Nueva Publicación</h2>
            <p className="text-slate-400 text-sm">Redacta un nuevo Writeup o Proyecto para tu Portfolio.</p>
          </div>
        </div>

        {message && (
          <div className={`p-4 rounded-lg mb-6 text-sm flex items-center gap-2 ${message.type === 'success' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}>
            {message.type === 'error' && <ShieldAlert className="w-5 h-5" />}
            {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-300 mb-2">Título de la Investigación</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                className="w-full bg-slate-950/50 border border-slate-700 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 outline-none transition-all"
                placeholder="Ej: Análisis de Vulnerabilidad CVE-2024-XXXX"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Tipo</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="w-full bg-slate-950/50 border border-slate-700 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 outline-none transition-all"
              >
                <option value="writeup">Writeup / Auditoría</option>
                <option value="code">Código / Herramienta</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Contenido (Soporta Markdown)</label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              required
              rows={10}
              className="w-full bg-slate-950/50 border border-slate-700 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 outline-none transition-all font-mono text-sm"
              placeholder="# Introducción&#10;En esta auditoría descubrimos..."
            ></textarea>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="flex items-center justify-center gap-2 w-full py-3 bg-emerald-600/80 hover:bg-emerald-500 text-white rounded-lg font-semibold shadow-lg shadow-emerald-500/20 transition-all disabled:opacity-50"
          >
            <Save className="w-5 h-5" />
            {loading ? 'Publicando...' : 'Publicar en el Portfolio'}
          </button>
        </form>
      </motion.div>
    </div>
  );
}

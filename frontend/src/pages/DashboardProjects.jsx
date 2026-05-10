import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FileText, Save, ShieldAlert, Trash2, Plus, List } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function DashboardProjects() {
  const [projects, setProjects] = useState([]);
  const [view, setView] = useState('list'); // 'list' o 'create'
  
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [type, setType] = useState('writeup');
  const [githubUrl, setGithubUrl] = useState('');
  const [tagsInput, setTagsInput] = useState('');
  const [message, setMessage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [editSlug, setEditSlug] = useState(null);
  const { user } = useAuth();

  useEffect(() => {
    if (view === 'list') {
      fetchProjects();
    }
  }, [view]);

  const fetchProjects = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/projects`);
      if (res.ok) {
        const data = await res.json();
        setProjects(data);
      }
    } catch (error) {
      console.error("Error al obtener los proyectos:", error);
    }
  };

  const handleDelete = async (slug) => {
    if (!window.confirm("¿Estás seguro de que deseas eliminar esta investigación de forma permanente?")) return;
    
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/projects/${slug}`, {
        method: 'DELETE',
        credentials: 'include'
      });

      if (res.ok) {
        setProjects(projects.filter(p => p.slug !== slug));
      } else {
        alert("Error al eliminar el proyecto");
      }
    } catch (error) {
      console.error("Error en la petición DELETE", error);
    }
  };

  const handleEditClick = (project) => {
    setTitle(project.title);
    setContent(project.content);
    setType(project.project_type);
    setGithubUrl(project.github_url || '');
    setTagsInput(project.tags ? project.tags.map(t => t.name).join(', ') : '');
    setEditSlug(project.slug);
    setView('create');
    setMessage(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const url = editSlug 
        ? `${import.meta.env.VITE_API_URL}/api/projects/${editSlug}`
        : `${import.meta.env.VITE_API_URL}/api/projects`;
      const method = editSlug ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ 
          title, 
          content, 
          project_type: type,
          github_url: githubUrl || null,
          tags: tagsInput.split(',').map(t => t.trim()).filter(t => t)
        })
      });

      if (res.ok) {
        setMessage({ type: 'success', text: editSlug ? 'Publicación actualizada exitosamente.' : 'Publicación creada exitosamente.' });
        setTitle('');
        setContent('');
        setGithubUrl('');
        setTagsInput('');
        setEditSlug(null);
        setTimeout(() => {
          setView('list');
          fetchProjects(); // Recargar proyectos para reflejar cambios
        }, 1500);
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

  if (user?.rol !== 'admin') {
    return (
      <div className="p-8 text-center text-red-400">
        <ShieldAlert className="w-12 h-12 mx-auto mb-4" />
        <h2 className="text-xl font-bold">Acceso Denegado</h2>
        <p>Solo los administradores pueden gestionar las publicaciones.</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      
      {/* Controles de Vista */}
      <div className="flex items-center gap-4 border-b border-slate-800 pb-4">
        <button 
          onClick={() => setView('list')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${view === 'list' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-slate-200'}`}
        >
          <List className="w-4 h-4" /> Mis Investigaciones
        </button>
        <button 
          onClick={() => { 
            setView('create'); 
            setMessage(null); 
            setEditSlug(null);
            setTitle('');
            setContent('');
            setTagsInput('');
            setGithubUrl('');
          }}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${view === 'create' ? 'bg-emerald-600/20 text-emerald-400 border border-emerald-500/30' : 'text-slate-400 hover:text-slate-200'}`}
        >
          <Plus className="w-4 h-4" /> Redactar Nuevo
        </button>
      </div>

      {view === 'list' ? (
        /* VISTA: LISTA DE PROYECTOS */
        <motion.div 
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
          className="bg-slate-900/50 backdrop-blur-md border border-slate-800 rounded-2xl overflow-hidden"
        >
          <div className="p-6 border-b border-slate-800 bg-slate-950">
            <h2 className="text-xl font-bold text-white">Inventario de Proyectos</h2>
          </div>
          
          <div className="divide-y divide-slate-800">
            {projects.length === 0 ? (
              <div className="p-12 text-center text-slate-500">
                No tienes publicaciones registradas en la base de datos.
              </div>
            ) : (
              projects.map(project => (
                <div key={project.id} className="p-6 flex items-center justify-between hover:bg-slate-800/30 transition-colors">
                  <div>
                    <h3 className="text-lg font-semibold text-slate-200">{project.title}</h3>
                    <div className="flex items-center gap-3 mt-2">
                      <span className={`text-xs px-2 py-1 rounded font-bold uppercase ${project.project_type === 'writeup' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-blue-500/10 text-blue-400'}`}>
                        {project.project_type}
                      </span>
                      <span className="text-xs text-slate-500">/{project.slug}</span>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <button 
                      onClick={() => handleEditClick(project)}
                      className="p-3 text-slate-400 hover:text-emerald-400 hover:bg-emerald-500/10 rounded-lg transition-all"
                      title="Editar registro"
                    >
                      <FileText className="w-5 h-5" />
                    </button>
                    <button 
                      onClick={() => handleDelete(project.slug)}
                      className="p-3 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all"
                      title="Eliminar registro"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </motion.div>
      ) : (
        /* VISTA: CREAR PROYECTO */
        <motion.div 
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
          className="bg-slate-900/50 backdrop-blur-md border border-slate-800 rounded-2xl p-8"
        >
          <div className="flex items-center gap-3 mb-8">
            <div className="p-3 bg-emerald-500/10 rounded-xl">
              <FileText className="w-6 h-6 text-emerald-400" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">{editSlug ? 'Editar Operación' : 'Redactar Operación'}</h2>
              <p className="text-slate-400 text-sm">{editSlug ? 'Modifica los detalles de la auditoría o herramienta.' : 'Registra una nueva auditoría o herramienta.'}</p>
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
                <label className="block text-sm font-medium text-slate-300 mb-2">Nombre Clave (Título)</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  className="w-full bg-slate-950/50 border border-slate-700 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 outline-none transition-all"
                  placeholder="Ej: Análisis CVE-2024-XXXX"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Clasificación</label>
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
              <label className="block text-sm font-medium text-slate-300 mb-2">URL del Repositorio de GitHub (Opcional)</label>
              <input
                type="url"
                value={githubUrl}
                onChange={(e) => setGithubUrl(e.target.value)}
                className="w-full bg-slate-950/50 border border-slate-700 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 outline-none transition-all"
                placeholder="Ej: https://github.com/usuario/repo"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Etiquetas (separadas por comas)</label>
              <input
                type="text"
                value={tagsInput}
                onChange={(e) => setTagsInput(e.target.value)}
                className="w-full bg-slate-950/50 border border-slate-700 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 outline-none transition-all"
                placeholder="Ej: web, xss, bugbounty"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Cuerpo del Reporte (Soporta Markdown Fuerte)</label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                required
                rows={10}
                className="w-full bg-slate-950/50 border border-slate-700 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 outline-none transition-all font-mono text-sm"
                placeholder="# Resumen Ejecutivo&#10;Se detectó una vulnerabilidad..."
              ></textarea>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="flex items-center justify-center gap-2 w-full py-3 bg-emerald-600/80 hover:bg-emerald-500 text-white rounded-lg font-semibold shadow-lg shadow-emerald-500/20 transition-all disabled:opacity-50"
            >
              <Save className="w-5 h-5" />
              {loading ? 'Subiendo a la base de datos...' : editSlug ? 'Actualizar Registro' : 'Publicar Registro'}
            </button>
          </form>
        </motion.div>
      )}
    </div>
  );
}

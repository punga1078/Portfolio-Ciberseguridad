import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Shield, ArrowLeft, MessageSquare, Send, ShieldAlert, CheckCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import DOMPurify from 'dompurify';
import ReactMarkdown from 'react-markdown';

export default function ProjectDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Comentarios
  const [newComment, setNewComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchProject();
  }, [id]);

  const fetchProject = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/projects/${id}`);
      if (res.ok) {
        const data = await res.json();
        setProject(data);
      }
    } catch (error) {
      console.error("Error al obtener el proyecto", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    
    setSubmitting(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/projects/${id}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ content: newComment })
      });
      
      if (res.ok) {
        const comment = await res.json();
        // Agregar el comentario a la vista sin recargar
        setProject({
          ...project,
          comments: [...project.comments, comment]
        });
        setNewComment('');
      }
    } catch (error) {
      console.error("Error al comentar", error);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-slate-300">
        <ShieldAlert className="w-16 h-16 text-red-500 mb-4" />
        <h2 className="text-2xl font-bold">Proyecto no encontrado</h2>
        <Link to="/projects" className="mt-4 text-emerald-400 hover:text-emerald-300">Volver a la galería</Link>
      </div>
    );
  }

  // 🛡️ SANITIZACIÓN: Limpiamos el markdown antes de renderizarlo para evitar XSS Almacenado
  const safeContent = DOMPurify.sanitize(project.content);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200">
      {/* Header Público */}
      <header className="h-16 border-b border-slate-800 bg-slate-900/50 backdrop-blur-md flex items-center px-8 sticky top-0 z-50">
        <Link to="/projects" className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors">
          <ArrowLeft className="w-5 h-5" />
          <span>Volver</span>
        </Link>
      </header>

      <main className="max-w-4xl mx-auto py-12 px-6">
        <motion.article 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-slate-900/50 backdrop-blur-md border border-slate-800 rounded-3xl p-8 md:p-12 shadow-2xl mb-12"
        >
          <div className="flex items-center gap-3 mb-6">
            <span className="px-3 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full text-xs font-bold uppercase tracking-wider">
              {project.project_type}
            </span>
          </div>
          
          <h1 className="text-3xl md:text-5xl font-bold text-white mb-8">{project.title}</h1>
          
          {/* 🛡️ Renderizado Seguro de Markdown */}
          <div className="prose prose-invert prose-emerald max-w-none">
            <ReactMarkdown>{safeContent}</ReactMarkdown>
          </div>
        </motion.article>

        {/* Sección de Comentarios */}
        <section className="bg-slate-900/30 border border-slate-800 rounded-3xl p-8">
          <h3 className="text-2xl font-bold text-white flex items-center gap-2 mb-8">
            <MessageSquare className="w-6 h-6 text-emerald-400" />
            Comentarios y Discusión
          </h3>

          {/* Formulario de comentario (Requiere sesión) */}
          {user ? (
            <form onSubmit={handleCommentSubmit} className="mb-10">
              <div className="flex items-start gap-4">
                <div className="flex-1">
                  <textarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Aporta a la investigación o haz una pregunta..."
                    className="w-full bg-slate-950/50 border border-slate-700 rounded-xl p-4 text-white placeholder-slate-500 focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 outline-none transition-all"
                    rows="3"
                    required
                  ></textarea>
                </div>
              </div>
              <div className="flex justify-end mt-3">
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-2 rounded-lg font-medium transition-colors disabled:opacity-50"
                >
                  <Send className="w-4 h-4" />
                  {submitting ? 'Publicando...' : 'Comentar'}
                </button>
              </div>
            </form>
          ) : (
            <div className="bg-slate-950/50 border border-slate-800 rounded-xl p-6 text-center mb-10">
              <Shield className="w-8 h-8 text-slate-500 mx-auto mb-3" />
              <p className="text-slate-400 mb-4">Debes estar autenticado para participar en la discusión.</p>
              <Link to="/login" className="inline-block bg-slate-800 hover:bg-slate-700 text-white px-6 py-2 rounded-lg font-medium transition-colors">
                Iniciar Sesión
              </Link>
            </div>
          )}

          {/* Lista de Comentarios */}
          <div className="space-y-6">
            {project.comments.length === 0 ? (
              <p className="text-slate-500 text-center italic">Sé el primero en comentar esta investigación.</p>
            ) : (
              project.comments.map((comment) => (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  key={comment.id} 
                  className="bg-slate-950/80 border border-slate-800/50 rounded-xl p-5"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400 font-bold text-xs border border-emerald-500/30">
                      {comment.author_email.charAt(0).toUpperCase()}
                    </div>
                    <span className="text-sm font-medium text-slate-300">{comment.author_email}</span>
                    {comment.author_email.includes('admin') && (
                      <CheckCircle className="w-4 h-4 text-emerald-400" />
                    )}
                  </div>
                  <p className="text-slate-300 text-sm pl-10 whitespace-pre-wrap">{comment.content}</p>
                </motion.div>
              ))
            )}
          </div>
        </section>
      </main>
    </div>
  );
}

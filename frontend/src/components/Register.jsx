import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ShieldCheck, KeyRound, ArrowRight, Mail, UserPlus } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errorMensaje, setErrorMensaje] = useState('');
  const [successMensaje, setSuccessMensaje] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMensaje('');
    setSuccessMensaje('');
    
    if (password !== confirmPassword) {
      setErrorMensaje('Las contraseñas no coinciden');
      return;
    }

    setIsSubmitting(true);

    const result = await register(email, password);
    
    if (result.success) {
      setSuccessMensaje('Usuario creado exitosamente. Redirigiendo al login...');
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } else {
      setErrorMensaje(result.error);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 relative overflow-hidden">
      {/* Elementos decorativos cyberpunk/neón de fondo */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-blue-600/20 rounded-full blur-[100px]" />
      <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-emerald-600/20 rounded-full blur-[100px]" />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-slate-900/50 backdrop-blur-xl p-8 rounded-2xl shadow-2xl w-full max-w-md border border-slate-800 z-10"
      >
        <div className="text-center mb-8">
          <div className="mx-auto w-16 h-16 bg-blue-500/10 rounded-full flex items-center justify-center mb-4 border border-blue-500/20">
            <UserPlus className="w-8 h-8 text-blue-400" />
          </div>
          <h2 className="text-3xl font-bold text-white tracking-tight">New Operative</h2>
          <p className="text-slate-400 mt-2 text-sm">Registro de Credenciales de Seguridad</p>
        </div>

        {errorMensaje && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mb-6 bg-red-950/50 border border-red-500/50 text-red-200 px-4 py-3 rounded-lg text-sm flex items-center gap-3"
          >
            <ShieldCheck className="w-5 h-5 flex-shrink-0" />
            <span>{errorMensaje}</span>
          </motion.div>
        )}

        {successMensaje && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mb-6 bg-emerald-950/50 border border-emerald-500/50 text-emerald-200 px-4 py-3 rounded-lg text-sm flex items-center gap-3"
          >
            <ShieldCheck className="w-5 h-5 flex-shrink-0" />
            <span>{successMensaje}</span>
          </motion.div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Correo Electrónico</label>
            <div className="relative">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="block w-full pl-10 pr-4 py-3 bg-slate-950/50 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all outline-none"
                placeholder="operativo@dominio.com"
                required
              />
              <Mail className="absolute left-3 top-3.5 w-5 h-5 text-slate-500" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Contraseña Maestra</label>
            <div className="relative">
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="block w-full pl-10 pr-4 py-3 bg-slate-950/50 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all outline-none"
                placeholder="••••••••"
                required
              />
              <KeyRound className="absolute left-3 top-3.5 w-5 h-5 text-slate-500" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Confirmar Contraseña</label>
            <div className="relative">
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="block w-full pl-10 pr-4 py-3 bg-slate-950/50 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all outline-none"
                placeholder="••••••••"
                required
              />
              <KeyRound className="absolute left-3 top-3.5 w-5 h-5 text-slate-500" />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 border border-blue-500/30 rounded-lg shadow-lg shadow-blue-500/10 text-sm font-semibold text-white bg-blue-600/80 hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 focus:ring-offset-slate-900 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Registrando...' : 'Crear Identidad'}
            {!isSubmitting && <ArrowRight className="w-4 h-4" />}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-slate-800 text-center">
          <p className="text-slate-400 text-sm">
            ¿Ya tienes una identidad activa?{' '}
            <Link to="/login" className="text-blue-400 hover:text-blue-300 font-medium transition-colors">
              Inicia Protocolo
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}

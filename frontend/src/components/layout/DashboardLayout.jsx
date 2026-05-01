import { Outlet, useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Shield, LayoutDashboard, Terminal, LogOut, User, FileEdit, Users, Eye } from 'lucide-react';
import { motion } from 'framer-motion';

export default function DashboardLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 flex overflow-hidden">
      {/* Sidebar */}
      <motion.aside 
        initial={{ x: -250 }}
        animate={{ x: 0 }}
        className="w-64 bg-slate-900/50 backdrop-blur-xl border-r border-slate-800 flex flex-col"
      >
        <div className="h-16 flex items-center px-6 border-b border-slate-800">
          <Shield className="w-6 h-6 text-emerald-400 mr-3" />
          <span className="font-bold text-lg tracking-wide text-white">SecOps Panel</span>
        </div>
        
        <nav className="flex-1 px-4 py-6 space-y-2">
          <Link to="/" className="flex items-center px-4 py-3 mb-6 text-slate-400 hover:text-emerald-400 hover:bg-emerald-500/5 rounded-lg transition-all group border border-transparent hover:border-emerald-500/20">
            <Eye className="w-5 h-5 mr-3 group-hover:scale-110 transition-transform" />
            Ver Sitio Público
          </Link>

          <Link to="/dashboard" className={`flex items-center px-4 py-3 rounded-lg border transition-all ${
            isActive('/dashboard') 
              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
              : 'text-slate-400 border-transparent hover:bg-slate-800/50 hover:text-white'
          }`}>
            <LayoutDashboard className="w-5 h-5 mr-3" />
            Métricas Core
          </Link>
          <Link to="/dashboard/editor" className={`flex items-center px-4 py-3 rounded-lg border transition-all ${
            isActive('/dashboard/editor') 
              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
              : 'text-slate-400 border-transparent hover:bg-slate-800/50 hover:text-white'
          }`}>
            <FileEdit className="w-5 h-5 mr-3" />
            Gestión de Proyectos
          </Link>
          
          {user?.rol === 'admin' && (
            <Link to="/dashboard/users" className={`flex items-center px-4 py-3 rounded-lg border transition-all ${
              isActive('/dashboard/users') 
                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                : 'text-slate-400 border-transparent hover:bg-slate-800/50 hover:text-white'
            }`}>
              <Users className="w-5 h-5 mr-3" />
              Operativos
            </Link>
          )}
        </nav>

        <div className="p-4 border-t border-slate-800">
          <button 
            onClick={handleLogout}
            className="flex items-center w-full px-4 py-3 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
          >
            <LogOut className="w-5 h-5 mr-3" />
            Desconectar
          </button>
        </div>
      </motion.aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col relative">
        {/* Background Glow */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-emerald-600/10 rounded-full blur-[120px] pointer-events-none" />
        
        {/* Top Navbar */}
        <header className="h-16 bg-slate-900/30 backdrop-blur-md border-b border-slate-800 flex items-center justify-between px-8 z-10">
          <h1 className="text-xl font-semibold text-white">Resumen de Operaciones</h1>
          
          <div className="flex items-center gap-3">
            <div className="text-right hidden md:block">
              <div className="text-sm font-medium text-white">{user?.email}</div>
              <div className="text-xs text-emerald-400">{user?.rol}</div>
            </div>
            <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center border border-slate-700">
              <User className="w-5 h-5 text-slate-400" />
            </div>
          </div>
        </header>

        {/* Dynamic Page Content */}
        <main className="flex-1 overflow-auto p-8 z-10">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

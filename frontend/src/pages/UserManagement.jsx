import { useState, useEffect } from 'react';
import { Users, Shield, UserX, UserCheck, AlertCircle, Search } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [updatingId, setUpdatingId] = useState(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/users`, {
        credentials: 'include',
      });
      if (res.ok) {
        const data = await res.json();
        setUsers(data);
      } else {
        setError('Error al cargar usuarios. Asegúrate de tener permisos de administrador.');
      }
    } catch (err) {
      setError('Error de conexión con el servidor.');
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    setUpdatingId(userId);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/users/${userId}/role`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ role: newRole }),
      });
      
      if (res.ok) {
        setUsers(users.map(u => u.id === userId ? { ...u, role: newRole } : u));
      } else {
        const data = await res.json();
        alert(data.detail || 'Error al actualizar el rol');
      }
    } catch (err) {
      alert('Error de red al intentar actualizar el rol');
    } finally {
      setUpdatingId(null);
    }
  };

  const filteredUsers = users.filter(u => 
    u.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-white flex items-center gap-3">
            <Users className="w-8 h-8 text-emerald-400" />
            Gestión de Operativos
          </h2>
          <p className="text-slate-400 mt-2">Control de accesos y jerarquías del sistema SecOps.</p>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            placeholder="Buscar por identificación..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 bg-slate-900 border border-slate-800 rounded-lg text-sm text-white focus:ring-2 focus:ring-emerald-500/50 outline-none w-full md:w-64 transition-all"
          />
        </div>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-xl flex items-center gap-3 text-red-400">
          <AlertCircle className="w-5 h-5" />
          {error}
        </div>
      )}

      <div className="bg-slate-900/30 border border-slate-800 rounded-2xl overflow-hidden backdrop-blur-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-900/50">
                <th className="px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Identidad</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Nivel de Acceso</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              <AnimatePresence>
                {filteredUsers.map((u) => (
                  <motion.tr 
                    key={u.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="hover:bg-slate-800/20 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center border border-slate-700">
                          <Shield className={`w-4 h-4 ${u.role === 'admin' ? 'text-emerald-400' : 'text-blue-400'}`} />
                        </div>
                        <span className="text-white font-medium">{u.email}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                        u.role === 'admin' 
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                          : 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                      }`}>
                        {u.role === 'admin' ? 'Administrador' : 'Operativo'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {u.role === 'admin' ? (
                          <button
                            onClick={() => handleRoleChange(u.id, 'user')}
                            disabled={updatingId === u.id}
                            className="flex items-center gap-2 px-3 py-1.5 bg-slate-800 text-slate-300 rounded-lg text-xs font-medium hover:bg-red-500/10 hover:text-red-400 transition-all disabled:opacity-50"
                          >
                            <UserX className="w-3.5 h-3.5" />
                            Degradar a Operativo
                          </button>
                        ) : (
                          <button
                            onClick={() => handleRoleChange(u.id, 'admin')}
                            disabled={updatingId === u.id}
                            className="flex items-center gap-2 px-3 py-1.5 bg-emerald-500/10 text-emerald-400 rounded-lg text-xs font-medium hover:bg-emerald-500/20 transition-all disabled:opacity-50"
                          >
                            <UserCheck className="w-3.5 h-3.5" />
                            Promover a Admin
                          </button>
                        )}
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
        
        {filteredUsers.length === 0 && (
          <div className="p-12 text-center">
            <Users className="w-12 h-12 text-slate-700 mx-auto mb-4" />
            <p className="text-slate-500">No se encontraron identidades que coincidan con la búsqueda.</p>
          </div>
        )}
      </div>
    </div>
  );
}

import { useState } from 'react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMensaje, setErrorMensaje] = useState(''); // Estado para errores

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMensaje(''); // Limpiar errores previos

    try {
      const response = await fetch('http://localhost:8000/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || 'Error en la conexión');
      }

      // Si llegamos aquí, el login fue exitoso
      localStorage.setItem('portfolio_token', data.token);
      
      alert("¡Login Exitoso! Token guardado de forma segura en el navegador.");
      console.log("JWT Recibido:", data.token);
      
    } catch (error) {
      setErrorMensaje(error.message);
    }
  };

  // 🚀 Función para probar la Bóveda Secreta
  const accederAlDashboard = async () => {
    // 1. Buscamos la llave en la mochila (localStorage)
    const token = localStorage.getItem('portfolio_token');
    
    if (!token) {
      alert("Acceso Denegado: No tienes un token. Inicia sesión primero.");
      return;
    }

    try {
      // 2. Hacemos la petición inyectando el token en el Header
      const response = await fetch('http://localhost:8000/api/dashboard', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}` // La palabra Bearer es un estándar HTTP
        }
      });

      const data = await response.json();

      if (response.ok) {
        alert(`¡Éxito! El servidor dice: ${data.mensaje}`);
        console.log("Datos secretos:", data);
      } else {
        alert(`Fallo de seguridad: ${data.detail}`);
      }
    } catch (error) {
      console.error("Error al conectar con la bóveda", error);
    }
  };

  // 💥 Función para destruir el token (Cerrar Sesión)
  const cerrarSesion = () => {
    localStorage.removeItem('portfolio_token');
    alert("Sesión cerrada. El token ha sido destruido.");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900">
      <div className="bg-gray-800 p-8 rounded-lg shadow-2xl w-96 border border-gray-700">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-white">Security Portal</h2>
          <p className="text-gray-400 mt-2">Acceso Restringido</p>
        </div>

        {/* 🛡️ Alerta de error condicional */}
        {errorMensaje && (
          <div className="mb-4 bg-red-900/50 border border-red-500 text-red-200 px-4 py-2 rounded-md text-sm text-center">
            {errorMensaje}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-300">Email Administrativo</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 block w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:ring-blue-500 focus:border-blue-500"
              placeholder="admin@dominio.com"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300">Contraseña</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 block w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:ring-blue-500 focus:border-blue-500"
              placeholder="••••••••"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 focus:ring-offset-gray-900 transition-colors"
          >
            Autenticar
          </button>
        </form>
        {/* NUEVO BOTÓN PARA PROBAR LA RUTA PROTEGIDA */}
        <button 
          onClick={accederAlDashboard} 
          style={{ marginTop: '20px', backgroundColor: '#4CAF50', width: '100%' }}
         >
          Entrar a la Bóveda (Requiere Token)
        </button>

        {/* BOTÓN PARA DESTRUIR EL TOKEN */}
        <button 
          onClick={cerrarSesion} 
          style={{ marginTop: '10px', backgroundColor: '#ef4444', width: '100%' }}
          className="py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white hover:bg-red-700 transition-colors"
        >
          Cerrar Sesión (Destruir Token)
        </button>

    </div>
    </div>
  );
}
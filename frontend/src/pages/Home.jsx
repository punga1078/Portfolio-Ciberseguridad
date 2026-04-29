import { motion } from 'framer-motion';
import { Shield, Crosshair, Server, Lock, Code2, Terminal } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 relative overflow-hidden font-sans">
      {/* Background elegant accents: Blue (Defensive) and Red (Offensive) */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-red-600/5 rounded-full blur-[120px] pointer-events-none" />

      {/* Header */}
      <header className="h-16 border-b border-slate-800/50 bg-slate-950/50 backdrop-blur-md flex items-center justify-between px-8 z-10 relative">
        <div className="flex items-center gap-2">
          <Shield className="w-6 h-6 text-slate-100" />
          <span className="font-bold text-lg tracking-wide text-white">Portfolio</span>
        </div>
        <nav className="flex items-center gap-6">
          <Link to="/projects" className="text-sm font-medium text-slate-400 hover:text-white transition-colors">
            Investigaciones
          </Link>
          <Link to="/login" className="text-sm font-medium text-slate-400 hover:text-white transition-colors border border-slate-800 px-4 py-1.5 rounded-md hover:bg-slate-800/50">
            Login
          </Link>
        </nav>
      </header>

      {/* Hero Section */}
      <main className="max-w-6xl mx-auto px-6 py-24 z-10 relative">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900 border border-slate-800 mb-6">
              <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
              <span className="text-xs font-semibold tracking-wider text-slate-400 uppercase">Security Specialist</span>
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse delay-75"></span>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight tracking-tight">
              Asegurando <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-red-400">
                Sistemas
              </span>
            </h1>
            
            <p className="text-lg text-slate-400 mb-10 max-w-xl leading-relaxed">
              Especialista en ciberseguridad enfocado en la convergencia entre ofensiva y defensiva. 
              Identificando vulnerabilidades antes que los atacantes y construyendo infraestructuras resilientes.
            </p>
            
            <div className="flex flex-wrap items-center gap-4">
              <Link to="/projects" className="bg-slate-100 text-slate-950 hover:bg-white px-8 py-3 rounded-lg font-semibold transition-all">
                Ver Investigaciones
              </Link>
              <a href="#skills" className="px-8 py-3 rounded-lg font-semibold text-slate-300 hover:text-white hover:bg-slate-900 transition-all border border-slate-800">
                Habilidades Core
              </a>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="relative"
          >
            {/* Elemento Visual Abstracto (Elegante) */}
            <div className="aspect-square max-w-md mx-auto relative">
              <div className="absolute inset-0 bg-gradient-to-tr from-blue-500/10 to-red-500/10 rounded-3xl border border-slate-800/50 backdrop-blur-sm transform rotate-3 hover:rotate-0 transition-transform duration-500"></div>
              <div className="absolute inset-0 bg-slate-900/80 rounded-3xl border border-slate-800 shadow-2xl p-8 flex flex-col justify-between transform -rotate-3 hover:rotate-0 transition-transform duration-500">
                <div className="flex justify-between items-start">
                  <Terminal className="w-8 h-8 text-slate-500" />
                  <div className="flex gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-500/50"></div>
                    <div className="w-3 h-3 rounded-full bg-yellow-500/50"></div>
                    <div className="w-3 h-3 rounded-full bg-green-500/50"></div>
                  </div>
                </div>
                <div className="space-y-4 font-mono text-sm">
                  <div className="flex items-center gap-2 text-slate-400">
                    <span className="text-blue-400">root@sys</span><span>:</span><span className="text-slate-500">~</span><span>#</span>
                    <span className="text-slate-300 typing-effect"> nmap -sV -p- target</span>
                  </div>
                  <div className="text-slate-500">Starting Nmap 7.93...</div>
                  <div className="text-emerald-500/70 opacity-70">Discovered open port 22/tcp</div>
                  <div className="text-emerald-500/70 opacity-70">Discovered open port 80/tcp</div>
                  <div className="text-emerald-500/70 opacity-70">Discovered open port 443/tcp</div>
                  <div className="text-red-400/80 mt-4 animate-pulse">Vulnerability detected: CVE-2024-XXXX</div>
                  <div className="flex items-center gap-2 text-slate-400 mt-4">
                    <span className="text-blue-400">root@sys</span><span>:</span><span className="text-slate-500">~</span><span>#</span>
                    <span className="w-2 h-4 bg-slate-300 animate-bounce"></span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Skills Section */}
        <div id="skills" className="mt-32 pt-16 border-t border-slate-800/50">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-white mb-4">Competencias Técnicas</h2>
            <p className="text-slate-400 max-w-2xl mx-auto">Enfoque integral que abarca desde la explotación de sistemas hasta la arquitectura de soluciones seguras.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <motion.div whileHover={{ y: -5 }} className="bg-slate-900/30 border border-slate-800 rounded-2xl p-8">
              <div className="w-12 h-12 bg-red-500/10 rounded-xl flex items-center justify-center mb-6">
                <Crosshair className="w-6 h-6 text-red-400" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Red Team (Offensive)</h3>
              <p className="text-slate-400 text-sm leading-relaxed mb-4">
                Auditorías de seguridad, pruebas de penetración (Pentesting) y simulación de adversarios para identificar vectores de ataque críticos.
              </p>
              <ul className="space-y-2 text-sm text-slate-500 font-medium">
                <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-red-400"></div> Web Application Pentesting</li>
                <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-red-400"></div> Vulnerability Assessment</li>
                <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-red-400"></div> Exploit Development</li>
              </ul>
            </motion.div>

            <motion.div whileHover={{ y: -5 }} className="bg-slate-900/30 border border-slate-800 rounded-2xl p-8">
              <div className="w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center mb-6">
                <Shield className="w-6 h-6 text-blue-400" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Blue Team (Defensive)</h3>
              <p className="text-slate-400 text-sm leading-relaxed mb-4">
                Diseño de arquitecturas seguras, análisis de tráfico, monitorización de incidentes y endurecimiento (hardening) de servidores.
              </p>
              <ul className="space-y-2 text-sm text-slate-500 font-medium">
                <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-blue-400"></div> Security Operations (SecOps)</li>
                <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-blue-400"></div> Incident Response</li>
                <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-blue-400"></div> Log Analysis & SIEM</li>
              </ul>
            </motion.div>

            <motion.div whileHover={{ y: -5 }} className="bg-slate-900/30 border border-slate-800 rounded-2xl p-8">
              <div className="w-12 h-12 bg-slate-500/10 rounded-xl flex items-center justify-center mb-6">
                <Code2 className="w-6 h-6 text-slate-400" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">DevSecOps & Coding</h3>
              <p className="text-slate-400 text-sm leading-relaxed mb-4">
                Integración de seguridad en el ciclo de vida del desarrollo. Automatización y creación de herramientas personalizadas.
              </p>
              <ul className="space-y-2 text-sm text-slate-500 font-medium">
                <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-slate-400"></div> Python / Bash Scripting</li>
                <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-slate-400"></div> Docker / Contenedores Seguros</li>
                <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-slate-400"></div> Secure CI/CD Pipelines</li>
              </ul>
            </motion.div>
          </div>
        </div>
      </main>
    </div>
  );
}

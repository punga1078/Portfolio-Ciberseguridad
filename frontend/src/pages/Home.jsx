import { motion } from 'framer-motion';
import { Shield, Crosshair, Server, Lock, Code2, Terminal, Github, Linkedin, Mail } from 'lucide-react';
import { Link } from 'react-router-dom';
import TerminalSimulator from '../components/TerminalSimulator';
import { Helmet } from 'react-helmet-async';

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 relative overflow-hidden font-sans">
      <Helmet>
        <title>Facundo Cáceres | Cybersecurity Portfolio</title>
        <meta name="description" content="Portfolio de Facundo Cáceres. Especialista en Ciberseguridad, Pentester y Analista de Malware." />
        <meta property="og:title" content="Facundo Cáceres | Cybersecurity Portfolio" />
      </Helmet>

      {/* Background elegant accents: Blue (Defensive) and Red (Offensive) */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-red-600/5 rounded-full blur-[120px] pointer-events-none" />

      {/* Header */}
      <header className="h-16 border-b border-slate-800/50 bg-slate-950/50 backdrop-blur-md flex items-center justify-between px-8 z-10 relative">
        <div className="flex items-center gap-2">
          <Shield className="w-6 h-6 text-slate-100" />
          <span className="font-bold text-lg tracking-wide text-white">Facundo Cáceres</span>
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
              Facundo <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-400">
                Cáceres
              </span>
            </h1>
            
            <p className="text-lg text-slate-400 mb-8 max-w-xl leading-relaxed">
              Analista de Ciberseguridad & Tool Developer. Diplomado por UNTREF, con fuerte enfoque en la convergencia entre ofensiva y defensiva (SOC & Pentesting). Automatizando la detección de amenazas mediante Python y diseñando arquitecturas corporativas resilientes.
            </p>
            
            {/* Redes Sociales */}
            <div className="flex items-center gap-4 mb-10">
              <a href="https://github.com/punga1078" target="_blank" rel="noopener noreferrer" className="p-2 bg-slate-900 border border-slate-800 rounded-lg text-slate-400 hover:text-white hover:border-slate-600 transition-all">
                <Github className="w-5 h-5" />
              </a>
              <a href="https://www.linkedin.com/in/facundo-andres-caceres-tiznado-898709359/" target="_blank" rel="noopener noreferrer" className="p-2 bg-slate-900 border border-slate-800 rounded-lg text-slate-400 hover:text-blue-400 hover:border-blue-500/50 transition-all">
                <Linkedin className="w-5 h-5" />
              </a>
              <a href="mailto:facundo.caceres.tiz@gmail.com" className="p-2 bg-slate-900 border border-slate-800 rounded-lg text-slate-400 hover:text-emerald-400 hover:border-emerald-500/50 transition-all">
                <Mail className="w-5 h-5" />
              </a>
            </div>
            
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
            className="relative w-full flex items-center justify-center"
          >
            <TerminalSimulator />
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
                <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-red-400"></div> Web Pentesting & OWASP Top 10</li>
                <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-red-400"></div> Active Directory Exploitation</li>
                <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-red-400"></div> Privilege Escalation (Lin/Win)</li>
              </ul>
            </motion.div>

            <motion.div whileHover={{ y: -5 }} className="bg-slate-900/30 border border-slate-800 rounded-2xl p-8">
              <div className="w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center mb-6">
                <Shield className="w-6 h-6 text-blue-400" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Blue Team (Defensive)</h3>
              <p className="text-slate-400 text-sm leading-relaxed mb-4">
                Diseño de arquitecturas seguras, análisis forense (DFIR), monitorización de incidentes en entornos SOC y Threat Intelligence.
              </p>
              <ul className="space-y-2 text-sm text-slate-500 font-medium">
                <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-blue-400"></div> SIEM (Splunk) & Log Analysis</li>
                <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-blue-400"></div> DFIR & Incident Response</li>
                <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-blue-400"></div> Wireshark & Traffic Analysis</li>
              </ul>
            </motion.div>

            <motion.div whileHover={{ y: -5 }} className="bg-slate-900/30 border border-slate-800 rounded-2xl p-8">
              <div className="w-12 h-12 bg-slate-500/10 rounded-xl flex items-center justify-center mb-6">
                <Code2 className="w-6 h-6 text-slate-400" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">DevSecOps & Tooling</h3>
              <p className="text-slate-400 text-sm leading-relaxed mb-4">
                Desarrollo de herramientas de seguridad defensiva, automatización de tareas y despliegue de honeypots en contenedores.
              </p>
              <ul className="space-y-2 text-sm text-slate-500 font-medium">
                <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-slate-400"></div> Python Scripting & Tool Dev</li>
                <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-slate-400"></div> Docker & Honeypot Deployment</li>
                <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-slate-400"></div> Threat Hunting Automation</li>
              </ul>
            </motion.div>
          </div>
        </div>
      </main>
    </div>
  );
}

import { useState, useRef, useEffect } from 'react';
import { Terminal } from 'lucide-react';
import { motion } from 'framer-motion';

export default function TerminalSimulator() {
  const [history, setHistory] = useState([
    { text: "Security Portal [Versión 2.0.1]", type: "system" },
    { text: "Escribe 'help' para ver los comandos disponibles.", type: "system" }
  ]);
  const [input, setInput] = useState('');
  const containerRef = useRef(null);

  const commands = {
    help: "Comandos disponibles:\n  whoami  - Ver información de perfil\n  skills  - Listar habilidades técnicas\n  clear   - Limpiar pantalla\n  contact - Mostrar información de contacto\n  sudo    - ???",
    whoami: "Especialista en Ciberseguridad | Pentester & Analista.\nEnfocado en identificar vulnerabilidades y asegurar infraestructuras críticas.",
    skills: "Habilidades Técnicas:\n  [+] Web Security (OWASP Top 10)\n  [+] Network Penetration Testing\n  [+] Python, Bash, Go Scripting\n  [+] Cloud Security & DevOps",
    contact: "Contacto:\n  Email: facundo.caceres.tiz@gmail.com\n  LinkedIn: <a href='https://www.linkedin.com/in/facundo-andres-caceres-tiznado-898709359/' target='_blank' rel='noopener noreferrer' class='text-blue-400 hover:text-blue-300 underline'>/in/facundo-caceres</a>",
    sudo: "Acceso denegado. Este incidente ha sido reportado y registrado."
  };

  const handleCommand = (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const cmd = input.trim().toLowerCase();
    const newHistory = [...history, { text: `user@portfolio:~$ ${input}`, type: "command" }];

    if (cmd === 'clear') {
      setHistory([]);
    } else {
      const response = commands[cmd] || `bash: ${cmd}: command not found`;
      newHistory.push({ text: response, type: "response" });
      setHistory(newHistory);
    }
    setInput('');
  };

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [history]);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="bg-slate-950 border border-slate-800 rounded-xl overflow-hidden shadow-2xl font-mono text-sm max-w-2xl mx-auto w-full"
    >
      <div className="bg-slate-900 border-b border-slate-800 px-4 py-2 flex items-center gap-2">
        <Terminal className="w-4 h-4 text-slate-400" />
        <span className="text-slate-400 text-xs font-semibold">terminal - admin@portfolio:~</span>
      </div>
      
      <div ref={containerRef} className="p-4 h-64 overflow-y-auto flex flex-col gap-1 custom-scrollbar">
        {history.map((line, idx) => (
          <div 
            key={idx} 
            className={`
              ${line.type === 'system' ? 'text-slate-500' : ''}
              ${line.type === 'response' ? 'text-slate-300 whitespace-pre-wrap mt-1 mb-2' : ''}
              ${line.type === 'command' ? 'text-emerald-400' : ''}
            `}
          >
            {line.type === 'response' ? (
              <span dangerouslySetInnerHTML={{ __html: line.text }} />
            ) : (
              line.text
            )}
          </div>
        ))}
        
        <form onSubmit={handleCommand} className="flex gap-2 mt-1">
          <span className="text-emerald-500">user@portfolio:~$</span>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="flex-1 bg-transparent outline-none text-emerald-400 w-full"
            autoFocus
            autoComplete="off"
            spellCheck="false"
          />
        </form>
      </div>
      <style dangerouslySetInnerHTML={{__html: `
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(15, 23, 42, 1);
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(51, 65, 85, 1);
          border-radius: 4px;
        }
      `}} />
    </motion.div>
  );
}

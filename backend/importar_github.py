import requests
import json
import sys
import os
from dotenv import load_dotenv

# Cargar variables de entorno desde .env
load_dotenv()

# ====================================================================
# SCRIPT PARA IMPORTAR PROYECTOS DE GITHUB A LA BASE DE DATOS LOCAL
# ====================================================================

# 1. Configuración
API_BASE_URL = "http://localhost/api"
ADMIN_EMAIL = os.getenv("ADMIN_EMAIL")       # Carga desde .env
ADMIN_PASSWORD = os.getenv("ADMIN_PASSWORD") # Carga desde .env

if not ADMIN_EMAIL or not ADMIN_PASSWORD:
    print("[-] Error: Faltan las variables ADMIN_EMAIL o ADMIN_PASSWORD en el archivo .env")
    sys.exit(1)

# 2. Lista de proyectos a importar
# Reemplaza 'RAW_URL_AQUI' con el link 'Raw' del archivo en tu GitHub
# Ejemplo: https://raw.githubusercontent.com/usuario/repo/main/README.md
PROYECTOS = [
    {
        "title": "Secure Enterprise Network Architecture",
        "url": "https://raw.githubusercontent.com/punga1078/Cisco-Enterprise-Security-Architecture/refs/heads/main/README.md", 
        "project_type": "writeup",
        "tags": ["networking", "packet-tracer", "architecture"]
    },
    {
        "title": "Bumblebee ",
        "url": "https://raw.githubusercontent.com/punga1078/bumblebee-Writeup/refs/heads/main/README.md", 
        "project_type": "writeup",
        "tags": ["writeup", "ctf"]
    },
    {
        "title": "Black Pearl",
        "url": "https://raw.githubusercontent.com/punga1078/BlackPearl-Writeup.md/refs/heads/main/README.md", 
        "project_type": "writeup",
        "tags": ["writeup", "ctf"]
    },
    {
        "title": "Shadow Shell",
        "url": "https://raw.githubusercontent.com/punga1078/ShadowShell/refs/heads/main/README.md", 
        "project_type": "code",
        "tags": ["malware", "shell", "python"]
    },
    {
        "title": "Log Hunter",
        "url": "https://raw.githubusercontent.com/punga1078/LogHunter_Project/refs/heads/main/README.md", 
        "project_type": "code",
        "tags": ["blue-team", "forensics", "logs"]
    }
]

def login():
    print(f"[*] Autenticando como {ADMIN_EMAIL}...")
    res = requests.post(f"{API_BASE_URL}/login", json={
        "email": ADMIN_EMAIL,
        "password": ADMIN_PASSWORD
    })
    
    if res.status_code == 200:
        print("[+] Autenticación exitosa.")
        # Extraer la cookie
        return res.cookies
    else:
        print(f"[-] Error al autenticar: {res.text}")
        sys.exit(1)

def importar_proyectos(cookies):
    for p in PROYECTOS:
        if p["url"] == "RAW_URL_AQUI":
            print(f"[-] Saltando '{p['title']}', no se ha configurado la URL.")
            continue
            
        print(f"\n[*] Descargando contenido de: {p['title']}...")
        try:
            req_github = requests.get(p["url"])
            if req_github.status_code != 200:
                print(f"[-] Error descargando desde GitHub (HTTP {req_github.status_code}).")
                continue
                
            contenido = req_github.text
            
            # Computar github_url desde el raw url
            github_url = p["url"].replace('raw.githubusercontent.com', 'github.com').replace('/refs/heads/', '/tree/').replace('/README.md', '')
            
            # Subir a la API local
            print(f"[*] Subiendo a la base de datos...")
            payload = {
                "title": p["title"],
                "content": contenido,
                "project_type": p["project_type"],
                "github_url": github_url,
                "tags": p["tags"]
            }
            
            res_api = requests.post(
                f"{API_BASE_URL}/projects", 
                json=payload, 
                cookies=cookies
            )
            
            if res_api.status_code == 200:
                print(f"[+] '{p['title']}' importado exitosamente!")
            else:
                print(f"[-] Error subiendo a la API: {res_api.text}")
                
        except Exception as e:
            print(f"[-] Excepción: {str(e)}")

if __name__ == "__main__":
    print("=== INICIANDO MIGRACIÓN DESDE GITHUB ===")
    session_cookies = login()
    importar_proyectos(session_cookies)
    print("\n=== MIGRACIÓN FINALIZADA ===")

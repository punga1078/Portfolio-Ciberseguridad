from passlib.context import CryptContext

# Configuramos Bcrypt como nuestro algoritmo de hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def verify_password(plain_password, hashed_password):
    """Compara la contraseña en texto plano con el hash guardado"""
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password):
    """Convierte la contraseña en un hash irreversible"""
    return pwd_context.hash(password)
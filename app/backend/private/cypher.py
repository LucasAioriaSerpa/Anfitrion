
import hashlib
import secrets
import hmac

try: from config.Config import Config
except ImportError: from app.backend.config.Config import Config


class Cypher:
    """
    ### Cypher
    sistema de hash, onde valida senhas usando PBKDF2-HMAC-SHA256
    """
    
    __config = Config()

    @classmethod
    def hash_password(cls, password: str) -> str:
        if not isinstance(password, str) or not password:
            raise ValueError("A senha deve ser um texto não vazio")

        salt = secrets.token_bytes(cls.__config.SALT_BYTES)
        password_hash = hashlib.pbkdf2_hmac(
            cls.__config.ALGORITHM,
            password.encode("utf-8"),
            salt,
            cls.__config.ITERATIONS,
        )
        return "$".join((
            cls.__config.ALGORITHM,
            str(cls.__config.ITERATIONS),
            salt.hex(),
            password_hash.hex(),
        ))

    @classmethod
    def verify_password(cls, password: str, encoded_password: str) -> bool:
        if not isinstance(password, str) or not isinstance(encoded_password, str): return False

        try:
            algorithm, iterations, salt_hex, hash_hex = encoded_password.split("$", 3)
            if algorithm != cls.__config.ALGORITHM: return False
            
            salt = bytes.fromhex(salt_hex)
            expected_hash = bytes.fromhex(hash_hex)
            calculated_hash = hashlib.pbkdf2_hmac(
                algorithm,
                password.encode("utf-8"),
                salt,
                int(iterations),
            )
        except (TypeError, ValueError): return False
        return hmac.compare_digest(calculated_hash, expected_hash)

    @staticmethod
    def decrypt_password(_: str) -> None: raise ValueError("Hashes SHA não podem ser descriptografados")

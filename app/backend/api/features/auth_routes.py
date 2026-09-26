from flask import Blueprint, request, jsonify
import sqlite3

try:
    from manager.Database import Database
    from config.Config import Config
    from utils.Loggers import Logger
    from api.factories.user_factory import userFactory
except ImportError:
    from app.backend.manager.Database import Database
    from app.backend.config.Config import Config
    from app.backend.utils.Loggers import Logger
    from app.backend.api.factories.user_factory import userFactory

try:
    from database.Setup_db import init_db
except ImportError:
    from app.backend.database.Setup_db import init_db


def ensure_funcionario_access_code_column() -> None:
    """Garante compatibilidade com bancos já existentes sem a coluna codigo_acesso."""
    try:
        db_path = Config().get("DATABASE_DIR")
        if not db_path:
            return
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        columns = [row[1] for row in cursor.execute("PRAGMA table_info(funcionario)").fetchall()]
        if "codigo_acesso" not in columns:
            cursor.execute("ALTER TABLE funcionario ADD COLUMN codigo_acesso TEXT;")
            conn.commit()
            log.log_info("[ auth_routes ] - Coluna codigo_acesso adicionada na tabela funcionario")
        conn.close()
    except Exception as exc:
        log.log_warning(f"[ auth_routes ] - Não foi possível validar a coluna codigo_acesso: {exc}")


init_db()
ensure_funcionario_access_code_column()

auth_bp = Blueprint("auth", __name__, url_prefix="/api/auth")
db = Database()
config = Config()
log = Logger()


def resolve_hotel_id(fallback_value: int = 1) -> int:
    """Retorna um hotel válido da base, evitando FK inválida em cadastros de funcionários."""
    hoteis = db.read("hotel", {})
    if hoteis and isinstance(hoteis, list):
        return int(hoteis[0].get("id_hotel", fallback_value))
    default_hotel_id = db.create("hotel", {
        "cnpj": "00.000.000/0001-00",
        "franquia": "Anfitrião",
        "nome": "Hotel Padrão",
        "endereso": "Endereço padrão do sistema",
        "qtd_quartos": 0,
    })
    return int(default_hotel_id or fallback_value)


@auth_bp.route("/login", methods=["POST"])
def login():
    """Autentica um funcionário ou hóspede pelo e-mail e senha."""
    data = request.get_json(silent=True) or {}
    email = str(data.get("email", "")).strip().lower()
    senha = str(data.get("senha", ""))
    requested_role = str(data.get("role", "hospede")).strip().lower()
    codigo_acesso = str(data.get("codigoAcesso", "") or data.get("codigo_acesso", "")).strip()

    if not email or not senha:
        log.log_warning("[ auth_routes ] - Tentativa de login sem e-mail ou senha")
        return jsonify({"success": False, "message": "E-mail e senha são obrigatórios"}), 400

    log.log_info(f"[ auth_routes ] - Tentativa de login para: {email} (role={requested_role})")

    hospedes = db.read("hospede", {"email": email})
    if not hospedes:
        log.log_warning(f"[ auth_routes ] - Usuário não encontrado: {email}")
        return jsonify({"success": False, "message": "Credenciais inválidas"}), 401

    user = hospedes[0]
    if user.get("senha") != senha:
        log.log_warning(f"[ auth_routes ] - Senha incorreta para: {email}")
        return jsonify({"success": False, "message": "Credenciais inválidas"}), 401

    funcionarios = db.read("funcionario", {"id_hospede": user["id_hospede"]})
    role = "hospede"
    funcionario_data = None

    if funcionarios:
        role = "funcionario"
        funcionario_data = funcionarios[0]

    if requested_role != "hospede":
        codigo_armazenado = str((funcionario_data or {}).get("codigo_acesso") or "").strip()
        if not codigo_acesso:
            return jsonify({"success": False, "message": "Informe o código de acesso do funcionário"}), 403
        if codigo_armazenado and codigo_acesso != codigo_armazenado:
            return jsonify({"success": False, "message": "Código de acesso do funcionário inválido"}), 403

    if funcionario_data and requested_role != "hospede":
        role = "funcionario"

    log.log_success(f"[ auth_routes ] - Login realizado com sucesso para: {email} (Role: {role})")
    return jsonify({
        "success": True,
        "message": "Login realizado com sucesso!",
        "user": {
            "id_hospede": user["id_hospede"],
            "nome": user["nome"],
            "email": user["email"],
            "telefone": user["telefone"],
            "role": role,
            "cargo": funcionario_data.get("cargo") if funcionario_data else None,
            "id_hotel": funcionario_data.get("id_hotel") if funcionario_data else None,
            "id_funcionario": funcionario_data.get("id_funcionario") if funcionario_data else None
        }
    }), 200

@auth_bp.route("/register", methods=["POST"])
def register():
    """Registra um novo hóspede ou funcionário com código de acesso quando necessário."""
    data = request.get_json(silent=True) or {}
    email = str(data.get("email", "")).strip().lower()
    senha = str(data.get("senha", ""))
    nome = str(data.get("nome", "")).strip() or email.split("@")[0]
    telefone = str(data.get("telefone", "0000000000"))
    requested_role = str(data.get("role", "hospede")).strip().lower()
    codigo_acesso = str(data.get("codigoAcesso", "") or data.get("codigo_acesso", "")).strip()

    if not email or not senha:
        return jsonify({"success": False, "message": "E-mail e senha são obrigatórios"}), 400

    if requested_role == "hospede":
        role = "hospede"
    else:
        role = requested_role or "funcionario"
        if not codigo_acesso:
            return jsonify({"success": False, "message": "Informe o código de acesso do funcionário"}), 403

    # Verifica se já existe
    existing = db.read("hospede", {"email": email})
    if existing:
        return jsonify({"success": False, "message": "Este e-mail já está cadastrado"}), 409

    user_obj = userFactory.registrar_user({
        "role": role,
        "nome": nome,
        "email": email,
        "senha": senha,
        "telefone": telefone,
        "cargo": data.get("cargo", "Recepcionista"),
        "id_hotel": data.get("id_hotel", 1)
    })

    if not user_obj:
        return jsonify({"success": False, "message": "Falha ao criar entidade de usuário"}), 500

    new_hospede_id = db.create("hospede", {
        "nome": nome,
        "email": email,
        "senha": senha,
        "telefone": telefone
    })

    funcionario_id = None
    if role != "hospede":
        hotel_id = int(data.get("id_hotel") or resolve_hotel_id())
        funcionario_id = db.create("funcionario", {
            "id_hospede": new_hospede_id,
            "id_hotel": hotel_id,
            "cargo": data.get("cargo", "Recepcionista"),
            "codigo_acesso": codigo_acesso
        })

    log.log_success(f"[ auth_routes ] - Conta criada com sucesso para: {email} (ID Hóspede: {new_hospede_id})")
    return jsonify({
        "success": True,
        "message": "Conta criada com sucesso!",
        "user": {
            "id_hospede": new_hospede_id,
            "nome": nome,
            "email": email,
            "role": role,
            "cargo": data.get("cargo", "Recepcionista") if role != "hospede" else None,
            "id_funcionario": funcionario_id
        }
    }), 201

@auth_bp.route("/stats", methods=["GET"])
def get_stats():
    """Retorna estatísticas operacionais computadas pela Thread MAIN."""
    stats = config.get("STATS") or {}
    return jsonify({"success": True, "stats": stats}), 200

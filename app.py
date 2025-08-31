import io
import qrcode
def generate_qr_base64(data):
    qr = qrcode.QRCode(
        version=1,
        error_correction=qrcode.constants.ERROR_CORRECT_L,
        box_size=4,
        border=1,
    )
    qr.add_data(data)
    qr.make(fit=True)
    img = qr.make_image(fill_color="black", back_color="white")
    buf = io.BytesIO()
    img.save(buf, format="PNG")
    buf.seek(0)
    return base64.b64encode(buf.read()).decode()

from flask import Flask, render_template, request, jsonify, session
import os
import random
import base64
from cryptography.fernet import Fernet
from cryptography.hazmat.primitives import hashes
from cryptography.hazmat.primitives.kdf.pbkdf2 import PBKDF2HMAC

# Carrega variáveis de ambiente do .env antes de qualquer uso de os.environ
try:
    from dotenv import load_dotenv
    load_dotenv()
except ImportError:
    pass

app = Flask(__name__)
app.secret_key = os.environ.get("SECRET_KEY", "supersecretkey")

# Chave secreta para criptografia (fixa para sessão)
# Usar chave fixa para que a criptografia funcione consistentemente
FERNET_KEY = os.environ.get("FERNET_KEY")
if not FERNET_KEY:
    # Gerar chave fixa baseada em uma string conhecida para desenvolvimento
    password = b"crewcipher-demo-key"  # Chave fixa para desenvolvimento
    salt = b"static-salt-123456"  # Salt fixo para desenvolvimento
    kdf = PBKDF2HMAC(
        algorithm=hashes.SHA256(),
        length=32,
        salt=salt,
        iterations=100000,
    )
    FERNET_KEY = base64.urlsafe_b64encode(kdf.derive(password))

fernet = Fernet(FERNET_KEY)

def encrypt_message(msg):
    return fernet.encrypt(msg.encode()).decode()

def decrypt_message(token):
    try:
        return fernet.decrypt(token.encode()).decode()
    except Exception:
        return "Código inválido"


# Código de desbloqueio da porta (obrigatório em produção)


# Código de desbloqueio da porta (obrigatório em produção, criptografado em todos os casos)
DOOR_UNLOCK_CODE = os.environ.get("DOOR_UNLOCK_CODE")
if not DOOR_UNLOCK_CODE:
    flask_env = os.environ.get("FLASK_ENV", "production")
    flask_debug = os.environ.get("FLASK_DEBUG", "0")
    if flask_env == "development" or flask_debug == "1":
        import warnings
        warnings.warn("A variável de ambiente DOOR_UNLOCK_CODE não está definida. Usando valor padrão apenas para desenvolvimento.")
        DOOR_UNLOCK_CODE = "ALPHA-7X9Z-BETA"
    else:
        raise RuntimeError(
            "A variável de ambiente DOOR_UNLOCK_CODE deve ser definida em produção.\n"
            "Defina DOOR_UNLOCK_CODE no ambiente ou crie um arquivo .env com DOOR_UNLOCK_CODE=seu_codigo.\n"
            "Para rodar localmente sem definir, use FLASK_ENV=development ou FLASK_DEBUG=1."
        )

# Mensagem criptografada para a crew autorizada (sempre criptografada, mesmo em dev)
ENCRYPTED_UNLOCK_CODE = encrypt_message(DOOR_UNLOCK_CODE)

# Lista base de tripulantes centralizada (sem nomes hardcoded)
BASE_CREW = [
    {"id": f"{i+1:03d}", **crew}
    for i, crew in enumerate([
        {"img": "/static/img/crew01.png", "role": "Navegador"},
        {"img": "/static/img/crew02.png", "role": "Médica"},
        {"img": "/static/img/crew03.png", "role": "Intendente"},
        {"img": "/static/img/crew04.png", "role": "Segurança"},
        {"img": "/static/img/crew05.png", "role": "Técnica de Laboratório"},
        {"img": "/static/img/crew06.png", "role": "Timoneiro"},
        {"img": "/static/img/crew07.png", "role": "Cozinheira"},
        {"img": "/static/img/crew01.png", "role": "Bioquímico"},
        {"img": "/static/img/crew02.png", "role": "Supervisora de Convés"},
        {"img": "/static/img/crew03.png", "role": "Imediato"},
        {"img": "/static/img/crew04.png", "role": "Comissária"},
        {"img": "/static/img/crew05.png", "role": "Especialista em Armas"},
        {"img": "/static/img/crew06.png", "role": "Materiais Perigosos"},
        {"img": "/static/img/crew07.png", "role": "Mecânico"},
        {"img": "/static/img/crew01.png", "role": "Engenheira Chefe"},
        {"img": "/static/img/crew02.png", "role": "Eletricista"},
        {"img": "/static/img/crew03.png", "role": "Assistente de Engenharia"},
        {"img": "/static/img/crew04.png", "role": "Operadora de Rádio"},
        {"img": "/static/img/crew05.png", "role": "Criptógrafo"},
        {"img": "/static/img/crew06.png", "role": "Capitã"},
        {"img": "/static/img/crew07.png", "role": "Oficial de Comunicações"},
        {"img": "/static/img/crew01.png", "role": "Oficial de Navegação"},
        {"img": "/static/img/crew02.png", "role": "Oficial de Segurança"},
        {"img": "/static/img/crew03.png", "role": "Oficial de Ciências"},
        {"img": "/static/img/crew04.png", "role": "Oficial de Manutenção"},
        {"img": "/static/img/crew05.png", "role": "Oficial de Suprimentos"},
        {"img": "/static/img/crew06.png", "role": "Oficial de Logística"},
    ])
]

def generate_random_crew():
    """Gera nomes e papéis aleatórios para a tripulação usando algoritmo"""
    
    # Algoritmo para gerar nomes aleatórios
    def generate_random_name():
        # Sílabas para formar nomes
        consonants = ['B', 'C', 'D', 'F', 'G', 'H', 'J', 'K', 'L', 'M', 'N', 'P', 'Q', 'R', 'S', 'T', 'V', 'W', 'X', 'Z']
        vowels = ['a', 'e', 'i', 'o', 'u']
        syllable_starts = ['Br', 'Cr', 'Dr', 'Fr', 'Gr', 'Pr', 'Tr', 'Bl', 'Cl', 'Fl', 'Gl', 'Pl', 'Sl']
        syllable_endings = ['an', 'en', 'in', 'on', 'ar', 'er', 'ir', 'or', 'al', 'el', 'il', 'ol']
        
        name_patterns = [
            # Padrão: Consoante + Vogal + Consoante + Vogal
            lambda: random.choice(consonants) + random.choice(vowels) + random.choice(consonants).lower() + random.choice(vowels),
            # Padrão: Sílaba complexa + Vogal + Consoante
            lambda: random.choice(syllable_starts) + random.choice(vowels) + random.choice(consonants).lower(),
            # Padrão: Consoante + Terminação
            lambda: random.choice(consonants) + random.choice(syllable_endings),
            # Padrão: Consoante + Vogal + Terminação
            lambda: random.choice(consonants) + random.choice(vowels) + random.choice(syllable_endings),
        ]
        
        # Escolher um padrão aleatório e gerar nome
        pattern = random.choice(name_patterns)
        name = pattern()
        
        # Capitalizar primeira letra
        return name.capitalize()
    
    # Gerar nomes únicos usando algoritmo
    generated_names = []
    while len(generated_names) < len(BASE_CREW):
        new_name = generate_random_name()
        # Evitar nomes duplicados
        if new_name not in generated_names:
            generated_names.append(new_name)
    
    # Embaralhar as posições da tripulação (não apenas nomes)
    crew_indices = list(range(len(BASE_CREW)))
    random.shuffle(crew_indices)
    
    # Criar mapeamento embaralhado
    shuffled_crew = [BASE_CREW[i] for i in crew_indices]
    
    # Embaralhar papéis para as novas posições
    roles = [c["role"] for c in shuffled_crew]
    random.shuffle(roles)
    
    # Garantir que nenhum papel fique na posição original após embaralhamento
    for i in range(len(shuffled_crew)):
        attempts = 0
        while roles[i] == shuffled_crew[i]["role"] and attempts < 10:
            random.shuffle(roles)
            attempts += 1
    
    return generated_names, roles, shuffled_crew


def build_crew_list(nomes, roles, shuffled_crew):
    """Helper function to build crew list from session data"""
    crew_list = []
    for i, c in enumerate(shuffled_crew):
        crew_member = {
            "id": c["id"],
            "name": nomes[i] if i < len(nomes) else f"Tripulante{i+1}",
            "img": c["img"],
            "role": roles[i] if i < len(roles) else c["role"],
        }
        crew_list.append(crew_member)
    return crew_list


def get_session_crew_data():
    """Get crew data from session or generate new if missing"""
    nomes = session.get('crew_names')
    roles = session.get('crew_roles')
    shuffled_crew = session.get('shuffled_crew')
    
    if not nomes or not roles or not shuffled_crew:
        nomes, roles, shuffled_crew = generate_random_crew()
        session['crew_names'] = nomes
        session['crew_roles'] = roles
        session['shuffled_crew'] = shuffled_crew
    
    return nomes, roles, shuffled_crew

@app.route("/")
def index():
    nomes, roles, shuffled_crew = generate_random_crew()
    # Atualiza a sessão para garantir consistência
    session['crew_names'] = nomes
    session['crew_roles'] = roles
    session['shuffled_crew'] = shuffled_crew
    
    crew = build_crew_list(nomes, roles, shuffled_crew)
    return render_template("index.html", encrypted=ENCRYPTED_UNLOCK_CODE, crew=crew)
# Endpoint para reiniciar rodada com nova tripulação aleatória
@app.route("/restart", methods=["POST"])
def restart():
    # Gerar nova tripulação aleatória com embaralhamento completo
    nomes, roles, shuffled_crew = generate_random_crew()
    session['crew_names'] = nomes
    session['crew_roles'] = roles
    session['shuffled_crew'] = shuffled_crew
    
    crew = build_crew_list(nomes, roles, shuffled_crew)
    return jsonify({"ok": True, "crew": crew})

@app.route("/check_access", methods=["POST"])
def check_access():
    data = request.json
    if not data:
        return jsonify({"access": False, "decrypted": "🙫 <b>Dados inválidos!</b>"})
        
    crew_id = data.get("crew")
    code = data.get("code")
    
    if not crew_id or not code:
        return jsonify({"access": False, "decrypted": "🙫 <b>Dados incompletos!</b>"})

    # Obter dados da sessão
    nomes, roles, shuffled_crew = get_session_crew_data()

    # Construir lista atual da tripulação
    crew_list = build_crew_list(nomes, roles, shuffled_crew)

    crew_member = next((c for c in crew_list if c["id"] == crew_id), None)
    papel = None
    if crew_member:
        papel = crew_member["role"].strip()


    if not crew_member:
        return jsonify({"access": False, "decrypted": "🚫 <b>Tripulante não encontrado!</b>"})

    # ABSOLUTE ACCESS CONTROL: Only "Materiais Perigosos" role is allowed
    # Any other role gets immediate denial - NO EXCEPTIONS
    if papel != "Materiais Perigosos":
        return jsonify({
            "access": False,
            "decrypted": f"🚫 <b>Acesso negado!</b>"
        })

    # ONLY "Materiais Perigosos" role can reach this point
    # Double-check the role to be absolutely sure
    if papel == "Materiais Perigosos":
        decrypted = decrypt_message(code)

        # Only allow access if decryption matches exactly
        if decrypted.strip() == DOOR_UNLOCK_CODE.strip():
            mensagem = (
                "✅ <b>Acesso autorizado!</b><br>"
                f"Código de desbloqueio: <span style=\"font-size:1.3em;letter-spacing:2px;background:#eaffea;padding:2px 8px;border-radius:6px;\">{DOOR_UNLOCK_CODE}</span><br>"
                "<i>Siga os protocolos de segurança ao entrar.</i>"
            )
            return jsonify({"access": True, "decrypted": mensagem})
        else:
            return jsonify({"access": False, "decrypted": "🚫 <b>Código inválido!</b> Tente novamente."})

    # Final failsafe - should never reach here, but deny access anyway
    return jsonify({"access": False, "decrypted": "🚫 <b>Acesso negado!</b> Erro de autorização."})

@app.route("/get_token/<crew_id>")
def get_token(crew_id):
    # Obter dados da sessão para encontrar o tripulante correto
    nomes, roles, shuffled_crew = get_session_crew_data()
    # Construir lista atual da tripulação
    crew_list = build_crew_list(nomes, roles, shuffled_crew)
    # Encontrar o tripulante pelo ID
    crew_member = next((c for c in crew_list if c["id"] == crew_id), None)
    # Reforço: só retorna token real se o papel for exatamente 'Materiais Perigosos'
    papel = crew_member["role"].strip() if crew_member else None
    if papel == "Materiais Perigosos":
        encrypted = encrypt_message(DOOR_UNLOCK_CODE)
    else:
        fake_code = f"FAKE_CODE_FOR_{crew_id}_ROLE_{papel if papel else 'UNKNOWN'}_DENIED"
        encrypted = encrypt_message(fake_code)
    qr_base64 = generate_qr_base64(encrypted)
    return jsonify({"encrypted": encrypted, "qr_base64": qr_base64})

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port)

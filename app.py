from flask import Flask, render_template, request, jsonify
from cryptography.fernet import Fernet

app = Flask(__name__)


# Simulação de tripulantes autorizados
AUTHORIZED_CREW = {"karina"}

# Chave secreta para criptografia (fixa para demo, em produção use variável de ambiente)
FERNET_KEY = Fernet.generate_key() if not hasattr(__builtins__, 'FERNET_KEY') else __builtins__.FERNET_KEY
fernet = Fernet(FERNET_KEY)

def encrypt_message(msg):
    return fernet.encrypt(msg.encode()).decode()

def decrypt_message(token):
    try:
        return fernet.decrypt(token.encode()).decode()
    except Exception:
        return "Código inválido"

# Código de desbloqueio da porta (apenas para a crew autorizada)
DOOR_UNLOCK_CODE = "4729#XZ"

# Mensagem criptografada para a crew autorizada
ENCRYPTED_UNLOCK_CODE = encrypt_message(DOOR_UNLOCK_CODE)

@app.route("/")
def index():
    # Lista de tripulantes
    crew = [
        {"id": "joao", "name": "João", "img": "/static/img/crew01.png", "access": True, "role": "Navegador"},
        {"id": "maria", "name": "Maria", "img": "/static/img/crew02.png", "access": True, "role": "Médica"},
        {"id": "ana", "name": "Ana", "img": "/static/img/crew03.png", "access": False, "role": "Intendente"},
        {"id": "bruno", "name": "Bruno", "img": "/static/img/crew04.png", "access": False, "role": "Segurança"},
        {"id": "carla", "name": "Carla", "img": "/static/img/crew05.png", "access": False, "role": "Técnica de Laboratório"},
        {"id": "daniel", "name": "Daniel", "img": "/static/img/crew06.png", "access": False, "role": "Timoneiro"},
        {"id": "elisa", "name": "Elisa", "img": "/static/img/crew07.png", "access": False, "role": "Cozinheira"},
        {"id": "felipe", "name": "Felipe", "img": "/static/img/crew08.png", "access": False, "role": "Bioquímico"},
        {"id": "giovana", "name": "Giovana", "img": "/static/img/crew09.png", "access": False, "role": "Supervisora de Convés"},
        {"id": "heitor", "name": "Heitor", "img": "/static/img/crew10.png", "access": False, "role": "Imediato"},
        {"id": "isabela", "name": "Isabela", "img": "/static/img/crew11.png", "access": False, "role": "Comissária"},
        {"id": "jorge", "name": "Jorge", "img": "/static/img/crew12.png", "access": False, "role": "Especialista em Armas"},
        {"id": "karina", "name": "Karina", "img": "/static/img/crew13.png", "access": False, "role": "Materiais Perigosos"},
        {"id": "lucas", "name": "Lucas", "img": "/static/img/crew14.png", "access": False, "role": "Mecânico"},
        {"id": "marina", "name": "Marina", "img": "/static/img/crew15.png", "access": False, "role": "Engenheira Chefe"},
        {"id": "nina", "name": "Nina", "img": "/static/img/crew16.png", "access": False, "role": "Eletricista"},
        {"id": "otavio", "name": "Otávio", "img": "/static/img/crew17.png", "access": False, "role": "Assistente de Engenharia"},
        {"id": "paula", "name": "Paula", "img": "/static/img/crew18.png", "access": False, "role": "Operadora de Rádio"},
        {"id": "rafael", "name": "Rafael", "img": "/static/img/crew19.png", "access": False, "role": "Criptógrafo"},
        {"id": "sara", "name": "Sara", "img": "/static/img/crew20.png", "access": False, "role": "Capitã"},
    ]
    return render_template("index.html", encrypted=ENCRYPTED_UNLOCK_CODE, crew=crew)

@app.route("/check_access", methods=["POST"])
def check_access():
    data = request.json
    crew = data.get("crew")
    code = data.get("code")
    if crew == "karina":
        decrypted = decrypt_message(code)
        if decrypted == DOOR_UNLOCK_CODE:
            decrypted = (
                "✅ <b>Acesso autorizado!</b><br>"
                f"Código de desbloqueio: <span style=\"font-size:1.3em;letter-spacing:2px;background:#eaffea;padding:2px 8px;border-radius:6px;\">{DOOR_UNLOCK_CODE}</span><br>"
                "<i>Siga os protocolos de segurança ao entrar.</i>"
            )
        return jsonify({"access": True, "decrypted": decrypted})
    else:
        return jsonify({"access": False, "decrypted": "🚫 <b>Acesso negado!</b> Esta área é restrita a pessoal autorizado."})

@app.route("/get_token/<crew_id>")
def get_token(crew_id):
    if crew_id == "karina":
        encrypted = encrypt_message(DOOR_UNLOCK_CODE)
    else:
        access_message = f"ACESSO LIBERADO:{crew_id}"
        encrypted = encrypt_message(access_message)
    return jsonify({"encrypted": encrypted})

import os
if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port, debug=True)

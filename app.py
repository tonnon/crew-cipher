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

@app.route("/")
def index():
    # Mensagem de acesso criptografada
    access_message = "ACESSO LIBERADO"
    encrypted = encrypt_message(access_message)
    return render_template("index.html", encrypted=encrypted)

@app.route("/check_access", methods=["POST"])
def check_access():
    data = request.json
    crew = data.get("crew")
    code = data.get("code")
    if crew in AUTHORIZED_CREW:
        decrypted = decrypt_message(code)
        return jsonify({"access": True, "decrypted": decrypted})
    else:
        return jsonify({"access": False, "decrypted": "Acesso negado"})

import os
if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port, debug=True)

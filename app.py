from flask import Flask, render_template, request, jsonify
import base64

app = Flask(__name__)

# Simulação de tripulantes autorizados
AUTHORIZED_CREW = {"joao", "maria"}

# Função simples de "descriptografia"
def decrypt_code(code):
    try:
        return base64.b64decode(code.encode()).decode()
    except Exception:
        return "Código inválido"

@app.route("/")
def index():
    return render_template("index.html")

@app.route("/check_access", methods=["POST"])
def check_access():
    data = request.json
    crew = data.get("crew")
    code = data.get("code")
    if crew in AUTHORIZED_CREW:
        decrypted = decrypt_code(code)
        return jsonify({"access": True, "decrypted": decrypted})
    else:
        return jsonify({"access": False, "decrypted": "Acesso negado"})

if __name__ == "__main__":
    app.run(debug=True)

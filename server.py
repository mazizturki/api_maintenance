from flask import Flask, jsonify, request, abort, send_from_directory
from flask_cors import CORS
from functools import wraps

app = Flask(__name__, static_folder='public', static_url_path='')
# Autorise spécifiquement votre domaine et les requêtes OPTIONS
CORS(app, resources={
    r"/api/*": {
        "origins": [
            "https://vierund.onrender.com",
            "https://vierund-maintenance.onrender.com",
            "http://localhost:*"
        ],
        "methods": ["GET", "POST", "OPTIONS"],
        "allow_headers": ["X-API-Key", "Content-Type"]
    }
})
# Configuration
API_KEY = "v44i31er5u015nd190105a"
BYPASS_TOKEN = "tt44315015"

# État de la maintenance
maintenance = {
    "isActive": False,
    "message": "Maintenance en cours..."
}

# Middleware pour vérifier le mode maintenance
def check_maintenance(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if maintenance["isActive"]:
            bypass_token = request.args.get("bypass") or request.headers.get("x-bypass-token")
            if bypass_token == BYPASS_TOKEN:
                return f(*args, **kwargs)
            return jsonify(maintenance), 503
        return f(*args, **kwargs)
    return decorated_function

# Vérification de la clé API pour sécuriser la modification de l'état
def check_api_key():
    api_key = request.headers.get('X-API-Key')
    if api_key != API_KEY:
        abort(401, description="Clé API invalide")

# GET: Vérifie l’état de la maintenance
@app.route('/api/maintenance', methods=['GET'])
@check_maintenance
def get_maintenance():
    return jsonify(maintenance)

# POST: Active ou désactive la maintenance (sans blocage middleware)
@app.route('/api/maintenance', methods=['POST'])
def update_maintenance():
    check_api_key()
    data = request.get_json()
    if 'isActive' in data and isinstance(data['isActive'], bool):
        maintenance['isActive'] = data['isActive']
    if 'message' in data and isinstance(data['message'], str):
        maintenance['message'] = data['message']
    return jsonify(maintenance)

def _build_cors_preflight_response():
    response = jsonify({'status': 'preflight'})
    response.headers.add("Access-Control-Allow-Origin", "*")
    response.headers.add("Access-Control-Allow-Headers", "*")
    response.headers.add("Access-Control-Allow-Methods", "*")
    return response

@app.after_request
def after_request(response):
    response.headers['Access-Control-Allow-Origin'] = 'https://vierund.onrender.com'
    response.headers['Access-Control-Allow-Methods'] = 'GET, POST, OPTIONS'
    response.headers['Access-Control-Allow-Headers'] = 'X-API-Key, X-Bypass-Token, Content-Type'
    response.headers['Access-Control-Allow-Credentials'] = 'true'
    return response

# Route principale (protégée par le middleware)
@app.route('/')
@check_maintenance
def serve_index():
    return send_from_directory('public', 'admin.html')

# Page statique de maintenance
@app.route('/maintenance')
def serve_maintenance():
    return send_from_directory('public', 'maintenance.html')

# Lancement local (non utilisé sur Render, mais utile pour tester)
if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)

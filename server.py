from flask import Flask, jsonify, request, abort, send_from_directory
from flask_cors import CORS
from functools import wraps

app = Flask(__name__, static_folder='public', static_url_path='')
CORS(app, resources={r"/api/*": {"origins": ["http://localhost:5001"]}})

API_KEY = "v44i31er5u015nd190105a"
BYPASS_TOKEN = "tt44315015"  

maintenance = {
    "isActive": False,
    "message": "Maintenance en cours..."
}

# Middleware pour vérifier le mode maintenance
def check_maintenance(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if maintenance["isActive"]:
            client_ip = request.remote_addr
            bypass_token = request.args.get("bypass") or request.headers.get("x-bypass-token")
            
            if bypass_token == BYPASS_TOKEN:
                return f(*args, **kwargs)
            
            return jsonify(maintenance), 503
        
        return f(*args, **kwargs)
    return decorated_function

def check_api_key():
    api_key = request.headers.get('X-API-Key')
    if api_key != API_KEY:
        abort(401, description="Clé API invalide")

@app.route('/api/maintenance', methods=['GET'])
@check_maintenance
def get_maintenance():
    return jsonify(maintenance)

@app.route('/api/maintenance', methods=['POST'])
@check_maintenance
def update_maintenance():
    check_api_key()
    data = request.get_json()
    if 'isActive' in data and isinstance(data['isActive'], bool):
        maintenance['isActive'] = data['isActive']
    if 'message' in data and isinstance(data['message'], str):
        maintenance['message'] = data['message']
    return jsonify(maintenance)

@app.route('/')
@check_maintenance
def serve_index():
    return send_from_directory('public', 'admin.html')

@app.route('/maintenance')
def serve_maintenance():
    return send_from_directory('public', 'maintenance.html')

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
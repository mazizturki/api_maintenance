from flask import Flask, jsonify, request, abort, send_from_directory
from flask_cors import CORS

app = Flask(__name__, static_folder='public', static_url_path='')
CORS(app, resources={r"/api/*": {"origins": ["http://localhost:3000"]}})

API_KEY = "v44i31er5u015nd190105a"

def check_api_key():
    api_key = request.headers.get('X-API-Key')
    if api_key != API_KEY:
        abort(401, description="Clé API invalide")

maintenance = {
    "isActive": False,
    "message": "Maintenance en cours..."
}

@app.route('/api/maintenance', methods=['GET'])
def get_maintenance():
    return jsonify(maintenance)

@app.route('/api/maintenance', methods=['POST'])
def update_maintenance():
    check_api_key()
    data = request.get_json()
    if 'isActive' in data and isinstance(data['isActive'], bool):
        maintenance['isActive'] = data['isActive']
    if 'message' in data and isinstance(data['message'], str):
        maintenance['message'] = data['message']
    return jsonify(maintenance)

@app.route('/')
def serve_index():
    return send_from_directory('public', 'index.html')

@app.route('/admin')
def serve_admin():
    return send_from_directory('public', 'admin.html')

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import sqlite3
import os
from datetime import datetime

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Initialize SQLite database
def init_db():
    conn = sqlite3.connect('pharmacy.db')
    cursor = conn.cursor()
    
    # Create inventory table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS inventory (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            quantity INTEGER NOT NULL,
            price REAL NOT NULL,
            exp_date DATE NOT NULL
        )
    ''')
    
    # Create prescriptions table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS prescriptions (
            prescription_id INTEGER PRIMARY KEY AUTOINCREMENT,
            patient_id TEXT NOT NULL,
            drug_id INTEGER NOT NULL,
            dosage TEXT NOT NULL,
            issue_dt DATE NOT NULL,
            FOREIGN KEY (drug_id) REFERENCES inventory(id)
        )
    ''')
    
    # Insert sample data if tables are empty
    cursor.execute('SELECT COUNT(*) FROM inventory')
    if cursor.fetchone()[0] == 0:
        cursor.execute('''
            INSERT INTO inventory (name, quantity, price, exp_date) 
            VALUES ('Aspirin', 100, 5.99, '2024-12-31')
        ''')
        cursor.execute('''
            INSERT INTO inventory (name, quantity, price, exp_date) 
            VALUES ('Paracetamol', 50, 3.99, '2024-10-15')
        ''')
        cursor.execute('''
            INSERT INTO inventory (name, quantity, price, exp_date) 
            VALUES ('Ibuprofen', 200, 7.50, '2025-01-01')
        ''')
    
    conn.commit()
    conn.close()

# Initialize database on startup
init_db()

# Serve static files
@app.route('/')
def serve_index():
    return send_from_directory('.', 'index.html')

@app.route('/<path:path>')
def serve_file(path):
    try:
        return send_from_directory('.', path)
    except:
        return "File not found", 404

# API to get all drugs from inventory
@app.route('/getDrugs', methods=['GET'])
def get_drugs():
    try:
        conn = sqlite3.connect('pharmacy.db')
        cursor = conn.cursor()
        cursor.execute('SELECT id, name, quantity, price, exp_date FROM inventory')
        drugs = cursor.fetchall()
        conn.close()
        
        drug_list = []
        for drug in drugs:
            drug_list.append({
                'id': drug[0],
                'name': drug[1],
                'quantity': drug[2],
                'price': drug[3],
                'exp_date': drug[4]
            })
        
        return jsonify({'drugs': drug_list})
    except Exception as e:
        return jsonify({'message': f'Error fetching drugs: {str(e)}'}), 500

# API to add a drug to inventory
@app.route('/addDrug', methods=['POST'])
def add_drug():
    try:
        data = request.json
        drugName = data['drugName']
        quantity = int(data['quantity'])
        price = float(data['price'])
        expirationDate = data['expirationDate']

        conn = sqlite3.connect('pharmacy.db')
        cursor = conn.cursor()
        cursor.execute('''
            INSERT INTO inventory (name, quantity, price, exp_date) 
            VALUES (?, ?, ?, ?)
        ''', (drugName, quantity, price, expirationDate))
        conn.commit()
        conn.close()
        
        return jsonify({'message': 'Drug added to inventory successfully', 'success': True})
    except Exception as e:
        return jsonify({'message': f'Error adding drug to inventory: {str(e)}', 'success': False}), 500

# API to issue a prescription
@app.route('/issuePrescription', methods=['POST'])
def issue_prescription():
    try:
        data = request.json
        patientId = data['patientId']
        drugId = int(data['drugId'])
        dosage = data['dosage']
        issueDate = data['issueDate']

        # Check if drug exists
        conn = sqlite3.connect('pharmacy.db')
        cursor = conn.cursor()
        cursor.execute('SELECT name, quantity FROM inventory WHERE id = ?', (drugId,))
        drug = cursor.fetchone()
        
        if not drug:
            conn.close()
            return jsonify({'message': 'Drug not found in inventory', 'success': False}), 400
        
        cursor.execute('''
            INSERT INTO prescriptions (patient_id, drug_id, dosage, issue_dt) 
            VALUES (?, ?, ?, ?)
        ''', (patientId, drugId, dosage, issueDate))
        conn.commit()
        conn.close()
        
        return jsonify({'message': f'Prescription issued successfully for {drug[0]}', 'success': True})
    except Exception as e:
        return jsonify({'message': f'Error issuing prescription: {str(e)}', 'success': False}), 500

# API to get all prescriptions
@app.route('/getPrescriptions', methods=['GET'])
def get_prescriptions():
    try:
        conn = sqlite3.connect('pharmacy.db')
        cursor = conn.cursor()
        cursor.execute('''
            SELECT p.prescription_id, p.patient_id, i.name, p.dosage, p.issue_dt
            FROM prescriptions p
            JOIN inventory i ON p.drug_id = i.id
            ORDER BY p.issue_dt DESC
        ''')
        prescriptions = cursor.fetchall()
        conn.close()
        
        prescription_list = []
        for prescription in prescriptions:
            prescription_list.append({
                'id': prescription[0],
                'patient_id': prescription[1],
                'drug_name': prescription[2],
                'dosage': prescription[3],
                'issue_date': prescription[4]
            })
        
        return jsonify({'prescriptions': prescription_list})
    except Exception as e:
        return jsonify({'message': f'Error fetching prescriptions: {str(e)}'}), 500

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
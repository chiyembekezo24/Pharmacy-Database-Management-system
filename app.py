from flask import Flask, request, jsonify, send_from_directory
import cx_Oracle
import os

app = Flask(__name__)

# Oracle database configuration
dsn = cx_Oracle.makedsn("localhost", 1521, service_name="orcl")
connection = cx_Oracle.connect(user="KONDWANI", password="Pa55word", dsn=dsn)

# Serve static files
@app.route('/')
def serve_index():
    return send_from_directory('public', 'index.html')

@app.route('/<path:path>')
def serve_file(path):
    return send_from_directory('public', path)

# API to add a drug to inventory
@app.route('/addDrug', methods=['POST'])
def add_drug():
    data = request.json
    drugName = data['drugName']
    quantity = data['quantity']
    price = data['price']
    expirationDate = data['expirationDate']

    try:
        cursor = connection.cursor()
        cursor.execute("""
            INSERT INTO inventory (name, quantity, price, exp_date) 
            VALUES (:drugName, :quantity, :price, TO_DATE(:expirationDate, 'YYYY-MM-DD'))
        """, [drugName, quantity, price, expirationDate])
        connection.commit()
        return jsonify({'message': 'Drug added to inventory successfully'})
    except cx_Oracle.DatabaseError as e:
        error, = e.args
        return jsonify({'message': f'Error adding drug to inventory: {error.message}'}), 500

# API to issue a prescription
@app.route('/issuePrescription', methods=['POST'])
def issue_prescription():
    data = request.json
    patientId = data['patientId']
    drugId = data['drugId']
    dosage = data['dosage']
    issueDate = data['issueDate']

    try:
        cursor = connection.cursor()
        cursor.execute("""
            INSERT INTO prescriptions (patient_id, drug_id, dosage, issue_dt) 
            VALUES (:patientId, :drugId, :dosage, TO_DATE(:issueDate, 'YYYY-MM-DD'))
        """, [patientId, drugId, dosage, issueDate])
        connection.commit()
        return jsonify({'message': 'Prescription issued successfully'})
    except cx_Oracle.DatabaseError as e:
        error, = e.args
        return jsonify({'message': f'Error issuing prescription: {error.message}'}), 500

if __name__ == '__main__':
    app.run(debug=True)

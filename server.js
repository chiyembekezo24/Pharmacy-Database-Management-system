const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('.'));

// Initialize SQLite database
function initDb() {
    const db = new sqlite3.Database('pharmacy.db');
    
    // Create inventory table
    db.run(`
        CREATE TABLE IF NOT EXISTS inventory (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            quantity INTEGER NOT NULL CHECK (quantity >= 0),
            price REAL NOT NULL CHECK (price >= 0),
            exp_date DATE NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `);
    
    // Create prescriptions table
    db.run(`
        CREATE TABLE IF NOT EXISTS prescriptions (
            prescription_id INTEGER PRIMARY KEY AUTOINCREMENT,
            patient_id TEXT NOT NULL,
            drug_id INTEGER NOT NULL,
            dosage TEXT NOT NULL,
            issue_dt DATE NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (drug_id) REFERENCES inventory(id) ON DELETE RESTRICT
        )
    `);
    
    // Create patients table
    db.run(`
        CREATE TABLE IF NOT EXISTS patients (
            patient_id TEXT PRIMARY KEY,
            patient_name TEXT NOT NULL,
            phone TEXT,
            address TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `);
    
    // Create trigger to reduce inventory on prescription
    db.run(`
        CREATE TRIGGER IF NOT EXISTS reduce_inventory_on_prescription
        AFTER INSERT ON prescriptions
        BEGIN
            UPDATE inventory 
            SET quantity = quantity - 1,
                updated_at = CURRENT_TIMESTAMP
            WHERE id = NEW.drug_id AND quantity > 0;
        END
    `);
    
    console.log('Database initialized with enhanced schema. Ready for custom drug entries.');
    
    db.close();
}

// Initialize database on startup
initDb();

// Serve static files
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// API to get all drugs from inventory
app.get('/getDrugs', (req, res) => {
    const db = new sqlite3.Database('pharmacy.db');
    
    db.all('SELECT id, name, quantity, price, exp_date FROM inventory ORDER BY name', (err, rows) => {
        if (err) {
            res.status(500).json({ message: `Error fetching drugs: ${err.message}` });
        } else {
            const drugList = rows.map(drug => ({
                id: drug.id,
                name: drug.name,
                quantity: drug.quantity,
                price: drug.price,
                exp_date: drug.exp_date
            }));
            res.json({ drugs: drugList });
        }
        db.close();
    });
});

// API to add a drug to inventory
app.post('/addDrug', (req, res) => {
    const { drugName, quantity, price, expirationDate } = req.body;
    const db = new sqlite3.Database('pharmacy.db');
    
    // Validate input
    if (!drugName || !quantity || !price || !expirationDate) {
        res.status(400).json({ 
            message: 'All fields are required', 
            success: false 
        });
        db.close();
        return;
    }
    
    if (parseInt(quantity) <= 0) {
        res.status(400).json({ 
            message: 'Quantity must be greater than 0', 
            success: false 
        });
        db.close();
        return;
    }
    
    if (parseFloat(price) < 0) {
        res.status(400).json({ 
            message: 'Price cannot be negative', 
            success: false 
        });
        db.close();
        return;
    }
    
    db.run(
        'INSERT INTO inventory (name, quantity, price, exp_date) VALUES (?, ?, ?, ?)',
        [drugName.trim(), parseInt(quantity), parseFloat(price), expirationDate],
        function(err) {
            if (err) {
                res.status(500).json({ 
                    message: `Error adding drug to inventory: ${err.message}`, 
                    success: false 
                });
            } else {
                res.json({ 
                    message: `${drugName} added to inventory successfully`, 
                    success: true 
                });
            }
            db.close();
        }
    );
});

// API to issue a prescription
app.post('/issuePrescription', (req, res) => {
    const { patientId, drugId, dosage, issueDate } = req.body;
    const db = new sqlite3.Database('pharmacy.db');
    
    // Validate input
    if (!patientId || !drugId || !dosage || !issueDate) {
        res.status(400).json({ 
            message: 'All fields are required', 
            success: false 
        });
        db.close();
        return;
    }
    
    // Check if drug exists and has sufficient quantity
    db.get('SELECT name, quantity, price FROM inventory WHERE id = ?', [parseInt(drugId)], (err, drug) => {
        if (err) {
            res.status(500).json({ 
                message: `Error checking drug: ${err.message}`, 
                success: false 
            });
            db.close();
            return;
        }
        
        if (!drug) {
            res.status(400).json({ 
                message: 'Drug not found in inventory', 
                success: false 
            });
            db.close();
            return;
        }
        
        if (drug.quantity <= 0) {
            res.status(400).json({ 
                message: `${drug.name} is out of stock`, 
                success: false 
            });
            db.close();
            return;
        }
        
        db.run(
            'INSERT INTO prescriptions (patient_id, drug_id, dosage, issue_dt) VALUES (?, ?, ?, ?)',
            [patientId.trim(), parseInt(drugId), dosage.trim(), issueDate],
            function(err) {
                if (err) {
                    res.status(500).json({ 
                        message: `Error issuing prescription: ${err.message}`, 
                        success: false 
                    });
                    db.close();
                } else {
                    // Return prescription details for printing
                    res.json({ 
                        message: `Prescription issued successfully for ${drug.name}`, 
                        success: true,
                        prescriptionData: {
                            prescriptionId: this.lastID,
                            patientId: patientId.trim(),
                            drugName: drug.name,
                            dosage: dosage.trim(),
                            issueDate: issueDate,
                            price: drug.price
                        }
                    });
                    db.close();
                }
            }
        );
    });
});

// API to get all prescriptions
app.get('/getPrescriptions', (req, res) => {
    const db = new sqlite3.Database('pharmacy.db');
    
    db.all(`
        SELECT 
            p.prescription_id, 
            p.patient_id, 
            i.name, 
            i.price,
            p.dosage, 
            p.issue_dt,
            p.created_at
        FROM prescriptions p
        JOIN inventory i ON p.drug_id = i.id
        ORDER BY p.issue_dt DESC, p.created_at DESC
    `, (err, rows) => {
        if (err) {
            res.status(500).json({ message: `Error fetching prescriptions: ${err.message}` });
        } else {
            const prescriptionList = rows.map(prescription => ({
                id: prescription.prescription_id,
                patient_id: prescription.patient_id,
                drug_name: prescription.name,
                drug_price: prescription.price,
                dosage: prescription.dosage,
                issue_date: prescription.issue_dt,
                created_at: prescription.created_at
            }));
            res.json({ prescriptions: prescriptionList });
        }
        db.close();
    });
});

// API to get prescription details for printing
app.get('/getPrescription/:id', (req, res) => {
    const prescriptionId = req.params.id;
    const db = new sqlite3.Database('pharmacy.db');
    
    db.get(`
        SELECT 
            p.prescription_id,
            p.patient_id,
            i.name as drug_name,
            i.price as drug_price,
            p.dosage,
            p.issue_dt,
            p.created_at
        FROM prescriptions p
        JOIN inventory i ON p.drug_id = i.id
        WHERE p.prescription_id = ?
    `, [prescriptionId], (err, prescription) => {
        if (err) {
            res.status(500).json({ message: `Error fetching prescription: ${err.message}` });
        } else if (!prescription) {
            res.status(404).json({ message: 'Prescription not found' });
        } else {
            res.json({ 
                success: true,
                prescription: {
                    id: prescription.prescription_id,
                    patientId: prescription.patient_id,
                    drugName: prescription.drug_name,
                    drugPrice: prescription.drug_price,
                    dosage: prescription.dosage,
                    issueDate: prescription.issue_dt,
                    createdAt: prescription.created_at
                }
            });
        }
        db.close();
    });
});

// API to get inventory statistics
app.get('/getStats', (req, res) => {
    const db = new sqlite3.Database('pharmacy.db');
    
    const stats = {};
    
    // Get total drugs
    db.get('SELECT COUNT(*) as total FROM inventory', (err, result) => {
        if (!err) stats.totalDrugs = result.total;
        
        // Get low stock count
        db.get('SELECT COUNT(*) as lowStock FROM inventory WHERE quantity <= 10', (err, result) => {
            if (!err) stats.lowStockItems = result.lowStock;
            
            // Get expired drugs count
            db.get("SELECT COUNT(*) as expired FROM inventory WHERE date(exp_date) < date('now')", (err, result) => {
                if (!err) stats.expiredDrugs = result.expired;
                
                // Get total prescriptions
                db.get('SELECT COUNT(*) as total FROM prescriptions', (err, result) => {
                    if (!err) stats.totalPrescriptions = result.total;
                    
                    res.json({ success: true, stats });
                    db.close();
                });
            });
        });
    });
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log('Pharmacy Management System ready with enhanced features');
    console.log('- Custom drug inventory management');
    console.log('- Zambian Kwacha (ZMW) currency support');
    console.log('- Prescription printing functionality');
    console.log('- Automatic inventory reduction on prescription');
});
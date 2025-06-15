-- Pharmacy Database Management System - Complete Database Schema
-- This file contains the complete database structure for the pharmacy system
-- Compatible with SQLite (used by the Node.js backend)

-- =====================================================
-- TABLE CREATION
-- =====================================================

-- Create Inventory Table
CREATE TABLE IF NOT EXISTS inventory (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    quantity INTEGER NOT NULL CHECK (quantity >= 0),
    price REAL NOT NULL CHECK (price >= 0),
    exp_date DATE NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Create Prescriptions Table
CREATE TABLE IF NOT EXISTS prescriptions (
    prescription_id INTEGER PRIMARY KEY AUTOINCREMENT,
    patient_id TEXT NOT NULL,
    drug_id INTEGER NOT NULL,
    dosage TEXT NOT NULL,
    issue_dt DATE NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (drug_id) REFERENCES inventory(id) ON DELETE RESTRICT
);

-- Create Patients Table (for better prescription management)
CREATE TABLE IF NOT EXISTS patients (
    patient_id TEXT PRIMARY KEY,
    patient_name TEXT NOT NULL,
    phone TEXT,
    address TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- INDEXES FOR BETTER PERFORMANCE
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_inventory_name ON inventory(name);
CREATE INDEX IF NOT EXISTS idx_inventory_exp_date ON inventory(exp_date);
CREATE INDEX IF NOT EXISTS idx_prescriptions_patient ON prescriptions(patient_id);
CREATE INDEX IF NOT EXISTS idx_prescriptions_drug ON prescriptions(drug_id);
CREATE INDEX IF NOT EXISTS idx_prescriptions_date ON prescriptions(issue_dt);

-- =====================================================
-- TRIGGERS FOR AUTOMATIC UPDATES
-- =====================================================

-- Trigger to update inventory timestamp on modification
CREATE TRIGGER IF NOT EXISTS update_inventory_timestamp 
    AFTER UPDATE ON inventory
BEGIN
    UPDATE inventory SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

-- Trigger to reduce inventory quantity when prescription is issued
CREATE TRIGGER IF NOT EXISTS reduce_inventory_on_prescription
    AFTER INSERT ON prescriptions
BEGIN
    UPDATE inventory 
    SET quantity = quantity - 1,
        updated_at = CURRENT_TIMESTAMP
    WHERE id = NEW.drug_id AND quantity > 0;
END;

-- =====================================================
-- VIEWS FOR REPORTING
-- =====================================================

-- View for prescription details with drug information
CREATE VIEW IF NOT EXISTS prescription_details AS
SELECT 
    p.prescription_id,
    p.patient_id,
    i.name as drug_name,
    i.price as drug_price,
    p.dosage,
    p.issue_dt,
    p.created_at,
    i.quantity as remaining_stock
FROM prescriptions p
JOIN inventory i ON p.drug_id = i.id
ORDER BY p.issue_dt DESC;

-- View for low stock alerts
CREATE VIEW IF NOT EXISTS low_stock_alert AS
SELECT 
    id,
    name,
    quantity,
    price,
    exp_date,
    CASE 
        WHEN quantity = 0 THEN 'OUT OF STOCK'
        WHEN quantity <= 5 THEN 'CRITICAL LOW'
        WHEN quantity <= 10 THEN 'LOW STOCK'
        ELSE 'ADEQUATE'
    END as stock_status
FROM inventory
WHERE quantity <= 10
ORDER BY quantity ASC;

-- View for expiring drugs
CREATE VIEW IF NOT EXISTS expiring_drugs AS
SELECT 
    id,
    name,
    quantity,
    price,
    exp_date,
    CASE 
        WHEN date(exp_date) < date('now') THEN 'EXPIRED'
        WHEN date(exp_date) <= date('now', '+30 days') THEN 'EXPIRING SOON'
        ELSE 'GOOD'
    END as expiry_status,
    CAST((julianday(exp_date) - julianday('now')) AS INTEGER) as days_until_expiry
FROM inventory
WHERE date(exp_date) <= date('now', '+60 days')
ORDER BY exp_date ASC;

-- =====================================================
-- SAMPLE QUERIES FOR TESTING
-- =====================================================

-- Query to get all prescriptions with full details
-- SELECT * FROM prescription_details;

-- Query to check low stock items
-- SELECT * FROM low_stock_alert;

-- Query to check expiring drugs
-- SELECT * FROM expiring_drugs;

-- Query to get prescription history for a specific patient
-- SELECT * FROM prescription_details WHERE patient_id = 'PATIENT_ID';

-- Query to get total sales value
-- SELECT SUM(drug_price) as total_sales FROM prescription_details;

-- =====================================================
-- DATABASE MAINTENANCE QUERIES
-- =====================================================

-- Clean up expired prescriptions older than 2 years
-- DELETE FROM prescriptions WHERE date(issue_dt) < date('now', '-2 years');

-- Update inventory quantities manually if needed
-- UPDATE inventory SET quantity = NEW_QUANTITY WHERE id = DRUG_ID;

-- =====================================================
-- NOTES
-- =====================================================
-- 1. This database uses SQLite syntax and is compatible with the Node.js backend
-- 2. All prices are stored in Zambian Kwacha (ZMW)
-- 3. The system automatically reduces inventory when prescriptions are issued
-- 4. Use the views for easy reporting and monitoring
-- 5. Regular maintenance should be performed to clean old data
-- 6. Always backup the database before making structural changes
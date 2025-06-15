document.addEventListener('DOMContentLoaded', function() {
    const inventoryForm = document.getElementById('inventoryForm');
    const prescriptionForm = document.getElementById('prescriptionForm');
    const inventoryResponse = document.getElementById('inventoryResponse');
    const prescriptionResponse = document.getElementById('prescriptionResponse');

    // Set default dates
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('issueDate').value = today;
    
    // Set minimum expiration date to today
    document.getElementById('expirationDate').min = today;

    // Load drugs for prescription form
    loadDrugsForPrescription();

    // Show different sections
    window.showSection = function(sectionName) {
        hideAllSections();
        document.getElementById('menu').style.display = 'none';
        
        switch(sectionName) {
            case 'inventory':
                document.getElementById('inventorySection').style.display = 'block';
                break;
            case 'prescription':
                document.getElementById('prescriptionSection').style.display = 'block';
                loadDrugsForPrescription();
                break;
            case 'view-inventory':
                document.getElementById('viewInventorySection').style.display = 'block';
                loadInventory();
                break;
            case 'view-prescriptions':
                document.getElementById('viewPrescriptionsSection').style.display = 'block';
                loadPrescriptions();
                break;
        }
    };

    window.showMenu = function() {
        hideAllSections();
        document.getElementById('menu').style.display = 'block';
        clearResponses();
    };

    function hideAllSections() {
        const sections = document.querySelectorAll('.section');
        sections.forEach(section => section.style.display = 'none');
    }

    function clearResponses() {
        inventoryResponse.innerHTML = '';
        prescriptionResponse.innerHTML = '';
    }

    function showMessage(element, message, isSuccess = true) {
        element.innerHTML = `<div class="message ${isSuccess ? 'success' : 'error'}">${message}</div>`;
        setTimeout(() => {
            element.innerHTML = '';
        }, 5000);
    }

    function formatCurrency(amount) {
        return `ZMW ${parseFloat(amount).toFixed(2)}`;
    }

    // Print prescription function
    function printPrescription(prescriptionData) {
        const printWindow = window.open('', '_blank');
        const currentDate = new Date().toLocaleDateString();
        const currentTime = new Date().toLocaleTimeString();
        
        const printContent = `
            <!DOCTYPE html>
            <html>
            <head>
                <title>Prescription - ${prescriptionData.prescriptionId}</title>
                <style>
                    body {
                        font-family: 'Arial', sans-serif;
                        max-width: 600px;
                        margin: 0 auto;
                        padding: 20px;
                        line-height: 1.6;
                        color: #333;
                    }
                    .header {
                        text-align: center;
                        border-bottom: 3px solid #2c3e50;
                        padding-bottom: 20px;
                        margin-bottom: 30px;
                    }
                    .header h1 {
                        color: #2c3e50;
                        margin: 0;
                        font-size: 2rem;
                    }
                    .header p {
                        color: #7f8c8d;
                        margin: 5px 0;
                    }
                    .prescription-details {
                        background: #f8f9fa;
                        padding: 20px;
                        border-radius: 8px;
                        margin: 20px 0;
                        border-left: 4px solid #3498db;
                    }
                    .detail-row {
                        display: flex;
                        justify-content: space-between;
                        margin: 10px 0;
                        padding: 8px 0;
                        border-bottom: 1px solid #ecf0f1;
                    }
                    .detail-row:last-child {
                        border-bottom: none;
                    }
                    .label {
                        font-weight: bold;
                        color: #2c3e50;
                        min-width: 150px;
                    }
                    .value {
                        color: #34495e;
                        text-align: right;
                        flex: 1;
                    }
                    .prescription-id {
                        font-size: 1.2rem;
                        font-weight: bold;
                        color: #e74c3c;
                        text-align: center;
                        margin: 20px 0;
                        padding: 10px;
                        background: #fff;
                        border: 2px dashed #e74c3c;
                        border-radius: 8px;
                    }
                    .dosage-instructions {
                        background: #fff3cd;
                        border: 1px solid #ffeaa7;
                        border-radius: 8px;
                        padding: 15px;
                        margin: 20px 0;
                    }
                    .dosage-instructions h3 {
                        color: #856404;
                        margin-top: 0;
                    }
                    .footer {
                        margin-top: 40px;
                        padding-top: 20px;
                        border-top: 2px solid #ecf0f1;
                        text-align: center;
                        color: #7f8c8d;
                        font-size: 0.9rem;
                    }
                    .price-info {
                        background: #d4edda;
                        border: 1px solid #c3e6cb;
                        border-radius: 8px;
                        padding: 15px;
                        margin: 20px 0;
                        text-align: center;
                    }
                    .price-info h3 {
                        color: #155724;
                        margin: 0;
                        font-size: 1.3rem;
                    }
                    @media print {
                        body { margin: 0; padding: 15px; }
                        .no-print { display: none; }
                    }
                </style>
            </head>
            <body>
                <div class="header">
                    <h1>🏥 PHARMACY PRESCRIPTION</h1>
                    <p>Pharmacy Database Management System</p>
                    <p>Printed on: ${currentDate} at ${currentTime}</p>
                </div>
                
                <div class="prescription-id">
                    PRESCRIPTION ID: #${prescriptionData.prescriptionId}
                </div>
                
                <div class="prescription-details">
                    <div class="detail-row">
                        <span class="label">Patient ID:</span>
                        <span class="value">${prescriptionData.patientId}</span>
                    </div>
                    <div class="detail-row">
                        <span class="label">Drug Name:</span>
                        <span class="value">${prescriptionData.drugName}</span>
                    </div>
                    <div class="detail-row">
                        <span class="label">Issue Date:</span>
                        <span class="value">${prescriptionData.issueDate}</span>
                    </div>
                </div>
                
                <div class="dosage-instructions">
                    <h3>📋 Dosage Instructions</h3>
                    <p style="font-size: 1.1rem; margin: 0; color: #856404; font-weight: 500;">
                        ${prescriptionData.dosage}
                    </p>
                </div>
                
                <div class="price-info">
                    <h3>💰 Drug Price: ${formatCurrency(prescriptionData.price)}</h3>
                    <p style="margin: 5px 0; color: #155724;">Price per unit in Zambian Kwacha</p>
                </div>
                
                <div class="footer">
                    <p><strong>Important:</strong> Follow the dosage instructions carefully</p>
                    <p>Keep this prescription for your records</p>
                    <p>Contact your healthcare provider if you have any questions</p>
                    <hr style="margin: 20px 0;">
                    <p>Generated by Pharmacy Database Management System</p>
                </div>
                
                <div class="no-print" style="text-align: center; margin-top: 30px;">
                    <button onclick="window.print()" style="
                        background: #3498db; 
                        color: white; 
                        border: none; 
                        padding: 12px 24px; 
                        border-radius: 6px; 
                        font-size: 1rem; 
                        cursor: pointer;
                        margin-right: 10px;
                    ">🖨️ Print Prescription</button>
                    <button onclick="window.close()" style="
                        background: #95a5a6; 
                        color: white; 
                        border: none; 
                        padding: 12px 24px; 
                        border-radius: 6px; 
                        font-size: 1rem; 
                        cursor: pointer;
                    ">❌ Close</button>
                </div>
            </body>
            </html>
        `;
        
        printWindow.document.write(printContent);
        printWindow.document.close();
        
        // Auto-focus the print window
        printWindow.focus();
    }

    // Load drugs for prescription dropdown
    async function loadDrugsForPrescription() {
        try {
            const response = await fetch('/getDrugs');
            const result = await response.json();
            
            const drugSelect = document.getElementById('drugId');
            drugSelect.innerHTML = '<option value="">Select a drug from inventory</option>';
            
            if (result.drugs && result.drugs.length > 0) {
                result.drugs.forEach(drug => {
                    if (drug.quantity > 0) { // Only show drugs with stock
                        const option = document.createElement('option');
                        option.value = drug.id;
                        option.textContent = `${drug.name} (Stock: ${drug.quantity}, Price: ${formatCurrency(drug.price)})`;
                        drugSelect.appendChild(option);
                    }
                });
                
                // Add out of stock drugs as disabled options
                result.drugs.forEach(drug => {
                    if (drug.quantity === 0) {
                        const option = document.createElement('option');
                        option.value = '';
                        option.textContent = `${drug.name} - OUT OF STOCK`;
                        option.disabled = true;
                        option.style.color = '#e74c3c';
                        drugSelect.appendChild(option);
                    }
                });
            } else {
                const option = document.createElement('option');
                option.value = '';
                option.textContent = 'No drugs available - Add drugs to inventory first';
                option.disabled = true;
                drugSelect.appendChild(option);
            }
        } catch (error) {
            console.error('Error loading drugs:', error);
            showMessage(prescriptionResponse, 'Error loading available drugs', false);
        }
    }

    // Load and display inventory
    window.loadInventory = async function() {
        const container = document.getElementById('inventoryTable');
        container.innerHTML = '<div class="loading">Loading inventory...</div>';
        
        try {
            const response = await fetch('/getDrugs');
            const result = await response.json();
            
            if (result.drugs && result.drugs.length > 0) {
                let tableHTML = `
                    <table class="data-table">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Drug Name</th>
                                <th>Quantity</th>
                                <th>Price (ZMW)</th>
                                <th>Expiration Date</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                `;
                
                result.drugs.forEach(drug => {
                    const expDate = new Date(drug.exp_date);
                    const today = new Date();
                    const daysUntilExpiry = Math.ceil((expDate - today) / (1000 * 60 * 60 * 24));
                    
                    let status = 'Good';
                    let statusClass = 'status-good';
                    
                    if (daysUntilExpiry < 0) {
                        status = 'Expired';
                        statusClass = 'status-expired';
                    } else if (daysUntilExpiry < 30) {
                        status = 'Expiring Soon';
                        statusClass = 'status-warning';
                    } else if (drug.quantity === 0) {
                        status = 'Out of Stock';
                        statusClass = 'status-expired';
                    } else if (drug.quantity <= 5) {
                        status = 'Critical Low';
                        statusClass = 'status-expired';
                    } else if (drug.quantity <= 10) {
                        status = 'Low Stock';
                        statusClass = 'status-warning';
                    }
                    
                    tableHTML += `
                        <tr>
                            <td>${drug.id}</td>
                            <td>${drug.name}</td>
                            <td>${drug.quantity}</td>
                            <td>${formatCurrency(drug.price)}</td>
                            <td>${drug.exp_date}</td>
                            <td><span class="status ${statusClass}">${status}</span></td>
                        </tr>
                    `;
                });
                
                tableHTML += '</tbody></table>';
                container.innerHTML = tableHTML;
            } else {
                container.innerHTML = `
                    <div class="no-data">
                        <h3>No drugs in inventory</h3>
                        <p>Start by adding your first drug to the inventory using the "Add New Drug" option.</p>
                    </div>
                `;
            }
        } catch (error) {
            container.innerHTML = '<div class="error">Error loading inventory</div>';
            console.error('Error loading inventory:', error);
        }
    };

    // Load and display prescriptions
    window.loadPrescriptions = async function() {
        const container = document.getElementById('prescriptionsTable');
        container.innerHTML = '<div class="loading">Loading prescriptions...</div>';
        
        try {
            const response = await fetch('/getPrescriptions');
            const result = await response.json();
            
            if (result.prescriptions && result.prescriptions.length > 0) {
                let tableHTML = `
                    <table class="data-table">
                        <thead>
                            <tr>
                                <th>Prescription ID</th>
                                <th>Patient ID</th>
                                <th>Drug Name</th>
                                <th>Price (ZMW)</th>
                                <th>Dosage</th>
                                <th>Issue Date</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                `;
                
                result.prescriptions.forEach(prescription => {
                    tableHTML += `
                        <tr>
                            <td>#${prescription.id}</td>
                            <td>${prescription.patient_id}</td>
                            <td>${prescription.drug_name}</td>
                            <td>${formatCurrency(prescription.drug_price)}</td>
                            <td>${prescription.dosage}</td>
                            <td>${prescription.issue_date}</td>
                            <td>
                                <button class="print-btn" onclick="printPrescriptionById(${prescription.id})" 
                                        style="background: #3498db; color: white; border: none; padding: 5px 10px; 
                                               border-radius: 4px; cursor: pointer; font-size: 0.9rem;">
                                    🖨️ Print
                                </button>
                            </td>
                        </tr>
                    `;
                });
                
                tableHTML += '</tbody></table>';
                container.innerHTML = tableHTML;
            } else {
                container.innerHTML = `
                    <div class="no-data">
                        <h3>No prescriptions found</h3>
                        <p>Prescription history will appear here once you start issuing prescriptions.</p>
                    </div>
                `;
            }
        } catch (error) {
            container.innerHTML = '<div class="error">Error loading prescriptions</div>';
            console.error('Error loading prescriptions:', error);
        }
    };

    // Print prescription by ID
    window.printPrescriptionById = async function(prescriptionId) {
        try {
            const response = await fetch(`/getPrescription/${prescriptionId}`);
            const result = await response.json();
            
            if (result.success && result.prescription) {
                const prescriptionData = {
                    prescriptionId: result.prescription.id,
                    patientId: result.prescription.patientId,
                    drugName: result.prescription.drugName,
                    dosage: result.prescription.dosage,
                    issueDate: result.prescription.issueDate,
                    price: result.prescription.drugPrice
                };
                printPrescription(prescriptionData);
            } else {
                alert('Error loading prescription details for printing');
            }
        } catch (error) {
            console.error('Error fetching prescription for printing:', error);
            alert('Error loading prescription details for printing');
        }
    };

    // Add drug to inventory
    async function addDrug(name, quantity, price, expDate) {
        const data = {
            drugName: name,
            quantity: quantity,
            price: price,
            expirationDate: expDate
        };

        try {
            const response = await fetch('/addDrug', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });

            const result = await response.json();
            showMessage(inventoryResponse, result.message, result.success);
            
            if (result.success) {
                inventoryForm.reset();
                // Reset minimum date for expiration
                document.getElementById('expirationDate').min = today;
                loadDrugsForPrescription(); // Refresh drug list for prescriptions
            }
        } catch (error) {
            showMessage(inventoryResponse, 'Error adding drug to inventory. Please try again.', false);
            console.error('Error:', error);
        }
    }

    // Issue prescription
    async function issuePrescription(patientId, drugId, dosage, issueDt) {
        const data = {
            patientId: patientId,
            drugId: drugId,
            dosage: dosage,
            issueDate: issueDt
        };

        try {
            const response = await fetch('/issuePrescription', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });

            const result = await response.json();
            showMessage(prescriptionResponse, result.message, result.success);
            
            if (result.success) {
                prescriptionForm.reset();
                document.getElementById('issueDate').value = today;
                loadDrugsForPrescription(); // Refresh drug list to show updated stock
                
                // Show print option for the new prescription
                if (result.prescriptionData) {
                    setTimeout(() => {
                        const printOption = confirm('Prescription issued successfully! Would you like to print it now?');
                        if (printOption) {
                            printPrescription(result.prescriptionData);
                        }
                    }, 1000);
                }
            }
        } catch (error) {
            showMessage(prescriptionResponse, 'Error issuing prescription. Please try again.', false);
            console.error('Error:', error);
        }
    }

    // Form validation and submission
    inventoryForm.addEventListener('submit', async function(event) {
        event.preventDefault();
        const name = document.getElementById('drugName').value.trim();
        const quantity = parseInt(document.getElementById('quantity').value, 10);
        const price = parseFloat(document.getElementById('price').value);
        const expDate = document.getElementById('expirationDate').value;
        
        // Validation
        if (!name) {
            showMessage(inventoryResponse, 'Please enter a drug name', false);
            return;
        }
        
        if (!quantity || quantity <= 0) {
            showMessage(inventoryResponse, 'Please enter a valid quantity (greater than 0)', false);
            return;
        }
        
        if (!price || price < 0) {
            showMessage(inventoryResponse, 'Please enter a valid price (0 or greater)', false);
            return;
        }
        
        if (!expDate) {
            showMessage(inventoryResponse, 'Please select an expiration date', false);
            return;
        }
        
        const selectedDate = new Date(expDate);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        if (selectedDate < today) {
            showMessage(inventoryResponse, 'Expiration date cannot be in the past', false);
            return;
        }
        
        await addDrug(name, quantity, price, expDate);
    });

    prescriptionForm.addEventListener('submit', async function(event) {
        event.preventDefault();
        const patientId = document.getElementById('patientId').value.trim();
        const drugId = document.getElementById('drugId').value;
        const dosage = document.getElementById('dosage').value.trim();
        const issueDate = document.getElementById('issueDate').value;
        
        // Validation
        if (!patientId) {
            showMessage(prescriptionResponse, 'Please enter a patient ID', false);
            return;
        }
        
        if (!drugId) {
            showMessage(prescriptionResponse, 'Please select a drug from the list', false);
            return;
        }
        
        if (!dosage) {
            showMessage(prescriptionResponse, 'Please enter dosage instructions', false);
            return;
        }
        
        if (!issueDate) {
            showMessage(prescriptionResponse, 'Please select an issue date', false);
            return;
        }
        
        await issuePrescription(patientId, drugId, dosage, issueDate);
    });
});
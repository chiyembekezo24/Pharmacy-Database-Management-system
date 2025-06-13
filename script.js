document.addEventListener('DOMContentLoaded', function() {
    const inventoryForm = document.getElementById('inventoryForm');
    const prescriptionForm = document.getElementById('prescriptionForm');
    const inventoryResponse = document.getElementById('inventoryResponse');
    const prescriptionResponse = document.getElementById('prescriptionResponse');

    // Set default dates
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('issueDate').value = today;

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

    // Load drugs for prescription dropdown
    async function loadDrugsForPrescription() {
        try {
            const response = await fetch('/getDrugs');
            const result = await response.json();
            
            const drugSelect = document.getElementById('drugId');
            drugSelect.innerHTML = '<option value="">Select a drug</option>';
            
            if (result.drugs) {
                result.drugs.forEach(drug => {
                    const option = document.createElement('option');
                    option.value = drug.id;
                    option.textContent = `${drug.name} (ID: ${drug.id}, Stock: ${drug.quantity})`;
                    drugSelect.appendChild(option);
                });
            }
        } catch (error) {
            console.error('Error loading drugs:', error);
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
                                <th>Price ($)</th>
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
                    } else if (drug.quantity < 10) {
                        status = 'Low Stock';
                        statusClass = 'status-warning';
                    }
                    
                    tableHTML += `
                        <tr>
                            <td>${drug.id}</td>
                            <td>${drug.name}</td>
                            <td>${drug.quantity}</td>
                            <td>$${parseFloat(drug.price).toFixed(2)}</td>
                            <td>${drug.exp_date}</td>
                            <td><span class="status ${statusClass}">${status}</span></td>
                        </tr>
                    `;
                });
                
                tableHTML += '</tbody></table>';
                container.innerHTML = tableHTML;
            } else {
                container.innerHTML = '<div class="no-data">No drugs in inventory</div>';
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
                                <th>Dosage</th>
                                <th>Issue Date</th>
                            </tr>
                        </thead>
                        <tbody>
                `;
                
                result.prescriptions.forEach(prescription => {
                    tableHTML += `
                        <tr>
                            <td>${prescription.id}</td>
                            <td>${prescription.patient_id}</td>
                            <td>${prescription.drug_name}</td>
                            <td>${prescription.dosage}</td>
                            <td>${prescription.issue_date}</td>
                        </tr>
                    `;
                });
                
                tableHTML += '</tbody></table>';
                container.innerHTML = tableHTML;
            } else {
                container.innerHTML = '<div class="no-data">No prescriptions found</div>';
            }
        } catch (error) {
            container.innerHTML = '<div class="error">Error loading prescriptions</div>';
            console.error('Error loading prescriptions:', error);
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
                loadDrugsForPrescription(); // Refresh drug list
            }
        } catch (error) {
            showMessage(inventoryResponse, 'Error adding drug to inventory', false);
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
            }
        } catch (error) {
            showMessage(prescriptionResponse, 'Error issuing prescription', false);
            console.error('Error:', error);
        }
    }

    // Form event listeners
    inventoryForm.addEventListener('submit', async function(event) {
        event.preventDefault();
        const name = document.getElementById('drugName').value.trim();
        const quantity = parseInt(document.getElementById('quantity').value, 10);
        const price = parseFloat(document.getElementById('price').value);
        const expDate = document.getElementById('expirationDate').value;
        
        if (name && quantity > 0 && price >= 0 && expDate) {
            await addDrug(name, quantity, price, expDate);
        } else {
            showMessage(inventoryResponse, 'Please fill in all fields correctly', false);
        }
    });

    prescriptionForm.addEventListener('submit', async function(event) {
        event.preventDefault();
        const patientId = document.getElementById('patientId').value.trim();
        const drugId = document.getElementById('drugId').value;
        const dosage = document.getElementById('dosage').value.trim();
        const issueDate = document.getElementById('issueDate').value;
        
        if (patientId && drugId && dosage && issueDate) {
            await issuePrescription(patientId, drugId, dosage, issueDate);
        } else {
            showMessage(prescriptionResponse, 'Please fill in all fields', false);
        }
    });
});
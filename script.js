document.addEventListener('DOMContentLoaded', function() {
    const inventoryForm = document.getElementById('inventoryForm');
    const prescriptionForm = document.getElementById('prescriptionForm');
    const inventoryResponse = document.getElementById('inventoryResponse');
    const prescriptionResponse = document.getElementById('prescriptionResponse');

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
            inventoryResponse.innerText = result.message;
        } catch (error) {
            inventoryResponse.innerText = 'Error adding drug to inventory';
        }
    }

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
            prescriptionResponse.innerText = result.message;
        } catch (error) {
            prescriptionResponse.innerText = 'Error issuing prescription';
        }
    }

    inventoryForm.addEventListener('submit', async function(event) {
        event.preventDefault();
        const name = document.getElementById('drugName').value;
        const quantity = parseInt(document.getElementById('quantity').value, 10);
        const price = parseFloat(document.getElementById('price').value);
        const expDate = document.getElementById('expirationDate').value;
        await addDrug(name, quantity, price, expDate);
    });

    prescriptionForm.addEventListener('submit', async function(event) {
        event.preventDefault();
        const patientId = document.getElementById('patientId').value;
        const drugId = document.getElementById('drugId').value;
        const dosage = document.getElementById('dosage').value;
        const issueDate = document.getElementById('issueDate').value;
        await issuePrescription(patientId, drugId, dosage, issueDate);
    });
});

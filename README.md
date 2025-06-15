# Pharmacy Database Management System

A complete software program called the Pharmacy Database Management System (PDBMS) was created to simplify the management of pharmacological data in a pharmacy setting. With the help of this system, pharmacy employees and pharmacists can effectively save, retrieve, and manage patient, prescription, inventory, and other related data.

## 🚀 Features

- **💊 Medication Management:** Easily add, edit, and delete details such as name, dose, manufacturer, and expiration date about different drugs
- **👥 Patient Records:** Keep thorough patient records that include personal data, medical history, allergies, and prescription information
- **📋 Prescription Management:** Keep track of refill requests, manage prescriptions from medical professionals, and make sure all legal criteria are met
- **📊 Inventory Control:** Track the amount of medication in stock, set up automatic reorder points, and create reports to keep an eye on expiration dates and stock levels
- **💰 Billing and Invoicing:** Prepare prescription drug bills, oversee insurance claims, and track patient and insurer payments (All prices in Zambian Kwacha - ZMW)
- **📈 Reporting and Analytics:** Create individualized reports and analytics to learn more about patient demographics, medicine consumption, revenue patterns, and other topics
- **🖨️ Prescription Printing:** Professional prescription printouts with all patient and drug details
- **🗑️ Delete Functionality:** Safely delete drugs from inventory and prescriptions with automatic inventory restoration

## 🛠️ Technology Stack

- **Backend:** Node.js with Express.js
- **Database:** SQLite (lightweight, file-based database)
- **Frontend:** HTML5, CSS3, JavaScript (Vanilla)
- **Currency:** Zambian Kwacha (ZMW)

## 📋 Prerequisites

Before running this application, make sure you have:

- **Node.js** (version 14 or higher) installed on your system
- **npm** (Node Package Manager) - comes with Node.js

## 🚀 Installation & Setup

### Option 1: Clone from GitHub

```bash
# Clone the repository
git clone https://github.com/yourusername/pharmacy-database-management-system.git

# Navigate to project directory
cd pharmacy-database-management-system

# Install dependencies
npm install

# Start the application
npm start
```

### Option 2: Download and Run Locally

1. Download all project files to your local machine
2. Open terminal/command prompt in the project directory
3. Run the following commands:

```bash
# Install dependencies
npm install

# Start the application
npm start
```

## 🌐 Usage

1. **Start the Server:**
   ```bash
   npm start
   ```

2. **Access the Application:**
   - Open your web browser
   - Navigate to: `http://localhost:5000`

3. **Main Features:**
   - **Add New Drug:** Add medications to your inventory with prices in ZMW
   - **Issue Prescription:** Create prescriptions for patients with automatic inventory reduction
   - **View Inventory:** Monitor stock levels, expiration dates, and drug status
   - **View Prescriptions:** Access prescription history with print and delete options
   - **Print Prescriptions:** Generate professional prescription printouts
   - **Delete Records:** Remove drugs or prescriptions with safety confirmations

## 📁 Project Structure

```
pharmacy-database-management-system/
├── index.html              # Main HTML file
├── style.css              # Styling and responsive design
├── script.js              # Frontend JavaScript functionality
├── server.js              # Node.js backend server
├── package.json           # Project dependencies and scripts
├── pharmacy_database.sql  # Complete database schema
├── README.md              # Project documentation
└── pharmacy.db           # SQLite database (created automatically)
```

## 🔧 Configuration

The application uses the following default settings:

- **Port:** 5000 (configurable via environment variable)
- **Database:** SQLite file-based database (`pharmacy.db`)
- **Currency:** Zambian Kwacha (ZMW)

To change the port:
```bash
PORT=3000 npm start
```

## 📊 Database Schema

The system uses three main tables:

1. **inventory** - Stores drug information, quantities, prices, and expiration dates
2. **prescriptions** - Records all issued prescriptions with patient and drug details
3. **patients** - Maintains patient information for better record keeping

## 🔒 Safety Features

- **Confirmation Dialogs:** All delete operations require user confirmation
- **Inventory Protection:** Cannot delete drugs that have existing prescriptions
- **Automatic Restoration:** Deleting prescriptions automatically restores inventory quantities
- **Data Validation:** All forms include comprehensive input validation
- **Expiration Tracking:** Automatic alerts for expired or expiring medications

## 🖨️ Printing Features

- **Immediate Printing:** Option to print prescriptions right after issuing
- **Historical Printing:** Print any prescription from the history view
- **Professional Format:** Clean, medical-standard prescription layout
- **Complete Information:** Includes all relevant patient and drug details

## 🌍 GitHub Compatibility

This project is fully compatible with GitHub and can be:

- ✅ Cloned directly from GitHub repositories
- ✅ Run on any local machine with Node.js
- ✅ Deployed to cloud platforms (Heroku, Railway, etc.)
- ✅ Shared and collaborated on through version control

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

If you encounter any issues:

1. Check that Node.js is properly installed
2. Ensure all dependencies are installed (`npm install`)
3. Verify the port 5000 is not in use by other applications
4. Check the console for any error messages

## 🔄 Updates

The system automatically:
- Creates the database on first run
- Reduces inventory when prescriptions are issued
- Restores inventory when prescriptions are deleted
- Tracks all changes with timestamps

---

**Made with ❤️ for efficient pharmacy management in Zambia**
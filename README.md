# BANTAY-INIT

bantay-init: This folder contains the **frontend application** for **BANTAY-INIT**, a cost-effective IoT system designed for **real-time heat index monitoring** to address urban heat island (UHI) effects. The project combines IoT sensors, machine learning, and a web-based dashboard to provide actionable data for local government units (LGUs) and communities.

---

## **Project Overview**
The **BANTAY-INIT** project focuses on:
- **Real-Time Heat Index Monitoring**: Data from IoT devices is sent to the Firebase Realtime Database and visualized through the frontend.
- **Urban Heat Island Mitigation**: Identifying localized hotspots to assist in informed urban planning.
- **Inclusivity**: The system emphasizes helping marginalized communities by providing open access to environmental data.

This frontend application is developed as part of our Special Problem for **CMSC 198.1** and **CMSC 198.2 (Thesis)** at **UP Visayas - Miagao**.

---

## **Key Features**
1. **Real-Time Data Visualization**:
   - Displays temperature, humidity, and heat index using responsive and dynamic graphs powered by **Chart.js**.
   - Updates instantly using **Firebase Realtime Database**.

2. **Modern, Minimal UI**:
   - Built with **React**, **TypeScript**, and **TailwindCSS** for a clean, responsive, and user-friendly experience.

3. **Expandable Architecture**:
   - Designed for scalability to integrate additional environmental metrics or external systems.

---

## **How It Works**
1. **IoT Sensors**:
   - ESP32-based devices measure temperature and humidity and transmit data to the **Firebase Realtime Database**.
2. **Dashboard**:
   - The frontend fetches real-time data from Firebase and visualizes it as interactive charts.
3. **Data Analysis**:
   - The system identifies anomalies and trends to support heat island mitigation efforts.

---

## **Getting Started**
### **Prerequisites**
- Node.js (v18 or later)
- npm or yarn
- Firebase project credentials (configured in `firebaseConfig.ts`)

### **Installation**
1. Clone the repository:
   ```bash
   git clone https://github.com/your-repo/B-1N1T.git
   cd B-1N1T/bantay-init

2. Install dependencies:
   ```bash 
   npm install

3. Start the development server:
   ```bash
   npm run dev


4. Open the app in your browser (usually at http://localhost:5173).

### Features Under Development
- Heat Index Alerts: Notify users when heat index exceeds safe thresholds.
- Data History and Analysis: Provide trends and insights based on stored data.
- GIS Mapping: Overlay data on geographic maps for spatial analysis of hotspots.

### Contributors
@tinapay, @xkaze09, @Megunut

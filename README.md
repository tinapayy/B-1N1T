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

# Contribution Workflow for BANTAY-INIT Project

This document provides a structured workflow for **frontend** and **backend** developers contributing to the project, including steps for design implementation, component development, and backend integration.

---

## **General Workflow for All Developers**

### **Set Up the Project Locally**
1. Clone the repository:
   ```bash
   git clone https://github.com/tinapayy/B-1N1T.git
   cd bantay-init
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
   
### **Branching Strategy**
- **Main Branches**:
  - `main`: Production-ready branch.
  - `dev`: Development branch (merge all features here).
- **Feature Branches**:
  - Use `feature/<feature-name>` for individual features or components.
  - Create a new branch:
    ```bash
    git checkout -b feature/<your-feature-name>
    ```

### **Contribution Guidelines**
- Follow coding conventions defined in `CONTRIBUTING.md`.
- Document new dependencies or configurations in `README.md`.

---

## **Frontend Developer Workflow**

### **1. Set Up the Frontend**
- Ensure all dependencies are installed and the development server is running:
  ```bash
  npm run dev
  ```

### **2. Design Guidelines**
- Refer to design mockups in **Figma**, **Adobe XD**, or **Sketch**.
- Use **Tailwind CSS** for styling:
  - Responsive design: Use responsive utilities (`sm`, `md`, `lg`, etc.).
  - Reusable components: Create modular components.

### **3. Add or Update Components**

#### Create a New Component
- Add components in the `src/components` folder.
- Example file structure:
  ```
  src/
  ├── components/
  │   ├── Header.tsx
  │   ├── Footer.tsx
  │   └── Graph.tsx
  ```

#### Example Component: `Header.tsx`
```tsx
import React from "react";

const Header: React.FC = () => {
  return (
    <header className="bg-blue-500 text-white p-4">
      <h1 className="text-xl font-bold">BANTAY-INIT Dashboard</h1>
    </header>
  );
};

export default Header;
```

#### Integrate Components
- Import and use the component in `App.tsx`:
```tsx
import Header from "./components/Header";

const App = () => {
  return (
    <div>
      <Header />
      {/* Other components */}
    </div>
  );
};

export default App;
```

#### Testing
- Run the development server and visually test the component.
- Write unit tests where applicable.

### **4. Push Changes**
1. Add, commit, and push changes:
   ```bash
   git add .
   git commit -m "Add Header component"
   git push origin feature/<your-feature-name>
   ```
2. Open a pull request to the `dev` branch.

---

## **Backend Developer Workflow**

### **1. Set Up the Backend**
1. Ensure backend dependencies are installed:
   ```bash
   npm install
   ```
2. Run the backend server (if applicable):
   ```bash
   npm start
   ```

### **2. Firebase Integration**

#### Extend Database Structure
- For new data types, define a clear structure in Firebase:
```json
{
  "sensor": {
    "temperature": 25.5,
    "humidity": 60.3
  },
  "alerts": {
    "thresholds": {
      "temperature": 30,
      "humidity": 80
    }
  }
}
```

#### Create Utility Functions
- Example: Retrieve sensor data:
```typescript
import { ref, get } from "firebase/database";
import { db } from "./utils/firebaseConfig";

export const getSensorData = async () => {
  const snapshot = await get(ref(db, "sensor"));
  return snapshot.val();
};
```

#### Test Changes
- Use **Postman** or similar tools to test backend functionality.

### **3. Push Changes**
1. Add, commit, and push changes:
   ```bash
   git add .
   git commit -m "Add Firebase threshold rules"
   git push origin feature/<your-feature-name>
   ```
2. Open a pull request to the `dev` branch.

---

## **Project-Wide Collaboration**

### **Pull Request Reviews**
1. **Create Pull Request (PR)**:
   - Clearly describe the changes made.
   - Mention any dependencies or follow-up tasks.

2. **Review Process**:
   - PRs must be reviewed by at least one other developer.
   - Resolve conflicts and update the branch before merging.

### **Syncing Changes**
- Regularly pull changes from the `dev` branch:
  ```bash
  git pull origin dev
  ```

### **Code Quality**
1. **Linting**:
   - Ensure ESLint and Prettier are set up for consistent formatting:
     ```bash
     npm run lint
     ```
2. **Testing**:
   - Write unit tests for components and backend logic.

---

## **Deployment Guidelines**

### **Frontend Deployment**
- Deploy the frontend using **Vercel** or **Netlify**.
- Update environment variables (Firebase keys) in the deployment platform.

### **Backend Deployment**
- Use **Firebase Hosting** for Realtime Database functions.
- Ensure database security rules are updated before deployment.

---

### Features Under Development
- Heat Index Alerts: Notify users when heat index exceeds safe thresholds.
- Data History and Analysis: Provide trends and insights based on stored data.
- GIS Mapping: Overlay data on geographic maps for spatial analysis of hotspots.

### Contributors
@tinapay, @xkaze09, @Megunut

import { useEffect, useState } from "react";
import { db } from "./utils/firebaseConfig";
import { ref, onValue } from "firebase/database";

const App = () => {
  const [temperature, setTemperature] = useState<number | null>(null);
  const [humidity, setHumidity] = useState<number | null>(null);

  useEffect(() => {
    // Reference the temperature and humidity paths in the database
    const tempRef = ref(db, "temperature");
    const humRef = ref(db, "humidity");

    // Listen for changes in temperature
    onValue(tempRef, (snapshot) => {
      setTemperature(snapshot.val());
    });

    // Listen for changes in humidity
    onValue(humRef, (snapshot) => {
      setHumidity(snapshot.val());
    });
  }, []);

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
      <h1 className="text-3xl font-bold mb-4">BANTAY-INIT Dashboard</h1>
      <div className="bg-white shadow rounded p-6 w-64 text-center">
        <p className="text-xl font-semibold">Temperature</p>
        <p className="text-2xl text-blue-600">{temperature ?? "Loading..."}°C</p>
      </div>
      <div className="bg-white shadow rounded p-6 w-64 text-center mt-4">
        <p className="text-xl font-semibold">Humidity</p>
        <p className="text-2xl text-green-600">{humidity ?? "Loading..."}%</p>
      </div>
    </div>
  );
};

export default App;

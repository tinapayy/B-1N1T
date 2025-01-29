import { useEffect, useState } from "react";
import { db } from "./utils/firebaseConfig";
import { ref, onValue } from "firebase/database";
import Graph from "./components/Graph";

const App = () => {
  const [labels, setLabels] = useState<string[]>([]);
  const [temperatureData, setTemperatureData] = useState<number[]>([]);
  const [humidityData, setHumidityData] = useState<number[]>([]);

  useEffect(() => {
    const tempRef = ref(db, "temperature");
    const humRef = ref(db, "humidity");

    onValue(tempRef, (snapshot) => {
      const timestamp = new Date().toLocaleTimeString();
      const temp = snapshot.val();
      setLabels((prev) => [...prev, timestamp].slice(-10));
      setTemperatureData((prev) => [...prev, temp].slice(-10));
    });

    onValue(humRef, (snapshot) => {
      const hum = snapshot.val();
      setHumidityData((prev) => [...prev, hum].slice(-10));
    });
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center p-6">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">
        BANTAY-INIT Dashboard
      </h1>
      <div className="flex flex-wrap justify-center gap-6 w-full max-w-6xl">
        <div className="bg-white shadow-lg rounded-lg p-4 w-full md:w-[48%]">
          <Graph
            labels={labels}
            data={temperatureData}
            title="Temperature (°C)"
          />
        </div>
        <div className="bg-white shadow-lg rounded-lg p-4 w-full md:w-[48%]">
          <Graph labels={labels} data={humidityData} title="Humidity (%)" />
        </div>
      </div>
    </div>
  );
};

export default App;

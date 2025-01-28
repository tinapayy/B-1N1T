import { useEffect, useState } from "react";
import { db } from "./utils/firebaseConfig";
import { ref, onValue } from "firebase/database";

const App = () => {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    const dataRef = ref(db);
    onValue(dataRef, (snapshot) => {
      setData(snapshot.val());
    });
  }, []);

  return (
    <div className="flex items-center justify-center h-screen bg-gray-100">
      <div>
        <h1 className="text-4xl font-bold text-blue-600">
          Firebase Data:
        </h1>
        <pre className="mt-4 bg-white p-4 rounded shadow">
          {JSON.stringify(data, null, 2)}
        </pre>
      </div>
    </div>
  );
};

export default App;

// src/lib/useFirebaseData.ts
import { useEffect, useState } from "react";
import { getDatabase, ref, onValue } from "firebase/database";
import { app } from "./firebase";

const database = getDatabase(app);

const useFirebaseData = (path: string) => {
  const [data, setData] = useState<any[]>([]); // Store data as an array
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const dataRef = ref(database, path);

    const unsubscribe = onValue(dataRef, (snapshot) => {
      try {
        const value = snapshot.val();
        if (value) {
          // Convert object to array and sort by Firebase keys
          const dataArray = Object.keys(value).map((key) => ({
            id: key, // Firebase auto-generated key
            ...value[key],
          }));
          setData(dataArray);
        } else {
          setData([]); // No data available
        }
        setLoading(false);
      } catch (err) {
        setError(err as Error);
        setLoading(false);
      }
    }, (error) => {
      setError(error);
      setLoading(false);
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, [path]);

  return { data, loading, error };
};

export default useFirebaseData; 
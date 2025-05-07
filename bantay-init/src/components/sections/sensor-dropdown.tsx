// bantay-init\src\components\sections\sensor-dropdown.tsx

"use client";
import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { firestore } from "@/lib/firebase-client";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface Sensor {
  sensorId: string;
  sensorName: string;
}

interface Props {
  selected: string;
  onChange: (sensorId: string) => void;
}

export function SensorDropdown({ selected, onChange }: Props) {
  const [sensors, setSensors] = useState<Sensor[]>([]);

  useEffect(() => {
    async function fetchSensors() {
      const querySnapshot = await getDocs(collection(firestore, "verified_sensors"));
      const list: Sensor[] = [];
      querySnapshot.forEach(doc => {
        const data = doc.data();
        list.push({
          sensorId: doc.id,
          sensorName: data.sensorName || doc.id
        });
      });
      setSensors(list);
    }

    fetchSensors();
  }, []);

  return (
    <Select value={selected} onValueChange={onChange}>
      <SelectTrigger className="w-full">
        <SelectValue placeholder="Select a sensor..." />
      </SelectTrigger>
      <SelectContent>
        {sensors.map((sensor) => (
          <SelectItem key={sensor.sensorId} value={sensor.sensorId}>
            {sensor.sensorName} ({sensor.sensorId})
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

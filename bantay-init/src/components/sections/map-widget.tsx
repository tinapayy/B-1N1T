// "use client";

// import { useState } from "react";
// import {
//   MapContainer,
//   TileLayer,
//   Marker,
//   Popup,
//   useMapEvents,
// } from "react-leaflet";
// import "leaflet/dist/leaflet.css";
// import L from "leaflet";
// import { MapPin, Thermometer, Flame, Navigation } from "lucide-react";

// // Hook to track zoom changes
// const ZoomHandler = ({ setZoom }: { setZoom: (zoom: number) => void }) => {
//   useMapEvents({
//     zoomend: (event) => {
//       setZoom(event.target.getZoom());
//     },
//   });
//   return null;
// };

// const MapWidget = () => {
//   const [zoom, setZoom] = useState(13);
//   const [selectedSensor, setSelectedSensor] = useState<number | null>(null);

//   // 🌡 Sensor Data
//   const sensorData = [
//     {
//       id: 1,
//       lat: 10.7202,
//       lng: 122.5621,
//       temp: 33,
//       heatIndex: 38,
//       location: "Iloilo City Proper",
//     },
//     {
//       id: 2,
//       lat: 10.713,
//       lng: 122.5514,
//       temp: 34,
//       heatIndex: 40,
//       location: "Molo, Iloilo",
//     },
//     {
//       id: 3,
//       lat: 10.7026,
//       lng: 122.5451,
//       temp: 32,
//       heatIndex: 37,
//       location: "Arevalo, Iloilo",
//     },
//     {
//       id: 4,
//       lat: 10.6905,
//       lng: 122.5643,
//       temp: 31,
//       heatIndex: 36,
//       location: "Mandurriao, Iloilo",
//     },
//     {
//       id: 5,
//       lat: 10.687,
//       lng: 122.5697,
//       temp: 35,
//       heatIndex: 42,
//       location: "Jaro, Iloilo",
//     },
//   ];

//   // 🎨 Heat Index Alert Colors
//   const getAlertColor = (heatIndex: number) => {
//     if (heatIndex < 27) return "#00A65A"; // 🟩 Safe (Green)
//     if (heatIndex < 32) return "#FFFF00"; // 🟨 Caution (Yellow)
//     if (heatIndex < 41) return "#FFB029"; // 🟧 Extreme Caution (Orange)
//     if (heatIndex < 51) return "#FF7123"; // 🟥 Danger (Red)
//     return "#CD0201"; // 🛑 Extreme Danger (Dark Red)
//   };

//   // 📌 Custom Marker Using DivIcon
//   const createCustomIcon = (heatIndex: number, id: number) => {
//     const color = getAlertColor(heatIndex);
//     return L.divIcon({
//       html: `<div style="
//         background-color: ${color};
//         color: white;
//         padding: 6px 10px;
//         border-radius: 8px;
//         font-weight: bold;
//         font-size: 14px;
//         text-align: center;
//         box-shadow: 0 0 8px rgba(0,0,0,0.3);
//         ${
//           selectedSensor === id
//             ? "transform: scale(1.1); border: 2px solid white;"
//             : ""
//         }
//       ">
//         ${heatIndex}°C
//       </div>`,
//       className: "custom-marker",
//       iconSize: [50, 50],
//       iconAnchor: [25, 25],
//     });
//   };

//   // Handle marker click
//   const handleMarkerClick = (id: number) => {
//     setSelectedSensor(id);
//   };

//   return (
//     <MapContainer
//       center={[10.7202, 122.5621]} // Iloilo City Proper
//       zoom={zoom}
//       className="h-full w-full rounded-xl"
//       scrollWheelZoom={true}
//       style={{ zIndex: 1 }} // Lower z-index
//     >
//       <ZoomHandler setZoom={setZoom} /> {/* Handle zoom events */}
//       {/* 🗺 Beige/Brown Themed Map */}
//       <TileLayer url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png" />
//       {/* 🔥 Sensor Markers with DivIcons */}
//       {sensorData.map((sensor) => (
//         <Marker
//           key={sensor.id}
//           position={[sensor.lat, sensor.lng]}
//           icon={createCustomIcon(sensor.heatIndex, sensor.id)}
//           eventHandlers={{
//             click: () => handleMarkerClick(sensor.id),
//           }}
//         ></Marker>
//       ))}
//       {/* Display selected sensor info at the bottom of the map */}
//       {selectedSensor && (
//         <div
//           className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-white p-3 rounded-lg shadow-lg z-[1000] text-sm"
//           style={{ minWidth: "200px", maxWidth: "90%" }}
//         >
//           {(() => {
//             const sensor = sensorData.find((s) => s.id === selectedSensor);
//             if (!sensor) return null;
//             return (
//               <>
//                 <div className="flex justify-between mb-1">
//                   <div className="font-bold">{sensor.location}</div>
//                   <div className="text-gray-500 text-sm">ID: {sensor.id}</div>
//                 </div>
//                 <div className="flex justify-between">
//                   <div className="flex items-center">
//                     <Thermometer className="w-4 h-4 mr-1 text-gray-700" />
//                     <span>{sensor.temp}°C</span>
//                   </div>
//                   <div className="flex items-center ml-4">
//                     <Flame className="w-4 h-4 mr-1 text-gray-700" />
//                     <span>{sensor.heatIndex}°C</span>
//                   </div>
//                 </div>
//               </>
//             );
//           })()}
//         </div>
//       )}
//     </MapContainer>
//   );
// };

// export default MapWidget;

#include <Arduino.h>
#include <LoRa.h>
#include <SPI.h>
#include <Wire.h>
#include <WiFi.h>
#include <HTTPClient.h>
#include <Adafruit_GFX.h>
#include <Adafruit_SSD1306.h>

// --- LoRa Pin Definitions ---
#define ss 5
#define rst 14
#define dio0 2
#define BAND 433E6

// --- OLED Display ---
#define SCREEN_WIDTH 128
#define SCREEN_HEIGHT 64
#define OLED_RESET -1
#define SCREEN_ADDRESS 0x3C
Adafruit_SSD1306 display(SCREEN_WIDTH, SCREEN_HEIGHT, &Wire, OLED_RESET);

// --- Wi-Fi Credentials ---
#define WIFI_SSID "3D2Y_2.4Ghz"
#define WIFI_PASSWORD "minecraft@259"

// --- Backend Endpoints ---
#define UPLOAD_ENDPOINT "http://192.168.1.3:3000/api/receiver/upload"
#define RECEIVER_BOOT_ENDPOINT "http://192.168.1.3:3000/api/receiver/boot"
#define SENSOR_BOOT_ENDPOINT "http://192.168.1.3:3000/api/sensor/boot"

// --- Globals ---
String sensorId;
float temperature, humidity, heatIndex;
int lastRSSI = 0;

// --- Setup Wi-Fi ---
void setupWifi() {
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  Serial.print("Connecting to Wi-Fi");
  while (WiFi.status() != WL_CONNECTED) {
    Serial.print(".");
    delay(300);
  }
  Serial.println("\nWi-Fi Connected!");
}

// --- Register Receiver to Backend (1st boot detection) ---
void registerReceiverIfNeeded() {
  String receiverId = "RECEIVER_A8:8F:84";
  HTTPClient http;
  http.begin(RECEIVER_BOOT_ENDPOINT);
  http.addHeader("Content-Type", "application/json");

  String body = "{";
  body += "\"receiverId\":\"" + receiverId + "\",";
  body += "\"mac\":\"" + WiFi.macAddress() + "\"";
  body += "}";

  int code = http.POST(body);
  if (code > 0) {
    Serial.println("Receiver boot POST OK: " + String(code));
    Serial.println("Response: " + http.getString());
  } else {
    Serial.println("Receiver boot POST failed: " + http.errorToString(code));
  }

  http.end();
}

// --- Register Sensor to Backend (via receiver) ---
void registerSensorIfNeeded(const String& sensorId, const String& receiverId) {
  HTTPClient http;
  http.begin(SENSOR_BOOT_ENDPOINT);
  http.addHeader("Content-Type", "application/json");

  String body = "{";
  body += "\"sensorId\":\"" + sensorId + "\",";
  body += "\"receiverId\":\"" + receiverId + "\"";
  body += "}";

  int code = http.POST(body);
  if (code > 0) {
    Serial.println("Sensor boot POST OK: " + String(code));
    Serial.println("Response: " + http.getString());
  } else {
    Serial.println("Sensor boot POST failed: " + http.errorToString(code));
  }

  http.end();
}

// --- Setup LoRa ---
void setupLoRa() {
  Serial.println("LoRa Receiver Init");
  LoRa.setPins(ss, rst, dio0);
  while (!LoRa.begin(BAND)) {
    Serial.print(".");
    delay(500);
  }
  LoRa.setSyncWord(0xA5);
  Serial.println("LoRa Initialized");
}

// --- Update OLED Display ---
void updateDisplay() {
  display.clearDisplay();
  display.setTextSize(1);
  display.setCursor(0, 0);
  display.print("Temp: ");
  display.print(temperature);
  display.println(" C");
  display.print("Humidity: ");
  display.print(humidity);
  display.println(" %");
  display.print("Heat Index: ");
  display.print(heatIndex);
  display.println(" C");
  display.print("RSSI: ");
  display.print(lastRSSI);
  display.println(" dBm");
  display.display();
}

// --- Parse LoRa Payload & Upload ---
void parseLoRaPayload(String payload) {
  int index = 0;
  String data[4];

  while (payload.indexOf(";") > 0 && index < 3) {
    data[index] = payload.substring(0, payload.indexOf(";"));
    payload = payload.substring(payload.indexOf(";") + 1);
    index++;
  }
  data[index] = payload;

  sensorId = data[0];
  temperature = data[1].toFloat();
  humidity = data[2].toFloat();
  heatIndex = data[3].toFloat();

  Serial.println("Parsed from LoRa:");
  Serial.println("Sensor ID: " + sensorId);
  Serial.println("Temp: " + String(temperature));
  Serial.println("Humidity: " + String(humidity));
  Serial.println("Heat Index: " + String(heatIndex));

  if (WiFi.status() == WL_CONNECTED && heatIndex != 0) {
    String receiverId = "RECEIVER_" + WiFi.macAddress().substring(9);

    // First-boot detection for sensor
    registerSensorIfNeeded(sensorId, receiverId);

    // Upload reading
    HTTPClient http;
    http.begin(UPLOAD_ENDPOINT);
    http.addHeader("Content-Type", "application/json");

    String json = "{";
    json += "\"sensorId\":\"" + sensorId + "\",";
    json += "\"temperature\":" + String(temperature) + ",";
    json += "\"humidity\":" + String(humidity) + ",";
    json += "\"heatIndex\":" + String(heatIndex) + ",";
    json += "\"receiverId\":\"" + receiverId + "\"";
    json += "}";

    int httpResponseCode = http.POST(json);

    delay(100);  // Let TCP stack finalize the response

    if (httpResponseCode > 0) {
      Serial.print("POST OK: ");
      Serial.println(httpResponseCode);
      Serial.println("Response: " + http.getString());
    } else {
      Serial.print("POST Failed: ");
      Serial.println(http.errorToString(httpResponseCode).c_str());
    }

    http.end();
  }
}

// --- Setup ---
void setup() {
  Serial.begin(115200);
  Wire.begin(21, 22);

  if (!display.begin(SSD1306_SWITCHCAPVCC, SCREEN_ADDRESS)) {
    Serial.println(F("SSD1306 allocation failed"));
    while (true) {}
  }

  setupWifi();
  registerReceiverIfNeeded();
  setupLoRa();
}

// --- Loop ---
void loop() {
  int packetSize = LoRa.parsePacket();
  if (packetSize && LoRa.available()) {
    String payload = LoRa.readString();
    Serial.println("Received LoRa payload: " + payload);
    parseLoRaPayload(payload);
    lastRSSI = LoRa.packetRssi();
    updateDisplay();
  }
  delay(100);
}

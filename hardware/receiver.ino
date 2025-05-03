#include <Arduino.h>
#include <LoRa.h>
#include <SPI.h>
#include <Wire.h>
#include <Adafruit_GFX.h>
#include <Adafruit_SSD1306.h>
#include <WiFi.h>
#include <Firebase_ESP_Client.h>
#include <addons/TokenHelper.h>

#define ss 5
#define rst 14
#define dio0 2
#define BAND 433E6

#define SCREEN_WIDTH 128
#define SCREEN_HEIGHT 64
#define OLED_RESET -1
#define SCREEN_ADDRESS 0x3C

#define WIFI_SSID ""
#define WIFI_PASSWORD ""
#define API_KEY ""
#define DATABASE_URL ""
#define FIREBASE_PROJECT_ID ""
#define DATABASE_ID ""
#define USER_EMAIL ""
#define USER_PASSWORD ""

FirebaseData fbdo;
FirebaseAuth auth;
FirebaseConfig config;
Adafruit_SSD1306 display(SCREEN_WIDTH, SCREEN_HEIGHT, &Wire, OLED_RESET);

String sensorId;
float temperature, humidity, heatIndex;
int lastRSSI = 0;

void setupLoRa() {
  Serial.println("LoRa Receiver");
  LoRa.setPins(ss, rst, dio0);
  while (!LoRa.begin(BAND)) {
    Serial.print(".");
    delay(500);
  }
  LoRa.setSyncWord(0xA5);
  Serial.println("LoRa Initialized");
}

void setupWifi() {
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  Serial.print("Connecting to Wi-Fi");
  while (WiFi.status() != WL_CONNECTED) {
    Serial.print(".");
    delay(300);
  }
  Serial.println("\nWi-Fi Connected!");
}

void setupFirebase() {
  config.api_key = API_KEY;
  config.database_url = DATABASE_URL;
  auth.user.email = USER_EMAIL;
  auth.user.password = USER_PASSWORD;
  config.token_status_callback = tokenStatusCallback;
  Firebase.reconnectNetwork(true);
  fbdo.setBSSLBufferSize(4096, 1024);
  fbdo.setResponseSize(2048);
  Firebase.begin(&config, &auth);
}

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

  if (Firebase.ready() && auth.token.uid.length() > 0) {
    const char* collectionId = "readings";
    const char* documentId = "";
    const char* mask = "";

    FirebaseJson content;
    content.set("fields/sensorId/stringValue", sensorId);
    content.set("fields/temperature/doubleValue", temperature);
    content.set("fields/humidity/doubleValue", humidity);
    content.set("fields/heatIndex/doubleValue", heatIndex);
    // timestamp will be set in the API route (backend)

    if (Firebase.Firestore.createDocument(&fbdo, FIREBASE_PROJECT_ID, DATABASE_ID, collectionId, documentId, content.raw(), mask)) {
      Serial.println("Firestore upload successful");
    } else {
      Serial.print("Firestore error: ");
      Serial.println(fbdo.errorReason());
    }

    String rtdbPath = "/sensor_readings/" + sensorId;
    FirebaseJson liveData;
    liveData.set("temperature", temperature);
    liveData.set("humidity", humidity);
    liveData.set("heatIndex", heatIndex);
    liveData.set("receiverId", "RECEIVER_" + WiFi.macAddress().substring(9));
    Firebase.RTDB.setJSON(&fbdo, rtdbPath.c_str(), &liveData);
  }
}

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

void setup() {
  Serial.begin(115200);
  Wire.begin(21, 22);  // for OLED

  if (!display.begin(SSD1306_SWITCHCAPVCC, SCREEN_ADDRESS)) {
    Serial.println(F("SSD1306 failed"));
    while (1) {}
  }

  setupWifi();
  setupFirebase();
  setupLoRa();
}

void loop() {
  int packetSize = LoRa.parsePacket();
  if (packetSize) {
    if (LoRa.available()) {
      String payload = LoRa.readString();
      Serial.println("Received LoRa payload: " + payload);
      parseLoRaPayload(payload);
      lastRSSI = LoRa.packetRssi();
      updateDisplay();
    }
  }
  delay(100);
}

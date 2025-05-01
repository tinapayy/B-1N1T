#include <Crypto.h>
#include <AES.h>
#include <Base64.h>
#include <Arduino.h>
#include <LoRa.h>
#include <SPI.h>
#include <Wire.h>
#include <Adafruit_GFX.h>
#include <Adafruit_SSD1306.h>
#include <WiFi.h>
#include <WiFiUdp.h>
#include <NTPClient.h>
#include <Firebase_ESP_Client.h>
#include <addons/TokenHelper.h>

// 🔁 MAC-address based ID
String STATION_ID;

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
WiFiUDP ntpUDP;
NTPClient timeClient(ntpUDP, "pool.ntp.org", 28800, 60000);
Adafruit_SSD1306 display(SCREEN_WIDTH, SCREEN_HEIGHT, &Wire, OLED_RESET);

float heatIndex, temperature, humidity;
int lastRSSI = 0;

String decryptPayload(String encryptedBase64) {
  AES128 aes;
  byte key[] = "A1B2C3D4E5F6G7H8";
  aes.setKey(key, sizeof(key));

  char decoded[32];
  byte decrypted[32];
  int decodedLength = base64_decode(decoded, encryptedBase64.c_str(), encryptedBase64.length());

  aes.decryptBlock((byte*)decoded, decrypted);
  decrypted[16] = '\0';
  return String((char*)decrypted);
}

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
  STATION_ID = "SENSOR_" + WiFi.macAddress().substring(9);
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

void setupNTPClient() {
  timeClient.begin();
  timeClient.update();
}

void parseDecrypted(String decrypted) {
  int index = 0;
  String data[3];

  while (decrypted.indexOf(";") > 0 && index < 3) {
    data[index] = decrypted.substring(0, decrypted.indexOf(";"));
    decrypted = decrypted.substring(decrypted.indexOf(";") + 1);
    index++;
  }
  if (index < 3) data[index] = decrypted;

  temperature = data[0].toFloat();
  humidity = data[1].toFloat();
  heatIndex = data[2].toFloat();

  if (Firebase.ready() && auth.token.uid.length() > 0) {
    String documentPath = "reading";
    String documentId = "";

    FirebaseJson content;
    content.set("fields/temperature/doubleValue", temperature);
    content.set("fields/humidity/doubleValue", humidity);
    content.set("fields/heatIndex/doubleValue", heatIndex);
    content.set("fields/timestamp/integerValue", timeClient.getEpochTime() * 1000);
    content.set("fields/sensorId/stringValue", STATION_ID);

    Serial.println("Uploading to Firestore...");
    if (Firebase.Firestore.createDocument(&fbdo, FIREBASE_PROJECT_ID, DATABASE_ID, documentPath, content.raw(), documentId)) {
      Serial.println("✔ Firestore write successful");
    } else {
      Serial.print("❌ Firestore write failed: ");
      Serial.println(fbdo.errorReason());
    }

    // Realtime Database update
    String rtdbPath = "/sensor_readings/" + STATION_ID;
    FirebaseJson liveData;
    liveData.set("temperature", temperature);
    liveData.set("humidity", humidity);
    liveData.set("heatIndex", heatIndex);
    liveData.set("timestamp", timeClient.getEpochTime() * 1000);
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
  if (!display.begin(SSD1306_SWITCHCAPVCC, SCREEN_ADDRESS)) {
    Serial.println(F("SSD1306 failed"));
    while (1) {}
  }
  setupWifi();
  setupFirebase();
  setupLoRa();
  setupNTPClient();
}

void loop() {
  int packetSize = LoRa.parsePacket();
  if (packetSize) {
    if (LoRa.available()) {
      String encrypted = LoRa.readString();
      Serial.print("Received encrypted: ");
      Serial.println(encrypted);

      String decrypted = decryptPayload(encrypted);
      Serial.print("Decrypted: ");
      Serial.println(decrypted);

      parseDecrypted(decrypted);
      lastRSSI = LoRa.packetRssi();
      updateDisplay();
    }
  }
  delay(100);
}

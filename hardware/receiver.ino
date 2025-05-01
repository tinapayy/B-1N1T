#include <Base64.h>

AESLib aesLib;

String decryptPayload(String encryptedBase64) {
  byte key[] = "A1B2C3D4E5F6G7H8";
  char decoded[32];
  int len = base64_decode(decoded, encryptedBase64.c_str(), encryptedBase64.length());
  byte decrypted[32];
  aesLib.decryptECB((byte*)decoded, decrypted, key);
  decrypted[15] = '\0';
  return String((char*)decrypted);
}

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

#define STATION_ID ""
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
#define USER_EMAIL ""
#define USER_PASSWORD ""

FirebaseData fbdo;
FirebaseAuth auth;
FirebaseConfig config;
WiFiUDP ntpUDP;
NTPClient timeClient(ntpUDP, "pool.ntp.org", 28800, 60000);
Adafruit_SSD1306 display(SCREEN_WIDTH, SCREEN_HEIGHT, &Wire, OLED_RESET);

char timeStr[30];
float heatIndex, temperature, humidity;
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

void setupNTPClient() {
  timeClient.begin();
  timeClient.update();
}

void getCurrentTime() {
  timeClient.update();
  unsigned long epochTime = timeClient.getEpochTime(); // Get current time in seconds
  if (epochTime == 0) {
    Serial.println("NTP sync failed. Using fallback timestamp.");
    epochTime = millis() / 1000; // Fallback to device uptime in seconds
  }
  unsigned long timestampMillis = epochTime * 1000; // Convert to milliseconds
  snprintf(timeStr, sizeof(timeStr), "%lu", timestampMillis); // Format as string
}

void uploadToFirebase() {
  if (Firebase.ready()) {
    FirebaseJson content;
    String documentPath = "/readings/";

    content.set("heatIndex", heatIndex);
    content.set("temperature", temperature);
    content.set("humidity", humidity);

    int retryCount = 0;
    bool success = false;
    while (retryCount < 3 && !success) {
      Serial.print("Uploading data to Firebase... ");
      if (Firebase.RTDB.pushJSON(&fbdo, documentPath.c_str(), &content)) {
        Serial.println("Success!");
        success = true;
      } else {
        Serial.print("Failed: ");
        Serial.println(fbdo.errorReason());
        retryCount++;
        delay(500);
      }
    }
  }
}

void parseLoRaData(String LoRaData) {
  int index = 0;
  String data[3];

  while (LoRaData.indexOf(";") > 0 && index < 3) {
    data[index] = LoRaData.substring(0, LoRaData.indexOf(";"));
    LoRaData = LoRaData.substring(LoRaData.indexOf(";") + 1);
    index++;
  }
  if (index < 3) {
    data[index] = LoRaData;
  }

  temperature = data[0].toFloat();
  humidity = data[1].toFloat();
  heatIndex = data[2].toFloat();

    if (Firebase.ready() && auth.token.uid.length() > 0) {
      String documentPath = "reading"; // flat collection
      String documentId = ""; // auto-ID

      FirebaseJson content;
      content.set("fields/temperature/doubleValue", temperature);
      content.set("fields/humidity/doubleValue", humidity);
      content.set("fields/heatIndex/doubleValue", heatIndex);
      content.set("fields/timestamp/integerValue", timeClient.getEpochTime() * 1000);
      content.set("fields/sensorId/stringValue", "SENSOR_001"); // replace with dynamic if needed

      Serial.println("Uploading to Firestore...");
      Firebase.Firestore.createDocument(&fbdo, FIREBASE_PROJECT_ID, DATABASE_ID, documentPath, content.raw(), documentId) {
        Serial.println("✔ Firestore write successful");
      } else {
        Serial.print("❌ Firestore write failed: ");
        Serial.println(fbdo.errorReason());
      }
    }


}

void setup() {
  Serial.begin(115200);
  delay(1000);
  Serial.println("Starting setup");
  if (!display.begin(SSD1306_SWITCHCAPVCC, SCREEN_ADDRESS)) {
    Serial.println(F("SSD1306 allocation failed"));
    for (;;) {}
  }

  delay(2000);
  display.clearDisplay();
  display.setTextColor(WHITE);
  setupWifi();
  setupFirebase();
  setupLoRa();
  setupNTPClient();
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

  // Display RSSI
  display.print("RSSI: ");
  display.print(lastRSSI);
  display.println(" dBm");

  display.display();
}

void loop() {
  Serial.println("Checking for packets...");
  int packetSize = LoRa.parsePacket();
  if (packetSize) {
    Serial.print("Received packet ");
    if (LoRa.available()) {
      String LoRaData = LoRa.readString();
      Serial.print(LoRaData);
      parseLoRaData(LoRaData);
      lastRSSI = LoRa.packetRssi();  // ✅ Correct global assignment
      updateDisplay();
    }
    Serial.print("' with RSSI ");
    Serial.println(lastRSSI);       // ✅ Use updated global
    uploadToFirebase();
  }
  delay(100);
}

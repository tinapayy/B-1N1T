#include <Arduino.h>
// libraries for LoRa
#include <LoRa.h>
#include <SPI.h>

// libraries for 0.96-in OLED
#include <Wire.h>
#include <Adafruit_GFX.h>
#include <Adafruit_SSD1306.h>

// libraries for Firebase
#include <WiFi.h>
#include <WiFiUdp.h>
#include <NTPClient.h>
#include <Firebase_ESP_Client.h>
#include <addons/TokenHelper.h>
#include <TimeLib.h>

#define STATION_ID "OyPbyjcdILMWRytztHYP" 

// macros for LoRa
#define ss 5
#define rst 14
#define dio0 2

// frequency for Asia
#define BAND 433E6

// macros for OLED display
#define SCREEN_WIDTH 128 
#define SCREEN_HEIGHT 64
#define OLED_RESET     -1 // Reset pin
#define SCREEN_ADDRESS 0x3C

// macros for Firebase
#define WIFI_SSID "3D2Y_2.4Ghz"
#define WIFI_PASSWORD "minecraft@259"
#define API_KEY "AIzaSyDDWHUd5EeFO0jYDG1ebHthZmywjFRNAl0"
#define FIREBASE_PROJECT_ID "project-b-1n1t"
#define USER_EMAIL "pdcordero@up.edu.ph"
#define USER_PASSWORD "1234567890"

// Firebase Data object (FBDO), Auth, and Config
FirebaseData fbdo;
FirebaseAuth auth;
FirebaseConfig config;

int received = 0;

unsigned long dataMillis = 0;
int count = 0;
char timeStr[30];

int readingID = 0;
int packetNum;
float heatIndex;
float temperature;
float humidity;
String formattedDate;

// Define NTP Client to get time
WiFiUDP ntpUDP;
NTPClient timeClient(ntpUDP, "pool.ntp.org", 28800, 60000); // Update every minute

// initialize OLED displawy
Adafruit_SSD1306 display(SCREEN_WIDTH, SCREEN_HEIGHT, &Wire, OLED_RESET);

// display readings on OLED display
void displayData (float temperature, float humidity, float heatIndex) {
      display.clearDisplay();
      
      // display temperature
      display.setTextSize(1);
      display.setCursor(0,0);
      display.print("Temperature: ");
      display.setTextSize(1);
      display.setCursor(0,10);
      display.print(temperature);
      display.print(" ");
      display.setTextSize(1);
      display.cp437(true);
      display.write(167);
      display.setTextSize(1);
      display.print("C");
      
      // display humidity
      display.setTextSize(1);
      display.setCursor(0, 20);
      display.print("Humidity: ");
      display.setTextSize(1);
      display.setCursor(0, 30);
      display.print(humidity);
      display.print(" %"); 

      // display temperature
      display.setTextSize(1);
      display.setCursor(0,40);
      display.print("Heat Index: ");
      display.setTextSize(1);
      display.setCursor(0,50);
      display.print(heatIndex);
      display.print(" ");
      display.setTextSize(1);
      display.cp437(true);
      display.write(167);
      display.setTextSize(1);
      display.print("C");
      
      display.display();
}

// The Firestore payload upload callback function
void fcsUploadCallback(CFS_UploadStatusInfo info)
{
  if (info.status == firebase_cfs_upload_status_init)
  {
    Serial.printf("\nUploading data (%d)...\n", info.size);
  }
  else if (info.status == firebase_cfs_upload_status_upload)
  {
    Serial.printf("Uploaded %d%s\n", (int)info.progress, "%");
  }
  else if (info.status == firebase_cfs_upload_status_complete)
  {
    Serial.println("Upload completed ");
  }
  else if (info.status == firebase_cfs_upload_status_process_response)
  {
    Serial.print("Processing the response... ");
  }
  else if (info.status == firebase_cfs_upload_status_error)
  {
    Serial.printf("Upload failed, %s\n", info.errorMsg.c_str());
  }
}

void setupWifi() 
{
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);

  Serial.print("Connecting to Wi-Fi");
  unsigned long ms = millis();
  while (WiFi.status() != WL_CONNECTED)
  {
    Serial.print(".");
    delay(300);
  }
  Serial.println();
  Serial.print("Connected with IP: ");
  Serial.println(WiFi.localIP());
  Serial.println();

  Serial.printf("Firebase Client v%s\n\n", FIREBASE_CLIENT_VERSION);
}

void setupFirebase() 
{ 
  // Assign credentials and authentication method
  config.api_key = API_KEY;
  auth.user.email = USER_EMAIL;
  auth.user.password = USER_PASSWORD;

  // Assign the callback function for the long running token generation task
  config.token_status_callback = tokenStatusCallback; // see addons/TokenHelper.h

  // Comment or pass false value when WiFi reconnection will control by your code or third party library e.g. WiFiManager
  Firebase.reconnectNetwork(true);

  // Since v4.4.x, BearSSL engine was used, the SSL buffer need to be set.
  // Large data transmission may require larger RX buffer, otherwise connection issue or data read time out can be occurred.
  fbdo.setBSSLBufferSize(4096 /* Rx buffer size in bytes from 512 - 16384 */, 1024 /* Tx buffer size in bytes from 512 - 16384 */);

  // Limit the size of response payload to be collected in FirebaseData
  fbdo.setResponseSize(2048);

  Firebase.begin(&config, &auth);
}

void setupNTPClient() {
  timeClient.begin();
  timeClient.update();
  formattedDate = timeClient.getFormattedTime();
}
void setupLoRa() 
{
  Serial.println("LoRa Receiver");

  LoRa.setPins(ss, rst, dio0); // setup LoRa transceiver module

  while (!LoRa.begin(433E6)) // 433E6 - Asia, 866E6 - Europe, 915E6 - North America
  {
    Serial.print(".");
    delay(500);
  }
  LoRa.setSyncWord(0xA5);
  Serial.println("LoRa Initializing OK!");
}

void getCurrentTime() 
{
  // Update NTP Client to get the current time
  timeClient.update();
  unsigned long epochTime = timeClient.getEpochTime();

  // Convert epoch time to RFC3339 format
  snprintf(timeStr, sizeof(timeStr), "%04d-%02d-%02dT%02d:%02d:%02dZ", year(epochTime), month(epochTime), day(epochTime), hour(epochTime), minute(epochTime), second(epochTime));
}

void uploadToFirebase() 
{
  // Firebase.ready() should be called repeatedly to handle authentication tasks.
  if (Firebase.ready() && (millis() - dataMillis > 60000 || dataMillis == 0))
  {
    dataMillis = millis();

    // Create FirebaseJson object to hold the data
    FirebaseJson content;

    // Create a document path
    String documentPath = "reading/";
    // documentPath += STATION_ID;
    // documentPath += "/" ;
    // documentPath += String(count);
    
    count++;

    // Create a reference path for stationID
    String referencePath = "projects/";
    referencePath += FIREBASE_PROJECT_ID;
    referencePath += "/databases/(default)/documents/station/";
    referencePath += STATION_ID;

    getCurrentTime();

    // Set the fields to be uploaded
    content.set("fields/readingID/integerValue", readingID++);
    content.set("fields/stationID/referenceValue", referencePath.c_str());
    content.set("fields/timestamp/timestampValue", formattedDate);
    content.set("fields/packetNum/integerValue", packetNum);
    content.set("fields/heatIndex/doubleValue", heatIndex);
    content.set("fields/temperature/doubleValue", temperature);
    content.set("fields/humidity/doubleValue", humidity);

    Serial.print("Create a document... ");

    if (Firebase.Firestore.createDocument(&fbdo, FIREBASE_PROJECT_ID, "" /* databaseId can be (default) or empty */, documentPath.c_str(), content.raw())) 
    {
      Serial.printf("ok\n%s\n\n", fbdo.payload().c_str());
    }
    else
    {
      Serial.println(fbdo.errorReason());
    }
  }
}

void parseLoRaData(String LoRaData) 
{
  int index = 0;
  String data[18];
  while (LoRaData.indexOf(";") > 0) 
  {
    data[index] = LoRaData.substring(0, LoRaData.indexOf(";"));
    LoRaData = LoRaData.substring(LoRaData.indexOf(";") + 1);
    index++;
  }
  data[index] = LoRaData;

  packetNum = 1;
  temperature = data[0].toFloat();
  humidity = data[1].toFloat();
  heatIndex = data[2].toFloat();
}




void setup() 
{
  Serial.begin(115200);
  delay(1000); // Add a small delay before initializing LoRa
  Serial.println("Starting setup");
  setupWifi();
  //setupFirebase();
  setupLoRa();
  setupNTPClient();

  if(!display.begin(SSD1306_SWITCHCAPVCC, SCREEN_ADDRESS)) {
    Serial.println(F("SSD1306 allocation failed"));
    for(;;); // Don't proceed, loop forever
  }

  delay(2000);
  display.clearDisplay();
  display.setTextColor(WHITE);  

}

void loop() 
{ 

  Serial.println("Checking for packets...");
  int packetSize = LoRa.parsePacket(); // try to parse packet
  if (packetSize) 
  {
    Serial.print("Received packet ");


    if (LoRa.available()) // read packet
    {
      String LoRaData = LoRa.readString();
      Serial.print(LoRaData);
      displayData(temperature, humidity, heatIndex);
      parseLoRaData(LoRaData);
    }

    Serial.print("' with RSSI "); // print RSSI of packet
    Serial.println(LoRa.packetRssi());

    uploadToFirebase();

  }
  delay(100);
}
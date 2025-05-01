#include <LoRa.h>
#include <SPI.h>
#include <WiFi.h>  // for MAC-based sensorId

//Libraries for LoRa
#include "DHT.h"
#define DHTPIN 4 //pin where the dht11 is connected
DHT dht(DHTPIN, DHT11);

#define ss 5
#define rst 14
#define dio0 2

#define RELAY_PB_L 25      // powerbank to load switch
#define RELAY_INIT 32      // solar to initial powerbank switch
#define RELAY_SECOND 33    // solar to second powerbank switch

#define SECONDS(x) ((x) * 1000UL)

int counter = 0;
int readingID = 0;

String LoRaMessage = "";

float temperature = 0;
float humidity = 0;
float heat_index = 0;

unsigned long previousRelayMillis = 0;
unsigned long relayInterval = 10UL * 1000UL; // 60 seconds in milliseconds
bool useInitialPowerbank = true;

String SENSOR_ID = ""; // MAC-based sender ID

void startDHT()
{
  if (isnan(humidity) || isnan(temperature))
  {
    Serial.println("Failed to read from DHT sensor!");
    return;
  }
  Serial.println("DHT initialize!");
}

//Initialize LoRa module
void setup() 
{
  pinMode(RELAY_INIT, OUTPUT);
  pinMode(RELAY_SECOND, OUTPUT);
  pinMode(RELAY_PB_L, OUTPUT);

  Serial.begin(115200); 
  while (!Serial);

  WiFi.mode(WIFI_STA);           // Required to get MAC
  WiFi.disconnect();             // Don’t connect to AP
  SENSOR_ID = "SENSOR_" + WiFi.macAddress().substring(9); // 
  Serial.print("Sensor ID: ");
  Serial.println(SENSOR_ID);

  dht.begin();
  startDHT();

  Serial.println("LoRa Sender");
  LoRa.setPins(ss, rst, dio0);    //setup LoRa transceiver module

  while (!LoRa.begin(433E6))      //433E6 - Asia, 866E6 - Europe, 915E6 - North America
  {
    Serial.println(".");
    delay(500);
  }
  LoRa.setSyncWord(0xA5);
  Serial.println("LoRa Initializing OK!");
}

void getReadings(){
  humidity = dht.readHumidity();
  temperature = dht.readTemperature();
  heat_index = dht.computeHeatIndex(temperature, humidity, false);

  Serial.print(F("Humidity: "));
  Serial.print(humidity);
  Serial.print(F("% Temperature: "));
  Serial.print(temperature);
  Serial.print(("°C "));
  Serial.print(F("Heat Index: "));
  Serial.println((heat_index));
}

void loop() 
{
  getReadings();
  LoRaMessage = String(temperature) + ";" + String(humidity)
              + ";" + String(heat_index);

  Serial.print("Sending packet: ");
  Serial.println(counter);
  Serial.print("Payload: ");
  Serial.println(LoRaMessage);

  LoRa.beginPacket();   //Send LoRa packet to receiver
  LoRa.print(LoRaMessage);
  LoRa.endPacket();

  readingID++;
  counter++;

  // Check if time to switch the relay
  unsigned long currentMillis = millis();

  if (currentMillis - previousRelayMillis >= relayInterval) {
    previousRelayMillis = currentMillis;
    if (useInitialPowerbank == true){
      switchRelayInitial();
      useInitialPowerbank = false;
    } else {
      switchRelaySecondary();
      useInitialPowerbank = true;
    }
    relayInterval = 60UL * 1000UL; // 60 seconds in milliseconds
  }

  delay(2000);
}

void switchRelayInitial() {
  digitalWrite(RELAY_INIT, HIGH);
  digitalWrite(RELAY_SECOND, LOW);
  Serial.println("Initial can now charge");
  delay(2000);
  digitalWrite(RELAY_PB_L, LOW);
}

void switchRelaySecondary() {
  digitalWrite(RELAY_SECOND, HIGH);
  digitalWrite(RELAY_INIT, LOW);
  Serial.println("Secondary can now charge");
  delay(2000);
  digitalWrite(RELAY_PB_L, HIGH);
}

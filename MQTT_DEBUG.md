## MQTT Connection Issues - Debugging Steps

### Issue Summary
The web dashboard shows "Waiting for sensor data from device" but no data is being received from the ESP32 device.

### Changes Made
1. ✅ **Fixed MQTT WebSocket URL**: Changed from `ws://broker.hivemq.com:8000/mqtt` to `wss://broker.hivemq.com:8884/mqtt` (secure WebSocket)
2. ✅ **Enhanced logging**: Added detailed console logging with emojis to track MQTT events
3. ✅ **Added diagnostics component**: New `MqttDiagnostics` component in System tab to monitor connection status
4. ✅ **Improved error handling**: Better error reporting and debugging information

### Next Steps to Debug

#### 1. Check ESP32 is Publishing Data
Run this PowerShell command to listen for messages from your ESP32:

```powershell
# Install mosquitto clients if not already installed
# Then subscribe to see if ESP32 is publishing:
mosquitto_sub -h broker.hivemq.com -p 1883 -t "agrohygra/sensors" -v
```

#### 2. Check All AgroHygra Topics
```powershell
# Listen to all AgroHygra topics
mosquitto_sub -h broker.hivemq.com -p 1883 -t "agrohygra/#" -v
```

#### 3. Test Publishing from Computer
```powershell
# Test if you can publish to the broker
mosquitto_pub -h broker.hivemq.com -p 1883 -t "agrohygra/sensors" -m '{"device":"test","timestamp":1695804000,"soilMoisture":45,"temperature":25.5,"humidity":60,"airQuality":80,"airQualityRaw":150,"airQualityGood":true,"airQualityPPM":400,"pumpActive":false,"wateringCount":5,"totalWateringTime":120,"uptime":3600}'
```

#### 4. Check Browser Console
1. Open the web app in Chrome/Edge
2. Press F12 to open Developer Tools
3. Go to Console tab
4. Look for MQTT connection messages (they now have emojis: ✅ ❌ 🌱 etc.)

#### 5. Verify ESP32 Configuration
Make sure your ESP32 `main.cpp` has:
```cpp
const char *MQTT_HOST = "broker.hivemq.com";
const int MQTT_PORT = 1883;  // ESP32 uses plain TCP
// Topics should be exactly:
// - "agrohygra/sensors" (published every 2 seconds)
// - "agrohygra/pump/status" 
// - "agrohygra/system/status" (retained)
// - "agrohygra/logs"
```

### Expected Behavior
If everything works correctly, you should see in the browser console:
- ✅ Connected to MQTT broker
- ✅ Subscribed to agrohygra/sensors
- 📨 Received message on agrohygra/sensors: {sensor data}
- 🌱 Processing sensor data...
- ✅ Sensor data updated: AgroHygra-ESP32

### Common Issues
1. **ESP32 not connected to WiFi** - Check serial monitor
2. **ESP32 not publishing** - Verify MQTT client code
3. **Wrong topic names** - Must match exactly: "agrohygra/sensors"
4. **Firewall/network issues** - Try different network
5. **Browser blocking WebSockets** - Check browser console for errors

Run the development server and check the System tab for detailed diagnostics.
const SERVICE_UUID = "12345678-1234-5678-1234-56789abcdef0";
const CHARACTERISTIC_UUID = "abcdef12-3456-7890-abcd-ef1234567890";

let bleDevice, bleServer, fallCharacteristic;

// 🔹 Connect Button Click Handler
document.getElementById("connectBtn").addEventListener("click", async () => {
    try {
        console.log("🔗 Requesting Bluetooth Device...");
        bleDevice = await navigator.bluetooth.requestDevice({
            acceptAllDevices: true,
            optionalServices: [SERVICE_UUID]
        });

        console.log("🔗 Connecting to GATT Server...");
        bleServer = await bleDevice.gatt.connect();
        console.log("✅ BLE Connected to:", bleDevice.name);

        console.log("📡 Getting Service...");
        const service = await bleServer.getPrimaryService(SERVICE_UUID);
        console.log("✅ Service Found:", service.uuid);

        console.log("📡 Getting Characteristic...");
        fallCharacteristic = await service.getCharacteristic(CHARACTERISTIC_UUID);
        console.log("✅ Characteristic Found:", fallCharacteristic.uuid);

        document.getElementById("status").innerText = "Status: 🟢 Connected to " + bleDevice.name;

        // 🔔 Subscribe to Notifications
        console.log("🔔 Subscribing to Notifications...");
        fallCharacteristic.addEventListener("characteristicvaluechanged", handleNotifications);
        await fallCharacteristic.startNotifications();
        console.log("✅ Notifications Enabled!");

    } catch (error) {
        console.error("❌ Bluetooth Connection Error:", error);
        alert("Failed to connect to ESP32. Make sure Bluetooth is on.");
    }
});

// 🔔 Handle Incoming BLE Notifications
function handleNotifications(event) {
    let value = new TextDecoder().decode(event.target.value);
    console.log("🚨 Received BLE Notification:", value);

    let alertContainer = document.getElementById("alertContainer");
    let newAlert = document.createElement("p");
    newAlert.innerHTML = "⚠️ " + value;
    newAlert.style.color = "red";

    // 🔹 If GPS data is included, add a Google Maps link
    if (value.includes("GPS:")) {
        let coords = value.match(/GPS: ([0-9.-]+),([0-9.-]+)/);
        if (coords) {
            let lat = coords[1];
            let lon = coords[2];
            let mapLink = document.createElement("a");
            mapLink.href = `https://www.google.com/maps?q=${lat},${lon}`;
            mapLink.innerText = "📍 View Location";
            mapLink.target = "_blank";
            newAlert.appendChild(document.createElement("br"));
            newAlert.appendChild(mapLink);
        }
    }

    alertContainer.prepend(newAlert);
}

// 🔄 Manual Read Button (Debugging)
async function readFallAlert() {
    if (fallCharacteristic) {
        let value = await fallCharacteristic.readValue();
        let alertMessage = new TextDecoder().decode(value);
        console.log("📥 Manually Read Alert:", alertMessage);

        let alertBox = document.getElementById("alertContainer");
        alertBox.innerHTML = `<b>${alertMessage}</b>`;
    } else {
        console.log("⚠️ No Characteristic Found!");
    }
}

// Add a button in HTML for manual read
document.getElementById("readAlertBtn").addEventListener("click", readFallAlert);

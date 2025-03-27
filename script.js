const SERVICE_UUID = "12345678-1234-5678-1234-56789abcdef0";
const CHARACTERISTIC_UUID = "abcdef12-3456-7890-abcd-ef1234567890";

let bleDevice, bleServer, fallCharacteristic;

document.getElementById("connectBtn").addEventListener("click", async () => {
    try {
        console.log("🔍 Searching for Bluetooth Devices...");
        bleDevice = await navigator.bluetooth.requestDevice({
            acceptAllDevices: true,
            optionalServices: [SERVICE_UUID]
        });

        console.log("✅ Device Found:", bleDevice.name);
        console.log("🔗 Connecting to GATT Server...");

        bleServer = await bleDevice.gatt.connect();

        console.log("✅ Connected to GATT Server!");

        console.log("📡 Getting Service...");
        const service = await bleServer.getPrimaryService(SERVICE_UUID);
        console.log("✅ Service Found!");

        console.log("🔢 Getting Characteristic...");
        fallCharacteristic = await service.getCharacteristic(CHARACTERISTIC_UUID);
        console.log("✅ Characteristic Found!");

        document.getElementById("status").innerText = "🟢 Connected to " + bleDevice.name;

        fallCharacteristic.addEventListener("characteristicvaluechanged", handleNotifications);
        await fallCharacteristic.startNotifications();
        console.log("✅ Notifications Enabled!");

    } catch (error) {
        console.error("❌ Bluetooth Connection Error:", error);
        alert("Failed to connect to ESP32. Ensure Bluetooth is on and try again.");
    }
});

// Handle incoming notifications
function handleNotifications(event) {
    let value = new TextDecoder().decode(event.target.value);
    console.log("📩 Received Notification:", value);

    let alertContainer = document.getElementById("alertContainer");
    let newAlert = document.createElement("p");
    newAlert.innerHTML = "⚠️ " + value;
    newAlert.style.color = "red";

    // Add Google Maps Link if GPS data is available
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

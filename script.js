const SERVICE_UUID = "12345678-1234-5678-1234-56789abcdef0";
const CHARACTERISTIC_UUID = "abcdef12-3456-7890-abcd-ef1234567890";

let bleDevice, bleServer, fallCharacteristic;

document.getElementById("connectBtn").addEventListener("click", async () => {
    try {
        console.log("Requesting Bluetooth Device...");
        bleDevice = await navigator.bluetooth.requestDevice({
            acceptAllDevices: true,
            optionalServices: [SERVICE_UUID]
        });

        console.log("Connecting to GATT Server...");
        bleServer = await bleDevice.gatt.connect();

        console.log("Getting Service...");
        const service = await bleServer.getPrimaryService(SERVICE_UUID);

        console.log("Getting Characteristic...");
        fallCharacteristic = await service.getCharacteristic(CHARACTERISTIC_UUID);

        document.getElementById("status").innerText = "Status: 🟢 Connected to " + bleDevice.name;

        // Subscribe to Notifications
        fallCharacteristic.addEventListener("characteristicvaluechanged", handleNotifications);
        await fallCharacteristic.startNotifications();

        console.log("Notifications Started...");

    } catch (error) {
        console.error("Bluetooth Connection Error:", error);
        alert("Failed to connect to ESP32. Make sure Bluetooth is on.");
    }
});

// Handle incoming notifications
function handleNotifications(event) {
    let value = new TextDecoder().decode(event.target.value);
    console.log("Received:", value);

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

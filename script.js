const SERVICE_UUID = "12345678-1234-5678-1234-56789abcdef0";
const CHARACTERISTIC_UUID = "abcdef12-3456-7890-abcd-ef1234567890";

async function connectToBLE() {
    try {
        console.log("🔄 Requesting BLE device...");
        const device = await navigator.bluetooth.requestDevice({
            acceptAllDevices: true,
            optionalServices: [SERVICE_UUID]
        });

        console.log("✅ Device found:", device.name);
        const server = await device.gatt.connect();
        console.log("🔗 Connected to GATT Server");

        const service = await server.getPrimaryService(SERVICE_UUID);
        const characteristic = await service.getCharacteristic(CHARACTERISTIC_UUID);

        console.log("🔄 Subscribing to notifications...");
        await characteristic.startNotifications();

        characteristic.addEventListener("characteristicvaluechanged", (event) => {
            const value = new TextDecoder().decode(event.target.value);
            console.log("📡 Received Notification:", value);
            document.getElementById("status").innerText = `🚨 Alert: ${value}`;
        });

        console.log("✅ Successfully subscribed to notifications!");

    } catch (error) {
        console.error("❌ GATT Error:", error);
        alert("GATT Error: " + error.message);
    }
}

document.getElementById("connect").addEventListener("click", connectToBLE);

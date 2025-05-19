class BluetoothController {
    constructor() {
        this.device = null;
        this.server = null;
        this.service = null;
        this.characteristic = null;
        this.callbacks = {
            onConnected: null,
            onDisconnected: null,
            onError: null
        };
    }    setCallbacks(callbacks) {
        this.callbacks = {
            onConnected: callbacks.onConnected || null,
            onDisconnected: callbacks.onDisconnected || null,
            onError: callbacks.onError || null
        };
    }

    isSupported() {
        return !!navigator.bluetooth;
    }

    async connect() {
        try {
            this.device = await navigator.bluetooth.requestDevice({
                filters: [{ name: 'ModernCompass' }],
                optionalServices: ['0000180d-0000-1000-8000-00805f9b34fb']
            });

            const server = await this.device.gatt.connect();
            const service = await server.getPrimaryService('0000180d-0000-1000-8000-00805f9b34fb');
            this.characteristic = await service.getCharacteristic('00002a37-0000-1000-8000-00805f9b34fb');
              if (this.callbacks.onConnected) {
                this.callbacks.onConnected();
            }
            return true;
        } catch (error) {
            if (this.onErrorCallback) {
                this.onErrorCallback(error);
            }
            return false;
        }
    }

    disconnect() {
        if (this.device?.gatt?.connected) {
            this.device.gatt.disconnect();
            if (this.onDisconnectedCallback) {
                this.onDisconnectedCallback();
            }
        }
    }

    isConnected() {
        return this.device?.gatt?.connected ?? false;
    }

    async sendConfiguration(data) {
        if (!this.characteristic) {
            throw new Error('Not connected to device');
        }

        try {
            await this.characteristic.writeValue(data);
            return true;
        } catch (error) {
            if (this.onErrorCallback) {
                this.onErrorCallback(error);
            }
            return false;
        }
    }
}

let connectedDevice = null;
let characteristicCache = null;

export async function connectBluetooth() {
    try {
        const device = await navigator.bluetooth.requestDevice({
            filters: [{ 
                services: ['0000ffe0-0000-1000-8000-00805f9b34fb']  // ModernCompass service UUID
            }]
        });

        console.log('Connecting to device:', device.name);
        
        const server = await device.gatt.connect();
        const service = await server.getPrimaryService('0000ffe0-0000-1000-8000-00805f9b34fb');
        characteristicCache = await service.getCharacteristic('0000ffe1-0000-1000-8000-00805f9b34fb');
        
        connectedDevice = device;
        updateDeviceStatus(device.name);
        
        // Listen for disconnection
        device.addEventListener('gattserverdisconnected', onDisconnected);
        
        return device;
    } catch (error) {
        console.error('Bluetooth connection failed:', error);
        throw error;
    }
}

export async function sendCoordinatesToDevice({ lat, lng }) {
    if (!characteristicCache) {
        throw new Error('Bluetooth not connected');
    }

    // Format coordinates as expected by the device
    // Example format: "LAT:48.8566,LNG:2.3522\n"
    const data = `LAT:${lat.toFixed(6)},LNG:${lng.toFixed(6)}\n`;
    const encoder = new TextEncoder();
    const dataArray = encoder.encode(data);

    try {
        await characteristicCache.writeValue(dataArray);
        console.log('Coordinates sent successfully:', data);
    } catch (error) {
        console.error('Failed to send coordinates:', error);
        throw error;
    }
}

function onDisconnected() {
    connectedDevice = null;
    characteristicCache = null;
    updateDeviceStatus();
}

function updateDeviceStatus(deviceName) {
    const statusElement = document.getElementById('bluetoothStatus');
    if (statusElement) {
        statusElement.textContent = deviceName || 'Non connecté';
        statusElement.className = deviceName ? 'connected' : '';
    }
}

export function getConnectedDevice() {
    return connectedDevice;
}

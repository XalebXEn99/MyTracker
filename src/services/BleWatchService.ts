import {BleManager, Device, Service, Characteristic} from 'react-native-ble-plx';
import {useEffect, useMemo, useState} from 'react';

const manager = new BleManager();

export const useBleWatch = () => {
  const [devices, setDevices] = useState<Device[]>([]);
  const [selectedDevice, setSelectedDevice] = useState<Device | null>(null);
  const [log, setLog] = useState<string[]>([]);

  useEffect(() => {
    const subscription = manager.onStateChange((state) => {
      if (state === 'PoweredOn') {
        scan();
      }
    }, true);
    return () => {
      subscription.remove();
      manager.destroy();
    };
  }, []);

  const scan = async () => {
    setLog((previous) => [...previous, 'Starting BLE scan...']);
    manager.startDeviceScan(null, null, (error, device) => {
      if (error) {
        setLog((previous) => [...previous, `Scan error: ${error.message}`]);
        return;
      }
      if (device && device.name && !devices.some((item) => item.id === device.id)) {
        setDevices((previous) => [...previous, device]);
      }
    });
  };

  const connectToDevice = async (device: Device) => {
    try {
      const connected = await manager.connectToDevice(device.id);
      await connected.discoverAllServicesAndCharacteristics();
      setSelectedDevice(connected);
      setLog((previous) => [...previous, `Connected to ${device.name || device.id}`]);
    } catch (error: any) {
      setLog((previous) => [...previous, `Connect error: ${error.message}`]);
    }
  };

  const readGatt = async () => {
    if (!selectedDevice) {
      return;
    }
    const services = await selectedDevice.services();
    for (const service of services) {
      const characteristics = await service.characteristics();
      for (const characteristic of characteristics) {
        const value = await characteristic.read();
        setLog((previous) => [...previous, `Service ${service.uuid} char ${characteristic.uuid} value ${value.value}`]);
      }
    }
  };

  return {
    devices,
    selectedDevice,
    log,
    scan,
    connectToDevice,
    readGatt,
  };
};

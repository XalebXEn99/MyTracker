import {NativeEventEmitter, NativeModules, Platform} from 'react-native';

const {CarConnectionManager} = NativeModules;

export type CarConnectEvent = {
  deviceName: string;
  connected: boolean;
};

const emitter = new NativeEventEmitter(CarConnectionManager);

export const addCarConnectionListener = (callback: (event: CarConnectEvent) => void) => {
  return emitter.addListener('CarDidConnect', callback);
};

export const getConnectedAccessories = async (): Promise<string[]> => {
  if (!CarConnectionManager?.getConnectedAccessories) {
    return [];
  }
  return CarConnectionManager.getConnectedAccessories();
};

export const queryConnectedCar = async (): Promise<string | null> => {
  const devices = await getConnectedAccessories();
  return devices.find((name) => /toyota|corolla/i.test(name)) || null;
};

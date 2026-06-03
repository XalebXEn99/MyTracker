import {Platform} from 'react-native';
import Geolocation, {GeoPosition} from 'react-native-geolocation-service';
import BackgroundFetch from 'react-native-background-fetch';
import {LocationPoint} from '../types';

let routeBuffer: LocationPoint[] = [];
let tracking = false;

const storePoint = (position: GeoPosition) => {
  const point: LocationPoint = {
    latitude: position.coords.latitude,
    longitude: position.coords.longitude,
    timestamp: position.timestamp,
    altitude: position.coords.altitude ?? undefined,
  };
  routeBuffer.push(point);
};

export const startLocationTracking = async () => {
  if (tracking) {
    return;
  }
  tracking = true;
  await BackgroundFetch.configure(
    {
      minimumFetchInterval: 15,
      stopOnTerminate: false,
      enableHeadless: true,
      requiredNetworkType: BackgroundFetch.NETWORK_TYPE_ANY,
    },
    async () => {
      console.log('Background fetch event received');
      await captureLocationPoint();
      BackgroundFetch.finish('newData');
    },
    (error) => {
      console.warn('BackgroundFetch failed to start', error);
    },
  );
  await captureLocationPoint();
};

export const stopLocationTracking = () => {
  tracking = false;
  BackgroundFetch.stop();
  routeBuffer = [];
};

export const captureLocationPoint = async () => {
  return new Promise<LocationPoint | null>((resolve) => {
    Geolocation.getCurrentPosition(
      (position) => {
        storePoint(position);
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          timestamp: position.timestamp,
          altitude: position.coords.altitude ?? undefined,
        });
      },
      (error) => {
        console.warn('Location error', error);
        resolve(null);
      },
      {
        enableHighAccuracy: true,
        distanceFilter: 5,
      },
    );
  });
};

export const getCurrentRouteBuffer = () => routeBuffer;

export const clearRouteBuffer = () => {
  routeBuffer = [];
};

export const getTrackedRoute = () => [...routeBuffer];

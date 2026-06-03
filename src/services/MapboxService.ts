import {Platform} from 'react-native';
import {MAPBOX_TOKEN} from '@env';

export const getMapboxAccessToken = () => {
  return process.env.MAPBOX_TOKEN || MAPBOX_TOKEN || '';
};

export const mapboxConfig = {
  accessToken: getMapboxAccessToken(),
  styleURL: 'mapbox://styles/mapbox/outdoors-v12',
  telemetryEnabled: false,
};

export const MapboxSettings = {
  downloadOfflineRegion: async (bounds: any) => {
    // TODO: wire actual offline region download through RN Mapbox native API.
    console.log('Offline download requested for viewport', bounds);
  },
  clearCache: async () => {
    console.log('Clearing Mapbox cache.');
  },
};

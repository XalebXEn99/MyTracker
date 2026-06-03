import {NativeModules, Platform} from 'react-native';

const {MapSnapshotHelper} = NativeModules;

export const createMapSnapshot = async (cameraState: {
  latitude: number;
  longitude: number;
  zoom: number;
  width: number;
  height: number;
}) => {
  if (!MapSnapshotHelper?.createSnapshot) {
    throw new Error('MapSnapshotHelper native module is not available.');
  }
  return MapSnapshotHelper.createSnapshot(cameraState);
};

export const saveSnapshot = async (data: {path: string; width: number; height: number}) => {
  if (!MapSnapshotHelper?.saveSnapshot) {
    throw new Error('MapSnapshotHelper native module is not available.');
  }
  return MapSnapshotHelper.saveSnapshot(data);
};

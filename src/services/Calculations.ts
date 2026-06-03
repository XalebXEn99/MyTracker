import haversine from 'haversine-distance';

export const calculateDistanceMeters = (points: {latitude: number; longitude: number}[]) => {
  if (points.length < 2) {
    return 0;
  }
  return points.reduce((total, point, index) => {
    if (index === 0) {
      return 0;
    }
    const prev = points[index - 1];
    return total + haversine(prev, point);
  }, 0);
};

export const calculateDurationSeconds = (start: number, end: number) => Math.max(0, Math.round((end - start) / 1000));

export const calculatePaceSecondsPerKm = (distanceMeters: number, durationSeconds: number) => {
  if (distanceMeters <= 0) {
    return 0;
  }
  return Math.round((durationSeconds / distanceMeters) * 1000);
};

export const calculateElevationGain = (points: {altitude?: number}[]) => {
  return points.reduce((gain, point, index) => {
    if (index === 0) {
      return gain;
    }
    const prev = points[index - 1];
    if (point.altitude && prev.altitude && point.altitude > prev.altitude) {
      return gain + (point.altitude - prev.altitude);
    }
    return gain;
  }, 0);
};

export const calculateCalories = (weightKg: number, durationSeconds: number, distanceMeters: number) => {
  const hours = durationSeconds / 3600;
  const mets = 3.5 + Math.min(10, distanceMeters / Math.max(1, hours * 1600));
  return Math.round(mets * weightKg * hours);
};

export const calculateFuelLiters = (distanceMeters: number) => {
  const km = distanceMeters / 1000;
  return Number((km * 5.1 / 100).toFixed(2));
};

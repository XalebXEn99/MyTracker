import {
  calculateCalories,
  calculateDistanceMeters,
  calculateElevationGain,
  calculateFuelLiters,
  calculatePaceSecondsPerKm,
  calculateDurationSeconds,
} from '../src/services/Calculations';

test('calculateDistanceMeters returns zero for empty route', () => {
  expect(calculateDistanceMeters([])).toBe(0);
});

test('calculateDurationSeconds computes seconds between timestamps', () => {
  expect(calculateDurationSeconds(1000, 4000)).toBe(3);
});

test('calculatePaceSecondsPerKm handles zero distance', () => {
  expect(calculatePaceSecondsPerKm(0, 100)).toBe(0);
});

test('calculateElevationGain sums positive altitude climbs', () => {
  const points = [{altitude: 10}, {altitude: 15}, {altitude: 12}, {altitude: 20}];
  expect(calculateElevationGain(points)).toBe(13);
});

test('calculateCalories returns a numeric estimate', () => {
  expect(calculateCalories(70, 1800, 4000)).toBeGreaterThan(0);
});

test('calculateFuelLiters returns expected consumption', () => {
  expect(calculateFuelLiters(10000)).toBeCloseTo(0.51, 2);
});

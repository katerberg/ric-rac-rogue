import {Coordinate, NumberCoordinates} from './types';

export function coordsToNumberCoords(coords: Coordinate): NumberCoordinates {
  const [startX, startY] = coords.split(',');
  return {x: Number.parseInt(startX, 10), y: Number.parseInt(startY, 10)};
}

export function numberCoordsToCoords(numberCoords: NumberCoordinates): Coordinate {
  return `${numberCoords.x},${numberCoords.y}`;
}

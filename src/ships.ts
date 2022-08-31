import type { ShipType, Ship, PlayerType, PlayerShips, ComputerShips, Position, Grid, GridState, PossibleValue } from './types'
import { shipNames, gridChars, makePositionFromId, getPositionArray, getRadomElementFromArray, gridNumbers } from './utils'
import { isTaken, setSquareValue, getSquareValue } from './grid'

export function createShip(shipType: ShipType, playerType: PlayerType): Ship {
  let length: number
  let isHorizontal: boolean = true
  const hits = 0
  let element: HTMLElement | undefined

  switch (shipType) {
    case "destroyer":
      length = 2;
      break;
    case "cruiser":
    case "submarine":
      length = 3;
      break;
    case "battleship":
      length = 4;
      break;
    case "carrier":
      length = 5;
      break;
  }

  if (playerType === 'player') {

    element = document.querySelector(
      `.${shipType}-container`
    ) as HTMLElement;
  }

  return { type: shipType, length, isHorizontal, hits, element }
}

export function rotateShip(ship: Ship): void {

  if (!ship.element) return
  // Flip isHorizontal boolean
  ship.isHorizontal = !ship.isHorizontal;

  // e.g. this.element.className -> "ship destroyer-container"
  // e.g. shipSpecificClass -> "destroyer-container"
  const shipSpecificClass = ship.element.className.split(" ")[1];
  ship.element.classList.toggle(`${shipSpecificClass}-vertical`);
}

export function createPlayerShips(): PlayerShips {
  const shipsToBePlaced: Ship[] = []
  const selectedShipPart: number = 0
  const selectedShip: Ship | null = null
  const ships: Ship[] = []

  shipNames.forEach(name => shipsToBePlaced.push(createShip(name, 'player')))
  return {
    ships,
    shipsToBePlaced,
    selectedShipPart,
    selectedShip
  }
}

export function createComputerShips(): { ships: Ship[] } {
  const ships: Ship[] = []
  shipNames.forEach(name => ships.push(createShip(name, 'computer')))
  return { ships }
}

function drawShip(positions: Position[], shipType: ShipType, playerType: PlayerType): void {
  positions.forEach((position) => {
    const square = document.getElementById(`${playerType}-${position}`);
    square?.classList.add(shipType);
  });
}

export function placeShip(playerGrid: Grid, playerShips: PlayerShips, position: Position) {
  const { selectedShip, selectedShipPart } = playerShips
  if (!selectedShip) return
  // Create a binding that holds all of the positions the ship takes
  const shipSquares: Position[] = [];
  // "a-1" -> "a"
  const positionChar = position.split("-")[0];
  // "a-1" -> 1
  const positionNumber = parseInt(position.split("-")[1]);

  if (selectedShip.isHorizontal) {
    // Determine how far the ship extends horizontally (number)
    for (let i = 0; i < selectedShip.length; i++) {
      // calculate the position that each part of the ship would take
      const number = positionNumber + i - selectedShipPart;
      // if ship occupies a cell with a number greater than 10 or less than 1 -> invalid
      if (number > 10 || number < 1) {
        // Return ship if position is invalid
        return;
      }
      shipSquares.push(`${positionChar}-${number}`);
    }
  } else {
    for (let i = 0; i < selectedShip.length; i++) {
      const charIndex = gridChars.indexOf(positionChar);
      // calculate the position that each part of the ship would take
      const char = gridChars[charIndex + i - selectedShipPart];
      if (!char) {
        return;
      }
      shipSquares.push(`${char}-${positionNumber}`);
    }
  }

  const taken = isTaken(playerGrid.state, shipSquares);

  if (!taken) {
    shipSquares.forEach((square) => setSquareValue(playerGrid.state, square, selectedShip.type));
    drawShip(shipSquares, selectedShip.type, playerGrid.type);
    playerShips.ships.push(selectedShip);
    playerShips.shipsToBePlaced = playerShips.shipsToBePlaced.filter((s) => s !== selectedShip);
    if (selectedShip.element) {
      selectedShip.element.remove();
    }
  }
}

export function addShipListeners(playerGrid: Grid, playerShips: PlayerShips) {

  playerShips.shipsToBePlaced.forEach((ship) => {
    if (!ship.element) return
    ship.element.addEventListener("mousedown", (event) => {
      const target = event.target as HTMLElement;
      // take e.g. destroyer-0 and assign the number after the "-" to selectedShipPart
      playerShips.selectedShipPart = parseInt(
        target.id.substring(target.id.length - 1)
      );
    });
    ship.element.addEventListener("dragstart", () => {
      playerShips.selectedShip = ship;
    });
  });

  playerGrid.element.addEventListener("dragstart", (event) =>
    event.preventDefault()
  );
  playerGrid.element.addEventListener("dragover", (event) =>
    event.preventDefault()
  );
  playerGrid.element.addEventListener("dragenter", (event) =>
    event.preventDefault()
  );
  playerGrid.element.addEventListener("dragleave", (event) =>
    event.preventDefault()
  );
  playerGrid.element.addEventListener("drop", (event) => {
    const target = event.target as HTMLElement;
    const position = makePositionFromId(target.id);
    console.log(position)
    if (playerShips.selectedShip) {
      placeShip(playerGrid, playerShips, position);
    }
  });
}

function calculateOffset<T>(shipLength: number, array: T[], element: T): number {
  let offset = 0;
  const index = array.indexOf(element);
  const endingPostion = index + shipLength;

  if (endingPostion > array.length) {
    offset = endingPostion - array.length;
  }
  return offset;
}

function makeRandomShipPosition(gridState: GridState, ship: Ship): Position[] {
  const shipSquares: Position[] = [];
  const positionArray = getPositionArray(gridState)
  const randomStartingPosition = getRadomElementFromArray(positionArray);
  const positionChar = randomStartingPosition[0];
  const positionNumber = parseInt(randomStartingPosition[2]);

  const randomIsHorizontal = Boolean(Math.round(Math.random()));
  ship.isHorizontal = randomIsHorizontal;

  if (ship.isHorizontal) {
    for (let i = 0; i < ship.length; i++) {
      const horizontalOffset = calculateOffset(
        ship.length,
        gridNumbers,
        positionNumber
      );
      const number = positionNumber + i - horizontalOffset;
      shipSquares.push(`${positionChar}-${number}`);
    }
  } else {
    for (let i = 0; i < ship.length; i++) {
      const verticalOffset = calculateOffset(
        ship.length,
        gridChars,
        positionChar
      );
      const charIndex = gridChars.indexOf(positionChar);
      const char = gridChars[charIndex + i - verticalOffset];
      shipSquares.push(`${char}-${positionNumber}`);
    }
  }
  return shipSquares;
}

export function generateShipPlacement(gridState: GridState, ship: Ship): void {
  let shipSquares: Position[] = makeRandomShipPosition(gridState, ship);
  let taken: boolean = isTaken(gridState, shipSquares);

  while (taken) {
    shipSquares = makeRandomShipPosition(gridState, ship);
    taken = isTaken(gridState, shipSquares);
  }

  shipSquares.forEach((square) => {
    setSquareValue(gridState, square, ship.type)
  });

  drawShip(shipSquares, ship.type, 'computer')

  // this.drawShip(shipSquares, ship.type);
}

export function hit(ship: Ship): void {
  if (ship.hits < ship.length) {
    ship.hits += 1;
  }
}

export function isSunken(ship: Ship): boolean {
  return ship.hits === ship.length;
}

export function removeShip(playerShips: PlayerShips | ComputerShips, ship: Ship): void {
  playerShips.ships = playerShips.ships.filter((s) => s !== ship);
}

export function takeShot(grid: Grid, playerShips: PlayerShips | ComputerShips, square: HTMLElement): void {
  const currentPlayer = grid.type === "computer" ? "player" : "computer";
  const position = makePositionFromId(square.id)
  const squareValue = getSquareValue(grid.state, position)

  if (shipNames.includes(squareValue as ShipType)) {
    const hitShip = playerShips.ships.find(
      (ship) => ship.type === squareValue
    ) as Ship;
    hit(hitShip);
    square.classList.add("boom");
    console.log(position);
    setSquareValue(grid.state, position, "hit");

    if (isSunken(hitShip)) {
      console.log(`${hitShip.type} is destroyed`);
      removeShip(playerShips, hitShip);

      if (!playerShips.ships.length) {
        alert(`${currentPlayer} won`);
        console.log("Game over");
        return;
      }
    }
  } else {
    square.classList.add("miss");
    setSquareValue(grid.state, position, "miss");
  }
}

export function fireRandom(grid: Grid): HTMLElement {
  let sqaureValue: PossibleValue;
  const positionArray = getPositionArray(grid.state)
  let randomPosition = getRadomElementFromArray(positionArray);
  sqaureValue = getSquareValue(grid.state, randomPosition);

  while (sqaureValue === "hit" || sqaureValue === "miss") {
    randomPosition = getRadomElementFromArray(positionArray);
    sqaureValue = getSquareValue(grid.state, randomPosition);
  }

  return document.getElementById(
    `${grid.type}-${randomPosition}`
  ) as HTMLElement;
}

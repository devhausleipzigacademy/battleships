import type { GridState, Position, PlayerType, PossibleValue, Grid } from './types'
import { gridChars } from './utils'

export function createGrid(type: PlayerType): Grid {
  const state: GridState = {}

  const element = document.createElement('div')
  element.classList.add('grid')
  element.id = `${type}-grid`


  for (let i = 0; i < gridChars.length; i++) {

    for (let j = 1; j <= 10; j++) {
      // add each key to the state object -> e.g. "a-1": ""
      const position: Position = `${gridChars[i]}-${j}`;
      state[position] = "";
    }
  }

  const squares = createBoard(state, type, element)

  // put the grid into it's container
  const container = document.querySelector(".grid-container") as HTMLElement;
  container.appendChild(element);
  return { state, squares, element, type }
}


export function createBoard(state: GridState, type: PlayerType, element: HTMLElement): HTMLElement[] {
  const squares: HTMLElement[] = []
  // loop over every entry in the state object and take the key
  for (const key in state) {
    // create a square
    const square = document.createElement("div");
    // give it the position and the grid-type as id
    square.id = `${type}-${key}`;
    element.appendChild(square);
    // hold a reference to each square on the instance
    squares.push(square);
  }
  return squares
}

export function getSquareValue(gridState: GridState, position: Position): PossibleValue {
  return gridState[position];
}

export function setSquareValue(gridState: GridState, position: Position, value: PossibleValue): void {
  gridState[position] = value;
}


export function isTaken(gridState: GridState, positions: Position[]): boolean {
  return positions.some((square) => getSquareValue(gridState, square));
}




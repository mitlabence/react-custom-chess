import {
  PieceColor,
  BoardState,
  Position,
  Piece,
  kGridSize,
} from "../../Constants";
import { tileIsOccupiedBy, tileIsOccupied } from "../Referee";
export const isValidKnightMove = (
  sourcePosition: Position,
  targetPosition: Position,
  pieceColor: PieceColor,
  boardState: BoardState
): boolean => {
  const sourceX: number = sourcePosition.x;
  const sourceY: number = sourcePosition.y;
  const targetX: number = targetPosition.x;
  const targetY: number = targetPosition.y;
  const deltaXAbs = Math.abs(targetX - sourceX);
  // forward is dependent on color! Should be positive if moving forward, negative if backward
  const deltaForward =
    pieceColor === PieceColor.WHITE ? targetY - sourceY : sourceY - targetY;
  const oppositeColor =
    pieceColor === PieceColor.WHITE ? PieceColor.BLACK : PieceColor.WHITE;
  // Knight moves 2 vertically, 1 horiziontally, or vice versa.
  if (
    (Math.abs(deltaForward) === 2 && deltaXAbs === 1) ||
    (Math.abs(deltaForward) === 1 && deltaXAbs === 2)
  ) {
    if (tileIsOccupiedBy(targetPosition, boardState, oppositeColor)) {
      return true;
    } else if (!tileIsOccupied(targetPosition, boardState)) {
      return true;
    }
  }
  return false;
};

export const getValidKnightMoves = (
  bishop: Piece,
  boardState: BoardState
): Position[] => {
  const validMoves: Position[] = [];

  const sourceX: number = bishop.position.x;
  const sourceY: number = bishop.position.y;
  const pieceColor: PieceColor = bishop.color;

  // 1. Go left/right 2 and up/down 1
  const shortSteps = [-1, 1];
  const longSteps = [-2, 2];
  for (let xStep of longSteps) {
    const targetX = sourceX + xStep;
    if (!(targetX >= 0 && targetX < kGridSize)) {  // Check if targetX is within bounds
      continue;
    }
    for (let yStep of shortSteps) {
      const targetY = sourceY + yStep;
      if (targetY >= 0 && targetY < kGridSize) {
        const targetPosition: Position = { x: targetX, y: targetY };
        if (
          isValidKnightMove(
            bishop.position,
            targetPosition,
            pieceColor,
            boardState
          )
        ) {
          validMoves.push(targetPosition);
        }
      }
    }
  }
  // 2. Go left/right 1 and up/down 2
  for (let xStep of shortSteps) {
    const targetX = sourceX + xStep;
    if (!(targetX >= 0 && targetX < kGridSize)) {  // Check if targetX is within bounds
      continue;
    }
    for (let yStep of longSteps) {
      const targetY = sourceY + yStep;
      if (targetY >= 0 && targetY < kGridSize) {
        const targetPosition: Position = { x: targetX, y: targetY };
        if (
          isValidKnightMove(
            bishop.position,
            targetPosition,
            pieceColor,
            boardState
          )
        ) {
          validMoves.push(targetPosition);
        }
      }
    }
  }
  return validMoves;
};

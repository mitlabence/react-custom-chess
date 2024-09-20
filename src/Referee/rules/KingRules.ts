import {
  PieceColor,
  BoardState,
  Position,
  Piece,
  kGridSize,
} from "../../Constants";
import { canMoveStraightTo, tileIsOccupiedBy } from "../Referee";
export const isValidKingMove = (
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
  if (Math.abs(deltaForward) <= 1 && deltaXAbs <= 1) {
    return canMoveStraightTo(
      sourcePosition,
      targetPosition,
      boardState,
      pieceColor
    );
  }
  return false;
};

export const getValidKingMoves = (
  bishop: Piece,
  boardState: BoardState
): Position[] => {
  const validMoves: Position[] = [];

  const sourceX: number = bishop.position.x;
  const sourceY: number = bishop.position.y;
  const pieceColor: PieceColor = bishop.color;
  const oppositeColor =
    pieceColor === PieceColor.WHITE ? PieceColor.BLACK : PieceColor.WHITE;

  // From starting position, go in all 4 possible directions, stop when board edge is reached or friendly piece is in the way
  // or after finding an enemy piece
  const steps = [-1, 0, 1];
  for (var xStep of steps) {
    for (var yStep of steps) {
      if (xStep === 0 && yStep === 0) { // avoid xStep === 0 && yStep === 0 at the same time, i.e. no movement
        continue;
      }
      let targetX = sourceX + xStep;
      let targetY = sourceY + yStep;
      if (
        targetX >= 0 &&
        targetX < kGridSize &&
        targetY >= 0 &&
        targetY < kGridSize &&
        !tileIsOccupiedBy({ x: targetX, y: targetY }, boardState, pieceColor)
      ) {
        validMoves.push({ x: targetX, y: targetY });
      }
    }
  }
  return validMoves;
};

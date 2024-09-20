import {
  PieceColor,
  BoardState,
  Position,
  Piece,
  kGridSize,
} from "../../Constants";
import { canMoveStraightTo, tileIsOccupiedBy } from "../Referee";
export const isValidRookMove = (
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
  const isHorizontalOrVertical: boolean = !(
    (deltaForward !== 0) ===
    (deltaXAbs !== 0)
  ); // negation of: either no move, or move both horizontally and vertically
  if (!isHorizontalOrVertical) {
    // Rook: should be horizontal or vertical move that changes position, i.e. deltaX > 0 XOR deltaY > 0, i.e. these two should be 1 true, 1 false
    return false;
  }
  return canMoveStraightTo(
    sourcePosition,
    targetPosition,
    boardState,
    pieceColor
  );
};

export const getValidRookMoves = (
  rook: Piece,
  boardState: BoardState
): Position[] => {
  const validMoves: Position[] = [];
  const sourceX: number = rook.position.x;
  const sourceY: number = rook.position.y;
  const pieceColor: PieceColor = rook.color;
  const oppositeColor =
    pieceColor === PieceColor.WHITE ? PieceColor.BLACK : PieceColor.WHITE;

  // From starting position, go in all 4 possible directions, stop when board edge is reached or friendly piece is in the way
  // or after finding an enemy piece
  const steps = [-1, 1];
  // 1. horizontal moves
  for (var xStep of steps) {
    let targetX = sourceX + xStep;
    let targetY = sourceY;
    while (
      targetX >= 0 &&
      targetX < kGridSize &&
      !tileIsOccupiedBy({ x: targetX, y: targetY }, boardState, pieceColor)
    ) {
      validMoves.push({ x: targetX, y: targetY });
      if (
        tileIsOccupiedBy({ x: targetX, y: targetY }, boardState, oppositeColor)
      ) {
        break;
      }
      targetX += xStep;
    }
  }
  // 2. vertical moves
  for (var yStep of steps) {
    let targetX = sourceX;
    let targetY = sourceY + yStep;
    while (
      targetY >= 0 &&
      targetY < kGridSize &&
      !tileIsOccupiedBy({ x: targetX, y: targetY }, boardState, pieceColor)
    ) {
      validMoves.push({ x: targetX, y: targetY });
      if (
        tileIsOccupiedBy({ x: targetX, y: targetY }, boardState, oppositeColor)
      ) {
        break;
      }
      targetY += yStep;
    }
  }

  return validMoves;
};

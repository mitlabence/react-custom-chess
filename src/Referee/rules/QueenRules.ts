import {
  PieceColor,
  BoardState,
  Position,
  Piece,
  kGridSize,
} from "../../Constants";
import { canMoveStraightTo, tileIsOccupiedBy } from "../Referee";
export const isValidQueenMove = (
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
  const isDiagonal: boolean = !(
    deltaForward === 0 || Math.abs(deltaForward) !== deltaXAbs
  );
  const isHorizontalOrVertical: boolean = !(
    (deltaForward !== 0) ===
    (deltaXAbs !== 0)
  ); // negation of: either no move, or move both horizontally and vertically
  if (!isDiagonal && !isHorizontalOrVertical) {
    // Queen: either diagonal or horizontal or vertical. So if not any of the previous
    return false;
  }
  return canMoveStraightTo(
    sourcePosition,
    targetPosition,
    boardState,
    pieceColor
  );
};

export const getValidQueenMoves = (
  queen: Piece,
  boardState: BoardState
): Position[] => {
  const validMoves: Position[] = [];
  const sourceX: number = queen.position.x;
  const sourceY: number = queen.position.y;
  const pieceColor: PieceColor = queen.color;
  const oppositeColor =
    pieceColor === PieceColor.WHITE ? PieceColor.BLACK : PieceColor.WHITE;

  // From starting position, go in all 4 possible directions, stop when board edge is reached or friendly piece is in the way
  // or after finding an enemy piece
  // only avoid xStep === 0 && yStep === 0 at the same time
  const steps = [-1, 0, 1];
  for (var xStep of steps) {
    for (var yStep of steps) {
      if (xStep === 0 && yStep === 0) {
        continue;
      }
      let targetX = sourceX + xStep;
      let targetY = sourceY + yStep;
      while (
        targetX >= 0 &&
        targetX < kGridSize &&
        targetY >= 0 &&
        targetY < kGridSize &&
        !tileIsOccupiedBy({ x: targetX, y: targetY }, boardState, pieceColor)
      ) {
        validMoves.push({ x: targetX, y: targetY });
        if (
          tileIsOccupiedBy(
            { x: targetX, y: targetY },
            boardState,
            oppositeColor
          )
        ) {
          break;
        }
        targetX += xStep;
        targetY += yStep;
      }
    }
  }

  return validMoves;
};

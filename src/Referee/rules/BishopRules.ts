import {
  PieceColor,
  BoardState,
  Position,
  Piece,
  kGridSize,
} from "../../Constants";
import { canMoveStraightTo, tileIsOccupiedBy } from "../Referee";
export const isValidBishopMove = (
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
  if (!isDiagonal) {
    // Bishop: should be a diagonal move that changes position, i.e. deltaX > 0 and abs(deltaX) === abs(deltaY)
    return false;
  }

  return canMoveStraightTo(
    sourcePosition,
    targetPosition,
    boardState,
    pieceColor
  );
};

export const getValidBishopMoves = (
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
  const steps = [-1, 1];
  for (var xStep of steps) {
    for (var yStep of steps) {
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

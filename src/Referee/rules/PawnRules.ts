import { PieceColor, BoardState, Position, Piece } from "../../Constants";
import {
  straightPathOccupied,
  tileIsOccupied,
  tileIsOccupiedBy,
  moveIsEnPassant
} from "../Referee";
export const isValidPawnMove = (
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
  // First step can be 1 or 2 squares forward. White: source -> target is an increment, black: decrement
  // For pawn, important to know if it is on second rank of its color (pawns can move 2 forward as first move)
  const isOnStartingRank =
    (pieceColor === PieceColor.WHITE && sourceY === 1) ||
    (pieceColor === PieceColor.BLACK && sourceY === 6)
      ? true
      : false;
  // Check based on forward movement
  if (deltaForward === 2 && deltaXAbs === 0 && isOnStartingRank) {
    if (
      //this.tileIsOccupied(targetPosition, boardState) ||
      //this.tileIsOccupied(
      //  { x: targetX, y: Math.abs((targetY + sourceY) / 2) },
      //  boardState
      //)
      straightPathOccupied(sourcePosition, targetPosition, boardState, true)
    ) {
      // if moving 2 steps forward, check if tile pawn would move to and tile between source and target are free
      return false;
    }
    return true;
  } else if (deltaForward === 1) {
    if (deltaXAbs === 0) {
      if (
        !straightPathOccupied(sourcePosition, targetPosition, boardState, true)
      ) {
        return true;
      }
    } else if (deltaXAbs === 1) {
      if (tileIsOccupied(targetPosition, boardState)) {
        return tileIsOccupiedBy(targetPosition, boardState, oppositeColor);
      }
    }
  }
  // TODO: move en passant here?
  return false;
};

export const getValidPawnMoves = (
  pawn: Piece,
  boardState: BoardState
): Position[] => {
  const validMoves: Position[] = [];
  // Valid moves:
  // 1. 1 square forward if empty
  // 2. 2 squares forward if two squares in front empty, and on starting rank
  // 3. 1 square diagonally forward if occupied by opposite color
  // 4. En passant capture: 1 square diagonally forward if previous move was 2 squares forward by opposite color pawn

  const sourceX: number = pawn.position.x;
  const sourceY: number = pawn.position.y;
  const pieceColor: PieceColor = pawn.color;
  const oppositeColor =
    pieceColor === PieceColor.WHITE ? PieceColor.BLACK : PieceColor.WHITE;
  // First step can be 1 or 2 squares forward. White: source -> target is an increment, black: decrement
  // For pawn, important to know if it is on second rank of its color (pawns can move 2 forward as first move)
  const isOnStartingRank =
    (pieceColor === PieceColor.WHITE && sourceY === 1) ||
    (pieceColor === PieceColor.BLACK && sourceY === 6)
      ? true
      : false;
  const forwardDirection = pieceColor === PieceColor.WHITE ? 1 : -1;

  const singleForwardMove = { x: sourceX, y: sourceY + forwardDirection };
  const doubleForwardMove = { x: sourceX, y: sourceY + 2 * forwardDirection };
  const leftAttackMove = { x: sourceX - 1, y: sourceY + forwardDirection };
  const rightAttackMove = { x: sourceX + 1, y: sourceY + forwardDirection };

  // 1. Check if single step forward is possible
  if (!tileIsOccupied(singleForwardMove, boardState)) {
    validMoves.push(singleForwardMove);
    // 2. Check if double step forward is possible. Only possible if the single step forward is possible (and pawn is on starting rank)
    if (isOnStartingRank && !tileIsOccupied(doubleForwardMove, boardState)) {
      validMoves.push(doubleForwardMove);
    }
  }
  // 3. Check if left/right diagonal attack is possible
  if (tileIsOccupiedBy(leftAttackMove, boardState, oppositeColor)) {
    validMoves.push(leftAttackMove);
  }
  if (tileIsOccupiedBy(rightAttackMove, boardState, oppositeColor)) {
    validMoves.push(rightAttackMove);
  }
  // 4. En passant capture
  if (moveIsEnPassant(pawn.position, leftAttackMove, pawn.type, pieceColor, boardState)) {
    validMoves.push(leftAttackMove);
  }
  if (moveIsEnPassant(pawn.position, rightAttackMove, pawn.type, pieceColor, boardState)) {
    validMoves.push(rightAttackMove);
  }
  return validMoves;
};

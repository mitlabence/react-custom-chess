import { PieceColor, PieceType, Position } from "../../Constants";
import { Piece } from "./Piece";
import { BoardState } from "../BoardState";

export class Pawn implements Piece {
  image: string;
  position: Position;
  type: PieceType;
  color: PieceColor;
  validMoves: Position[] = [];
  checkable: boolean = false;
  constructor(position: Position, color: PieceColor) {
    this.image = `assets/images/${color}_pawn.png`;
    this.position = position;
    this.type = PieceType.PAWN;
    this.color = color;
  }

  isValidMove(targetPosition: Position, boardState: BoardState): boolean {
    const pieceColor = this.color;
    const sourcePosition = this.position;
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
        boardState.straightPathOccupied(sourcePosition, targetPosition, true)
      ) {
        // if moving 2 steps forward, check if tile pawn would move to and tile between source and target are free
        return false;
      }
      return true;
    } else if (deltaForward === 1) {
      if (deltaXAbs === 0) {
        if (
          !boardState.straightPathOccupied(
            sourcePosition,
            targetPosition,
            true
          )
        ) {
          return true;
        }
      } else if (deltaXAbs === 1) {
        if (boardState.tileIsOccupied(targetPosition)) {
          return boardState.tileIsOccupiedBy(targetPosition, oppositeColor);
        }
      }
    }
    // TODO: move en passant here?
    return false;
  }

  updateValidMoves(boardState: BoardState): void {
    const validMoves: Position[] = [];
    // Valid moves:
    // 1. 1 square forward if empty
    // 2. 2 squares forward if two squares in front empty, and on starting rank
    // 3. 1 square diagonally forward if occupied by opposite color
    // 4. En passant capture: 1 square diagonally forward if previous move was 2 squares forward by opposite color pawn

    const sourceX: number = this.position.x;
    const sourceY: number = this.position.y;
    const pieceColor: PieceColor = this.color;
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
    if (!boardState.tileIsOccupied(singleForwardMove)) {
      validMoves.push(singleForwardMove);
      // 2. Check if double step forward is possible. Only possible if the single step forward is possible (and pawn is on starting rank)
      if (isOnStartingRank && !boardState.tileIsOccupied(doubleForwardMove)) {
        validMoves.push(doubleForwardMove);
      }
    }
    // 3. Check if left/right diagonal attack is possible
    if (boardState.tileIsOccupiedBy(leftAttackMove, oppositeColor)) {
      validMoves.push(leftAttackMove);
    }
    if (boardState.tileIsOccupiedBy(rightAttackMove, oppositeColor)) {
      validMoves.push(rightAttackMove);
    }
    // 4. En passant capture
    if (
      boardState.moveIsEnPassant(
        this.position,
        leftAttackMove
      )
    ) {
      validMoves.push(leftAttackMove);
    }
    if (
      boardState.moveIsEnPassant(
        this.position,
        rightAttackMove,
      )
    ) {
      validMoves.push(rightAttackMove);
    }
    this.validMoves = validMoves;
  }
}

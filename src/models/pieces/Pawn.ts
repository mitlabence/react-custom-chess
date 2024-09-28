import { kGridSize, PieceColor, PieceType, Position } from "../../Constants";
import { BoardState } from "../BoardState";
import { PawnLike } from "./PawnLikePiece";

export class Pawn implements PawnLike {
  image: string;
  type: PieceType;
  color: PieceColor;
  hasMoved: boolean; // TODO: instead of checking if pawn on second rank of team, use hasMoved (more general)
  constructor(color: PieceColor, hasMoved?: boolean) {
    this.image = `assets/images/${color}_pawn.png`;
    this.type = PieceType.PAWN;
    this.color = color;
    this.hasMoved = hasMoved ? hasMoved : false;
  }

  isValidMove(
    sourcePosition: Position,
    targetPosition: Position,
    boardState: BoardState
  ): boolean {
    const pieceColor = this.color;
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
    // Check based on forward movement
    if (deltaForward === 2 && deltaXAbs === 0 && !this.hasMoved) {
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
          !boardState.straightPathOccupied(sourcePosition, targetPosition, true)
        ) {
          return true;
        }
      } else if (deltaXAbs === 1) {
        if (boardState.tileIsOccupied(targetPosition)) {
          return boardState.tileIsOccupiedByColor(
            targetPosition,
            oppositeColor
          );
        }
      }
    }
    // TODO: move en passant here?
    return false;
  }

  getValidMoves(sourcePosition: Position, boardState: BoardState): Position[] {
    const validMoves: Position[] = [];
    // Valid moves:
    // 1. 1 square forward if empty
    // 2. 2 squares forward if two squares in front empty, and on starting rank
    // 3. 1 square diagonally forward if occupied by opposite color
    // 4. En passant capture: 1 square diagonally forward if previous move was 2 squares forward by opposite color pawn

    const sourceX: number = sourcePosition.x;
    const sourceY: number = sourcePosition.y;
    const pieceColor: PieceColor = this.color;
    const oppositeColor =
      pieceColor === PieceColor.WHITE ? PieceColor.BLACK : PieceColor.WHITE;
    // First step can be 1 or 2 squares forward. White: source -> target is an increment, black: decrement
    const forwardDirection = pieceColor === PieceColor.WHITE ? 1 : -1;

    const singleForwardMove = { x: sourceX, y: sourceY + forwardDirection };
    const doubleForwardMove = { x: sourceX, y: sourceY + 2 * forwardDirection };
    const leftAttackMove = { x: sourceX - 1, y: sourceY + forwardDirection };
    const rightAttackMove = { x: sourceX + 1, y: sourceY + forwardDirection };

    // 1. Check if single step forward is possible
    if (!boardState.tileIsOccupied(singleForwardMove)) {
      validMoves.push(singleForwardMove);
      // 2. Check if double step forward is possible. Only possible if the single step forward is possible (and pawn is on starting rank)
      if (!this.hasMoved && !boardState.tileIsOccupied(doubleForwardMove)) {
        validMoves.push(doubleForwardMove);
      }
    }

    // 3. Check if left/right diagonal attack is possible
    if (
      leftAttackMove.x >= 0 &&
      leftAttackMove.x < kGridSize &&
      boardState.tileIsOccupiedByColor(leftAttackMove, oppositeColor)
    ) {
      // no need to check leftAttackMove.y as pawn never moves (changes type) after reaching last rank
      validMoves.push(leftAttackMove);
    }
    if (
      rightAttackMove.x >= 0 &&
      rightAttackMove.x < kGridSize &&
      boardState.tileIsOccupiedByColor(rightAttackMove, oppositeColor)
    ) {
      validMoves.push(rightAttackMove);
    }
    // 4. En passant capture
    if (this.moveIsEnPassant(sourcePosition, leftAttackMove, boardState)) {
      validMoves.push(leftAttackMove);
    }
    if (this.moveIsEnPassant(sourcePosition, rightAttackMove, boardState)) {
      validMoves.push(rightAttackMove);
    }
    return validMoves;
  }

  moveIsEnPassant(
    sourcePosition: Position,
    targetPosition: Position,
    boardState: BoardState
  ): boolean {
    // moveHistory should not be empty (en passant depends on previous move)
    if (boardState.moveHistory.length < 1) {
      return false;
    }
    const sourceX: number = sourcePosition.x;
    const sourceY: number = sourcePosition.y;
    const targetX: number = targetPosition.x;
    const targetY: number = targetPosition.y;

    // The number of horizontal moves
    const deltaX = Math.abs(targetX - sourceX);
    // forward is dependent on color! Should be positive if moving forward, negative if backward
    const deltaForward =
      this.color === PieceColor.WHITE ? targetY - sourceY : sourceY - targetY;
    if (!(deltaX === 1 && deltaForward === 1)) {
      // Pawn capture move => has to have 1 unit horizontal movement and 1 unit forward
      return false;
    }

    // Up to this point, we made sure that a pawn makes a capture-like movement. Need to check:
    // 1. if there is a pawn P at (targetX, sourceY). This pawn would be captured.
    // 2. if the P has opposite color
    const pieceToCapture = boardState.piecesGrid[sourceY][targetX];
    if (!pieceToCapture || pieceToCapture.type !== PieceType.PAWN) {
      // TODO: not only pawns should be enPassant capturable, but all pawn-like pieces
      // No piece to be captured is found or found piece is not a pawn
      return false;
    }
    // 3. if the pawn P just made a first move of double squares.
    //  It is enough to show that the previous move (two moves forward by P) ends up at same Y where attacking pawn is originally,
    //  and the x of P is where the attacking pawn ends up
    const previousMove =
      boardState.moveHistory[boardState.moveHistory.length - 1];
    if (
      !(previousMove.targetY === sourceY && previousMove.sourceX === targetX)
    ) {
      return false;
    }
    // 4. if we end up on third rank of enemy. Equivalent: if P has just moved 2 along Y axis.
    if (!(Math.abs(previousMove.targetY - previousMove.sourceY) === 2)) {
      return false;
    }
    return true;
  }
  isValidAttack(
    sourcePosition: Position,
    targetPosition: Position,
    boardState: BoardState
  ): boolean {
    const forwardDirection = this.color === PieceColor.WHITE ? 1 : -1;
    //const oppositeColor = this.color === PieceColor.WHITE ? PieceColor.BLACK : PieceColor.WHITE;
    const deltaX = Math.abs(targetPosition.x - sourcePosition.x);
    const deltaY = targetPosition.y - sourcePosition.y;
    const isVA = deltaX === 1 && deltaY === forwardDirection;
    return isVA;
  }
}

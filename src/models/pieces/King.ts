import {
  kGridSize,
  PieceColor,
  PieceType,
  Position,
  kKingX,
} from "../../Constants";
import { BoardState } from "../BoardState";
import { ChessPiece } from "./ChessPiece";
import { KingLikePiece } from "./KingLikePiece";
import { NullPiece } from "./NullPiece";
// TODO: implement check related logic. Maybe implement a CheckablePiece?
export class King implements KingLikePiece {
  image: string;
  type: PieceType;
  color: PieceColor;
  hasMoved: boolean;
  constructor(color: PieceColor, hasMoved?: boolean) {
    this.image = `assets/images/${color}_king.png`;
    this.type = PieceType.KING;
    this.color = color;
    this.hasMoved = hasMoved ? hasMoved : false;
  }

  isValidMove(
    sourcePosition: Position,
    targetPosition: Position,
    boardState: BoardState
  ): boolean {
    const sourceX: number = sourcePosition.x;
    const sourceY: number = sourcePosition.y;
    const targetX: number = targetPosition.x;
    const targetY: number = targetPosition.y;
    const deltaXAbs = Math.abs(targetX - sourceX);
    const oppositeColor =
      this.color === PieceColor.WHITE ? PieceColor.BLACK : PieceColor.WHITE;
    // forward is dependent on color! Should be positive if moving forward, negative if backward
    const deltaForward =
      this.color === PieceColor.WHITE ? targetY - sourceY : sourceY - targetY;
    const simulatedBoardState = boardState.cloneWithRelocation(sourcePosition, {
      x: targetX,
      y: targetY,
    });
    if (Math.abs(deltaForward) <= 1 && deltaXAbs <= 1) {
      if (
        simulatedBoardState.tileIsAttacked(
          { x: targetX, y: targetY },
          oppositeColor
        )
      ) {
        return false;
      }
      return boardState.canMoveStraightTo(
        sourcePosition,
        targetPosition,
        this.color
      );
    } else if (
      !this.hasMoved &&
      Math.abs(deltaForward) === 0 &&
      deltaXAbs === 2
    ) {
      // possible castling
      if (targetX === kKingX + 2) {
        return this.canCastleShort(boardState);
      } else if (targetX === kKingX - 2) {
        return this.canCastleLong(boardState);
      }
    }
    return false;
  }

  getValidMoves(sourcePosition: Position, boardState: BoardState): Position[] {
    const validMoves: Position[] = [];
    // TODO: need to simulate the possible move and check if the king would be attacked there!
    //although actually pawn isValidAttack should also just be the two diagonals, regardless of whether there is someone there
    const sourceX: number = sourcePosition.x;
    const sourceY: number = sourcePosition.y;
    const oppositeColor =
      this.color === PieceColor.WHITE ? PieceColor.BLACK : PieceColor.WHITE;
    const steps = [-1, 0, 1];
    for (var xStep of steps) {
      for (var yStep of steps) {
        if (xStep === 0 && yStep === 0) {
          // avoid xStep === 0 && yStep === 0 at the same time, i.e. no movement
          continue;
        }
        let targetX = sourceX + xStep;
        let targetY = sourceY + yStep;
        // create boardState with simulated move
        const simulatedBoardState = boardState.cloneWithRelocation(
          sourcePosition,
          { x: targetX, y: targetY }
        );

        if (
          targetX >= 0 &&
          targetX < kGridSize &&
          targetY >= 0 &&
          targetY < kGridSize &&
          !boardState.tileIsOccupiedByColor(
            { x: targetX, y: targetY },
            this.color
          ) &&
          !simulatedBoardState.tileIsAttacked(
            { x: targetX, y: targetY },
            oppositeColor
          )
        ) {
          validMoves.push({ x: targetX, y: targetY });
        }
      }
    }
    // check for castling
    if (this.canCastleShort(boardState)) {
      validMoves.push({ x: kKingX + 2, y: sourceY });
    }
    if (this.canCastleLong(boardState)) {
      validMoves.push({ x: kKingX - 2, y: sourceY });
    }

    return validMoves;
  }

  isValidAttack(
    sourcePosition: Position,
    targetPosition: Position,
    boardState: BoardState
  ): boolean {
    return this.isValidMove(sourcePosition, targetPosition, boardState);
  }

  canCastleTo(toShort: boolean, boardState: BoardState): boolean {
    if (this.hasMoved) {
      return false;
    }
    const cornerX: number = toShort ? kGridSize - 1 : 0; // short castling happens toward +x direction, long towards x=0
    const unitStepKingToCorner: number = toShort ? 1 : -1; // short towards +x
    const castleY: number = this.color === PieceColor.WHITE ? 0 : kGridSize - 1; // y coordinate of the king
    // possibly castling:
    // 1. check if corresponding rook (or corner piece in general) has not moved
    const rookPosition: Position = { x: cornerX, y: castleY };
    const cornerPiece: ChessPiece =
      boardState.piecesGrid[rookPosition.y][rookPosition.x];
    const oppositeColor: PieceColor =
      this.color === PieceColor.WHITE ? PieceColor.BLACK : PieceColor.WHITE;
    if (cornerPiece instanceof NullPiece || cornerPiece.hasMoved) {
      return false;
    }
    // 2. check if path is free: one and two steps from king towards corner; for long castle, also 3 steps should be empty
    if (
      !(
        boardState.piecesGrid[castleY][kKingX + unitStepKingToCorner] instanceof
        NullPiece
      ) &&
      !(
        boardState.piecesGrid[castleY][
          kKingX + 2 * unitStepKingToCorner
        ] instanceof NullPiece
      ) && // if long castle, also check the third step
      (toShort ||
        !(
          boardState.piecesGrid[castleY][
            kKingX + 3 * unitStepKingToCorner
          ] instanceof NullPiece
        ))
    ) {
      return false;
    }
    // 3. check if king, field to jump over, and field king arrives at are not in check
    if (
      boardState.tileIsAttacked({ x: kKingX, y: castleY }, oppositeColor) ||
      boardState.tileIsAttacked(
        { x: kKingX + unitStepKingToCorner, y: castleY },
        oppositeColor
      ) ||
      boardState.tileIsAttacked(
        { x: kKingX + 2 * unitStepKingToCorner, y: castleY },
        oppositeColor
      )
    ) {
      return false;
    }
    return true;
  }

  canCastleShort(boardState: BoardState): boolean {
    return this.canCastleTo(true, boardState);
  }
  canCastleLong(boardState: BoardState): boolean {
    return this.canCastleTo(false, boardState);
  }

  moveIsCastling(
    sourcePosition: Position,
    targetPosition: Position,
    boardState: BoardState
  ): boolean {
    const kingPiece = boardState.piecesGrid[sourcePosition.y][sourcePosition.x];
    if (!(kingPiece instanceof King)) {
      return false;
    }
    if (targetPosition.x === kKingX + 2) {
      return this.canCastleShort(boardState);
    } else if (targetPosition.x === kKingX - 2) {
      return this.canCastleLong(boardState);
    } else {
      // not a castling move if not deltaX === 2
      return false;
    }
  }
}

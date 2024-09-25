import {
  kGridSize,
  PieceColor,
  PieceType,
  Position,
} from "../../Constants";
import { Piece } from "./Piece";
import {
  canMoveStraightTo,
  tileIsOccupiedBy,
} from "../../components/Referee/Referee";
import { BoardState } from "../BoardState";

export class Bishop implements Piece {
  image: string;
  position: Position;
  type: PieceType;
  color: PieceColor;
  validMoves: Position[] = [];
  checkable: boolean = false;
  constructor(position: Position, color: PieceColor) {
    this.image = `assets/images/${color}_bishop.png`;
    this.position = position;
    this.type = PieceType.BISHOP;
    this.color = color;
  }

  isValidMove(targetPosition: Position, boardState: BoardState): boolean {
    const sourceX: number = this.position.x;
    const sourceY: number = this.position.y;
    const targetX: number = targetPosition.x;
    const targetY: number = targetPosition.y;
    const deltaXAbs = Math.abs(targetX - sourceX);
    // forward is dependent on color! Should be positive if moving forward, negative if backward
    const deltaForward =
      this.color === PieceColor.WHITE ? targetY - sourceY : sourceY - targetY;
    const isDiagonal: boolean = !(
      deltaForward === 0 || Math.abs(deltaForward) !== deltaXAbs
    );
    if (!isDiagonal) {
      // Bishop: should be a diagonal move that changes position, i.e. deltaX > 0 and abs(deltaX) === abs(deltaY)
      return false;
    }

    return canMoveStraightTo(
      this.position,
      targetPosition,
      boardState,
      this.color
    );
  }

  updateValidMoves(boardState: BoardState): void {
    const validMoves: Position[] = [];

    const sourceX: number = this.position.x;
    const sourceY: number = this.position.y;
    const pieceColor: PieceColor = this.color;
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

    this.validMoves = validMoves;
  }
}

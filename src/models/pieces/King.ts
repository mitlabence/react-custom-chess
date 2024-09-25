import { kGridSize, PieceColor, PieceType, Position } from "../../Constants";
import { Piece } from "./Piece";
import { BoardState } from "../BoardState";
// TODO: implement check related logic. Maybe implement a CheckablePiece?
export class King implements Piece {
  image: string;
  position: Position;
  type: PieceType;
  color: PieceColor;
  validMoves: Position[] = [];
  checkable: boolean = true;
  constructor(position: Position, color: PieceColor) {
    this.image = `assets/images/${color}_king.png`;
    this.position = position;
    this.type = PieceType.KING;
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
    if (Math.abs(deltaForward) <= 1 && deltaXAbs <= 1) {
      return boardState.canMoveStraightTo(
        this.position,
        targetPosition,
        this.color
      );
    }
    return false;
  }

  updateValidMoves(boardState: BoardState): void {
    const validMoves: Position[] = [];
  
    const sourceX: number = this.position.x;
    const sourceY: number = this.position.y;
    const pieceColor: PieceColor = this.color;

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
          !boardState.tileIsOccupiedBy({ x: targetX, y: targetY }, pieceColor)
        ) {
          validMoves.push({ x: targetX, y: targetY });
        }
      }
    }
    this.validMoves = validMoves;
  }
}

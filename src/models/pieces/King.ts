import { kGridSize, PieceColor, PieceType, Position } from "../../Constants";
import { ChessPiece } from "./ChessPiece";
import { BoardState } from "../BoardState";
// TODO: implement check related logic. Maybe implement a CheckablePiece?
export class King implements ChessPiece {
  image: string;
  type: PieceType;
  color: PieceColor;
  checkable: boolean = true;
  constructor(color: PieceColor) {
    this.image = `assets/images/${color}_king.png`;
    this.type = PieceType.KING;
    this.color = color;
  }

  isValidMove(sourcePosition: Position, targetPosition: Position, boardState: BoardState): boolean {
    const sourceX: number = sourcePosition.x;
    const sourceY: number = sourcePosition.y;
    const targetX: number = targetPosition.x;
    const targetY: number = targetPosition.y;
    const deltaXAbs = Math.abs(targetX - sourceX);
    // forward is dependent on color! Should be positive if moving forward, negative if backward
    const deltaForward =
      this.color === PieceColor.WHITE ? targetY - sourceY : sourceY - targetY;
    if (Math.abs(deltaForward) <= 1 && deltaXAbs <= 1) {
      return boardState.canMoveStraightTo(
        sourcePosition,
        targetPosition,
        this.color
      );
    }
    return false;
  }

  getValidMoves(sourcePosition: Position, boardState: BoardState): Position[] {
    const validMoves: Position[] = [];
  
    const sourceX: number = sourcePosition.x;
    const sourceY: number = sourcePosition.y;
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
          !boardState.tileIsOccupiedByColor({ x: targetX, y: targetY }, pieceColor)
        ) {
          validMoves.push({ x: targetX, y: targetY });
        }
      }
    }
    return validMoves;
  }
}

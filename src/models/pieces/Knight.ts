import {
  kGridSize,
  PieceColor,
  PieceType,
  Position,
} from "../../Constants";
import { Piece } from "./Piece";
import { BoardState } from "../BoardState";

export class Knight implements Piece {
  image: string;
  position: Position;
  type: PieceType;
  color: PieceColor;
  validMoves: Position[] = [];
  checkable: boolean = false;
  constructor(position: Position, color: PieceColor) {
    this.image = `assets/images/${color}_knight.png`;
    this.position = position;
    this.type = PieceType.KNIGHT;
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
    const oppositeColor =
      this.color === PieceColor.WHITE ? PieceColor.BLACK : PieceColor.WHITE;
    // Knight moves 2 vertically, 1 horiziontally, or vice versa.
    if (
      (Math.abs(deltaForward) === 2 && deltaXAbs === 1) ||
      (Math.abs(deltaForward) === 1 && deltaXAbs === 2)
    ) {
      if (boardState.tileIsOccupiedBy(targetPosition,  oppositeColor)) {
        return true;
      } else if (!boardState.tileIsOccupied(targetPosition)) {
        return true;
      }
    }
    return false;
  }

  updateValidMoves(boardState: BoardState): void {
    const validMoves: Position[] = [];

    const sourceX: number = this.position.x;
    const sourceY: number = this.position.y;

    // 1. Go left/right 2 and up/down 1
    const shortSteps = [-1, 1];
    const longSteps = [-2, 2];
    for (let xStep of longSteps) {
      const targetX = sourceX + xStep;
      if (!(targetX >= 0 && targetX < kGridSize)) {
        // Check if targetX is within bounds
        continue;
      }
      for (let yStep of shortSteps) {
        const targetY = sourceY + yStep;
        if (targetY >= 0 && targetY < kGridSize) {
          const targetPosition: Position = { x: targetX, y: targetY };
          if (this.isValidMove(targetPosition, boardState)) {
            validMoves.push(targetPosition);
          }
        }
      }
    }
    // 2. Go left/right 1 and up/down 2
    for (let xStep of shortSteps) {
      const targetX = sourceX + xStep;
      if (!(targetX >= 0 && targetX < kGridSize)) {
        // Check if targetX is within bounds
        continue;
      }
      for (let yStep of longSteps) {
        const targetY = sourceY + yStep;
        if (targetY >= 0 && targetY < kGridSize) {
          const targetPosition: Position = { x: targetX, y: targetY };
          if (this.isValidMove(targetPosition, boardState)) {
            validMoves.push(targetPosition);
          }
        }
      }
    }
    this.validMoves = validMoves;
  }
}

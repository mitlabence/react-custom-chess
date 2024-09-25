import { kGridSize, PieceColor, PieceType, Position } from "../../Constants";
import { Piece } from "./Piece";
import { BoardState } from "../BoardState";

export class Queen implements Piece {
  image: string;
  position: Position;
  type: PieceType;
  color: PieceColor;
  validMoves: Position[] = [];
  checkable: boolean = false;
  constructor(position: Position, color: PieceColor) {
    this.image = `assets/images/${color}_queen.png`;
    this.position = position;
    this.type = PieceType.QUEEN;
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
    const isHorizontalOrVertical: boolean = !(
      (deltaForward !== 0) ===
      (deltaXAbs !== 0)
    ); // negation of: either no move, or move both horizontally and vertically
    if (!isDiagonal && !isHorizontalOrVertical) {
      // Queen: either diagonal or horizontal or vertical. So if not any of the previous
      return false;
    }
    return boardState.canMoveStraightTo(
      this.position,
      targetPosition,
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
          !boardState.tileIsOccupiedBy({ x: targetX, y: targetY }, pieceColor)
        ) {
          validMoves.push({ x: targetX, y: targetY });
          if (
            boardState.tileIsOccupiedBy(
              { x: targetX, y: targetY }, oppositeColor
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
  };
}

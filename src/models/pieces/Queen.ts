import { kGridSize, PieceColor, PieceType, Position } from "../../Constants";
import { ChessPiece } from "./ChessPiece";
import { BoardState } from "../BoardState";

export class Queen implements ChessPiece {
  image: string;
  type: PieceType;
  color: PieceColor;
  hasMoved?: boolean | undefined;
  constructor(color: PieceColor, hasMoved?: boolean) {
    this.image = `assets/images/${color}_queen.png`;
    this.type = PieceType.QUEEN;
    this.color = color;
    this.hasMoved = hasMoved ? hasMoved : false;
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
      sourcePosition,
      targetPosition,
      this.color
    );
  }

  getValidMoves(sourcePosition: Position, boardState: BoardState): Position[] {
    const validMoves: Position[] = [];
    const sourceX: number = sourcePosition.x;
    const sourceY: number = sourcePosition.y;
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
          !boardState.tileIsOccupiedByColor({ x: targetX, y: targetY }, pieceColor)
        ) {
          validMoves.push({ x: targetX, y: targetY });
          if (
            boardState.tileIsOccupiedByColor(
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
  
    return validMoves;
  };
  isValidAttack(sourcePosition: Position, targetPosition: Position, boardState: BoardState) : boolean {
    return this.isValidMove(sourcePosition, targetPosition, boardState);
  }
}

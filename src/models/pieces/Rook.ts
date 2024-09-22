import { BoardState, kGridSize, PieceColor, PieceType, Position } from "../../Constants";
import { Piece } from "./Piece";
import {
  canMoveStraightTo,
  tileIsOccupied,
  tileIsOccupiedBy,
  moveIsEnPassant,
  straightPathOccupied,
} from "../../components/Referee/Referee";

export class Rook implements Piece {
  image: string;
  position: Position;
  type: PieceType;
  color: PieceColor;
  possibleMoves?: Position[];
  checkable: boolean = false;
  constructor(position: Position, color: PieceColor) {
    this.image = `assets/images/${color}_rook.png`;
    this.position = position;
    this.type = PieceType.ROOK;
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
    const isHorizontalOrVertical: boolean = !(
      (deltaForward !== 0) ===
      (deltaXAbs !== 0)
    ); // negation of: either no move, or move both horizontally and vertically
    if (!isHorizontalOrVertical) {
      // Rook: should be horizontal or vertical move that changes position, i.e. deltaX > 0 XOR deltaY > 0, i.e. these two should be 1 true, 1 false
      return false;
    }
    return canMoveStraightTo(
      this.position,
      targetPosition,
      boardState,
      this.color
    );
  }

  getValidMoves(boardState: BoardState): Position[] {
    const validMoves: Position[] = [];
    const sourceX: number = this.position.x;
    const sourceY: number = this.position.y;
    const pieceColor: PieceColor = this.color;
    const oppositeColor =
      pieceColor === PieceColor.WHITE ? PieceColor.BLACK : PieceColor.WHITE;
  
    // From starting position, go in all 4 possible directions, stop when board edge is reached or friendly piece is in the way
    // or after finding an enemy piece
    const steps = [-1, 1];
    // 1. horizontal moves
    for (var xStep of steps) {
      let targetX = sourceX + xStep;
      let targetY = sourceY;
      while (
        targetX >= 0 &&
        targetX < kGridSize &&
        !tileIsOccupiedBy({ x: targetX, y: targetY }, boardState, pieceColor)
      ) {
        validMoves.push({ x: targetX, y: targetY });
        if (
          tileIsOccupiedBy({ x: targetX, y: targetY }, boardState, oppositeColor)
        ) {
          break;
        }
        targetX += xStep;
      }
    }
    // 2. vertical moves
    for (var yStep of steps) {
      let targetX = sourceX;
      let targetY = sourceY + yStep;
      while (
        targetY >= 0 &&
        targetY < kGridSize &&
        !tileIsOccupiedBy({ x: targetX, y: targetY }, boardState, pieceColor)
      ) {
        validMoves.push({ x: targetX, y: targetY });
        if (
          tileIsOccupiedBy({ x: targetX, y: targetY }, boardState, oppositeColor)
        ) {
          break;
        }
        targetY += yStep;
      }
    }
  
    return validMoves;
  }
}

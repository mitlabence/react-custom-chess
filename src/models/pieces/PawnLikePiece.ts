import { PieceColor, PieceType, Position } from "../../Constants";
import { BoardState } from "../BoardState";
import { ChessPiece } from "./ChessPiece";

export interface PawnLike extends ChessPiece {
  image?: string;
  type?: PieceType | undefined;
  color?: PieceColor | undefined;
  hasMoved: boolean | undefined; // Pawn hasMoved is used to determine if it can move 2 squares forward

  isValidMove: (
    sourcePosition: Position,
    targetPosition: Position,
    boardState: BoardState
  ) => boolean;
  getValidMoves: (
    sourcePosition: Position,
    boardState: BoardState
  ) => Position[];
  isValidAttack: (
    sourcePosition: Position,
    targetPosition: Position,
    boardState: BoardState
  ) => boolean;
  moveIsEnPassant: (
    sourcePosition: Position,
    targetPosition: Position,
    boardState: BoardState
  ) => boolean;
}

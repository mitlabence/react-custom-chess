import { PieceColor, PieceType, Position } from "../../Constants";
import { BoardState } from "../BoardState";
import { ChessPiece } from "./ChessPiece";

export interface KingLikePiece extends ChessPiece {
  image?: string;
  type?: PieceType | undefined;
  color?: PieceColor | undefined;
  hasMoved: boolean;
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
  canCastleShort: (boardState: BoardState) => boolean;
  canCastleLong: (boardState: BoardState) => boolean;
  moveIsCastling: (
    sourcePosition: Position,
    targetPosition: Position,
    boardState: BoardState
  ) => boolean;
}

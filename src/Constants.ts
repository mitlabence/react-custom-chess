import { Bishop } from "./models/pieces/Bishop";
import { BoardState } from "./models/BoardState";
import { King } from "./models/pieces/King";
import { Knight } from "./models/pieces/Knight";
import { Pawn } from "./models/pieces/Pawn";
import { ChessPiece } from "./models/pieces/ChessPiece";
import { Queen } from "./models/pieces/Queen";
import { Rook } from "./models/pieces/Rook";
import { NullPiece } from "./models/pieces/NullPiece";

export const kVerticalAxis = ["1", "2", "3", "4", "5", "6", "7", "8"];
export const kHorizontalAxis = ["a", "b", "c", "d", "e", "f", "g", "h"];
export const kTileSize = 100; // The side length of a chessboard tile in pixels
export const kGridSize = 8; // the number of tiles along each axis of the chess board
export const kKingX = 4; // king starts at e1 for white, e8 for black
export const kInitialMoveHistory: ChessMove[] = [];

export enum PieceType {
  PAWN = "pawn",
  ROOK = "rook",
  KNIGHT = "knight",
  BISHOP = "bishop",
  QUEEN = "queen",
  KING = "king",
}

export enum PieceColor {
  WHITE = "white",
  BLACK = "black",
  NULL = "null",
}

export interface Position {
  x: number;
  y: number;
}

export function equalsPosition(position1: Position, position2: Position) {
  return position1.x === position2.x && position1.y === position2.y;
}

export class ChessMove {
  pieceType: PieceType;
  pieceColor: PieceColor;
  sourceX: number;
  sourceY: number;
  targetX: number;
  targetY: number;
  constructor(
    pieceType: PieceType,
    pieceColor: PieceColor,
    sourceX: number,
    sourceY: number,
    targetX: number,
    targetY: number
  ) {
    this.pieceType = pieceType;
    this.pieceColor = pieceColor;
    this.sourceX = sourceX;
    this.sourceY = sourceY;
    this.targetX = targetX;
    this.targetY = targetY;
  }
}

// add pawns
export const kPawnsConfig = [Pawn, Pawn, Pawn, Pawn, Pawn, Pawn, Pawn, Pawn];
// add pieces, left to right:
//  rook, knight, bishop, queen, king, bishop, knight, rook
export const kPiecesConfig = [
  Rook,
  Knight,
  Bishop,
  Queen,
  King,
  Bishop,
  Knight,
  Rook,
]; // TODO: can make it more compact than specifying basically same information twice? piecesConfig and pieceTypesConfig

// [[row_1], ..., [row_last]] 
export const kInitialPieces: ChessPiece[][] = new Array(kGridSize)
  .fill(null)
  .map((_, rowIndex) => {
    if (rowIndex === 0) {
      /// white pieces
      return kPawnsConfig.map(
        (value, index, _) => new kPiecesConfig[index](PieceColor.WHITE)
      );
    } else if (rowIndex === 1) {
      /// white pawns
      return kPawnsConfig.map(
        (value, index, _) => new kPawnsConfig[index](PieceColor.WHITE)
      );
    } else if (rowIndex === kGridSize - 2) {
      /// black pawns
      return kPawnsConfig.map(
        (value, index, _) => new kPawnsConfig[index](PieceColor.BLACK)
      );
    } else if (rowIndex === kGridSize - 1) {
      /// black pieces
      return kPawnsConfig.map(
        (value, index, _) => new kPiecesConfig[index](PieceColor.BLACK)
      );
    } else {
      return new Array(kGridSize).fill(new NullPiece());
    }
  });

export const kInitialBoardState = new BoardState(
  kInitialPieces,
  kInitialMoveHistory
);

export const kPieceTypeMap = {
  pawn: Pawn,
  rook: Rook,
  knight: Knight,
  bishop: Bishop,
  queen: Queen,
  king: King,
};

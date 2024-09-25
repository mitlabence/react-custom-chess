import { Bishop } from "./models/pieces/Bishop";
import { BoardState } from "./models/BoardState";
import { King } from "./models/pieces/King";
import { Knight } from "./models/pieces/Knight";
import { Pawn } from "./models/pieces/Pawn";
import { Piece } from "./models/pieces/Piece";
import { Queen } from "./models/pieces/Queen";
import { Rook } from "./models/pieces/Rook";

export const kVerticalAxis = ["1", "2", "3", "4", "5", "6", "7", "8"];
export const kHorizontalAxis = ["a", "b", "c", "d", "e", "f", "g", "h"];
export const kTileSize = 100; // The side length of a chessboard tile in pixels
export const kGridSize = 8; // the number of tiles along each axis of the chess board
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

export const kInitialPieces: Piece[] = [];
for (let i = 0; i < 8; i++) {
  // white
  kInitialPieces.push(new kPiecesConfig[i]({ x: i, y: 0 }, PieceColor.WHITE));
  kInitialPieces.push(new kPawnsConfig[i]({ x: i, y: 1 }, PieceColor.WHITE));
  // black
  kInitialPieces.push(new kPiecesConfig[i]({ x: i, y: 7 }, PieceColor.BLACK));
  kInitialPieces.push(new kPawnsConfig[i]({ x: i, y: 6 }, PieceColor.BLACK));
}


export const kInitialBoardState = new BoardState(kInitialPieces, kInitialMoveHistory);

export const kPieceTypeMap = {
  "pawn" : Pawn,
  "rook" : Rook,
  "knight" : Knight,
  "bishop" : Bishop,
  "queen" : Queen,
  "king" : King
};
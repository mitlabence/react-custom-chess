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

export function equalsPosition(position1: Position, position2: Position){
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

export class BoardState {
  pieces: Piece[];
  moveHistory: ChessMove[];
  constructor(pieces: Piece[], moveHistory: ChessMove[]) {
    this.pieces = pieces;
    this.moveHistory = moveHistory;
  }
}

export interface Piece {
  image: string;
  position: Position;
  type: PieceType;
  color: PieceColor;
  possibleMoves?: Position[];
}

// add pawns
export const kPawnsConfig = [
  PieceType.PAWN,
  PieceType.PAWN,
  PieceType.PAWN,
  PieceType.PAWN,
  PieceType.PAWN,
  PieceType.PAWN,
  PieceType.PAWN,
  PieceType.PAWN,
];
// add pieces, left to right:
//  rook, knight, bishop, queen, king, bishop, knight, rook
export const kPiecesConfig = [
  PieceType.ROOK,
  PieceType.KNIGHT,
  PieceType.BISHOP,
  PieceType.QUEEN,
  PieceType.KING,
  PieceType.BISHOP,
  PieceType.KNIGHT,
  PieceType.ROOK,
]; // TODO: can make it more compact than specifying basically same information twice? piecesConfig and pieceTypesConfig

export const kInitialPieces: Piece[] = [];
for (let i = 0; i < 8; i++) {
  // white
  let image_path_white_piece = `assets/images/${PieceColor.WHITE}_${kPiecesConfig[i]}.png`;
  kInitialPieces.push({
    image: image_path_white_piece,
    position: { x: i, y: 0 },
    type: kPiecesConfig[i],
    color: PieceColor.WHITE,
  });
  let image_path_white_pawn = `assets/images/${PieceColor.WHITE}_${kPawnsConfig[i]}.png`;
  kInitialPieces.push({
    image: image_path_white_pawn,
    position: { x: i, y: 1 },
    type: PieceType.PAWN,
    color: PieceColor.WHITE,
  });
  // black
  let image_path_black_piece = `assets/images/${PieceColor.BLACK}_${kPiecesConfig[i]}.png`;
  kInitialPieces.push({
    image: image_path_black_piece,
    position: { x: i, y: 7 },
    type: kPiecesConfig[i],
    color: PieceColor.BLACK,
  });
  let image_path_black_pawn = `assets/images/${PieceColor.BLACK}_${kPawnsConfig[i]}.png`;
  kInitialPieces.push({
    image: image_path_black_pawn,
    position: { x: i, y: 6 },
    type: PieceType.PAWN,
    color: PieceColor.BLACK,
  });
}

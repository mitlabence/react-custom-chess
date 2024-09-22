import { BoardState, PieceColor, PieceType, Position } from "../../Constants";

export interface Piece {
    image: string;
    position: Position;
    type: PieceType;
    color: PieceColor;
    possibleMoves?: Position[];
    checkable: boolean;  // in standard chess, only the king is checkable.
    
    isValidMove: (targetPosition: Position, boardState: BoardState) => boolean;
    getValidMoves: (boardState: BoardState) => Position[];
}
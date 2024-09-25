import { PieceColor, PieceType, Position } from "../../Constants";
import { BoardState } from "../BoardState";

export interface Piece {
    image: string;
    position: Position;
    type: PieceType;
    color: PieceColor;
    validMoves: Position[];
    checkable: boolean;  // in standard chess, only the king is checkable.
    
    isValidMove: (targetPosition: Position, boardState: BoardState) => boolean;
    updateValidMoves: (boardState: BoardState) => void;
}
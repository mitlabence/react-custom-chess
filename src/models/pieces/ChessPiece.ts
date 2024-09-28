import { PieceColor, PieceType, Position } from "../../Constants";
import { BoardState } from "../BoardState";

export interface ChessPiece {
    image?: string;
    type?: PieceType | undefined;
    color?: PieceColor | undefined;
    hasMoved? : boolean;
    isValidMove: (sourcePosition: Position, targetPosition: Position, boardState: BoardState) => boolean;
    getValidMoves: (sourcePosition: Position, boardState: BoardState) => Position[];
    isValidAttack: (sourcePosition: Position, targetPosition: Position, boardState: BoardState) => boolean;
}
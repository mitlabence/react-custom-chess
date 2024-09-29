import { PieceColor, PieceType, Position } from "../../Constants";
import { BoardState } from "../BoardState";

export interface ChessPiece {
    image?: string;
    type?: PieceType | undefined;
    color?: PieceColor | undefined;
    hasMoved? : boolean;
    // TODO: valid move in ChessPiece context does not include check/mate logic! i.e. results could actually be invalid if they leave own king in check
    isValidMove: (sourcePosition: Position, targetPosition: Position, boardState: BoardState) => boolean;
    getValidMoves: (sourcePosition: Position, boardState: BoardState) => Position[];
    isValidAttack: (sourcePosition: Position, targetPosition: Position, boardState: BoardState) => boolean;
}
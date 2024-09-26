import { Position } from "../../Constants";
import { ChessPiece } from "./ChessPiece";

export class NullPiece implements ChessPiece{
    image = undefined;
    type = undefined;
    color = undefined;
    checkable: boolean = false;
    isValidMove(sourcePosition: Position, targetPosition: Position): boolean {
        return false;
    }

    getValidMoves(): Position[] {
        return [];
    }
}
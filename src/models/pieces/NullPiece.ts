import { Position } from "../../Constants";
import { BoardState } from "../BoardState";
import { ChessPiece } from "./ChessPiece";

export class NullPiece implements ChessPiece{
    image = undefined;
    type = undefined;
    color = undefined;
    hasMoved = false;
    isValidMove(sourcePosition: Position, targetPosition: Position): boolean {
        return false;
    }

    getValidMoves(): Position[] {
        return [];
    }
    isValidAttack(sourcePosition: Position, targetPosition: Position, boardState: BoardState) : boolean {
        return false;
      }
}
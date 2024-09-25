import { ChessMove } from "../Constants";
import { Piece } from "./pieces/Piece";

export class BoardState {
  pieces: Piece[];
  moveHistory: ChessMove[];
  constructor(pieces: Piece[], moveHistory: ChessMove[]) {
    this.pieces = pieces;
    this.moveHistory = moveHistory;
  }

  updatePossibleMoves(): void {
    for (const piece of this.pieces) {
      piece.updateValidMoves(this);
    }
  }
}

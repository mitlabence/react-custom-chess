import { ChessMove, PieceColor, PieceType, Position } from "../Constants";
import { NullPiece } from "./pieces/NullPiece";
import { ChessPiece } from "./pieces/ChessPiece";

export class BoardState {
  piecesGrid: ChessPiece[][]; // an array of the chess board rows; i.e. piecesGrid[0] is the first row!
  moveHistory: ChessMove[];
  constructor(piecesGrid: ChessPiece[][], moveHistory: ChessMove[]) {
    this.piecesGrid = piecesGrid;
    this.moveHistory = moveHistory;
  }
  straightPathOccupied(
    sourcePosition: Position,
    targetPosition: Position,
    includeTarget: boolean = false
  ): boolean {
    /// Given a current position and a target position, find out whether any tile along the straight path (horizontal, vertical, or diagonal)
    /// connecting these two positions is occupied by any piece (i.e. excluding begin and end positions). If the path is not straight, returns true.
    const deltaX: number = targetPosition.x - sourcePosition.x;
    const deltaY: number = targetPosition.y - sourcePosition.y;
    if (deltaX !== 0 && deltaY !== 0 && Math.abs(deltaX) !== Math.abs(deltaY)) {
      // not horizontal, vertical, or diagonal path
      return true;
    }
    const horizontalStep: number = deltaX > 0 ? 1 : -1;
    const verticalStep: number = deltaY > 0 ? 1 : -1;
    // loop over path in one for loop
    // determine path length: if horizontal, it is abs(deltaX) - 1; if vertical, abs(deltaY) - 1; if diagonal, both should be the same
    var pathLength = Math.max(Math.abs(deltaX) - 1, Math.abs(deltaY) - 1);
    // Step over all tiles starting with neighbor of currentPosition, and end with neighbor of targetPosition
    if (includeTarget) {
      // we want to include last tile in the check (for example, pawn move forward should check if there is any piece)
      pathLength += 1;
    }
    for (let i = 1; i <= pathLength; i++) {
      // need equality because pathLength only includes tiles we actually want to check
      // Construct position of current tile in path
      let pathX = sourcePosition.x;
      let pathY = sourcePosition.y;
      if (deltaX !== 0) {
        pathX += i * horizontalStep;
      }
      if (deltaY !== 0) {
        pathY += i * verticalStep;
      }
      // Check if a piece is on the tile, color does not matter
      const piece = this.piecesGrid[pathY][pathX];
      if (piece && !(piece instanceof NullPiece)) {
        // found such a piece
        return true;
      }
    }

    return false;
  }
  tileIsAttacked(position: Position, attackerColor: PieceColor): boolean {
    // Check if the tile at (x,y) is attacked by any piece of the attackerColor.
    let isAttacked = false;
    // TODO: forEach cannot use break to exit early. Use for loop instead.
    this.piecesGrid.forEach((row, y) => {
      row.forEach((piece, x) => {
        if (!isAttacked && piece.color === attackerColor) {
          if (piece.isValidAttack({ x, y }, position, this)) {
            isAttacked = true;
          }
        }
      });
    });
    return isAttacked;
  }
  tileIsOccupied(position: Position): boolean {
    const piece = this.piecesGrid[position.y][position.x];
    if (piece instanceof NullPiece) {
      return false;
    } else {
      return true;
    }
  }
  tileIsOccupiedByColor(position: Position, color: PieceColor): boolean {
    /// Given a color (team), check if (x,y) is occupied by a piece that belongs to that color.
    const piece = this.piecesGrid[position.y][position.x];
    return piece.color === color;
  }

  canMoveStraightTo(
    sourcePosition: Position,
    targetPosition: Position,
    ownColor: PieceColor
  ): boolean {
    // Check if the tiles along a straight (horizontal/vertical/diagonal) path between sourcePosition to targetPosition are
    // free from any pieces, and targetPosition is not occupied by a piece with color ownColor.

    // 1. Check if "straight" (diagonal) path from second up to second-to-last tile is occupied by any piece. Move fails if yes.
    if (this.straightPathOccupied(sourcePosition, targetPosition)) {
      return false;
    }
    // 2. Check if target field is occupied by own color piece; otherwise, valid move.
    if (this.tileIsOccupiedByColor(targetPosition, ownColor)) {
      return false;
    }
    return true;
  }

  cloneWithRelocation(sourcePosition: Position, targetPosition: Position): BoardState {
    /// Simulate a move from sourcePosition to targetPosition, and return the new board state as a new object. Leaves the original BoardState object unchanged. The move is not checked for validity!
    /// If trying to relocate a NullPiece, no move is added to the move history
    const movedPiece: ChessPiece = this.piecesGrid[sourcePosition.y][sourcePosition.x];
    const updatedPiecesGrid = this.piecesGrid.map((row, rowIndex) => {
      return row.map((piece, colIndex) => {
        if (rowIndex === sourcePosition.y && colIndex === sourcePosition.x) {
          return new NullPiece();
        } else if (rowIndex === targetPosition.y && colIndex === targetPosition.x) {
          return movedPiece;
        } else {
          return piece;
        }
      });
    });
    if (movedPiece instanceof NullPiece) {
      return new BoardState(updatedPiecesGrid, this.moveHistory);
    }
    else {
      return new BoardState(updatedPiecesGrid, [...this.moveHistory, new ChessMove(movedPiece.type!, movedPiece.color!, sourcePosition.x, sourcePosition.y, targetPosition.x, targetPosition.y)]);
    }
  }
  getKingPosition(color: PieceColor): Position | undefined{
    let kingPosition: Position | undefined = undefined;
    this.piecesGrid.forEach((row, y) => {
      row.forEach((piece, x) => {
        if (piece.color === color && piece.type === PieceType.KING) {
          kingPosition = {x, y};
        }
      });
    });
    return kingPosition;
  }
}

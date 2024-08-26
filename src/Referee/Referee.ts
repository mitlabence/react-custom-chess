import {
  Piece,
  PieceType,
  TeamType,
} from "../components/Chessboard/Chessboard";

export default class Referee {
  tileIsOccupied(x: number, y: number, boardState: Piece[]): boolean {
    const piece = boardState.find((p) => p.x === x && p.y === y);
    if (piece) {
      return true;
    } else {
      return false;
    }
  }
  tileIsOccupiedBy(
    x: number,
    y: number,
    boardState: Piece[],
    team: TeamType
  ): boolean {
    /// Given a color (team), check if (x,y) is occupied by a piece that belongs to that color.
    const piece = boardState.find(
      (p) => p.x === x && p.y === y && p.team === team
    );
    if (piece) {
      return true;
    } else {
      return false;
    }
  }

  isVaLidMove(
    sourceX: number,
    sourceY: number,
    targetX: number,
    targetY: number,
    pieceType: PieceType,
    pieceColor: TeamType,
    boardState: Piece[]
  ) {
    const deltaX = Math.abs(targetX - sourceX);
    // forward is dependent on color! Should be positive if moving forward, negative if backward
    const deltaForward =
      pieceColor === TeamType.WHITE ? targetY - sourceY : sourceY - targetY;
    if (pieceType === PieceType.PAWN) {
      // First step can be 1 or 2 squares forward. White: source -> target is an increment, black: decrement
      // For pawn, important to know if it is on second rank of its color (pawns can move 2 forward as first move)
      const isOnStartingRank =
        (pieceColor === TeamType.WHITE && sourceY === 1) ||
        (pieceColor === TeamType.BLACK && sourceY === 6)
          ? true
          : false;
      // Check based on forward movement
      if (deltaForward === 2 && deltaX === 0 && isOnStartingRank) {
        if (
          this.tileIsOccupied(targetX, targetY, boardState) ||
          this.tileIsOccupied(
            targetX,
            Math.abs((targetY + sourceY) / 2),
            boardState
          )
        ) {
          // if moving 2 steps forward, check if tile pawn would move to and tile between source and target are free
          return false;
        }
        return true;
      } else if (deltaForward === 1) {
        if (deltaX === 0) {
          if (!this.tileIsOccupied(targetX, targetY, boardState)) {
            return true;
          }
        } else if (deltaX === 1) {
          if (this.tileIsOccupied(targetX, targetY, boardState)) {
            // TODO: check if opposite color!
            const oppositeColor =
              pieceColor === TeamType.WHITE ? TeamType.BLACK : TeamType.WHITE;
            return this.tileIsOccupiedBy(
              targetX,
              targetY,
              boardState,
              oppositeColor
            );
          }
        }
      }
    }
    return false;
  }
}

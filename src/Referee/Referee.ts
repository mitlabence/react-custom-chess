import {
  Piece,
  PieceType,
  PieceColor,
  BoardState,
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
    team: PieceColor
  ): boolean {
    /// Given a color (team), check if (x,y) is occupied by a piece that belongs to that color.
    const piece = boardState.find(
      (p) => p.x === x && p.y === y && p.color === team
    );
    if (piece) {
      return true;
    } else {
      return false;
    }
  }

  moveIsEnPassant(
    sourceX: number,
    sourceY: number,
    targetX: number,
    targetY: number,
    movingPieceType: PieceType,
    movingPieceColor: PieceColor,
    boardState: BoardState
  ): boolean {
    // Given a source and target (x, y) coordinate, check if the
    // piece with pieceType and pieceColor is making a move that is a legal en passant capture.
    if (movingPieceType !== PieceType.PAWN) {
      // only a pawn can en passant capture
      return false;
    }
    // moveHistory should not be empty (en passant depends on previous move)
    if (boardState.moveHistory.length < 1) {
      return false;
    }
    // The number of horizontal moves
    const deltaX = Math.abs(targetX - sourceX);
    // forward is dependent on color! Should be positive if moving forward, negative if backward
    const deltaForward =
      movingPieceColor === PieceColor.WHITE
        ? targetY - sourceY
        : sourceY - targetY;
    if (!(deltaX === 1 && deltaForward === 1)) {
      // Pawn capture move => has to have 1 unit horizontal movement and 1 unit forward
      return false;
    }

    // Up to this point, we made sure that a pawn makes a capture-like movement. Need to check:
    // 1. if there is a pawn P at (targetX, sourceY). This pawn would be captured.
    // 2. if the P has opposite color
    const pieceToCapture = boardState.pieces.find(
      (p) => p.x === targetX && p.y === sourceY && p.color !== movingPieceColor
    );
    if (!pieceToCapture) {
      // No piece to be captured is found
      return false;
    }
    // 3. if the pawn P just made a first move of double squares.
    //  It is enough to show that the previous move (two moves forward by P) ends up at same Y where attacking pawn is originally,
    //  and the x of P is where the attacking pawn ends up
    const previousMove = boardState.moveHistory[boardState.moveHistory.length - 1];
    if (!(previousMove.targetY === sourceY && previousMove.sourceX === targetX)) {
      return false;
    }
    // 4. if we end up on third rank of enemy. Equivalent: if P has just moved 2 along Y axis.
    if(!(Math.abs(previousMove.targetY - previousMove.targetX)===2)){
      return false;
    }
    return true;
  }

  isVaLidMove(
    sourceX: number,
    sourceY: number,
    targetX: number,
    targetY: number,
    pieceType: PieceType,
    pieceColor: PieceColor,
    boardState: BoardState
  ) {
    const pieces = boardState.pieces;
    const deltaX = Math.abs(targetX - sourceX);
    // forward is dependent on color! Should be positive if moving forward, negative if backward
    const deltaForward =
      pieceColor === PieceColor.WHITE ? targetY - sourceY : sourceY - targetY;
    if (pieceType === PieceType.PAWN) {
      // First step can be 1 or 2 squares forward. White: source -> target is an increment, black: decrement
      // For pawn, important to know if it is on second rank of its color (pawns can move 2 forward as first move)
      const isOnStartingRank =
        (pieceColor === PieceColor.WHITE && sourceY === 1) ||
        (pieceColor === PieceColor.BLACK && sourceY === 6)
          ? true
          : false;
      // Check based on forward movement
      if (deltaForward === 2 && deltaX === 0 && isOnStartingRank) {
        if (
          this.tileIsOccupied(targetX, targetY, pieces) ||
          this.tileIsOccupied(
            targetX,
            Math.abs((targetY + sourceY) / 2),
            pieces
          )
        ) {
          // if moving 2 steps forward, check if tile pawn would move to and tile between source and target are free
          return false;
        }
        return true;
      } else if (deltaForward === 1) {
        if (deltaX === 0) {
          if (!this.tileIsOccupied(targetX, targetY, pieces)) {
            return true;
          }
        } else if (deltaX === 1) {
          if (this.tileIsOccupied(targetX, targetY, pieces)) {
            // TODO: check if opposite color!
            const oppositeColor =
              pieceColor === PieceColor.WHITE
                ? PieceColor.BLACK
                : PieceColor.WHITE;
            return this.tileIsOccupiedBy(
              targetX,
              targetY,
              pieces,
              oppositeColor
            );
          }
        }
      }
    }
    return false;
  }
}

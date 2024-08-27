import {
  Piece,
  PieceType,
  PieceColor,
  BoardState,
  Position,
  equalsPosition,
} from "../Constants";

export default class Referee {
  tileIsOccupied(position: Position, boardState: BoardState): boolean {
    const piece = boardState.pieces.find((p) =>
      equalsPosition(p.position, position)
    );
    if (piece) {
      return true;
    } else {
      return false;
    }
  }
  tileIsOccupiedBy(
    position: Position,
    boardState: BoardState,
    color: PieceColor
  ): boolean {
    /// Given a color (team), check if (x,y) is occupied by a piece that belongs to that color.
    const piece = boardState.pieces.find(
      (p) => equalsPosition(p.position, position) && p.color === color
    );
    if (piece) {
      return true;
    } else {
      return false;
    }
  }

  straightPathOccupied(
    sourcePosition: Position,
    targetPosition: Position,
    boardState: BoardState,
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
      const pathPosition: Position = { x: pathX, y: pathY };
      // Check if a piece is on the tile, color does not matter
      const piece = boardState.pieces.find((p) =>
        equalsPosition(p.position, pathPosition)
      );
      if (piece) {
        // found such a piece
        return true;
      }
    }

    return false;
  }

  canMoveStraightTo(
    sourcePosition: Position,
    targetPosition: Position,
    boardState: BoardState,
    ownColor: PieceColor
  ) {
    // Check if the tiles along a straight path between sourcePosition to targetPosition are
    // free from any pieces, and targetPosition is not occupied by a piece with color ownColor.

    // 1. Check if "straight" (diagonal) path from second up to second-to-last tile is occupied by any piece. Move fails if yes.
    if (this.straightPathOccupied(sourcePosition, targetPosition, boardState)) {
      return false;
    }
    // 2. Check if target field is occupied by own color piece; otherwise, valid move.
    if (this.tileIsOccupiedBy(targetPosition, boardState, ownColor)) {
      return false;
    }
    return true;
  }
  moveIsEnPassant(
    sourcePosition: Position,
    targetPosition: Position,
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
    const sourceX: number = sourcePosition.x;
    const sourceY: number = sourcePosition.y;
    const targetX: number = targetPosition.x;
    const targetY: number = targetPosition.y;

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
      (p) =>
        p.position.x === targetX &&
        p.position.y === sourceY &&
        p.color !== movingPieceColor
    );
    if (!pieceToCapture || pieceToCapture.type !== PieceType.PAWN) {
      // No piece to be captured is found or found piece is not a pawn
      return false;
    }
    // 3. if the pawn P just made a first move of double squares.
    //  It is enough to show that the previous move (two moves forward by P) ends up at same Y where attacking pawn is originally,
    //  and the x of P is where the attacking pawn ends up
    const previousMove =
      boardState.moveHistory[boardState.moveHistory.length - 1];
    if (
      !(previousMove.targetY === sourceY && previousMove.sourceX === targetX)
    ) {
      return false;
    }
    // 4. if we end up on third rank of enemy. Equivalent: if P has just moved 2 along Y axis.
    if (!(Math.abs(previousMove.targetY - previousMove.sourceY) === 2)) {
      return false;
    }
    return true;
  }

  isVaLidMove(
    sourcePosition: Position,
    targetPosition: Position,
    pieceType: PieceType,
    pieceColor: PieceColor,
    boardState: BoardState
  ) {
    const sourceX: number = sourcePosition.x;
    const sourceY: number = sourcePosition.y;
    const targetX: number = targetPosition.x;
    const targetY: number = targetPosition.y;
    const deltaXAbs = Math.abs(targetX - sourceX);
    // forward is dependent on color! Should be positive if moving forward, negative if backward
    const deltaForward =
      pieceColor === PieceColor.WHITE ? targetY - sourceY : sourceY - targetY;
    const oppositeColor =
      pieceColor === PieceColor.WHITE ? PieceColor.BLACK : PieceColor.WHITE;
    const isDiagonal: boolean = !(
      deltaForward === 0 || Math.abs(deltaForward) !== deltaXAbs
    );
    const isHorizontalOrVertical: boolean = !(
      (deltaForward !== 0) ===
      (deltaXAbs !== 0)
    ); // negation of: either no move, or move both horizontally and vertically
    if (pieceType === PieceType.PAWN) {
      // First step can be 1 or 2 squares forward. White: source -> target is an increment, black: decrement
      // For pawn, important to know if it is on second rank of its color (pawns can move 2 forward as first move)
      const isOnStartingRank =
        (pieceColor === PieceColor.WHITE && sourceY === 1) ||
        (pieceColor === PieceColor.BLACK && sourceY === 6)
          ? true
          : false;
      // Check based on forward movement
      if (deltaForward === 2 && deltaXAbs === 0 && isOnStartingRank) {
        if (
          //this.tileIsOccupied(targetPosition, boardState) ||
          //this.tileIsOccupied(
          //  { x: targetX, y: Math.abs((targetY + sourceY) / 2) },
          //  boardState
          //)
          this.straightPathOccupied(
            sourcePosition,
            targetPosition,
            boardState,
            true
          )
        ) {
          // if moving 2 steps forward, check if tile pawn would move to and tile between source and target are free
          return false;
        }
        return true;
      } else if (deltaForward === 1) {
        if (deltaXAbs === 0) {
          if (
            !this.straightPathOccupied(
              sourcePosition,
              targetPosition,
              boardState,
              true
            )
          ) {
            return true;
          }
        } else if (deltaXAbs === 1) {
          if (this.tileIsOccupied(targetPosition, boardState)) {
            return this.tileIsOccupiedBy(
              targetPosition,
              boardState,
              oppositeColor
            );
          }
        }
      }
    } else if (pieceType === PieceType.KNIGHT) {
      // Knight moves 2 vertically, 1 horiziontally, or vice versa.
      if (
        (Math.abs(deltaForward) === 2 && deltaXAbs === 1) ||
        (Math.abs(deltaForward) === 1 && deltaXAbs === 2)
      ) {
        if (this.tileIsOccupiedBy(targetPosition, boardState, oppositeColor)) {
          return true;
        } else if (!this.tileIsOccupied(targetPosition, boardState)) {
          return true;
        }
      }
    } else if (pieceType === PieceType.BISHOP) {
      // 1. Check path shape:

      if (pieceType === PieceType.BISHOP && !isDiagonal) {
        // Bishop: should be a diagonal move that changes position, i.e. deltaX > 0 and abs(deltaX) === abs(deltaY)
        return false;
      }
      return this.canMoveStraightTo(
        sourcePosition,
        targetPosition,
        boardState,
        pieceColor
      );
    } else if (pieceType === PieceType.ROOK) {
      if (!isHorizontalOrVertical) {
        // Rook: should be horizontal or vertical move that changes position, i.e. deltaX > 0 XOR deltaY > 0, i.e. these two should be 1 true, 1 false
        return false;
      }
      return this.canMoveStraightTo(
        sourcePosition,
        targetPosition,
        boardState,
        pieceColor
      );
    } else if (pieceType === PieceType.QUEEN) {
      if (!isDiagonal && !isHorizontalOrVertical) {
        // Queen: either diagonal or horizontal or vertical. So if not any of the previous
        return false;
      }
      return this.canMoveStraightTo(
        sourcePosition,
        targetPosition,
        boardState,
        pieceColor
      );
    } else if (pieceType === PieceType.KING) {
      if (Math.abs(deltaForward) <= 1 && deltaXAbs <= 1) {
        return this.canMoveStraightTo(
          sourcePosition,
          targetPosition,
          boardState,
          pieceColor
        );
      }
      return false;
    }
    return false;
  }
}

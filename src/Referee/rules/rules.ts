import { canMoveStraightTo, tileIsOccupied, tileIsOccupiedBy, moveIsEnPassant, straightPathOccupied } from "../../components/Referee/Referee";
import {
  PieceColor,
  BoardState,
  Position,
  Piece,
  kGridSize,
} from "../../Constants";

export const isValidBishopMove = (
  sourcePosition: Position,
  targetPosition: Position,
  pieceColor: PieceColor,
  boardState: BoardState
): boolean => {
  const sourceX: number = sourcePosition.x;
  const sourceY: number = sourcePosition.y;
  const targetX: number = targetPosition.x;
  const targetY: number = targetPosition.y;
  const deltaXAbs = Math.abs(targetX - sourceX);
  // forward is dependent on color! Should be positive if moving forward, negative if backward
  const deltaForward =
    pieceColor === PieceColor.WHITE ? targetY - sourceY : sourceY - targetY;
  const isDiagonal: boolean = !(
    deltaForward === 0 || Math.abs(deltaForward) !== deltaXAbs
  );
  if (!isDiagonal) {
    // Bishop: should be a diagonal move that changes position, i.e. deltaX > 0 and abs(deltaX) === abs(deltaY)
    return false;
  }

  return canMoveStraightTo(
    sourcePosition,
    targetPosition,
    boardState,
    pieceColor
  );
};

export const getValidBishopMoves = (
  bishop: Piece,
  boardState: BoardState
): Position[] => {
  const validMoves: Position[] = [];

  const sourceX: number = bishop.position.x;
  const sourceY: number = bishop.position.y;
  const pieceColor: PieceColor = bishop.color;
  const oppositeColor =
    pieceColor === PieceColor.WHITE ? PieceColor.BLACK : PieceColor.WHITE;

  // From starting position, go in all 4 possible directions, stop when board edge is reached or friendly piece is in the way
  // or after finding an enemy piece
  const steps = [-1, 1];
  for (var xStep of steps) {
    for (var yStep of steps) {
      let targetX = sourceX + xStep;
      let targetY = sourceY + yStep;
      while (
        targetX >= 0 &&
        targetX < kGridSize &&
        targetY >= 0 &&
        targetY < kGridSize &&
        !tileIsOccupiedBy({ x: targetX, y: targetY }, boardState, pieceColor)
      ) {
        validMoves.push({ x: targetX, y: targetY });
        if (
          tileIsOccupiedBy(
            { x: targetX, y: targetY },
            boardState,
            oppositeColor
          )
        ) {
          break;
        }
        targetX += xStep;
        targetY += yStep;
      }
    }
  }

  return validMoves;
};



export const isValidKingMove = (
    sourcePosition: Position,
    targetPosition: Position,
    pieceColor: PieceColor,
    boardState: BoardState
  ): boolean => {
    const sourceX: number = sourcePosition.x;
    const sourceY: number = sourcePosition.y;
    const targetX: number = targetPosition.x;
    const targetY: number = targetPosition.y;
    const deltaXAbs = Math.abs(targetX - sourceX);
    // forward is dependent on color! Should be positive if moving forward, negative if backward
    const deltaForward =
      pieceColor === PieceColor.WHITE ? targetY - sourceY : sourceY - targetY;
    if (Math.abs(deltaForward) <= 1 && deltaXAbs <= 1) {
      return canMoveStraightTo(
        sourcePosition,
        targetPosition,
        boardState,
        pieceColor
      );
    }
    return false;
  };
  
  export const getValidKingMoves = (
    bishop: Piece,
    boardState: BoardState
  ): Position[] => {
    const validMoves: Position[] = [];
  
    const sourceX: number = bishop.position.x;
    const sourceY: number = bishop.position.y;
    const pieceColor: PieceColor = bishop.color;
  
    // From starting position, go in all 4 possible directions, stop when board edge is reached or friendly piece is in the way
    // or after finding an enemy piece
    const steps = [-1, 0, 1];
    for (var xStep of steps) {
      for (var yStep of steps) {
        if (xStep === 0 && yStep === 0) { // avoid xStep === 0 && yStep === 0 at the same time, i.e. no movement
          continue;
        }
        let targetX = sourceX + xStep;
        let targetY = sourceY + yStep;
        if (
          targetX >= 0 &&
          targetX < kGridSize &&
          targetY >= 0 &&
          targetY < kGridSize &&
          !tileIsOccupiedBy({ x: targetX, y: targetY }, boardState, pieceColor)
        ) {
          validMoves.push({ x: targetX, y: targetY });
        }
      }
    }
    return validMoves;
  };

  
  export const isValidKnightMove = (
    sourcePosition: Position,
    targetPosition: Position,
    pieceColor: PieceColor,
    boardState: BoardState
  ): boolean => {
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
    // Knight moves 2 vertically, 1 horiziontally, or vice versa.
    if (
      (Math.abs(deltaForward) === 2 && deltaXAbs === 1) ||
      (Math.abs(deltaForward) === 1 && deltaXAbs === 2)
    ) {
      if (tileIsOccupiedBy(targetPosition, boardState, oppositeColor)) {
        return true;
      } else if (!tileIsOccupied(targetPosition, boardState)) {
        return true;
      }
    }
    return false;
  };
  
  export const getValidKnightMoves = (
    bishop: Piece,
    boardState: BoardState
  ): Position[] => {
    const validMoves: Position[] = [];
  
    const sourceX: number = bishop.position.x;
    const sourceY: number = bishop.position.y;
    const pieceColor: PieceColor = bishop.color;
  
    // 1. Go left/right 2 and up/down 1
    const shortSteps = [-1, 1];
    const longSteps = [-2, 2];
    for (let xStep of longSteps) {
      const targetX = sourceX + xStep;
      if (!(targetX >= 0 && targetX < kGridSize)) {  // Check if targetX is within bounds
        continue;
      }
      for (let yStep of shortSteps) {
        const targetY = sourceY + yStep;
        if (targetY >= 0 && targetY < kGridSize) {
          const targetPosition: Position = { x: targetX, y: targetY };
          if (
            isValidKnightMove(
              bishop.position,
              targetPosition,
              pieceColor,
              boardState
            )
          ) {
            validMoves.push(targetPosition);
          }
        }
      }
    }
    // 2. Go left/right 1 and up/down 2
    for (let xStep of shortSteps) {
      const targetX = sourceX + xStep;
      if (!(targetX >= 0 && targetX < kGridSize)) {  // Check if targetX is within bounds
        continue;
      }
      for (let yStep of longSteps) {
        const targetY = sourceY + yStep;
        if (targetY >= 0 && targetY < kGridSize) {
          const targetPosition: Position = { x: targetX, y: targetY };
          if (
            isValidKnightMove(
              bishop.position,
              targetPosition,
              pieceColor,
              boardState
            )
          ) {
            validMoves.push(targetPosition);
          }
        }
      }
    }
    return validMoves;
  };
  

  export const isValidPawnMove = (
    sourcePosition: Position,
    targetPosition: Position,
    pieceColor: PieceColor,
    boardState: BoardState
  ): boolean => {
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
        straightPathOccupied(sourcePosition, targetPosition, boardState, true)
      ) {
        // if moving 2 steps forward, check if tile pawn would move to and tile between source and target are free
        return false;
      }
      return true;
    } else if (deltaForward === 1) {
      if (deltaXAbs === 0) {
        if (
          !straightPathOccupied(sourcePosition, targetPosition, boardState, true)
        ) {
          return true;
        }
      } else if (deltaXAbs === 1) {
        if (tileIsOccupied(targetPosition, boardState)) {
          return tileIsOccupiedBy(targetPosition, boardState, oppositeColor);
        }
      }
    }
    // TODO: move en passant here?
    return false;
  };
  
  export const getValidPawnMoves = (
    pawn: Piece,
    boardState: BoardState
  ): Position[] => {
    const validMoves: Position[] = [];
    // Valid moves:
    // 1. 1 square forward if empty
    // 2. 2 squares forward if two squares in front empty, and on starting rank
    // 3. 1 square diagonally forward if occupied by opposite color
    // 4. En passant capture: 1 square diagonally forward if previous move was 2 squares forward by opposite color pawn
  
    const sourceX: number = pawn.position.x;
    const sourceY: number = pawn.position.y;
    const pieceColor: PieceColor = pawn.color;
    const oppositeColor =
      pieceColor === PieceColor.WHITE ? PieceColor.BLACK : PieceColor.WHITE;
    // First step can be 1 or 2 squares forward. White: source -> target is an increment, black: decrement
    // For pawn, important to know if it is on second rank of its color (pawns can move 2 forward as first move)
    const isOnStartingRank =
      (pieceColor === PieceColor.WHITE && sourceY === 1) ||
      (pieceColor === PieceColor.BLACK && sourceY === 6)
        ? true
        : false;
    const forwardDirection = pieceColor === PieceColor.WHITE ? 1 : -1;
  
    const singleForwardMove = { x: sourceX, y: sourceY + forwardDirection };
    const doubleForwardMove = { x: sourceX, y: sourceY + 2 * forwardDirection };
    const leftAttackMove = { x: sourceX - 1, y: sourceY + forwardDirection };
    const rightAttackMove = { x: sourceX + 1, y: sourceY + forwardDirection };
  
    // 1. Check if single step forward is possible
    if (!tileIsOccupied(singleForwardMove, boardState)) {
      validMoves.push(singleForwardMove);
      // 2. Check if double step forward is possible. Only possible if the single step forward is possible (and pawn is on starting rank)
      if (isOnStartingRank && !tileIsOccupied(doubleForwardMove, boardState)) {
        validMoves.push(doubleForwardMove);
      }
    }
    // 3. Check if left/right diagonal attack is possible
    if (tileIsOccupiedBy(leftAttackMove, boardState, oppositeColor)) {
      validMoves.push(leftAttackMove);
    }
    if (tileIsOccupiedBy(rightAttackMove, boardState, oppositeColor)) {
      validMoves.push(rightAttackMove);
    }
    // 4. En passant capture
    if (moveIsEnPassant(pawn.position, leftAttackMove, pawn.type, pieceColor, boardState)) {
      validMoves.push(leftAttackMove);
    }
    if (moveIsEnPassant(pawn.position, rightAttackMove, pawn.type, pieceColor, boardState)) {
      validMoves.push(rightAttackMove);
    }
    return validMoves;
  };
  

  export const isValidQueenMove = (
    sourcePosition: Position,
    targetPosition: Position,
    pieceColor: PieceColor,
    boardState: BoardState
  ): boolean => {
    const sourceX: number = sourcePosition.x;
    const sourceY: number = sourcePosition.y;
    const targetX: number = targetPosition.x;
    const targetY: number = targetPosition.y;
    const deltaXAbs = Math.abs(targetX - sourceX);
    // forward is dependent on color! Should be positive if moving forward, negative if backward
    const deltaForward =
      pieceColor === PieceColor.WHITE ? targetY - sourceY : sourceY - targetY;
    const isDiagonal: boolean = !(
      deltaForward === 0 || Math.abs(deltaForward) !== deltaXAbs
    );
    const isHorizontalOrVertical: boolean = !(
      (deltaForward !== 0) ===
      (deltaXAbs !== 0)
    ); // negation of: either no move, or move both horizontally and vertically
    if (!isDiagonal && !isHorizontalOrVertical) {
      // Queen: either diagonal or horizontal or vertical. So if not any of the previous
      return false;
    }
    return canMoveStraightTo(
      sourcePosition,
      targetPosition,
      boardState,
      pieceColor
    );
  };
  
  export const getValidQueenMoves = (
    queen: Piece,
    boardState: BoardState
  ): Position[] => {
    const validMoves: Position[] = [];
    const sourceX: number = queen.position.x;
    const sourceY: number = queen.position.y;
    const pieceColor: PieceColor = queen.color;
    const oppositeColor =
      pieceColor === PieceColor.WHITE ? PieceColor.BLACK : PieceColor.WHITE;
  
    // From starting position, go in all 4 possible directions, stop when board edge is reached or friendly piece is in the way
    // or after finding an enemy piece
    // only avoid xStep === 0 && yStep === 0 at the same time
    const steps = [-1, 0, 1];
    for (var xStep of steps) {
      for (var yStep of steps) {
        if (xStep === 0 && yStep === 0) {
          continue;
        }
        let targetX = sourceX + xStep;
        let targetY = sourceY + yStep;
        while (
          targetX >= 0 &&
          targetX < kGridSize &&
          targetY >= 0 &&
          targetY < kGridSize &&
          !tileIsOccupiedBy({ x: targetX, y: targetY }, boardState, pieceColor)
        ) {
          validMoves.push({ x: targetX, y: targetY });
          if (
            tileIsOccupiedBy(
              { x: targetX, y: targetY },
              boardState,
              oppositeColor
            )
          ) {
            break;
          }
          targetX += xStep;
          targetY += yStep;
        }
      }
    }
  
    return validMoves;
  };
  

  export const isValidRookMove = (
    sourcePosition: Position,
    targetPosition: Position,
    pieceColor: PieceColor,
    boardState: BoardState
  ): boolean => {
    const sourceX: number = sourcePosition.x;
    const sourceY: number = sourcePosition.y;
    const targetX: number = targetPosition.x;
    const targetY: number = targetPosition.y;
    const deltaXAbs = Math.abs(targetX - sourceX);
    // forward is dependent on color! Should be positive if moving forward, negative if backward
    const deltaForward =
      pieceColor === PieceColor.WHITE ? targetY - sourceY : sourceY - targetY;
    const isHorizontalOrVertical: boolean = !(
      (deltaForward !== 0) ===
      (deltaXAbs !== 0)
    ); // negation of: either no move, or move both horizontally and vertically
    if (!isHorizontalOrVertical) {
      // Rook: should be horizontal or vertical move that changes position, i.e. deltaX > 0 XOR deltaY > 0, i.e. these two should be 1 true, 1 false
      return false;
    }
    return canMoveStraightTo(
      sourcePosition,
      targetPosition,
      boardState,
      pieceColor
    );
  };
  
  export const getValidRookMoves = (
    rook: Piece,
    boardState: BoardState
  ): Position[] => {
    const validMoves: Position[] = [];
    const sourceX: number = rook.position.x;
    const sourceY: number = rook.position.y;
    const pieceColor: PieceColor = rook.color;
    const oppositeColor =
      pieceColor === PieceColor.WHITE ? PieceColor.BLACK : PieceColor.WHITE;
  
    // From starting position, go in all 4 possible directions, stop when board edge is reached or friendly piece is in the way
    // or after finding an enemy piece
    const steps = [-1, 1];
    // 1. horizontal moves
    for (var xStep of steps) {
      let targetX = sourceX + xStep;
      let targetY = sourceY;
      while (
        targetX >= 0 &&
        targetX < kGridSize &&
        !tileIsOccupiedBy({ x: targetX, y: targetY }, boardState, pieceColor)
      ) {
        validMoves.push({ x: targetX, y: targetY });
        if (
          tileIsOccupiedBy({ x: targetX, y: targetY }, boardState, oppositeColor)
        ) {
          break;
        }
        targetX += xStep;
      }
    }
    // 2. vertical moves
    for (var yStep of steps) {
      let targetX = sourceX;
      let targetY = sourceY + yStep;
      while (
        targetY >= 0 &&
        targetY < kGridSize &&
        !tileIsOccupiedBy({ x: targetX, y: targetY }, boardState, pieceColor)
      ) {
        validMoves.push({ x: targetX, y: targetY });
        if (
          tileIsOccupiedBy({ x: targetX, y: targetY }, boardState, oppositeColor)
        ) {
          break;
        }
        targetY += yStep;
      }
    }
  
    return validMoves;
  };
  
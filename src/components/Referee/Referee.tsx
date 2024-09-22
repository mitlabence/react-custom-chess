import { useEffect, useRef, useState } from "react";
import {
  BoardState,
  kInitialPieces,
  Position,
  kInitialMoveHistory,
  PieceType,
  PieceColor,
  ChessMove,
  equalsPosition,
  kGridSize,
  kPieceTypeMap,
} from "../../Constants";
import { Piece } from "../../models/pieces/Piece";
import Chessboard from "../Chessboard/Chessboard";

export default function Referee() {
  const [boardState, setBoardState] = useState<BoardState>(
    new BoardState(kInitialPieces, kInitialMoveHistory)
  );
  const [promotionPawn, setPromotionPawn] = useState<Piece>();

  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setBoardState((currBoardState) => getPossibleMoves(currBoardState));
  }, []);

  function promotePawn(pieceType: PieceType) {
    if (promotionPawn === undefined) return;
    const updatedPieces = boardState.pieces.reduce((results, piece) => {
      if (equalsPosition(piece.position, promotionPawn.position)) {
        // Found promoted piece
        const transformedPiece = new kPieceTypeMap[pieceType](promotionPawn.position, promotionPawn.color);
        results.push(transformedPiece);
      }
      else {
        results.push(piece);
      }
      return results;
    }, [] as Piece[]);
    // Update pieces and move history
    // TODO: add promotion somehow to move history?
    //setBoardState(newBoardState);
    setBoardState(
      (currBoardState) =>
        new BoardState(updatedPieces, currBoardState.moveHistory)
    );
    // Update possible moves for new board state
    setBoardState((currBoardState) => getPossibleMoves(currBoardState));
    modalRef.current?.classList.add("hidden");
  }

  function getPossibleMoves(currentBoardState: BoardState) {
    // add possible moves to boardState pieces
    const updatedPieces = currentBoardState.pieces.map((piece) => {
      piece.possibleMoves = getValidMoves(piece, currentBoardState);
      return piece;
    });
    //setBoardState(newBoardState);
    //setBoardState(
    //  (currBoardState) =>
    //    new BoardState(updatedPieces, currBoardState.moveHistory)
    //);
    const updatedBoardState = new BoardState(
      updatedPieces,
      currentBoardState.moveHistory
    );
    return updatedBoardState;
  }
  function playMove(playedPiece: Piece, targetPosition: Position): boolean {
    const validMove = isVaLidMove(playedPiece, targetPosition);

    const isEnPassantMove: boolean = moveIsEnPassant(
      playedPiece.position,
      targetPosition,
      playedPiece.type,
      playedPiece.color,
      boardState
    );
    if (validMove || isEnPassantMove) {
      // Add move to move history
      const newMove: ChessMove = new ChessMove(
        playedPiece.type,
        playedPiece.color,
        playedPiece.position.x,
        playedPiece.position.y,
        targetPosition.x,
        targetPosition.y
      );
      // Check if pawn is promoting by reaching last row for team
      let promotionRow = playedPiece.color === PieceColor.WHITE ? 7 : 0;

      // Update pieces on the board
      // One piece is moved (as it is a valid move); up to one piece might be captured
      // Initially, set the coordinates of a potentially captured piece
      let captureX = targetPosition.x;
      let captureY = targetPosition.y;
      if (isEnPassantMove) {
        // Define what is one tile "in front" of moving piece
        const forwardDirection =
          playedPiece.color === PieceColor.WHITE ? +1 : -1;
        // For en passant, the captured piece is actually not at the coordinates where the moved piece ends up,
        // but one behind
        captureY = captureY - forwardDirection;
      } else if (
        playedPiece.type === PieceType.PAWN &&
        targetPosition.y === promotionRow
      ) {
        modalRef.current?.classList.remove("hidden");
        setPromotionPawn(playedPiece); // FIXME: change promotion pawn back to undefined once promotion is done
      }
      const newPieces = boardState.pieces.reduce((results, piece) => {
        if (
          equalsPosition(playedPiece.position, piece.position) &&
          piece.color === playedPiece.color
        ) {
          // if no deep copy of pieces were made, we would need piece.team === currentPiece.team as well
          piece.position.x = targetPosition.x;
          piece.position.y = targetPosition.y;
          results.push(piece);
        } else if (
          !equalsPosition(piece.position, { x: captureX, y: captureY })
        ) {
          // move all pieces but the one attacked (which could be non-existent, so cannot check it explicitly)
          results.push(piece);
        }
        return results;
      }, [] as Piece[]);
      // Update possible moves for new board state

      // Update pieces and move history
      setBoardState(
        (currBoardState) =>
          new BoardState(newPieces, [...currBoardState.moveHistory, newMove])
      );

      setBoardState((currBoardState) => getPossibleMoves(currBoardState));
      console.log(targetPosition);
    } else {
      return false;
    }
    return true;
  }

  function isVaLidMove(movingPiece: Piece, targetPosition: Position): boolean {
    if (
      targetPosition.x < 0 ||
      targetPosition.x >= kGridSize ||
      targetPosition.y < 0 ||
      targetPosition.y >= kGridSize
    ) {
      // avoid pieces leaving the board
      return false;
    }
    return movingPiece.isValidMove(targetPosition, boardState);
  }

  function getValidMoves(piece: Piece, boardState: BoardState): Position[] {
    return piece.getValidMoves(boardState);
  }

  return (
    <>
      <div id="pawn-promotion-modal" className="hidden" ref={modalRef}>
        <div className="modal-body">
          <img
            alt="Q"
            onClick={() => promotePawn(PieceType.QUEEN)}
            src={`assets/images/${promotionPawn?.color}_queen.png`}
          />
          <img
            alt="R"
            onClick={() => promotePawn(PieceType.ROOK)}
            src={`assets/images/${promotionPawn?.color}_rook.png`}
          />
          <img
            alt="B"
            onClick={() => promotePawn(PieceType.BISHOP)}
            src={`assets/images/${promotionPawn?.color}_bishop.png`}
          />
          <img
            alt="N"
            onClick={() => promotePawn(PieceType.KNIGHT)}
            src={`assets/images/${promotionPawn?.color}_knight.png`}
          />
        </div>
      </div>
      <Chessboard playMove={playMove} boardState={boardState} />
    </>
  );
}

export function canMoveStraightTo(
  sourcePosition: Position,
  targetPosition: Position,
  boardState: BoardState,
  ownColor: PieceColor
): boolean {
  // Check if the tiles along a straight (horizontal/vertical/diagonal) path between sourcePosition to targetPosition are
  // free from any pieces, and targetPosition is not occupied by a piece with color ownColor.

  // 1. Check if "straight" (diagonal) path from second up to second-to-last tile is occupied by any piece. Move fails if yes.
  if (straightPathOccupied(sourcePosition, targetPosition, boardState)) {
    return false;
  }
  // 2. Check if target field is occupied by own color piece; otherwise, valid move.
  if (tileIsOccupiedBy(targetPosition, boardState, ownColor)) {
    return false;
  }
  return true;
}

export function straightPathOccupied(
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

export function tileIsOccupied(
  position: Position,
  boardState: BoardState
): boolean {
  const piece = boardState.pieces.find((p) =>
    equalsPosition(p.position, position)
  );
  if (piece) {
    return true;
  } else {
    return false;
  }
}
export function tileIsOccupiedBy(
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

export function moveIsEnPassant(
  sourcePosition: Position,
  targetPosition: Position,
  movingPieceType: PieceType,
  movingPieceColor: PieceColor,
  boardState: BoardState
) {
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
  if (!(previousMove.targetY === sourceY && previousMove.sourceX === targetX)) {
    return false;
  }
  // 4. if we end up on third rank of enemy. Equivalent: if P has just moved 2 along Y axis.
  if (!(Math.abs(previousMove.targetY - previousMove.sourceY) === 2)) {
    return false;
  }
  return true;
}

import { useEffect, useRef, useState } from "react";
import {
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
import { BoardState } from "../../models/BoardState";

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
        const transformedPiece = new kPieceTypeMap[pieceType](
          promotionPawn.position,
          promotionPawn.color
        );
        results.push(transformedPiece);
      } else {
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
    currentBoardState.updatePossibleMoves();
    const updatedBoardState = new BoardState(
      currentBoardState.pieces,
      currentBoardState.moveHistory
    );
    return updatedBoardState;
  }
  function playMove(playedPiece: Piece, targetPosition: Position): boolean {
    const validMove = isVaLidMove(playedPiece, targetPosition);

    const isEnPassantMove: boolean = boardState.moveIsEnPassant(
      playedPiece.position,
      targetPosition
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
    // This function has to stay in referee, as it will be used to check if correct player is playing, etc.
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
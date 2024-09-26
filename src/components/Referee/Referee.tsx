import { useRef, useState } from "react";
import {
  kInitialPieces,
  Position,
  kInitialMoveHistory,
  PieceType,
  PieceColor,
  ChessMove,
  kGridSize,
  kPieceTypeMap,
} from "../../Constants";

import { ChessPiece } from "../../models/pieces/ChessPiece";
import Chessboard from "../Chessboard/Chessboard";
import { BoardState } from "../../models/BoardState";
import { Pawn } from "../../models/pieces/Pawn";
import { NullPiece } from "../../models/pieces/NullPiece";

export default function Referee() {
  const [boardState, setBoardState] = useState<BoardState>(
    new BoardState(kInitialPieces, kInitialMoveHistory)
  );
  const [promotionPawn, setPromotionPawn] = useState<ChessPiece>();

  const modalRef = useRef<HTMLDivElement>(null);

  function promotePawn(pieceType: PieceType): void {
    if (promotionPawn === undefined || boardState.moveHistory.length < 1)
      return;
    const lastMove = boardState.moveHistory[boardState.moveHistory.length - 1];
    const updatedPieces = boardState.piecesGrid.map((row, rowIndex) => {
      if (rowIndex === lastMove.targetY) {
        // Found promoted piece
        const transformedPiece = new kPieceTypeMap[pieceType](
          promotionPawn.color!
        );
        return row.map((p, colIndex) =>
          colIndex === lastMove.targetX ? transformedPiece : p
        );
      } else {
        return row;
      }
    });
    // Update pieces and move history
    // TODO: add promotion somehow to move history?
    //setBoardState(newBoardState);
    setBoardState(
      (currBoardState) =>
        new BoardState(updatedPieces, currBoardState.moveHistory)
    );
    // Update possible moves for new board state
    modalRef.current?.classList.add("hidden");
  }

  function playMove(
    playedPiece: ChessPiece,
    sourcePosition: Position,
    targetPosition: Position
  ): boolean {
    if (playedPiece instanceof NullPiece) {
      // if piece type is not defined (NullPiece), return false
      return false;
    }
    const validMove = isValidMove(playedPiece, sourcePosition, targetPosition);

    const isEnPassantMove: boolean =
      playedPiece instanceof Pawn
        ? playedPiece.moveIsEnPassant(
            sourcePosition,
            targetPosition,
            boardState
          )
        : false;
    if (validMove || isEnPassantMove) {
      // Add move to move history
      const newMove: ChessMove = new ChessMove(
        playedPiece.type!,
        playedPiece.color!,
        sourcePosition.x,
        sourcePosition.y,
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
        console.log(captureY);
      } else if (
        playedPiece.type === PieceType.PAWN &&
        targetPosition.y === promotionRow
      ) {
        modalRef.current?.classList.remove("hidden");
        setPromotionPawn(playedPiece); // FIXME: change promotion pawn back to undefined once promotion is done
      }
      const color = playedPiece.color;
      const pieceType = playedPiece.type;
      // 1. change piece at source position to NullPiece, as piece moved
      // 2. change piece at target position to piece that was moved
      // 3. if targetPosition != capturePosition (en passant): change piece at capture position to NullPiece, if a piece was captured
      const newPieces = boardState.piecesGrid.map((row, rowIndex) => {
        return row.map((piece, colIndex) => {
          if (rowIndex === sourcePosition.y && colIndex === sourcePosition.x) { // 1.
            return new NullPiece();
          } else if (rowIndex === targetPosition.y && colIndex === targetPosition.x) {
            return playedPiece;
          } else if (rowIndex === captureY && colIndex === captureX) {
            return new NullPiece();
          } else {
            return piece;
          }
        });
      });
      
      // Update pieces and move history
      setBoardState(
        (currBoardState) =>
          new BoardState(newPieces, [...currBoardState.moveHistory, newMove])
      );
    } else {
      return false;
    }
    return true;
  }

  function isValidMove(movingPiece: ChessPiece, sourcePosition: Position, targetPosition: Position): boolean {
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
    return movingPiece.isValidMove(sourcePosition, targetPosition, boardState);
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

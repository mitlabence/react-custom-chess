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
  kKingX,
} from "../../Constants";

import { ChessPiece } from "../../models/pieces/ChessPiece";
import Chessboard from "../Chessboard/Chessboard";
import { BoardState } from "../../models/BoardState";
import { Pawn } from "../../models/pieces/Pawn";
import { NullPiece } from "../../models/pieces/NullPiece";
import { King } from "../../models/pieces/King";

export default function Referee() {
  // TODO: update hasMoved for each piece, even pawns! Also promotion should result in a piece that has moved
  const [boardState, setBoardState] = useState<BoardState>(
    new BoardState(kInitialPieces, kInitialMoveHistory)
  );
  const [promotionPawn, setPromotionPawn] = useState<ChessPiece>();
  const [isWhitesTurn, setIsWhitesTurn] = useState<boolean>(true);
  const [winningTeam, setWinningTeam] = useState<PieceColor | undefined>(
    undefined
  );
  const modalRef = useRef<HTMLDivElement>(null);
  const checkMateModalRef = useRef<HTMLDivElement>(null);

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
  function postMove(): void {
    /// After the move is made, check if enemy king is put in check or checkmate
    // Check if enemy king is in check
    if (boardState.moveHistory.length < 1) return;
    const moveColor =
      boardState.moveHistory[boardState.moveHistory.length - 1].pieceColor;
    const oppositeColor =
      moveColor === PieceColor.WHITE ? PieceColor.BLACK : PieceColor.WHITE;
    const opposingKingPosition = boardState.getKingPosition(oppositeColor);
    if (opposingKingPosition === undefined) {
      return; // Should not happen: every player should have a king. But if not, no need to check for check/mate
    }
    // Set turn to the other player
    setIsWhitesTurn(!isWhitesTurn);
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
    const oppositeColor =
      playedPiece.color === PieceColor.WHITE
        ? PieceColor.BLACK
        : PieceColor.WHITE;
    if ((playedPiece.color === PieceColor.BLACK) === isWhitesTurn) {
      // if it is not white's turn, return false
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
    const isCastlingMove: boolean =
      playedPiece instanceof King
        ? playedPiece.moveIsCastling(sourcePosition, targetPosition, boardState)
        : false;
    // Check if pawn is promoting by reaching last row for team
    let promotionRow = playedPiece.color === PieceColor.WHITE ? 7 : 0;
    const isPromotionMove: boolean =
      playedPiece.type === PieceType.PAWN && targetPosition.y === promotionRow;
    if (validMove || isEnPassantMove) {
      // FIXME: enpassantmove should also be a valid move... i.e. if (validMove) {... if (isEnPassantMove) {...}}
      // Add move to move history
      const newMove: ChessMove = new ChessMove(
        playedPiece.type!,
        playedPiece.color!,
        sourcePosition.x,
        sourcePosition.y,
        targetPosition.x,
        targetPosition.y
      );

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
      } else if (isPromotionMove) {
        modalRef.current?.classList.remove("hidden");
        setPromotionPawn(playedPiece); // FIXME: change promotion pawn back to undefined once promotion is done
      } else if (isCastlingMove) {
        // Castling move: move corner piece to the other side of the king
        // sourceX and sourceY of corner piece
        var cornerPieceSourceX = targetPosition.x > kKingX ? kGridSize - 1 : 0;
        var cornerPieceSourceY = targetPosition.y;
        var cornerPieceType: PieceType =
          boardState.piecesGrid[cornerPieceSourceY][cornerPieceSourceX].type!; // already checked for type in moveIsCastling
        // targetX of corner piece (targetY is cornerPieceY)
        var cornerPieceTargetX =
          targetPosition.x > kKingX
            ? targetPosition.x - 1
            : targetPosition.x + 1;
        var cornerPieceTargetY = cornerPieceSourceY;
      }
      // 1. change piece at source position to NullPiece, as piece moved
      // 2. change piece at target position to piece that was moved
      // 3. if targetPosition != capturePosition (en passant): change piece at capture position to NullPiece, if a piece was captured
      // 4. if castling move: move corner piece to the other side of the king
      const newPieces = boardState.piecesGrid.map((row, rowIndex) => {
        return row.map((piece, colIndex) => {
          if (rowIndex === sourcePosition.y && colIndex === sourcePosition.x) {
            // 1.
            return new NullPiece();
          } else if (
            rowIndex === targetPosition.y &&
            colIndex === targetPosition.x
          ) {
            return new kPieceTypeMap[playedPiece.type!](
              playedPiece.color!,
              true
            ); // create same piece type as playedPiece but with hasMoved=true
          } else if (rowIndex === captureY && colIndex === captureX) {
            return new NullPiece();
          } else if (
            isCastlingMove &&
            colIndex === cornerPieceSourceX &&
            rowIndex === cornerPieceSourceY
          ) {
            return new NullPiece();
          } else if (
            isCastlingMove &&
            colIndex === cornerPieceTargetX &&
            rowIndex === cornerPieceTargetY
          ) {
            return new kPieceTypeMap[cornerPieceType](playedPiece.color!, true); // corner piece "has moved" (hasMoved=true)
          } else {
            return piece;
          }
        });
      });
      const updatedBoardState = new BoardState(newPieces, [
        ...boardState.moveHistory,
        newMove,
      ]);
      // Update pieces and move history for next render
      setBoardState(updatedBoardState);

      // Set turn to the other player
      setIsWhitesTurn(!isWhitesTurn);

      // Handle checkmate: check if opposite king is in checkmate
      if (
        isCheckMate(
          updatedBoardState.getKingPosition(oppositeColor)!,
          updatedBoardState
        )
      ) {
        setWinningTeam(playedPiece.color);
        checkMateModalRef.current?.classList.remove("hidden");
      }
      return true;
    } else {
      // invalid move/enpassant move
      return false;
    }
  }

  function isCheckMate(
    kingPosition: Position,
    boardStateAfterMove: BoardState
  ) {
    /// Check if last move in boardState.moveHistory resulted in checkmate
    if (boardStateAfterMove.moveHistory.length < 1) return false;
    const kingColor: PieceColor =
      boardStateAfterMove.piecesGrid[kingPosition.y][kingPosition.x].color!;
    const attackerColor: PieceColor =
      kingColor === PieceColor.WHITE ? PieceColor.BLACK : PieceColor.WHITE;
    const isKingChecked = boardStateAfterMove.tileIsAttacked(
      kingPosition,
      attackerColor
    );
    if (!isKingChecked) {
      return false;
    } else {
      // For all pieces on checked piece's team, check if there is a valid move
      const validMoveExists: boolean = boardStateAfterMove.piecesGrid.reduce(
        (thereIsValidMoveInRow, row, rowIndex) => {
          return (
            thereIsValidMoveInRow ||
            row.reduce((thereIsValidMove, piece, colIndex) => {
              if (piece.color === kingColor) {
                return (
                  thereIsValidMove ||
                  filterValidMoves(
                    { x: colIndex, y: rowIndex },
                    piece.getValidMoves(
                      { x: colIndex, y: rowIndex },
                      boardStateAfterMove
                    ),
                    boardStateAfterMove
                  ).length > 0
                );
              } else {
                return thereIsValidMove || false; // no valid moves from nullpiece or piece of other color
              }
            }, false)
          );
        },
        false
      );
      return !validMoveExists; // check mate if no valid move exists
    }
  }
  function filterValidMoves(
    sourcePosition: Position,
    validMoves: Position[],
    boardState: BoardState
  ): Position[] {
    validMoves.forEach((move) => {
      const piece = boardState.piecesGrid[sourcePosition.y][sourcePosition.x];
      console.log(piece, move);
    });
    const movingPieceColor =
      boardState.piecesGrid[sourcePosition.y][sourcePosition.x].color!;
    return validMoves.filter((move) => {
      const simulatedBoardState: BoardState = boardState.cloneWithRelocation(
        sourcePosition,
        move
      );
      if (
        simulatedBoardState.tileIsAttacked(
          simulatedBoardState.getKingPosition(movingPieceColor!)!,
          movingPieceColor === PieceColor.WHITE
            ? PieceColor.BLACK
            : PieceColor.WHITE
        )
      ) {
        return false;
      } else {
        return true;
      }
    });
  }

  function getValidMoves(
    movingPiece: ChessPiece,
    sourcePosition: Position
  ): Position[] {
    if (isWhitesTurn !== (movingPiece.color === PieceColor.WHITE)) {
      return [];
    }
    // 1. Get valid moves according to the piece logic
    const validMoves = movingPiece.getValidMoves(sourcePosition, boardState);
    // 2. Filter out moves where afterwards the own king is in check
    return filterValidMoves(sourcePosition, validMoves, boardState);
  }
  function isValidMove(
    movingPiece: ChessPiece,
    sourcePosition: Position,
    targetPosition: Position
  ): boolean {
    // The move is valid if
    // 0. not a NullPiece or moving to a position outside the board
    // 1. it is a valid piece move according to piece rules
    // 2. if own king is not in check after the move
    // 0.
    if (
      targetPosition.x < 0 ||
      targetPosition.x >= kGridSize ||
      targetPosition.y < 0 ||
      targetPosition.y >= kGridSize ||
      movingPiece instanceof NullPiece
    ) {
      // avoid pieces leaving the board
      return false;
    }
    // 1.
    if (!movingPiece.isValidMove(sourcePosition, targetPosition, boardState)) {
      return false;
    }
    // 2.
    const simulatedBoardState = boardState.cloneWithRelocation(
      sourcePosition,
      targetPosition
    );
    const ownKingPosition = simulatedBoardState.getKingPosition(
      movingPiece.color!
    ); // cannot be null piece => has to have color
    if (ownKingPosition === undefined) {
      return false; // This should not happen: every player should have a king
    }
    if (
      simulatedBoardState.tileIsAttacked(
        ownKingPosition,
        movingPiece.color === PieceColor.WHITE
          ? PieceColor.BLACK
          : PieceColor.WHITE
      )
    ) {
      return false;
    }
    return true;
  }
  function restartGame() {
    checkMateModalRef.current?.classList.add("hidden");
    setBoardState(new BoardState(kInitialPieces, kInitialMoveHistory));
    setIsWhitesTurn(true);
    setPromotionPawn(undefined);
  }
  return (
    <>
      <div className="modal hidden" ref={modalRef}>
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
      <div className="modal hidden" ref={checkMateModalRef}>
        <div className="modal-body">
          <div className="checkmate-body">
            <span>The winning team is {winningTeam}!</span>
            <button onClick={restartGame}>Play again</button>
          </div>
        </div>
      </div>
      <Chessboard
        playMove={playMove}
        boardState={boardState}
        getValidMoves={getValidMoves}
      />
    </>
  );
}

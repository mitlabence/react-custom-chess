import { useRef, useState } from "react";
import Tile from "../Tile/Tile";
import "./Chessboard.css";
import Referee from "../../Referee/Referee";
import {
  ChessMove,
  BoardState,
  Position,
  kInitialPieces,
  PieceColor,
  Piece,
  kVerticalAxis,
  kHorizontalAxis,
  kTileSize,
  kGridSize,
  equalsPosition,
  PieceType,
} from "../../Constants";

const initialMoveHistory: ChessMove[] = [];

export default function Chessboard() {
  const [grabPosition, setGrabPosition] = useState<Position>({ x: -1, y: -1 });
  const [activePiece, setActivePiece] = useState<HTMLElement | null>(null);
  const [promotionPawn, setPromotionPawn] = useState<Piece>();
  const chessBoardRef = useRef<HTMLDivElement>(null);
  const [boardState, setBoardState] = useState<BoardState>(
    new BoardState(kInitialPieces, initialMoveHistory)
  );

  const modalRef = useRef<HTMLDivElement>(null);

  const referee = new Referee();

  let board = [];

  function grabPiece(e: React.MouseEvent) {
    const element = e.target as HTMLElement;
    const chessboard = chessBoardRef.current;
    if (element.classList.contains("chess-piece") && chessboard) {
      setGrabPosition({
        // Find grid coordinates from mouse event coordinates
        x: Math.floor((e.clientX - chessboard.offsetLeft) / kTileSize),
        y: Math.floor(
          (kGridSize * kTileSize - e.clientY + chessboard.offsetTop) / kTileSize
        ),
      }); // TODO: set proper chessboard size
      // only interact with chess pieces
      const x = e.clientX - kTileSize / 2; // TODO: extract offset
      const y = e.clientY - kTileSize / 2;
      element.style.position = "absolute";
      element.style.left = `${x}px`;
      element.style.top = `${y}px`;
      setActivePiece(element);
    }
  }

  function movePiece(e: React.MouseEvent) {
    const chessboard = chessBoardRef.current;

    if (activePiece && chessboard) {
      const minX = chessboard.offsetLeft - 25; // TODO: use extracted offset
      const minY = chessboard.offsetTop - 25;
      const maxX = chessboard.offsetLeft + chessboard.clientWidth - 75;
      const maxY = chessboard.offsetTop + chessboard.clientHeight - 75;

      const x = e.clientX - kTileSize / 2; // TODO: extract offset
      const y = e.clientY - kTileSize / 2;
      activePiece.style.position = "absolute";

      if (x < minX) {
        activePiece.style.left = `${minX}px`;
      } else if (x > maxX) {
        activePiece.style.left = `${maxX}px`;
      } else {
        activePiece.style.left = `${x}px`;
      }

      if (y < minY) {
        activePiece.style.top = `${minY}px`;
      } else if (y > maxY) {
        activePiece.style.top = `${maxY}px`;
      } else {
        activePiece.style.top = `${y}px`;
      }
    }
  }

  function promotePawn(pieceType: PieceType) {
    if (promotionPawn === undefined) return;
    const updatedPieces = boardState.pieces.reduce((results, piece) => {
      if (equalsPosition(piece.position, promotionPawn.position)) {
        piece.type = pieceType;
        piece.image = `assets/images/${piece.color}_${pieceType}.png`;
      }

      results.push(piece);
      return results;
    }, [] as Piece[]);
    // Update pieces and move history
    // TODO: add promotion somehow to move history?
    const newBoardState: BoardState = new BoardState(
      updatedPieces,
      boardState.moveHistory
    );
    setBoardState(newBoardState);
    modalRef.current?.classList.add("hidden");

  }

  function dropPiece(e: React.MouseEvent) {
    const chessboard = chessBoardRef.current;
    if (activePiece && chessboard) {
      const targetX = Math.floor(
        (e.clientX - chessboard.offsetLeft) / kTileSize
      );
      const targetY = Math.floor(
        (kGridSize * kTileSize - e.clientY + chessboard.offsetTop) / kTileSize
      ); // TODO: set proper chessboard size
      const targetPosition: Position = { x: targetX, y: targetY };
      // Check if move is valid

      const currentPiece = boardState.pieces.find((p) =>
        equalsPosition(p.position, grabPosition)
      );
      //const attackedPiece = pieces.find((p) => p.x === x && p.y === y);

      // Update piece positions
      if (currentPiece) {
        const validMove = referee.isVaLidMove(
          grabPosition,
          targetPosition,
          currentPiece.type,
          currentPiece.color,
          boardState
        );

        const isEnPassantMove = referee.moveIsEnPassant(
          grabPosition,
          targetPosition,
          currentPiece.type,
          currentPiece.color,
          boardState
        );
        if (validMove || isEnPassantMove) {
          // Add move to move history
          const newMove: ChessMove = new ChessMove(
            currentPiece.type,
            currentPiece.color,
            grabPosition.x,
            grabPosition.y,
            targetX,
            targetY
          );
          // Check if pawn is promoting by reaching last row for team
          let promotionRow = currentPiece.color === PieceColor.WHITE ? 7 : 0;

          // Update pieces on the board
          // One piece is moved (as it is a valid move); up to one piece might be captured
          // Initially, set the coordinates of a potentially captured piece
          let captureX = targetX;
          let captureY = targetY;
          if (isEnPassantMove) {
            // Define what is one tile "in front" of moving piece
            const forwardDirection =
              currentPiece.color === PieceColor.WHITE ? +1 : -1;
            // For en passant, the captured piece is actually not at the coordinates where the moved piece ends up,
            // but one behind
            captureY = captureY - forwardDirection;
          } else if (currentPiece.type === PieceType.PAWN && targetY === promotionRow) {
            modalRef.current?.classList.remove("hidden");
            setPromotionPawn(currentPiece);
          }
          const newPieces = boardState.pieces.reduce((results, piece) => {
            if (equalsPosition(piece.position, grabPosition)) {
              // if no deep copy of pieces were made, we would need piece.team === currentPiece.team as well
              piece.position.x = targetX;
              piece.position.y = targetY;
              results.push(piece);
            } else if (
              !equalsPosition(piece.position, { x: captureX, y: captureY })
            ) {
              // move all pieces but the one attacked (which could be non-existent, so cannot check it explicitly)
              results.push(piece);
            }
            return results;
          }, [] as Piece[]);
          // Update pieces and move history
          const newBoardState: BoardState = new BoardState(newPieces, [
            ...boardState.moveHistory,
            newMove,
          ]);
          setBoardState(newBoardState);
        } else {
          // reset piece location
          activePiece.style.position = "relative";
          activePiece.style.removeProperty("top");
          activePiece.style.removeProperty("left");
        }
      }
      setActivePiece(null);
    }
  }

  for (let j = kVerticalAxis.length - 1; j >= 0; j--) {
    for (let i = 0; i < kHorizontalAxis.length; i++) {
      const number = j + i;
      const piece = boardState.pieces.find((p) =>
        equalsPosition(p.position, { x: i, y: j })
      );
      let image = piece ? piece.image : undefined;
      board.push(
        <Tile key={`${i}, ${j}`} number={number} image={image}></Tile>
      );
    }
  }
  return (
    <>
      <div id="pawn-promotion-modal" className="hidden" ref={modalRef}>
        <div className="modal-body">
          <img
            onClick={() => promotePawn(PieceType.QUEEN)}
            src={`assets/images/${promotionPawn?.color}_queen.png`}
          />
          <img
            onClick={() => promotePawn(PieceType.ROOK)}
            src={`assets/images/${promotionPawn?.color}_rook.png`}
          />
          <img
            onClick={() => promotePawn(PieceType.BISHOP)}
            src={`assets/images/${promotionPawn?.color}_bishop.png`}
          />
          <img
            onClick={() => promotePawn(PieceType.KNIGHT)}
            src={`assets/images/${promotionPawn?.color}_knight.png`}
          />
        </div>
      </div>
      <div
        onMouseDown={(e) => grabPiece(e)}
        onMouseMove={(e) => movePiece(e)}
        onMouseUp={(e) => dropPiece(e)}
        id="chessboard"
        ref={chessBoardRef}
      >
        {board}
      </div>
    </>
  );
}

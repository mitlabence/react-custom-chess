import { useRef, useState } from "react";
import Tile from "../Tile/Tile";
import "./Chessboard.css";
import { ChessPiece } from "../../models/pieces/ChessPiece";

import {
  Position,
  kVerticalAxis,
  kHorizontalAxis,
  kTileSize,
  kGridSize,
  equalsPosition,
} from "../../Constants";
import { BoardState } from "../../models/BoardState";

interface Props {
  playMove: (
    piece: ChessPiece,
    sourcePosition: Position,
    targetPosition: Position
  ) => boolean;
  boardState: BoardState;
}

export default function Chessboard({ playMove, boardState }: Props) {
  const [grabPosition, setGrabPosition] = useState<Position>({ x: -1, y: -1 });
  const [activePiece, setActivePiece] = useState<HTMLElement | null>(null);
  const chessBoardRef = useRef<HTMLDivElement>(null);

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

      const currentPiece =
        boardState.piecesGrid[grabPosition.y][grabPosition.x];
      //const attackedPiece = pieces.find((p) => p.x === x && p.y === y);

      // Update piece positions
      if (currentPiece) {
        var moveSuccessful = playMove(
          currentPiece,
          grabPosition,
          targetPosition
        );
        if (!moveSuccessful) {
          // reset piece location
          activePiece.style.position = "relative";
          activePiece.style.removeProperty("top");
          activePiece.style.removeProperty("left");
        }
      }
      setActivePiece(null);
    }
  }
  let grabbedPiece =
    activePiece != null
      ? boardState.piecesGrid[grabPosition.y][grabPosition.x]
      : undefined;
  const validMoves = grabbedPiece?.getValidMoves(grabPosition, boardState);

  for (let j = kVerticalAxis.length - 1; j >= 0; j--) {
    for (let i = 0; i < kHorizontalAxis.length; i++) {
      const number = j + i;
      const piece = boardState.piecesGrid[j][i];
      let image = piece && piece.image ? piece.image : undefined; // if NullPiece, set image to undefined as well
      let isHighlighted: boolean = validMoves
        ? validMoves.some((p) => equalsPosition(p, { x: i, y: j }))
        : false; // highlight the valid moves of grabbed piece
      board.push(
        <Tile
          key={`${i}, ${j}`}
          number={number}
          image={image}
          highlight={isHighlighted}
        ></Tile>
      );
    }
  }
  return (
    <>
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

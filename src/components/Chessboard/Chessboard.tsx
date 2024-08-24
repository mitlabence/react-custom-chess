import { useEffect, useRef, useState } from "react";
import Tile from "../Tile/Tile";
import "./Chessboard.css";

const verticalAxis = ["1", "2", "3", "4", "5", "6", "7", "8"];
const horizontalAxis = ["a", "b", "c", "d", "e", "f", "g", "h"];

interface Piece {
  image: string;
  y: number;
  x: number;
}

// add pawns
const pawnsConfig = [
  "pawn",
  "pawn",
  "pawn",
  "pawn",
  "pawn",
  "pawn",
  "pawn",
  "pawn",
];
// add pieces, left to right:
//  rook, knight, bishop, queen, king, bishop, knight, rook
const piecesConfig = [
  "rook",
  "knight",
  "bishop",
  "queen",
  "king",
  "bishop",
  "knight",
  "rook",
];

const initialBoardState: Piece[] = [];
for (let i = 0; i < 8; i++) {
  // white
  let image_path_white_piece = `assets/images/white_${piecesConfig[i]}.png`;
  initialBoardState.push({ image: image_path_white_piece, x: i, y: 0 });
  let image_path_white_pawn = `assets/images/white_${pawnsConfig[i]}.png`;
  initialBoardState.push({ image: image_path_white_pawn, x: i, y: 1 });
  // black
  let image_path_black_piece = `assets/images/black_${piecesConfig[i]}.png`;
  initialBoardState.push({ image: image_path_black_piece, x: i, y: 7 });
  let image_path_black_pawn = `assets/images/black_${pawnsConfig[i]}.png`;
  initialBoardState.push({ image: image_path_black_pawn, x: i, y: 6 });
}

export default function Chessboard() {
  const [gridX, setGridX] = useState(0);
  const [gridY, setGridY] = useState(0);
  const [activePiece, setActivePiece] = useState<HTMLElement | null>(null);

  const chessBoardRef = useRef<HTMLDivElement>(null);
  const [pieces, setPieces] = useState<Piece[]>(initialBoardState);

  let board = [];


  function grabPiece(e: React.MouseEvent) {
    const element = e.target as HTMLElement;
    const chessboard = chessBoardRef.current;
    if (element.classList.contains("chess-piece") && chessboard) {
      setGridX(Math.floor((e.clientX - chessboard.offsetLeft) / 100));
      setGridY(Math.floor((800 - e.clientY + chessboard.offsetTop) / 100));  // TODO: set proper chessboard size
      // only interact with chess pieces
      const x = e.clientX - 50; // TODO: extract offset
      const y = e.clientY - 50;
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

      const x = e.clientX - 50; // TODO: extract offset
      const y = e.clientY - 50;
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
    console.log(e);
    const chessboard = chessBoardRef.current;
    if (activePiece && chessboard) {
      const x = Math.floor((e.clientX - chessboard.offsetLeft) / 100);
      const y = Math.floor((800 - e.clientY + chessboard.offsetTop) / 100); // TODO: set proper chessboard size
      setPieces((value) => {
        const pieces = value.map((p) => {
          if (p.x === gridX && p.y === gridY) {
            p.x = x;
            p.y = y;
          }
          return p;
        });
        return pieces;
      });
      setActivePiece(null);
    }
  }

  for (let j = verticalAxis.length - 1; j >= 0; j--) {
    for (let i = 0; i < horizontalAxis.length; i++) {
      const number = j + i;
      let image = undefined;

      pieces.forEach((p) => {
        if (p.x === i && p.y === j) {
          image = p.image;
        }
      });
      board.push(
        <Tile key={`${i}, ${j}`} number={number} image={image}></Tile>
      );
    }
  }
  return (
    <div
      onMouseDown={(e) => grabPiece(e)}
      onMouseMove={(e) => movePiece(e)}
      onMouseUp={(e) => dropPiece(e)}
      id="chessboard"
      ref={chessBoardRef}
    >
      {board}
    </div>
  );
}

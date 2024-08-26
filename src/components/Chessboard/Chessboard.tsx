import { useRef, useState } from "react";
import Tile from "../Tile/Tile";
import "./Chessboard.css";
import Referee from "../../Referee/Referee";

const verticalAxis = ["1", "2", "3", "4", "5", "6", "7", "8"];
const horizontalAxis = ["a", "b", "c", "d", "e", "f", "g", "h"];

export enum PieceType {
  PAWN = "pawn",
  ROOK = "rook",
  KNIGHT = "knight",
  BISHOP = "bishop",
  QUEEN = "queen",
  KING = "king",
}

export enum TeamType {
  WHITE = "white",
  BLACK = "black",
}

export interface Piece {
  image: string;
  y: number;
  x: number;
  type: PieceType;
  team: TeamType;
}

// add pawns
const pawnsConfig = [
  PieceType.PAWN,
  PieceType.PAWN,
  PieceType.PAWN,
  PieceType.PAWN,
  PieceType.PAWN,
  PieceType.PAWN,
  PieceType.PAWN,
  PieceType.PAWN,
];
// add pieces, left to right:
//  rook, knight, bishop, queen, king, bishop, knight, rook
const piecesConfig = [
  PieceType.ROOK,
  PieceType.KNIGHT,
  PieceType.BISHOP,
  PieceType.QUEEN,
  PieceType.KING,
  PieceType.BISHOP,
  PieceType.KNIGHT,
  PieceType.ROOK,
]; // TODO: can make it more compact than specifying basically same information twice? piecesConfig and pieceTypesConfig

const initialBoardState: Piece[] = [];
for (let i = 0; i < 8; i++) {
  // white
  let image_path_white_piece = `assets/images/${TeamType.WHITE}_${piecesConfig[i]}.png`;
  initialBoardState.push({
    image: image_path_white_piece,
    x: i,
    y: 0,
    type: piecesConfig[i],
    team: TeamType.WHITE,
  });
  let image_path_white_pawn = `assets/images/${TeamType.WHITE}_${pawnsConfig[i]}.png`;
  initialBoardState.push({
    image: image_path_white_pawn,
    x: i,
    y: 1,
    type: PieceType.PAWN,
    team: TeamType.WHITE,
  });
  // black
  let image_path_black_piece = `assets/images/${TeamType.BLACK}_${piecesConfig[i]}.png`;
  initialBoardState.push({
    image: image_path_black_piece,
    x: i,
    y: 7,
    type: piecesConfig[i],
    team: TeamType.BLACK,
  });
  let image_path_black_pawn = `assets/images/${TeamType.BLACK}_${pawnsConfig[i]}.png`;
  initialBoardState.push({
    image: image_path_black_pawn,
    x: i,
    y: 6,
    type: PieceType.PAWN,
    team: TeamType.BLACK,
  });
}

export default function Chessboard() {
  const [sourceX, setGridX] = useState(0);
  const [sourceY, setGridY] = useState(0);
  const [activePiece, setActivePiece] = useState<HTMLElement | null>(null);

  const chessBoardRef = useRef<HTMLDivElement>(null);
  const [pieces, setPieces] = useState<Piece[]>(initialBoardState);

  const referee = new Referee();

  let board = [];

  function grabPiece(e: React.MouseEvent) {
    const element = e.target as HTMLElement;
    const chessboard = chessBoardRef.current;
    if (element.classList.contains("chess-piece") && chessboard) {
      setGridX(Math.floor((e.clientX - chessboard.offsetLeft) / 100));
      setGridY(Math.floor((800 - e.clientY + chessboard.offsetTop) / 100)); // TODO: set proper chessboard size
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
      const targetX = Math.floor((e.clientX - chessboard.offsetLeft) / 100);
      const targetY = Math.floor(
        (800 - e.clientY + chessboard.offsetTop) / 100
      ); // TODO: set proper chessboard size
      // Check if move is valid

      const currentPiece = pieces.find(
        (p) => p.x === sourceX && p.y === sourceY
      );
      //const attackedPiece = pieces.find((p) => p.x === x && p.y === y);

      // Update piece positions
      if (currentPiece) {
        const validMove = referee.isVaLidMove(
          sourceX,
          sourceY,
          targetX,
          targetY,
          currentPiece.type,
          currentPiece.team,
          pieces
        );
        if (validMove) {
          const newPieces = pieces.reduce((results, piece) => {
            if (piece.x === sourceX && piece.y === sourceY) {
              // if no deep copy of pieces were made, we would need piece.team === currentPiece.team as well
              piece.x = targetX;
              piece.y = targetY;
              results.push(piece);
            } else if (!(piece.x === targetX && piece.y === targetY)) {
              // move all pieces but the one attacked (which could be non-existent, so cannot check it explicitly)
              results.push(piece);
            }
            return results;
          }, [] as Piece[]);

          setPieces(newPieces);
        } else {
          // reset piece location
          activePiece.style.position = "relative";
          activePiece.style.removeProperty("top");
          activePiece.style.removeProperty("left");
        }
      }
      setActivePiece(null);
      console.log("");
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

import Tile from "../Tile/Tile";
import "./Chessboard.css";

const verticalAxis = ["1", "2", "3", "4", "5", "6", "7", "8"];
const horizontalAxis = ["a", "b", "c", "d", "e", "f", "g", "h"];

interface Piece {
    image: string;
    y: number
    x: number
}

const pieces: Piece[] = []

// add pawns
const pawnsConfig = ["pawn", "pawn", "pawn", "pawn", "pawn", "pawn", "pawn", "pawn"];
// add pieces, left to right:
//  rook, knight, bishop, queen, king, bishop, knight, rook
const piecesConfig = ["rook", "knight", "bishop", "queen", "king", "bishop", "knight", "rook"];

for(let i=0; i<8; i++){
    // white
    let image_path_white_piece = `assets/images/white_${piecesConfig[i]}.png`;
    pieces.push({image: image_path_white_piece, x:i, y:0});
    let image_path_white_pawn = `assets/images/white_${pawnsConfig[i]}.png`;
    pieces.push({image: image_path_white_pawn, x:i, y:1});
    // black
    let image_path_black_piece = `assets/images/black_${piecesConfig[i]}.png`;
    pieces.push({image: image_path_black_piece, x:i, y:7});
    let image_path_black_pawn = `assets/images/black_${pawnsConfig[i]}.png`;
    pieces.push({image: image_path_black_pawn, x:i, y:6});
}




export default function Chessboard() {
    let board = [];
    for(let j=verticalAxis.length-1; j >= 0; j--)
     {
        for(let i=0; i < horizontalAxis.length; i++) {
            const number = j+i;
            let image = undefined;

            pieces.forEach(p=>{
                if(p.x === i && p.y === j) {
                    image = p.image;
                }
            })
            board.push(<Tile number={number} image={image}></Tile>);   

        }
    }
    return <div id="chessboard">
        {board}
    </div>;
}
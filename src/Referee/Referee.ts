import { PieceType, TeamType } from "../components/Chessboard/Chessboard";

export default class Referee {
  isVaLidMove(
    sourceX: number,
    sourceY: number,
    targetX: number,
    targetY: number,
    pieceType: PieceType,
    pieceColor: TeamType
  ) {
    const deltaX = targetX - sourceX;
    // forward is dependent on color! Should be positive if moving forward, negative if backward
    const deltaForward =
      pieceColor === TeamType.WHITE ? targetY - sourceY : sourceY - targetY;
    if (pieceType === PieceType.PAWN) {
      // First step can be 1 or 2 squares forward. White: source -> target is an increment, black: decrement
      // For pawn, important to know if it is on second rank of its color (pawns can move 2 forward as first move)
      const isOnSecondRank =
        (pieceColor === TeamType.WHITE && sourceY === 1) ||
        (pieceColor === TeamType.BLACK && sourceY === 6)
          ? true
          : false;
      // Check based on forward movement
      if (deltaForward === 2 && deltaX === 0 && isOnSecondRank) {
        console.log(`${pieceColor} ${pieceType}: first step 2 forward`);
        return true;
      } else if (deltaForward === 1 && deltaX === 0) {
        // TODO: add piece capturing
        console.log(`${pieceColor} ${pieceType}: step 1 forward`);
        return true;
      }
    }
    return false;
  }
}

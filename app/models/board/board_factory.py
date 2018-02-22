from .square_board.board import Board as NormalBoard
from .square_board.data import piece_shape_set

class BoardFactory:
    
    @staticmethod
    def createBoard(boardType):
        if boardType == "normal":
            return NormalBoard(piece_shape_set)
        return False
    
    @staticmethod
    def getBoardData(boardType):
        if boardType == "normal":
            return piece_shape_set
        return False
    

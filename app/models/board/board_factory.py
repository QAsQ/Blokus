from .square_board.board import Board as NormalBoard
from .square_board.data import piece_shape_set

class BoardFactory:
    
    @staticmethod
    def createBoard(boardType):
        if boardType == "square_standard":
            return NormalBoard(piece_shape_set)
        return "board type {} is not defined!".format(boardType)
    
    @staticmethod
    def getBoardData(boardType):
        if boardType == "square_standard":
            return piece_shape_set
        return "board type {} is not defined!".format(boardType)
    

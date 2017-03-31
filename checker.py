import json

Chess = [
    [(0,0)],
    [(4,0),(3,0)],
    [(0,4),(1,4),(0,3)],
    [(4,0),(3,0),(2,0)],
    [(0,0),(0,1),(1,0),(1,1)],
    [(0,0),(0,1),(0,2),(1,1)],
    [(0,0),(0,1),(0,2),(0,3)],
    [(0,4),(1,4),(2,4),(0,3)],
    [(0,0),(0,1),(1,1),(1,2)],
    [(4,0),(3,0),(2,0),(1,0),(4,1)],
    [(4,4),(4,3),(4,2),(3,3),(2,3)],
    [(4,4),(4,3),(4,2),(3,4),(2,4)],
    [(4,4),(3,4),(2,4),(2,3),(1,3)],
    [(4,4),(4,3),(3,3),(2,3),(2,2)],
    [(0,0),(0,1),(0,2),(0,3),(0,4)],
    [(0,4),(0,3),(0,2),(1,4),(1,3)],
    [(0,4),(1,4),(1,3),(2,3),(2,2)],
    [(0,4),(1,4),(2,4),(0,3),(2,3)],
    [(0,0),(0,1),(1,1),(1,2),(2,1)],
    [(1,0),(1,1),(1,2),(0,1),(2,1)],
    [(0,4),(0,3),(0,2),(0,1),(1,3)]
];

def toCell(Sta):
    if Sta["id"] == -1:
        return list();
    sta = 0;
    chs = Chess[int(Sta["id"])];
    if(Sta["sta"] & 1):
        chs = map(lambda (x,y) : (x,4-y),chs);
        sta ^= 1;
    while(sta != Sta["sta"]):
        chs = map(lambda (x,y) : (y,4-x),chs);
        sta = (sta + (6 if 1 == (sta & 1) else 2)) % 8;

    chs = map(lambda (x,y) : (Sta["round"] % 4,x + Sta["x"],y + Sta["y"]) ,chs)
    return chs;

Chesses = [list() for id in range(21)];

for id in range(0,21):
    sta = 0;
    Chesses[id] = [list() in range (8)];
    for sta in range(8):
        pass;



def pre(board,own):
    cells = [cell for chess in map(toCell,board) for cell in chess];
    cells += [(0, -1, -1) , (1, -1, 20) , (2, 20, 20) , (3, 20, -1)];
    owner = filter(lambda (o,x,y) : o == own,cells);
    link  = lambda x,y : x + y;
    inr   = lambda x : 0 <= x and x <= 19;               #in range
    inb   = lambda (x,y) : inr(x) and inr(y);            #in board
    off   = lambda ps : map(lambda (o,x,y) : (x,y),ps);  #reduction O
    shift = lambda lis,t :filter(inb,list(set( reduce(link,map(lambda (_x,_y) : map(lambda (o,x,y): (_x+x,_y+y) , lis),t) ))));
    crash = shift(owner,[(1,0),(-1,0),(0,1),(0,-1)]) +  off(cells);
    horn  = filter(lambda p : crash.count(p) == 0 ,shift(owner,[(1,1),(-1,-1),(1,-1),(-1,1)]));
    return (crash,horn);


def check(board,sta):
    if sta["sta"] == -1:
        return True;
    for chs in board:
        if sta["ronnd"] % 4 == chs["round"] % 4 and sta["id"] == chs["id"]:
            return False;
    (crash,horn) = pre(board,sta["round"] % 4);
    off   = lambda ps : map(lambda (o,x,y) : (x,y),ps);  #reduction O
    cnt   = lambda obj : sum(map(lambda p : obj.count(p),off(toCell(sta)))); 
    return cnt(horn) > 0 and cnt(crash) == 0;

def nextSta(board):
    own = len(board) % 4;
    #bod = [[0 for col in range(20)] for row in range(20)];
    #(crash,horn) = pre(board,len(board) % 4);
    #for (x,y) in horn:
    #    bod[x][y] = 1;
    #for (x,y) in crash:
    #    bod[x][y] = -1;
    for Id in range (0,21):
        for x in range(-4,20):
            for y in range(-4,20):
                for sta in range(0,8):
                    Sta = {"id":Id,"x":x,"y":y,"sta":sta,"round":len(board)};
                    if check(board,Sta):
                        return Sta;
    return {"id":-1,"x":-1,"y":-1,"sta":-1,"round":len(board)};



#roundCheck(tes);
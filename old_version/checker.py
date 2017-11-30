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
    chs = Chesses[Sta["id"]][Sta["sta"]];

    chs = map(lambda (x,y) : (Sta["round"] % 4,x + Sta["x"],y + Sta["y"]) ,chs)
    return chs;


Chesses = [list() for id in range(21)];
for id in range(0,21):
    def genchs(id,sta):
        _sta = 0;
        chs = Chess[id];
        if(sta & 1):
            chs = map(lambda (x,y) : (x,4-y),chs);
            _sta ^= 1;
        while(_sta != sta):
            chs = map(lambda (x,y) : (y,4-x),chs);
            _sta = (_sta + (6 if 1 == (_sta & 1) else 2)) % 8;
        return chs;
    Chesses[id] = [list() for ind in range(8)];
    for sta in range(8):
        Chesses[id][sta] = genchs(id,sta);

off   = lambda ps : map(lambda (o,x,y) : (x,y),ps);  #reduction O
inr   = lambda x : 0 <= x and x <= 19;               #in range
inb   = lambda (x,y) : inr(x) and inr(y);            #in board

def pre(board,owner):
    cells = [cell for chess in map(toCell,board) for cell in chess];
    cells += [(0, -1, -1) , (1, -1, 20) , (2, 20, 20) , (3, 20, -1)];
    owner = filter(lambda (o,x,y) : o == owner,cells);
    link  = lambda x,y : x + y;
    shift = lambda lis,t :filter(inb,list(set( reduce(link,map(lambda (_x,_y) : map(lambda (o,x,y): (_x+x,_y+y) , lis),t) ))));
    crash = filter(inb,shift(owner,[(1,0),(-1,0),(0,1),(0,-1)]) +  off(cells));
    horn  = filter(lambda p : crash.count(p) == 0 ,shift(owner,[(1,1),(-1,-1),(1,-1),(-1,1)]));
    return (horn,crash);

def check(board,Sta):
    if Sta["sta"] == -1:
        return True;
    for chs in board:
        if (Sta["round"] % 4) == (chs["round"] % 4) and Sta["id"] == chs["id"]:
            return False;
    (horn,crash) = pre(board,Sta["round"] % 4);
    cnt   = lambda obj : sum(map(lambda p : obj.count(p),off(toCell(Sta)))); 
    return cnt(horn) > 0 and cnt(crash) == 0 and all(map(inb,off(toCell(Sta))));


def nextSta(board):
    own = len(board) % 4;
    for Sta in board:
        if Sta["round"] % 4 == own and Sta["sta"] == -1:
            return {"id":-1,"x":-1,"y":-1,"sta":-1,"round":len(board)};
    bod = [[0 for id in range(20)] for id in range(20)];
    (horn,crash) = pre(board,own);
    for (x,y) in horn:
        bod[x][y] = 1;
    for (x,y) in crash:
        bod[x][y] = -1;
    def quickCheck(_x,_y,sta,id):
        cnter = 0;
        for (x,y) in Chesses[id][sta]:
            if not inb((x + _x,y + _y)) or bod[x + _x][y + _y] == -1:
                return False;
            cnter += bod[x + _x][y + _y];
        return cnter > 0;

    ids = range(20,-1,-1);
    for Sta in board:
        if Sta["round"] % 4 == own:
            ids.remove(Sta["id"]);
    
    for id in ids:
        for sta in range(0,8):
            for x in range(-4,20):
                for y in range(-4,20):
                    if quickCheck(x,y,sta,id):
                        return {"id":id,"x":x,"y":y,"sta":sta,"round":len(board)};
    return {"id":-1,"x":-1,"y":-1,"sta":-1,"round":len(board)};

#roundCheck(tes);
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

    chs = map(lambda (x,y) : (Sta["o"],x + Sta["x"],y + Sta["y"]) ,chs)
    return chs;

def debug(lis,cra):
    for i in range(0,20):
        line = "";
        for j in range(0,20):
            if ((i,j) in lis and (i,j) not in cra):
                line += '+';
            else:
                if (i,j) in cra:
                    line += '_';
                else:
                    line += '#';
        print line;
        

def check(_board,sta):
    board= json.loads(_board);
    cells = [cell for chess in map(toCell,board) for cell in chess];
    owner = filter(lambda (o,x,y) : o == sta["o"],cells);
    link = lambda x,y : x+y;
    inr = lambda x : 0 <= x and x <= 19; #in range
    inb = lambda (x,y) : inr(x) and inr(y); #in board
    shift = lambda lis,t :filter(inb,list(set( reduce(link,map(lambda (_x,_y) : map(lambda (o,x,y): (_x+x,_y+y) , lis),t) ))));
    horn = shift(owner,[(1,1),(-1,-1),(1,-1),(-1,1)]);
    crash = shift(owner,[(1,0),(-1,0),(0,1),(0,-1)]) + map(lambda oxy : oxy[1:3] , cells);
    debug(horn,crash);
    cnt = lambda obj : sum(map(lambda p : obj.count(p),toCell(sta)));#count 
    print cnt(horn)  , cnt(crash) ;
    return cnt(horn) > 0 and cnt(crash) == 0;

print check(tes,{"sta": 6, "o": 0, "y": 0, "x": 7, "id": 5});
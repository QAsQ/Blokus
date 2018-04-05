# 判断tuple代表的三角形是否在棋盘内

def bound_judge(pos):
    if (pos[2] > 1) or (pos[2] < 0):
        return False
    if (pos[0] > 17) or (pos[1] > 17):
        return False
    if pos[2] == 1:
        if (pos[0] + pos[1] < 8):
            return False
        if pos[0] + pos[1] > 25:
            return False
        return True
    else:
        if (pos[0] + pos[1] < 9):
            return False
        if pos[0] + pos[1] > 26:
            return False
        return True

# 输入不合法返回空list
# 输入合法返回合法的相邻三角的list

def edge2edge(pos):
    ret = []
    if not bound_judge(pos):
        return ret
    if pos[2] == 1:
        tup = (pos[0], pos[1], 0)
        if bound_judge(tup):
            ret.append(tup)
        tup = (pos[0], pos[1] + 1, 0)
        if bound_judge(tup):
            ret.append(tup)
        tup = (pos[0] + 1, pos[1], 0)
        if bound_judge(tup):
            ret.append(tup)
    else:
        tup = (pos[0], pos[1], 1)
        if bound_judge(tup):
            ret.append(tup)
        tup = (pos[0] - 1, pos[1], 1)
        if bound_judge(tup):
            ret.append(tup)
        tup = (pos[0], pos[1] - 1, 1)
        if bound_judge(tup):
            ret.append(tup)
    return ret

def corner2corner(pos):
    ret = []
    if not bound_judge(pos):
        return ret
    if pos[2] == 1:
        tup = (pos[0] + 1, pos[1] + 1, 0)
        if bound_judge(tup):
            ret.append(tup)
        tup = (pos[0] - 1, pos[1] + 1, 0)
        if bound_judge(tup):
            ret.append(tup)
        tup = (pos[0] + 1, pos[1] - 1, 0)
        if bound_judge(tup):
            ret.append(tup)
    else:
        tup = (pos[0] - 1, pos[1] - 1, 1)
        if bound_judge(tup):
            ret.append(tup)
        tup = (pos[0] - 1, pos[1] + 1, 1)
        if bound_judge(tup):
            ret.append(tup)
        tup = (pos[0] + 1, pos[1] - 1, 1)
        if bound_judge(tup):
            ret.append(tup)
    return ret

# 不合法返回(-1, -1, -1)
# 不存在返回(0, 0, 0)
# 合法返回对应位置的tuple

def edge_direct(pos, dir):
    if not bound_judge(pos):
        return (-1, -1, -1)
    if pos[2] == 1:
        if dir == 0:
            tup = (pos[0], pos[1] + 1, 0)
            if bound_judge(tup):
                return tup
            else:
                return (0, 0, 0) 
        if dir == 1:
            tup = (pos[0] + 1, pos[1], 0)
            if bound_judge(tup):
                return tup
            else:
                return (0, 0, 0)
        if dir == 2:
            tup = (pos[0], pos[1], 0)
            if bound_judge(tup):
                return tup
            else:
                return (0, 0, 0)
    else:
        if dir == 0:
            tup = (pos[0], pos[1] - 1, 0)
            if bound_judge(tup):
                return tup
            else:
                return (0, 0, 0) 
        if dir == 1:
            tup = (pos[0] - 1, pos[1], 0)
            if bound_judge(tup):
                return tup
            else:
                return (0, 0, 0)
        if dir == 2:
            tup = (pos[0], pos[1], 1)
            if bound_judge(tup):
                return tup
            else:
                return (0, 0, 0)
        
    

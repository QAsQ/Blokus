Room 房间

​	board 历史棋盘

 	status 各个位置被占用的情况

​        remain 各个人剩余的时间

​	last 上一次最后一个落子的时间

​        user 用户名



​	info 房间的位置被占用的情况

​		status

​		user

​	

​	history(cur) 对局信息(服务器当前时间)

​		history 历史棋盘

​		remain 

​		cur

---

```sequence
Client -> Server : "info" //房间的位置被占用的情况
Server -> Client : {"info",status:房间信息,user:用户名}

Client -> Server : "history"
Server -> Client : {"history"}

Client -> Server : "move"
Server -> Client : {"move"}

Server -> Client : over
```



Chess in round:

​	locate{

​	x,y:

​	}棋子左上角的坐标

​	id: 棋子的id

​	sta: 棋子的状态

​	round: 所处的回合 (also owner)
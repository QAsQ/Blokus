# Blokus

Blokus 是四个玩家参与的抽象策略类桌游，由法国数学家 Bernard Tavitian 发明

这里实现了一个四人在线版本 https://blokus.io

# 对局

标准的 Blokus 游戏由 21 种形状的棋子，每个形状四个颜色（红，绿，蓝，黄）各一份共 84 个棋子和 20 * 20 的正方形棋盘构成。每个颜色有对应的起始点。![full.png](https://i.loli.net/2018/03/22/5ab3905782df0.png)

详情参见官网

# 安装

1、安装 mongodb

* 通过系统包管理器安装  
如 brew (mac), apt-get (ubuntu)  
[Install MongoDB Community Edition](https://docs.mongodb.com/manual/administration/install-community/)  
* 通过 docker 安装  
`$ docker pull mongo`  
`$ docker create --name blokus -p 27017:27017 mongo`  
`$ docker start blokus`  

2、安装 python 的依赖

`pip install -r requirements.txt`

3、启动

`python app/run.py`

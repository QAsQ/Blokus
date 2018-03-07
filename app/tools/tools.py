#!/usr/bin/python3
#-*- coding: utf-8 -*-  

from config import db_config
from pymongo import MongoClient
import requests
import argparse
import json

parser = argparse.ArgumentParser()
parser.add_argument("mode", help="mode of this function")
parser.add_argument("-b", "--battle_id", type=int,
					help="battle-id, default 0", default=0)
parser.add_argument("--accuracy_time", type=int,
					help="accuracy time for battle, default 30", default=30)
parser.add_argument("--additional_time", type=int,
					help="additional time for battle, default 10", default=10)
parser.add_argument("-p", "--player_id",  type=int,
					help="player-id, default 0", default=0)
parser.add_argument("-u", "--user_id",  type=int,
					help="user-id, default 0", default=0)

parser.add_argument("--debug", action="store_true",
					help="debug mode, will print raw result")

api_head = "http://127.0.0.1:5000/api/"

def output_json(data):
		print(json.dumps(data, sort_keys=True))


def output_battle(battle):
	for player_info in battle['players_info']:
		output_json(player_info)
	print("history_len {}".format(len(battle['board_info']['history'])))
	if len(battle['board_info']['history']) == 0:
		print("not drop yet")
	else:
		output_json(battle['board_info']['history'][-1])
	output_json(battle['battle_info'])
	print("=" * 30)

def create_battle(param):
	data = {
		"board_type": "square_standard", 
		"battle_info": {
			"accuracy_time": param.accuracy_time,
			"additional_time": param.additional_time
		}
	}
	r = requests.post(api_head + "battles", json=data)
	print(r.text)

def add_user(param):
	data = {
		"user_id": param.user_id
	}
	r = requests.put(
		api_head +  "battles/{}/players/{}".format(
			param.battle_id, param.player_id
		),
		json=data
	)
	print(r.text)

def get_battles(param):
	r = requests.get(api_head + "battles")
	if param.debug:
		print(r.text)
	res = json.loads(r.text)
	for battle in res:
		output_battle(battle)

def get_one_battle(param):
	r = requests.get(api_head + "battles/{}".format(param.battle_id),
					params={"user_id": param.user_id})
	if param.debug:
		print(r.text)
	battle = json.loads(r.text)
	output_battle(battle)

def clear_db(param):
	db = MongoClient(host=db_config['host'], port=db_config['port'])[db_config['db_name']]
	if db_config['username'] is not None and db_config['password'] is not None:
		db.authenticate(db_config['name'], db_config['password'])
	
	db.battles.drop()
	db.counter.update(
		{"_id": 0},
		{"$set": {"battles": 0, "users": 0}}
	)

	print("SUCC")


def main(mode, param):
	if mode == "create_battle":
		create_battle(param)
	elif mode == "add_user":
		add_user(param)
	elif mode  == 'get_battles':
		get_battles(param)
	elif mode == 'get_one_battle':
		get_one_battle(param)
	elif mode == 'clear_db':
		clear_db(param)

if __name__ == '__main__':
	args = parser.parse_args()
	main(args.mode, args)


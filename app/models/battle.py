from .board import BoardFactory
from .board.square_board.piece import Position
from .db_utility import id_generate

default_offline_time = 10

class Battle:
    def __init__(self, timestamp, battle_info, board, db, player_info=None, battle_id=None):
        self.db = db

        self.board = board
        self.create_time = timestamp
        self.accuracy_time = battle_info['accuracy_time']
        self.additional_time = battle_info['additional_time']

        self.started = battle_info.get("started", False)
        self.ended = battle_info.get("ended", False)
        self.start_time = battle_info.get("start_time", -1)
        self.current_player = battle_info.get("current_player", -1)
        self.current_time = battle_info.get("current_time", -1)

        self.default_player_info = {"user_id": -1}
        if player_info is None:
            self.player_info = [self.default_player_info for _ in range(4)]
        else:
            self.player_info = player_info

        if battle_id is None:
            self.id = id_generate(db, "battle")
            db.insert(self.get_state(0))
        else:
            self.id = battle_id

    def try_join_player(self, timestamp, player_id, player_info):
        if self.player_info[player_id]["user_id"] != -1:
            return False

        self.player_info[player_id] = {
            "user_id": player_info["user_id"],
            "info": player_info,
            "join_time": timestamp,
            "last_active_time": timestamp,
            "accuracy_time_left": self.accuracy_time,
            "additional_time_left": self.additional_time,
            "is_auto": False
        }

        self._update_player(player_id)

        if self._is_ready():
            self.started = True
            self.start_time = timestamp
            self.current_time = timestamp
            self.current_player = 0

            self._update("battle_info", self._get_battle_info())

        return True

    def remove_player(self, timestamp, player_id):
        if not self.started:
            self.player_info[player_id] = self.default_player_info
        else:
            self.player_info[player_id]['is_auto'] = True
            self.player_info[player_id]['last_active_time'] = timestamp
        
        self._update_player(player_id)

    def remove_auto(self, timestamp, player_id):
        self.player_info[player_id]['is_auto'] = False
        self.player_info[player_id]['last_active_time'] = timestamp

        self._update_player(player_id)
    
    def get_state(self, timestamp, player_id=-1):
        self._update_info(timestamp, player_id)

        return {
            "_id": self.id,
            "player_info": self.player_info,
            "board_info": self.board.get_info(),
            "battle_info": self._get_battle_info()
        }

    def try_drop_piece(self, timestamp, player_id, piece_id, dict_position):
        self._update_info(timestamp, player_id)

        position = Position.from_dict(dict_position)
        if not self.started or self.ended or self.current_player != player_id:
            return False

        if self.board.try_drop_piece(player_id, piece_id, position):
            self.current_player = (self.current_player + 1) % 4
            self.ended = self.board.is_ended()

            self._update("board_info", self.board.get_info())
            self._update("battle_info", self._get_battle_info())

            return True
        else:
            return False

    def _get_battle_info(self):
        return {
            "accuracy_time": self.accuracy_time,
            "additional_time": self.additional_time,
            "started": self.started,
            "ended": self.ended,
            "start_time": self.start_time,
            "current_player": self.current_player,
            "current_time": self.current_time
        }

    def _update(self, key, value):
        self.db.update(
            {"_id": self.id},
            {
                "$set": {
                    key: value
                }
            }
        )
    
    def _update_player(self, player_id):
        self._update("player_info.{}".format(player_id), self.player_info[player_id])

    def _update_info(self, timestamp, player_id):
        if not self.started or self.ended:
            return
        def current_player():
            if self.current_player == -1:
                return None
            return self.player_info[self.current_player]
    
        def auto_drop_piece():
            self.board.auto_drop_piece(self.current_player)
            self.current_player += 1
            self.current_player %= 4
            current_player()['additional_time_left'] = self.additional_time

        for player_info in self.player_info:
            if player_info["last_active_time"] + default_offline_time < timestamp:
                player_info['is_auto'] = True

        if player_id != -1:
            self.player_info[player_id]["last_active_time"] = timestamp
        
        while self.current_time < timestamp and not self.ended:
            if current_player()["is_auto"]:
               auto_drop_piece()
            else:
                if current_player()["additional_time_left"] + self.current_time > timestamp:
                    current_player()["additional_time_left"] -= timestamp - self.current_time
                    self.current_time = timestamp
                    continue

                self.current_time += current_player()["additional_time_left"]
                current_player()["additional_time_left"] = 0

                if current_player()["accuracy_time_left"] + self.current_time > timestamp:
                    current_player()["accuracy_time_left"] -= timestamp - self.current_time
                    self.current_time = timestamp
                    continue

                self.current_time += current_player()["accuracy_time_left"]
                current_player()["accuracy_time_left"] = 0
                auto_drop_piece()
            
        self._update("player_info", self.player_info)
        self._update("board_info", self.board.get_info())

    def _is_ready(self):
        for player_info in self.player_info:
            if player_info['user_id'] == -1:
                return False
        return True

class BattleFactory():
    @staticmethod
    def create_battle(start_timestamp, battle_info, board_type, db):
        return Battle(start_timestamp, battle_info, BoardFactory.createBoard(board_type), db=db)
    
    @staticmethod
    def load_battle(id, db):
        battle_data = db.find({"_id": id})
        battle_info = battle_data['battle_info']
        board = BoardFactory.createBoard(battle_data['board_info']['board_type'])
        for one_step in battle_data['board_info']['history']:
            if not board.try_drop_piece(one_step['player_id'], one_step['piece_id'], one_step['position']):
                return None #False
        battle = Battle(battle_info['create_time'], battle_info, board, player_info=battle_data['player_info'], db=db)
        return battle
            

        
default_offline_time = 15
class Battle:
    def __init__(self, timestamp, total_time, temp_time, board):
        self.board = board
        self.create_time = timestamp
        self.total_time = total_time
        self.temp_time = temp_time 

        self.started = False
        self.start_time = -1

        self.default_player_state = {"user_id": -1}
        self.player_state = [self.default_player_state for _ in range(4)]

    def try_join_player(self, timestamp, player_id, player_info):
        if self.player_state[player_id]["user_id"] != -1:
            return False

        self.player_state[player_id] = {
            "user_id": player_info["user_id"],
            "info": player_info,
            "join_time": timestamp,
            "last_active_time": timestamp,
            "time_left": self.total_time,
            "is_auto": False
        }
        if self._is_ready():
            self.started = True
            self.start_time = timestamp
        return True

    def remove_player(self, timestamp, player_id):
        if not self.started:
            self.player_state[player_id] = self.default_player_state
        else:
            self.player_state[player_id]['is_auto'] = True
            self.player_state[player_id]['last_active_time'] = timestamp

    def remove_auto(self, timestamp, player_id):
        self.player_state[player_id]['is_auto'] = False
        self.player_state[player_id]['last_active_time'] = timestamp

    def get_state(self, timestamp, player_id=-1):
        self._update_state(timestamp, player_id)
        return {
            "player_state": self.player_state,
            "board": self.board.get_state(),
            "battle_info":{
                "total_time": self.total_time,
                "temp_time": self.temp_time,
                "started": False
            }
        }

    def try_drop_piece(self, timestamp, player_id, piece_id, position):
        if not self.started:
            return False
        self._update_state(timestamp, player_id)
        return self.board.try_drop_piece(player_id, piece_id, position)

    def _update_state(self, timestamp, player_id):
        if player_id != -1:
            self.player_state[player_id]["last_active_time"] = timestamp
        for player_state in self.player_state:
            if player_state["last_active_time"] + default_offline_time < timestamp:
                pass
        # update player to auto if is left
        # if player to auto, auto drop it
        pass

    def _is_ready(self):
        for player_state in self.player_state:
            if player_state['user_id'] == -1:
                return False
        return True

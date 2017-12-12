default_offline_time = 200
class Battle:
    def __init__(self, timestamp, total_time, temp_time, board):
        self.board = board
        self.create_time = timestamp
        self.total_time = total_time
        self.temp_time = temp_time 

        self.started = False
        self.ended = False
        self.start_time = -1
        self.current_player = -1
        self.current_time = -1

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
            "total_time_left": self.total_time,
            "temp_time_left": self.temp_time,
            "is_auto": False
        }
        if self._is_ready():
            self.started = True
            self.start_time = timestamp
            self.current_time = timestamp
            self.current_player = 0
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
            "battle":{
                "current_player": self.current_player,
                "start_time": self.start_time,
                "total_time": self.total_time,
                "temp_time": self.temp_time,
                "started": self.started 
            }
        }

    def try_drop_piece(self, timestamp, player_id, piece_id, position):
        self._update_state(timestamp, player_id)

        if not self.started or self.ended or self.current_player != player_id:
            return False

        if self.board.try_drop_piece(player_id, piece_id, position):
            self.current_player = (self.current_player + 1) % 4
            self.ended = self.board.is_ended()
            return True
        else:
            return False

    def _current_player(self):
        return self.player_state[self.current_player]
    
    def _auto_drop_piece(self):
        self.board.auto_drop_piece(self.current_player)
        self.current_player += 1
        self.current_player %= 4
        self._current_player()['temp_time_left'] = self.temp_time

    # when one player is offline or self set, is_auto =
    # when one player's time run up or is_auto = true, will auto drop it
        # update player to auto if is left
        # if player to auto, auto drop it
    def _update_state(self, timestamp, player_id):
        for player_state in self.player_state:
            if player_state["last_active_time"] + default_offline_time < timestamp:
                player_state['is_auto'] = True

        if player_id != -1:
            self.player_state[player_id]["last_active_time"] = timestamp
        
        while self.current_time < timestamp and not self.ended:
            if self._current_player()["is_auto"]:
                self._auto_drop_piece()
            else:
                if self._current_player()["temp_time_left"] + self.current_time > timestamp:
                    self._current_player()["temp_time_left"] -= timestamp - self.current_time
                    self.current_time = timestamp
                    continue

                self.current_time += self._current_player()["temp_time_left"]
                self._current_player()["temp_time_left"] = 0

                if self._current_player()["total_time_left"] + self.current_time > timestamp:
                    self._current_player()["total_time_left"] -= timestamp - self.current_time
                    self.current_time = timestamp
                    continue

                self.current_time += self._current_player()["total_time_left"]
                self._current_player()["total_time_left"] = 0
                self._auto_drop_piece()

    def _is_ready(self):
        for player_state in self.player_state:
            if player_state['user_id'] == -1:
                return False
        return True

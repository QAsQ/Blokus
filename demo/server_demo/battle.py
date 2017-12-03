class Battle:
    def __init__(self, timestamp, board):
        self.board = board
        self.create_time = timestamp

        self.started = False
        self.start_time = -1

        self.default_player_state = {"id": -1}
        self.player_state = [self.default_player_state for _ in range(4)]

    def join_player(self, timestamp, player_id, player_info):
        self.player_state[player_id] = {
            "id": player_info.id,
            "info": player_info,
            "join_time": timestamp,
            "last_active_time": timestamp,
            "is_auto": False
        }
        if self._is_ready():
            self.started = True
            self.start_time = timestamp

    def remove_player(self, timestamp, player_id):
        if self.started:
            self.player_state[player_id] = self.default_player_state
        else:
            self.player_state[player_id]['is_auto'] = True
            self.player_state[player_id]['last_active_time'] = timestamp

    def remove_auto(self, timestamp, player_id):
        self.player_state[player_id]['is_auto'] = False
        self.player_state[player_id]['last_active_time'] = timestamp

    def get_current_state(self, timestamp, player_id):
        self._update_state(timestamp)
        return {
            "player_state": self.player_state,
            "board": self.board.get_state()
        }

    def try_drop_piece(self, timestamp, player_id, piece_id, piece_position):
        self._update_state(timestamp, player_id)
        self.board.try_drop_piece(piece_id, piece_position)

    def _update_state(self, timestamp):
        # update player to auto if is left
        #
        pass

    def _is_ready(self):
        for player_state in self.player_state:
            if player_state['id'] == -1:
                return False
        return True

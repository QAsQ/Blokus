import math
import json

class User(object):
    def __init__(self, rank, old_rating, index = -1):
        self.index = index,
        self.rank = float(rank)
        self.old_rating = int(old_rating)

class RatingCalculator(object):
    def __init__(self, users):
        self.user_list = []
        for user in users:
            self.user_list.append(User(user['rank'], user['rating'], user['index']))

    def cal_p(self, user_a, user_b):
        return 1.0 / (1.0 + pow(10, (user_b.old_rating - user_a.old_rating) / 400.0))

    def get_ex_seed(self, user_list, rating, own_user):
        ex_user = User(0.0, rating)
        result = 1.0
        for user in user_list:
            if user != own_user:
                result += self.cal_p(user, ex_user)
        return result

    def cal_rating(self, user_list, rank, user):
        left = 1
        right = 8000
        while right - left > 1:
            mid = int((left + right) / 2)
            if self.get_ex_seed(user_list, mid, user) < rank:
                right = mid
            else:
                left = mid
        return left

    def calculate(self):
        # Calculate seed
        for i in range(len(self.user_list)):
            self.user_list[i].seed = 1.0
            for j in range(len(self.user_list)):
                if i != j:
                    self.user_list[i].seed += self.cal_p(self.user_list[j], self.user_list[i])
        # Calculate initial delta and sum_delta
        sum_delta = 0
        for user in self.user_list:
            user.delta = int(
                (self.cal_rating(self.user_list, math.sqrt(user.rank * user.seed), user) - user.old_rating) / 2)
            sum_delta += user.delta
        # Calculate first inc
        inc = int(-sum_delta / len(self.user_list)) - 1
        for user in self.user_list:
            user.delta += inc
        # Calculate second inc
        self.user_list = sorted(self.user_list, key=lambda x: x.old_rating, reverse=True)
        s = min(len(self.user_list), int(4 * round(math.sqrt(len(self.user_list)))))
        sum_s = 0
        for i in range(s):
            sum_s += self.user_list[i].delta
        inc = min(max(int(-sum_s / s), -10), 0)
        # Calculate new rating
        for user in self.user_list:
            user.delta += inc
            user.new_rating = user.old_rating + user.delta
        self.user_list = sorted(self.user_list, key=lambda x: x.index)

def calculate_rating(players_info):
    user_info = []
    for player_id, player_info in enumerate(players_info):
        user_info.append({
            "player_id": player_id,
            "rating": player_info['user_data']['user_info']['rating'],
            "left" : player_info['battle_result']['left'],
            "index": player_id
        })
    
    user_info = sorted(user_info, key=lambda user_info: user_info["left"], reverse=True)
    for index, user in enumerate(user_info):
        if index == 0:
            user['rank'] = len(user_info)
        else:
            user['rank'] = user_info[index-1]["rank"] - (user['left'] != user_info[index-1]['left'])
    
    victory_rank = user_info[-1]['rank']
    user_info = sorted(user_info, key=lambda user_info: user_info['player_id'])

    calculator = RatingCalculator(user_info)
    calculator.calculate()
    res_list = []
    for user in calculator.user_list:
        res_list.append({
            "rating": user.new_rating,
            "delta": user.delta,
            "player_id": user.index,
            "victory": victory_rank == user.rank
        })
    return res_list
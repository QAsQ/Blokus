import math
import json

class User(object):
    def __init__(self, rank, old_rating, left, index = -1):
        self.index = index,
        self.rank = float(rank)
        self.left = int(left)
        self.old_rating = int(old_rating)

class RatingCalculator(object):
    def __init__(self, users):
        self.user_list = []
        for user in users:
            self.user_list.append(User(user['rank'], user['rating'], user['left'], user['index']))

    def cal_p(self, user_a, user_b):
        return 1.0 / pow(10, (user_b.old_rating - user_a.old_rating) / 1000.0)

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
        # Initialization
        number_of_people = len(self.user_list)
        if number_of_people < 2:
            return failure("The number of people mustn't less than 2.")
        for i in range(number_of_people):
            self.user_list[i].delta = 0
            
        # Calculate sum_dis and ave_dis
        self.user_list = sorted(self.user_list, key=lambda x: x.left)
        sum_dis = 0
        for i in range(number_of_people):
            for j in range(i+1,number_of_people):
                sum_dis += self.user_list[j].left - self.user_list[i].left
        ave_dis = sum_dis / (number_of_people * (number_of_people - 1) / 2)
        if ave_dis == 0:
            ave_dis = 1
            
        # Calculate multi
        multi = 20 / ave_dis * pow(2, 4 - number_of_people)

        # Calculate rating changes between every two people
        for i in range(number_of_people):
            for j in range(i+1,number_of_people):
                inc = int(multi * (self.user_list[j].left - self.user_list[i].left) * self.cal_p(self.user_list[j], self.user_list[i]))
                min_rating_change = 0 if self.user_list[i].left == self.user_list[j].left else 15
                inc = min(max(inc, min_rating_change), 100)
                self.user_list[i].delta += inc
                self.user_list[j].delta -= inc
                
        # Calculate new rating
        for user in self.user_list:
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

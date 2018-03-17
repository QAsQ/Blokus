import pymongo

def auth_db(db, db_config):
    if db_config['username'] is not None and db_config['password'] is not None:
        db.authenticate(db_config['name'], db_config['password'])

def init_generate(db, category_list):
    db_counter = db.counter.find_one({"_id": 0})
    counter = {}
    for category in category_list:
        if db_counter is None or category not in db_counter:
            counter[category] = 0

    if len(counter) == 0:
        return
    db.counter.update(
        {"_id": 0},
        { "$set": counter},
        upsert=(db_counter is None)
    )

def id_generate(db, category):
    value = db.counter.find_and_modify(
        query={"_id": 0}, 
        update={"$inc": {category: 1}}
    )
    return value[category]

def id_clear(data_list):
    ret = []

    for data in data_list:
        data.pop("_id")
        ret.append(data)

    return ret

def username_checker(db, username):
    return username == "" or db.users.find({"username": username}).count() != 0 

def sort_condition_generate(conditions):
    field_translate = {
        "left_position": "battle_info.left_position",
        "initiation_time": "battle_info.initiation_time",
        "board_progress": "board_info.board_progress"
    }
    mongo_condition = []

    for condition in conditions:
        try:
            order, field = condition.split(':')
        except:
            return "sort condition syntax error! condition: {}".format(condition)
        
        if field not in field_translate:
            return "sort condition not support! condition: {}".format(condition)
        field = field_translate[field]
        
        if order == 'd':
            mongo_condition.append((field, pymongo.DESCENDING))
        elif order == 'a':
            mongo_condition.append((field, pymongo.ASCENDING))
        else:
            return "sort condition order {} in condition {} error".format(order, condition)
        
    return mongo_condition

def filter_condition_generate(conditions):
    def state_filter(state):
        state_translate = {
            "unstarted": {
                "battle_info.started": False,
                "battle_info.ended": False
            },
            "ongoing": {
                "battle_info.started": True,
                "battle_info.ended": False
            },
            "ended": {
                "battle_info.started": True,
                "battle_info.ended": True 
            }
        }
        state_condition = []
        for one_state in state:
            state_condition.append(state_translate[one_state])
        return {
            "$or" : state_condition
        }
    
    def user_filter(username):
        user_condition = []
        for i in range(4):
            user_condition.append({
                "players_info.{}.user_data.username".format(i): username
            })
        return {
            "$or": user_condition
        }
    
    field_translate = {
        "battle_name": "battle_info.battle_name",
        "board_type": "board_info.board_type"
    }
    def is_empty(key, value):
        checker  = {
            "username": "",
            "battle_state": [],
            "battle_name": "",
            "board_type": "" 
        }
        return key in checker and checker[key] == value

    mongo_condition = []
    for key in conditions:
        if is_empty(key, conditions[key]):
            continue
        if key == "battle_state":
            mongo_condition.append(state_filter(conditions['battle_state']))
        elif key == "username":
            mongo_condition.append(user_filter(conditions['username']))
        else:
            if key not in field_translate:
                return "filter condition not support! condition: {}".format(key)
            mongo_condition.append({field_translate[key]: conditions[key]})

    if len(mongo_condition) == 0:
        return {}
    
    if len(mongo_condition) == 1:
        return mongo_condition[0]

    return {
        "$and": mongo_condition
    }
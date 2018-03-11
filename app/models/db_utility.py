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
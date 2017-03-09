class user(object):
    def __init__(self,name):
        self.name = name;

    def get_id(self):
        return int(self.name[-1:0]);



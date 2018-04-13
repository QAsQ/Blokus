def ThemeFactory(theme, board_type):
    data = {
        ("default", "square_standard"): {
            "backgroundColor": 0xf2f0f1,
            "board": {
                "dividing_line": 0xffffff,
                "dividing_line_width": [3, 1],
                "frame": 0xe6eae9,
                "progress_bar":{
                    "bar_width": [7, 2],
                    "accuracy": [0xed1c24, 0x23b14d, 0x00a2e8, 0xffc90d],
                    "additional": 0xa1a3a4,
                    "particles": {
                        "accuracy": [0xcf1b24, 0x239546, 0x5d92b1, 0xD69723],
                        "additional": 0xa1a3a4
                    }
               }
            },
            "piece": {
                "initial_alpha": 0.4,
                "onselect_alpha": 0.8,
                "dropped_alpha": 1,
                "controller":{
                    "control_parts":{
                        "initial_alpha": 0.3,
                        "active_alpha": 1,
                        "color": 0x333333
                    },
                    "body": {
                        "alpha": 0.1,
                        "color": 0x333333
                    }
                } , 
                "shadow": 0x949293,
                "spectator": 0xb7b7b7,
                "dividing_line": 0xffffff,
                "dividing_line_width": [3, 1],
                #"cell": [0xf2542d,0x80ba04, 0x1da6f0, 0xfeb923],
                "cell": [0xf2542d, 0x36a850, 0x1da6f0, 0xfeb923],
                "initial":[0xcf1b24, 0x239546, 0x006BA3, 0xD69723],
                "last_drop": [0xcf1b24, 0x239546, 0x006BA3, 0xD69723]
            }
        },

        ("default", "square_duo"): {
            "backgroundColor": 0xf2f0f1,
            "board": {
                "dividing_line": 0xffffff,
                "dividing_line_width": [3, 1],
                "frame": 0xe6eae9,
                "progress_bar":{
                    "bar_width": [7, 2],
                    "accuracy": [0xed1c24, 0x00a2e8],
                    "additional": 0xa1a3a4,
                    "particles": {
                        "accuracy": [0xcf1b24, 0x5d92b1],
                        "additional": 0xa1a3a4
                    }
               }
            },
            "piece": {
                "initial_alpha": 0.4,
                "onselect_alpha": 0.8,
                "dropped_alpha": 1,
                "controller":{
                    "control_parts":{
                        "initial_alpha": 0.3,
                        "active_alpha": 1,
                        "color": 0x333333
                    },
                    "body": {
                        "alpha": 0.1,
                        "color": 0x333333
                    }
                } , 
                "shadow": 0x949293,
                "spectator": 0xb7b7b7,
                "dividing_line": 0xffffff,
                "dividing_line_width": [3, 1],
                "cell": [0xf2542d, 0x1da6f0],
                "initial":[0xcf1b24, 0x006BA3],
                "last_drop": [0xcf1b24, 0x006BA3]
            }
        },

        ("default", "trigon_trio"): {
            "backgroundColor": 0xf2f0f1,
            "board": {
                "dividing_line": 0xffffff,
                "dividing_line_width": [3, 1],
                "frame": 0xe6eae9,
                "progress_bar":{
                    "bar_width": [7, 2],
                    "accuracy": [0xed1c24, 0x23b14d, 0x00a2e8],
                    "additional": 0xa1a3a4,
                    "particles": {
                        "accuracy": [0xcf1b24, 0x239546, 0x5d92b1],
                        "additional": 0xa1a3a4
                    }
               }
            },
            "piece": {
                "initial_alpha": 0.4,
                "onselect_alpha": 0.8,
                "dropped_alpha": 1,
                "controller":{
                    "control_parts":{
                        "initial_alpha": 0.3,
                        "active_alpha": 1,
                        "color": 0x333333
                    },
                    "body": {
                        "alpha": 0.1,
                        "color": 0x333333
                    }
                } , 
                "shadow": 0x949293,
                "spectator": 0xb7b7b7,
                "dividing_line": 0xffffff,
                "dividing_line_width": [3, 1],
                #"cell": [0xf2542d,0x80ba04, 0x1da6f0, 0xfeb923],
                "cell": [0xf2542d, 0x36a850, 0x1da6f0],
                "initial":[0xcf1b24, 0x239546, 0x006BA3],
                "last_drop": [0xcf1b24, 0x239546, 0x006BA3]
            }
        },
    }
    if (theme, board_type) not in data:
        return "theme in {} board type {} not exist".format(theme, board_type)
    
    return data[(theme, board_type)]
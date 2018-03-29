function show_message(message) {
    $("#hit_nag_message").text(message)
    $("#hit_nag").nag('show')
    $("#hit_nag").nag('clear')
}

Vue.component("user-item", {
    props: ['user'],
    template: `
        <div>
            <a v-show="!logged" class="ui labeled icon teal button" href="javascript:void(0)" onclick="$('#login').modal('show')">
                <i class="sign in icon"></i>
                登录</a>
            <a v-show="!logged" class="ui labeled icon teal button" href="javascript:void(0)" onclick="$('#email').modal('show')">
                <i class="add user icon"></i>
                注册</a>
            <a v-show="logged" class="ui basic black right labeled icon dropdown">
                <div class="text">{{user.username}}</div>
                <i class="dropdown icon"></i>
                <div class="menu">
                    <a class="item" :href="my_index"><i class="user icon"></i>我的主页</a>
                    <a class="item" :href="setting"><i class="setting icon"></i>设置</a>
                    <div class="item" v-on:click="logout"><i class="sign out icon"></i>退出</div>
                </div>
            </a>
        </div>`,
    methods: {
        logout: function () {
            $.ajax({
                type: "DELETE",
                url: "/api/users/online",
                success: function (data) {
                    if (data.message == "success") {
                        show_message("退出登录成功")
                        user_item.user = Object.assign(user_item.user, data.result)
                    } else {
                        show_message(data.message)
                    }
                },
                error: function (data) {
                    show_message("请求失败，请检查网络连接")
                }
            })
        }
    },
    computed: {
        logged: function () {
            return this.user.user_id !== -1
        },
        my_index: function () {
            return "/users?user_id=" + this.user.user_id
        },
        setting: function () {
            return "/user_setting?user_id=" + this.user.user_id
        }
    }
});

Vue.component("user-data", {
    props: ['user'],
    template: `
    <div class="ui centered grid">
        <div class="row">
            <h1 style="font-size: 8em"> {{user.username}} </h1>
        </div>
        <div class="segment">
            <div class="ui statistic">
                <div class="value">
                    {{rate_of_victory}}
                </div>
                <div class="label">胜率</div>
            </div>
            <div class="ui huge statistic">
                <div class="value">
                    {{user.user_info.rating}}
                </div>
                <div class="label">rating</div>
            </div>
            <div class="ui statistic">
                <div class="value">
                    {{user.user_info.number_of_victory}}
                </div>
                <div class="label">获胜场次</div>
            </div>
            <div class="ui statistic">
                <div class="value">
                    {{user.user_info.number_of_battles}}
                </div>
                <div class="label">总场次</div>
            </div>
        </div>
    </div>`,
    computed: {
        rate_of_victory: function () {
            return (this.user.user_info.rate_of_victory * 100).toFixed(2) + "%"
        }
    }
})

function try_join(player_id) {
    if (!check_login()) return
    $.post("/api/battles/" + battle_interface.battle_data.battle_id + "/players/" + player_id, {}, function (data) {
        if (data.message != "success") {
            show_message(data.message)
            return
        }
        battle_interface.battle_data = data.result
    })
}

function try_leave(player_id, call_back) {
    if (!check_login()) return
    $.ajax({
        method: "delete",
        url: "/api/battles/" + battle_interface.battle_data.battle_id + "/players/" + player_id,
        success: function (data) {
            if (data.message != "success") {
                show_message(data.message)
                return
            }
            battle_interface.battle_data = data.result
            if (typeof (call_back) != "undefined")
                call_back()
        },
        error: function (data) {
            if (typeof (call_back) != "undefined")
                call_back()
        }
    })
}

Vue.component("playerinfo-item", {
    props: ['player_info', 'item_id', 'player_id', 'ended', 'description_type'],
    template: `
        <div class="item" 
            :class="{link: !occupied}" 
            @mouseenter="dimmer('show')"
            @mouseleave="dimmer('hide')"
            @click="change">
            <img class="ui avatar image" :src="image_path">
            <div class="content">
                <div class="header">{{user_name}}</div>
                <div class='description'>{{description}}</div>
            </div>
            <div class="ui dimmer" :id="'playerinfo_item_' + item_id" @click="operator">
                <div class="content">
                    {{player_id !== -1 ? '离开': '加入'}}
                    <i class="ui icon" :class="{close: player_id !== -1}"></i>
                </div> 
            </div>
        </div>`,
    methods: {
        operator: function () {
            this.dimmer('hide')
            if (this.player_id === -1) {
                if (this.occupied)
                    return
                try_join(this.item_id)
            } else {
                try_leave(this.item_id)
            }
        },
        change: function () {
            if (this.occupied)
                return
            if (this.player_id != this.item_id && this.player_id !== -1) {
                try_leave(this.player_id)
                try_join(this.item_id)
            }

        },
        dimmer: function (argument) {
            if (argument != "hide" && (
                    (this.player_id != -1 && this.item_id != this.player_id) ||
                    this.ended || this.occupied))
                return
            $("#playerinfo_item_" + this.item_id).dimmer(argument);
        }
    },
    computed: {
        occupied: function () {
            return this.ended || (this.player_info.user_id != -1 && this.item_id != this.player_id)
        },
        user_name: function () {
            if (this.player_info.user_id == -1)
                return ""
            return this.player_info.user_data.username
        },
        image_path: function () {
            return "static/common/images/player/" + (1 << this.item_id) + '.jpg'
        },
        description: function () {
            if (this.player_info.user_id == -1)
                return "";
            if (this.description_type == "winning_rate") {
                if (this.ended) {
                    head_char = ""
                    if (this.player_info.battle_result.rating_delta > 0)
                        head_char = "+"
                    return "Rating " + head_char + this.player_info.battle_result.rating_delta
                }
                return "胜率:" + (this.player_info.user_data.user_info.rate_of_victory * 100).toFixed(2) + "%"
            } else if (this.description_type == "battle_state") {
                if (this.ended)
                    return "剩余: " + this.player_info.battle_result.left + " 块"
                return this.player_info.is_hosting ? "托管中" : "在线"
            }
        }
    }
});

Vue.component("playerinfo-list", {
    props: ['players_info', 'ended'],
    template: `
        <div class='ui big list'>
            <playerinfo-item v-for="(player_info, index) in players_info" :key="index"
                :item_id="index"
                :player_id="-1"
                :player_info="player_info"
                :ended="ended"
                description_type="winning_rate">
            </playerinfo-item>
        </div>`
});

Vue.component("battle-info", {
    props: ['battle_info', 'board_info'],
    template: `
        <div class="ui fluid card">
            <div class="ui image">
                <img src="static/common/images/standard.png">
            </div>
            <div class="content">
                <div class="header">{{battle_type}}</div>
                <div class="meta">
                    <span class="date">{{start_state}}</span>
                </div>
                <div class="description">
                    对局进程: {{(board_info.board_progress * 100).toFixed(2)}}%
                </div>
            </div>
            <div class="extra content">
                <div class="header">对局信息</div>
                限时: {{ accuracy_time }}<br>
                每步额外限时: {{ additional_time }}<br>
                预计剩余时间: {{ remaining_time }}
            </div>
        </div>`,
    methods: {
        format_time: function (second) {
            let minute = Math.ceil(second / 60);
            if (minute < 60)
                return minute + "分钟";
            let hour = Math.ceil(second / 60);
            if (hour < 24)
                return hour + "小时";
            let day = Math.ceil(hour / 24);
            return day + "天";
        }
    },
    computed: {
        battle_type: function () {
            var battletype_translate = {
                standard: "四人对局"
            }
            return battletype_translate[this.board_info.board_type]
        },
        start_state: function () {
            if (!this.battle_info.started)
                return "未开始";
            else
                return "开始于" + this.format_time(
                    (Math.ceil(new Date().valueOf() / 1000) - this.battle_info.start_time)) + "前"
        },
        accuracy_time: function () {
            return this.battle_info.accuracy_time + "s"
        },
        additional_time: function () {
            return this.battle_info.additional_time + "s"
        },
        remaining_time: function () {
            return "暂未实现"
        }
    }
});

Vue.component("battle-item", {
    props: ['battle_data'],
    template: `
        <div class="item" v-on:click="goto_battle">
            <div class="ui image" name="head">
                <img class="ui avatar image" :src="image_path">
            </div>
            <div class="content">
                <div class="ui header" name="content"> {{battle_data.battle_info.battle_name}} </div>
                <div class="ui popup">
                    <battle-info :battle_info="battle_data.battle_info" :board_info="battle_data.board_info">
                    </battle-info>
                </div>
            </div>
            <div class="ui popup">
                <div class='header'>用户信息</div>
                <playerinfo-list 
                    :players_info="battle_data.players_info" 
                    :ended="battle_data.battle_info.ended">
                </playerinfo-list>
            </div>
        </div>`,
    methods: {
        goto_battle: function () {
            window.open("/battle?battle_id=" + this.battle_data.battle_id)
        }
    },
    computed: {
        image_path: function () {
            if (this.battle_data.battle_info.ended)
                return "static/common/images/battle/ended.jpg"
            state = 0
            for (var id = 0; id < 4; id++)
                if (this.battle_data.players_info[id].user_id !== -1)
                    state |= 1 << id
            return "static/common/images/battle/" + state + ".jpg"
        }
    }
});

Vue.component("battle-list", {
    props: ['battles_data', 'ended'],
    template: `
        <div class="ui huge divided selection list">
            <battle-item v-for="(battle_data, index) in battles_data"  :key="index"
                :battle_data="battle_data">
            </battle-item>
            <div class="ui horizontal divider" v-if="ended"> 我是有底线的 </div>
        </div>`,
    updated: function () {
        $('[name="head"]').popup({
            inline: true
        });
        $('[name="content"]').popup({
            inline: true
        });
        var width = document.body.clientWidth
        if (width > 767)
            $('.ui.sticky').sticky({
                offset: 50,
                context: '#battle_list'
            });
    }
});

Vue.component("playerinfo-table", {
    props: ['players_info', 'ended', 'player_id'],
    template: `
    <div class="ui vertical segment" @click="show_result">
        <div class="left aligned attached ui two item menu">
            <playerinfo-item 
                :player_info="players_info[0]" 
                :item_id="0" 
                :player_id="player_id" 
                :ended="ended"
                description_type="battle_state">
            </playerinfo-item>
            <playerinfo-item 
                :player_info="players_info[3]" 
                :item_id="3" 
                :player_id="player_id" 
                :ended="ended"
                description_type="battle_state">
            </playerinfo-item>
        </div>
        <div class="left aligned attached ui two item menu">
            <playerinfo-item 
                :player_info="players_info[1]" 
                :item_id="1" 
                :player_id="player_id" 
                :ended="ended"
                description_type="battle_state">
            </playerinfo-item>
            <playerinfo-item 
                :player_info="players_info[2]" 
                :item_id="2" 
                :player_id="player_id" 
                :ended="ended"
                description_type="battle_state">
            </playerinfo-item>
        </div>
    </div>`,
    methods: {
        show_result: function () {
            if (this.ended)
                $("#result_modal").modal("show")
        }
    }

});

Vue.component("chat-item", {
    props: ['chat_log'],
    template: `
        <div class="comment">
            <div class="content">
                <div class="inline author">{{chat_log.username}}
                    <div class="metadata">
                        <span class="date">{{time_format}}</span>
                    </div>
                </div>
                <div class="text">{{chat_log.content}}</div>
            </div>
        </div>`,
    computed: {
        time_format: function () {
            var date = new Date(this.chat_log.timestamp * 1000)
            return date.getHours() + ":" + date.getMinutes()
        }
    }
})

Vue.component("chat-box", {
    props: ['chat_logs'],
    template: `
        <div class="ui segment">
            <div class="ui horizontal chat-box" id="chat_box" @scroll="update_bottom">
                <div class="ui comments">
                    <chat-item v-for="(chat_log, index) in chat_logs" :chat_log="chat_log" :key="index"></chat-item>
                </div>
            </div>
            <div class="ui divider"></div>
            <div class="ui fluid icon input">
                <input type="text" id='input_box' @keydown.enter="send_message" @focus="$emit('focus_input')">
                <i class="inverted circular send link teal icon" @click="send_message"></i>
            </div>
        </div>`,
    data: function () {
        return {
            "bottom": true
        }
    },
    mounted: function () {
        this.roll_to_bottom()
    },
    updated: function () {
        var chat_box = $("#chat_box")
        if (this.bottom)
            this.roll_to_bottom()
    },
    methods: {
        update_bottom: function () {
            var chat_box = $("#chat_box")
            this.bottom = chat_box[0].scrollTop + chat_box.height() >= chat_box[0].scrollHeight
        },
        send_message: function () {
            var self = this
            if (!check_login())
                return
            var content = $("#input_box").val()
            if (content == "")
                return
            var battle_id = battle_interface.battle_data.battle_id
            var url = "/api/battles/" + battle_id + "/chat_logs"
            $.ajax({
                type: "POST",
                url: url,
                data: JSON.stringify({
                    "content": content,
                    require: battle_interface.generate_require()
                }),
                contentType: 'application/json; charset=UTF-8',
                success: function (data) {
                    if (data.message == "success") {
                        battle_interface.update_battle_data(data.result)
                        self.roll_to_bottom()
                        $("#input_box").val("")
                    } else {
                        show_message(data.message)
                    }
                },
                error: function (data) {
                    show_message("请求失败，请检查网络连接")
                }
            })
        },
        roll_to_bottom: function () {
            this.bottom = true
            $('#chat_box').scrollTop($('#chat_box')[0].scrollHeight)
        }
    }
});

Vue.component("control-panel", {
    props: ['battle_data', 'player_id', 'current_position'],
    template: `
        <div class="ui four wide column">
            <chat-box :chat_logs="battle_data.chat_logs" @focus_input="$emit('focus_input')"></chat-box>
            <div v-if="!battle_data.battle_info.ended" class="ui teal fluid button" 
                :class="{disabled: !can_hosting, loading: loading, active: hosting}"
                @mousedown="update_hosting"
                id="hosting_button">
                {{ hosting ? "取消托管": "托管"}}
            </div>
            <div v-if="battle_data.battle_info.ended" class="ui teal fluid buttons">
                <button class="ui button" :class="{disabled: !can_backward}" @click="$emit('move', -2)"><i class="fast backward icon"></i></button>
                <button class="ui button" :class="{disabled: !can_backward}" @click="$emit('move', -1)"><i class="step backward icon"></i></button>
                <button class="ui button" :class="{disabled: !can_forward}" @click="$emit('move', 1)"><i class="step forward icon"></i></button>
                <button class="ui button" :class="{disabled: !can_forward}" @click="$emit('move', 2)"><i class="fast forward icon"></i></button>
            </div>

            <div class="ui tiny modal" id="result_modal">
                    <div class="ui huge header ">
                        对局结果
                    </div>
                    <div class="content">
                    <table class="ui very basic selectable  single line table">
                        <thead>
                            <tr> <th>排名</th> <th>用户</th> <th>剩余</th> <th>Rating 更新</th></tr>
                        </thead>
                        <tbody>
                            <tr v-for="result in battle_result">
                                <td> {{result.rank}} </td>
                                <td>
                                    <h4 class="ui image header">
                                        <img :src="'static/common/images/player/' + (1 << result.player_id) + '.jpg'" class="ui mini rounded image">
                                        <div class="content">
                                            {{result.username}}
                                        </div>
                                    </h4>
                                </td>
                                <td>{{result.left}}</td>
                                <td>{{result.rating_state}}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
                <div class="actions">
                    <div class="ui ok teal button">
                        <i class="checkmark icon"></i>
                        确定
                    </div>
                </div>
            </div>

            <playerinfo-table 
                :player_id="player_id"
                :ended="battle_data.battle_info.ended"
                :players_info="battle_data.players_info">
            </playerinfo-table>
            <div class="ui fluid negative button" @click="leave">离开</div>
        </div> `,
    data: function () {
        return {
            loading: false
        }
    },
    watch: {
        "battle_data.battle_info.ended": function () {
            $("#result_modal").modal("show")
        }
    },
    methods: {
        detach: function () {
            this.b
        },
        update_hosting: function () {
            this.loading = true
            control_panel = this
            target_url = "/api/battles/" + this.battle_data.battle_id + "/players/" + this.player_id + "/hosting"
            $.ajax({
                type: control_panel.hosting ? "DELETE" : "POST",
                url: target_url,
                success: function (data) {
                    control_panel.loading = false
                    if (data.message == "success") {
                        battle_interface.battle_data = data.result
                    } else {
                        show_message(data.message)
                    }
                },
                error: function (data) {
                    control_panel.loading = false
                    show_message("请求失败，请检查网络连接")
                }
            })
        },
        leave: function () {
            if (this.player_id !== -1)
                try_leave(this.player_id, window.close)
            else
                window.close()
        }
    },
    computed: {
        can_hosting: function () {
            return !this.battle_data.battle_info.ended &&
                !this.loading &&
                this.player_id != -1
        },
        can_leave: function () {
            return this.player_id != -1
        },
        can_forward: function () {
            return this.current_position < this.battle_data.board_info.history.length
        },
        can_backward: function () {
            return this.current_position > 0
        },
        hosting: function () {
            if (this.player_id == -1)
                return false
            return this.battle_data.players_info[this.player_id]['is_hosting']
        },
        battle_result: function () {
            if (!this.battle_data.battle_info.ended) {
                var result = []
                for (var player_id = 0; player_id < 4; player_id++) {
                    result.push({
                        player_id: player_id,
                        username: "null",
                        rating_state: "none",
                        score: -1,
                        left: -1,
                        rank: 0
                    })
                }
                return result
            }

            function rating_state(rating, delta) {
                head_char = ""
                if (delta >= 0)
                    head_char = "+"
                return rating + "(" + head_char + delta + ")"
            }
            var result = []
            for (var player_id = 0; player_id < 4; player_id++) {
                var current_player = this.battle_data.players_info[player_id]
                result.push({
                    player_id: player_id,
                    username: current_player.user_data.username,
                    score: current_player.battle_result.score,
                    rating_state: rating_state(
                        current_player.battle_result.updated_rating,
                        current_player.battle_result.rating_delta
                    ),
                    left: current_player.battle_result.left
                })
            }

            result = result.sort(function (a, b) {
                return b.score - a.score
            })
            for (var player_id = 0; player_id < 4; player_id++) {
                if (player_id === 0)
                    result[player_id].rank = 1
                else {
                    result[player_id].rank = result[player_id - 1].rank + (result[player_id].left !== result[player_id - 1].left)
                }
            }
            return result
        }
    }
});

Vue.component("battle-progress", {
    props: ['running', 'board_progress'],
    template: `
        <div class="ui small progress"
            :class="{disabled: !running, gray: !running, teal: running}"
            :data-percent="board_progress" id="battle_progress">
            <div class="bar">
                <div class="progress"></div>
            </div>
        </div>`,
    watch: {
        "board_progress": function () {
            $("#battle_progress").progress("set percent", this.board_progress)
        }
    }
})

Vue.component("battle-interface", {
    props: ['board_data', 'battle_data', 'user_info'],
    template: `
        <div class="ui grid container stackable">
            <div class="ui center aligned eleven wide column">
                <div class="ui segment" id="board_container">
                    <canvas id="board" :height="board_height" :width="board_width"></canvas>
                </div>
                <battle-progress
                    :running="running"
                    :board_progress="board_progress">
                </battle-progress>
            </div>
            <control-panel 
                :battle_data="battle_data" 
                :player_id="player_id" 
                :current_position="current_position"
                @focus_input="board_detach_active_piece"
                @move="move"> 
            </control-panel>
        </div>`,
    data: function () {
        return {
            "current_position": this.battle_data.battle_info.ended ? this.battle_data.board_info.history.length : -1
        }
    },
    mounted: function () {
        this.board = generateBoard($("#board")[0], this.player_id, this.board_data, ColorThemeFactory("default"),this.mobile_version);
        this.board.loadState(this.battle_data, this.current_position)
    },
    methods: {
        board_detach_active_piece: function () {
            this.board.detach()
        },
        move: function (step) {
            var bound = [0, this.battle_data.board_info.history.length]
            if (Math.abs(step) === 1) {
                this.current_position += step
                this.current_position = Math.max(bound[0], this.current_position)
                this.current_position = Math.min(bound[1], this.current_position)
            } else {
                this.current_position = step > 0 ? bound[1] : bound[0]
            }
            this.board.loadState(this.battle_data, this.current_position)
        }
    },
    watch: {
        'battle_data.battle_info.ended': function () {
            this.current_position = this.battle_data.board_info.history.length
        },
        'battle_data.board_info': {
            handler() {
                this.board.loadState(this.battle_data, this.current_position)
            },
            deep: true
        },
        'player_id': function () {
            this.board.update_player(this.player_id)
        }
    },
    computed: {
        running: function () {
            return this.battle_data.battle_info.started &&
                !this.battle_data.battle_info.ended
        },
        board_progress: function () {
            return 100 * this.battle_data.board_info.board_progress
        },
        board_width: function () {
            var width = document.body.clientWidth
            if (width > 767)
                return 700
            else
                return width - 50
        },
        board_height: function () {
            var width = document.body.clientWidth
            if (width > 767)
                return 646
            else
                return document.body.clientHeight - 150

        },
        player_id: function () {
            if (this.user_info.user_id === -1)
                return -1
            for (var id = 0; id < this.battle_data.players_info.length; id++)
                if (this.user_info.user_id === this.battle_data.players_info[id].user_id)
                    return id
            return -1
        },
        mobile_version: function(){
            return document.body.clientWidth < 767
        }
    }
});

Vue.component("battle-condition", {
    props: ['condition'],
    template: `
    <form class="ui form">
        <h1><i class="filter icon"></i>筛选</h1>
        <div class="field">
            <label>按对局状态</label>
            <div class="three fields">
                <div class="field">
                    <div class="ui segment">
                        <div class="ui toggle checkbox">
                            <input type="checkbox" 
                                tabindex="0" 
                                value="unstarted" 
                                v-model="condition.query.battle_state">
                            <label><i class="hourglass start icon"></i>未开始</label>
                        </div>
                    </div>
                </div>
                <div class="field">
                    <div class="ui segment">
                        <div class="ui toggle checkbox">
                            <input type="checkbox" 
                                tabindex="0" 
                                value="ongoing"
                                v-model="condition.query.battle_state">
                            <label><i class="hourglass half icon"></i>进行中</label>
                        </div>
                    </div>
                </div>
                <div class="field">
                    <div class="ui segment">
                        <div class="ui toggle checkbox">
                            <input type="checkbox" 
                                tabindex="0" 
                                value="ended" 
                                v-model="condition.query.battle_state">
                            <label><i class="hourglass end icon"></i>已结束</label>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <div class="two fields">
            <div class="field" id="username_condition">
                <label><i class="user icon"></i>按参与用户</label>
                <div class="ui input">
                    <input v-model="condition.query.username" type="text" placeholder="用户名">
                </div>
            </div>
            <div class="field">
                <label><i class="chess board icon"></i>按对局名</label>
                <div class="ui input">
                    <input v-model="condition.query.battle_name" type="text" placeholder="对局名称">
                </div>
            </div>
        </div>
        <div class="field">
            <label>按对局类型</label>
            <select id="board_type" class="ui fluid selection dropdown" v-model="condition.query.board_type">
                <option value="">对局类型</option>
                <option class="item" value="square_standard">标准(四人)</option>
            </select>
        </div>
        <h1><i class="sort icon"></i>排序</h1>
        <select id="sort_condition" class="ui fluid dropdown multiple" v-model="condition.sort">
            <option value="">默认顺序</option>
            <option value="d:left_position">
                <i class="sort amount down icon"></i>
                剩余位置
            </option>
            <option value="d:initiation_time">
                <i class="sort amount down icon"></i>
                起始时间
            </option>
            <option value="d:board_progress">
                <i class="sort amount down icon"></i>
                对局进程
            </option>
            <option value="a:left_position">
                <i class="vertically flipped sort amount up icon"></i>
                剩余位置
            </option>
            <option value="a:initiation_time">
                <i class="vertically flipped sort amount up icon"></i>
                起始时间
            </option>
            <option value="a:board_progress">
                <i class="vertically flipped sort amount up icon"></i>
                对局进程
            </option>
        </select>
        </div>
        <div class="ui divider"></div>
        <div class="ui red fluid button" @click="reset_condition"> 
            <i class="erase icon"></i> 清空条件
        </div>
    </form>`,
    mounted: function () {
        if (this.condition.sort !== [])
            $("#sort_condition").dropdown("set selected", this.condition.sort)
        $('#board_type').dropdown();
    },
    methods: {
        reset_condition: function () {
            this.condition = Object.assign(this.condition, {
                sort: [],
                query: {
                    username: "",
                    battle_state: [],
                    battle_name: "",
                    board_type: ""
                }
            })
            $("#sort_condition").dropdown("clear")
        }
    },
    watch: {
        "condition.sort": function () {
            $("#sort_condition").dropdown("set selected", this.condition.sort);
        },
        "condition": {
            handler() {
                $("#username_condition").removeClass("error")
                var res = load_battles()
                if (res === "user not exist") {
                    $("#username_condition").addClass("error")
                } else if (res !== "success") {
                    show_message(res)
                }
            },
            deep: true
        }
    }
});

Vue.component("battle-creater", {
    props: ["parameter", "timer_scheme"],
    template: `
        <div class="ui two column grid">
            <div class="ui six width column">
                <form class="ui form" id='create_form'>
                    <div class="two fluid fields">
                        <div class="field">
                            <label>对局名称</label>
                            <input v-model="parameter.battle_name" type="text" name="battle_name" placeholder="名称长度小于20">
                        </div>
                        <div class="field">
                            <label>对局类型</label>
                            <select 
                                name="board_type"
                                class="ui fluid selection dropdown" 
                                v-model="parameter.board_type" 
                                id="board_type_selector">

                                <option value="">对局类型</option>
                                <option class="item" value="square_standard">标准(四人)</option>
                            </select>
                        </div>
                    </div>
                    <div class="ui divider"></div>
                        <div class="ui vertical segment">
                            <div class="field" name="timing_plan">
                                <label>计时类型</label>
                                <select v-model="timer_identity" class="ui basic inline dropdown" id="timer_type_selector">
                                    <option v-for="scheme in timer_scheme" 
                                        :value="scheme.identity">
                                        {{scheme.name}}
                                    </option>
                                    <option value="custom">自定义</option>
                                </select>
                            </div>
                            <div class="two fields">
                                <div class="field">
                                    <label>计时</label>
                                    <div class="ui right labeled input">
                                        <input v-model.number="parameter.accuracy_time" type="text" name="accuracy_time">
                                        <a class="ui basic label">秒</a>
                                    </div>
                                </div>
                                <div class="field">
                                    <label>额外</label>
                                    <div class="ui right labeled input">
                                        <input v-model.number="parameter.additional_time" type="text" name="additional_time">
                                        <a class="ui basic label">秒/步</a>
                                    </div>
                                </div>
                            </div>
                            <h4>预计游戏时间: {{expect_time}}</h4>
                        </div> 
                    </timer-scheme-selector>
                    <div class="ui error message" id="create_message"></div>
                </form>
            </div>
            <div class="ui column">
                <img class="ui middle image" src="static/common/images/standard.png">
            </div>
        </div>`,
    data: function () {
        return {
            timer_identity: 'custom',
        }
    },
    mounted: function () {
        this.update_timer_identity()
        $('#timer_type_selector').dropdown()
        $('#board_type_selector').dropdown()
        $("#create_form").form({
            fields: {
                battle_name: {
                    identifier: 'battle_name',
                    rules: [{
                            type: 'empty',
                            prompt: '对局名称不能为空'
                        },
                        {
                            type: 'maxLength[20]',
                            prompt: '对局名称长度要短于20'
                        }
                    ]
                },
                accuracy_time: {
                    identifier: 'accuracy_time',
                    rules: [{
                            type: 'empty',
                            prompt: '计时不能为空'
                        },
                        {
                            type: 'integer[1..]',
                            prompt: '计时必须大于1秒'
                        },
                        {
                            type: 'integer[0..3600]',
                            prompt: '计时必须小于3600秒'
                        }
                    ]
                },
                additional_time: {
                    identifier: 'additional_time',
                    rules: [{
                            type: 'empty',
                            prompt: '额外用时不能为空'
                        },
                        {
                            type: 'integer[1..]',
                            prompt: '额外用时必须大于1秒'
                        },
                        {
                            type: 'integer[0..3600]',
                            prompt: '额外用时必须小于3600秒'
                        }
                    ]
                }
            },
            onSuccess: function () {
                form = $("#create_form")
                form.addClass("loading")

                data = form.form("get values")
                data.accuracy_time = parseInt(data.accuracy_time)
                data.additional_time = parseInt(data.additional_time)
                $.ajax({
                    type: "POST",
                    url: "/api/battles",
                    data: JSON.stringify(data),
                    contentType: 'application/json; charset=UTF-8',
                    async: false,
                    success: function (data) {
                        form.removeClass("loading")
                        if (data.message == "success") {
                            form.removeClass("loading")
                            $("#create_modal").modal("hide");
                            window.open("/battle?battle_id=" + data.result.id);
                        } else {
                            form
                                .removeClass("success")
                                .addClass("error")
                            $("#create_message").text(data.message)
                        }
                    },
                    error: function (data) {
                        form
                            .removeClass("loading")
                            .removeClass("success")
                            .addClass("error")
                        $("#create_message").text("请求失败")
                    }
                })
            }
        })
    },
    methods: {
        update_timer_identity: function () {
            for (var id = 0; id < this.timer_scheme.length; id++) {
                if (this.timer_scheme[id].additional_time === this.parameter.additional_time &&
                    this.timer_scheme[id].accuracy_time === this.parameter.accuracy_time) {
                    this.timer_identity = this.timer_scheme[id].identity
                    $('#timer_type_selector').dropdown("set selected", this.timer_scheme[id].identity)
                    return
                }
            }
            this.timer_identity = "custom"
            $('#timer_type_selector').dropdown("set selected", 'custom')
        }
    },
    watch: {
        "timer_identity": function () {
            if (this.timer_identity === "custom")
                return true
            for (var id = 0; id < this.timer_scheme.length; id++) {
                if (this.timer_scheme[id].identity == this.timer_identity) {
                    this.parameter.accuracy_time = this.timer_scheme[id].accuracy_time
                    this.parameter.additional_time = this.timer_scheme[id].additional_time
                    return true
                }
            }
            console.log("ERROR! unknow identity " + this.timer_identity)
        },
        "parameter.accuracy_time": function () {
            this.update_timer_identity()
        },
        "parameter.additional_time": function () {
            this.update_timer_identity()
        }
    },
    computed: {
        expect_time: function () {
            second = (this.parameter.accuracy_time + this.parameter.additional_time * 21) * 4
            var minute = Math.ceil(second / 60)
            if (minute < 60)
                return minute + "分钟"
            var hour = Math.ceil(minute / 60)
            if (hour < 24)
                return hour + "小时"
            var day = Math.ceil(hour / 24)
            return day + "天"
        }
    }
})

Vue.component("rank-list", {
    props: ['users_data'],
    template: `
        <table class="ui basic selectable large table">
        <thead>
            <tr>
                <th><h1>排名     </h1>  </th>
                <th><h1>用户名    </h1> </th>
                <th><h1>Rating </h1>    </th>
                <th><h1>胜率     </h1>  </th>
                <th><h1>胜场     </h1>  </th>
                <th><h1>总场次    </h1> </th>
            </tr>
        </thead>
        <tbody>
            <tr class="tr-link" v-for="(user_data, index) in users_data" @click="jump_to(user_data.user_id)">
                <td><h1>{{index + 1}}                                                     </h1></td>
                <td><h1>{{user_data.username}}                                            </h1></td>
                <td><h1>{{user_data.user_info.rating}}                                    </h1></td>
                <td><h1>{{ (user_data.user_info.rate_of_victory * 100).toFixed(2) + "%" }}</h1></td>
                <td><h1>{{user_data.user_info.number_of_victory}}                         </h1></td>
                <td><h1>{{user_data.user_info.number_of_battles}}                         </h1></td>
            </tr>
        </tbody>
        </table>
    `,
    methods: {
        "jump_to": function (user_id) {
            location.href = "/users?user_id=" + user_id
        }
    }
});
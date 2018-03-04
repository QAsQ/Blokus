function data_gen(){
    current_timestamp =  Math.floor(new Date().valueOf() / 1000) - 120;
    return {
        users_info:[
            { username: "QAQ", winning_rate: 13.5 },
            { username: "QvQ", winning_rate: 1.5 },
            { username: "QwQ", winning_rate: 3.5 },
            { username: "oAo", winning_rate: 13 }
        ],
        battle_info:{
            battle_name: "Battle_QAQ",
            accuracy_time: 120,
            additional_time: 10,
            started: true,
            ended: false,
            create_time: current_timestamp + 1,
            start_time: current_timestamp,
            current_user: 1,
            current_time: current_timestamp
        },
        board_info:{
            board_type: "standard"
        }
    }
}

function gen_chatlog(){
    return [
        "lizi: wtf",
        "yyn: hahahaha",
        "quailty: 干得漂亮",
        "lizi: 多大仇多大仇",
        "QAQ: 一下子接受不了吧.jpg"
    ]
}


Vue.component("userinfo-item", {
    props: ['user_info', 'player_id'],
    template: `
        <div class='item'>
            <img class='ui avatar image' :src='image_path'>
            <div class='content'>
                <div class='header'> {{user_info.username}}</div>
                <div class='description'>胜率:{{user_info.winning_rate}}%</div>
            </div>
        </div>`,
    computed: {
        image_path: function () {
            return (1 << this.player_id ) + '.png'
        }
    }
});

Vue.component("userinfo-list", {
    props: ['users_info'],
    template:`
        <div class='ui big list'>
            <userinfo-item v-for="(user_info, index) in users_info" :key="index"
                :player_id="index"
                :user_info="user_info" >
            </userinfo-item>
        </div>`
});

Vue.component("battle-info", {
    props: ['battle_info', 'board_info'],
    template:`
        <div class="ui card">
            <div class="ui middle image">
                <img src="standard.png">
            </div>
            <div class="content">
                <div class="header">{{battle_type}}</div>
                <div class="meta">
                    <span class="date">{{start_state}}</span>
                </div>
                <div class="description">
                    对局进程: {{battle_process}}%
                </div>
            </div>
            <div class="extra content">
                <div class="header">对局信息</div>
                限时: {{ accuracy_time }}<br>
                每步额外限时: {{ additional_time }}<br>
                预计剩余时间: {{ remaining_time }}
            </div>
        </div>`,
    methods:{
        format_time: function (second) {
            let minute = Math.floor( second / 60 );
            if (minute < 60)
                return minute + "分钟";
            let hour = Math.floor(second / 60);
            if (hour < 24)
                return hour + "小时";
            let day = Math.floor(hour / 24);
            return day + "天";
        }
    },
    computed: {
        battle_type: function () {
            var battletype_translate = {
                standard: "标准对局"
            };
            return battletype_translate[this.board_info.board_type]
        },
        start_state : function () {
            if (! this.battle_info.started)
                return "未开始";
            else
                return "开始于" + this.format_time(
                        (Math.floor(new Date().valueOf() / 1000) - this.battle_info.start_time )) + "前"
        },
        battle_process: function () {
            return "暂未实现"
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
    template:`
        <div class="item">
            <div class="ui image">
                <img class="ui avatar image" src="favicon.ico">
            </div>
            <div class="content">
                <div class="ui header"> {{battle_data.battle_info.battle_name}} </div>
                <div class="ui popup">
                    <battle-info :battle_info="battle_data.battle_info" :board_info="battle_data.board_info">
                    </battle-info>
                </div>
            </div>
            <div class="ui popup">
                <div class='header'>用户信息</div>
                <userinfo-list :users_info="battle_data.users_info"></userinfo-list>
            </div>
        </div>`
});

Vue.component("battle-list", {
    props: ['battles_data', 'show_create'],
    template: `
        <div class="ui huge divided selection list">
            <div v-if="show_create" class="item" onclick="$('#create').modal({autofocus: false}).modal('show')">
                <i class="teal inverted circular middle plus icon"></i>
                <div class="content" data-tooltip="点击创建新对局">
                    <div class="ui header">「&ensp;&ensp;」</div>
                </div>
            </div>
            <battle-item v-for="(battle_data, index) in battles_data"  :key="index"
                :battle_data="battle_data">
            </battle-item>
        </div>`
});

Vue.component("playerinfo-item",{
    props: ['player_info', 'player_id'],
    template: `
        <div class="item" :class="{link: !occupied}">
            <img class="ui avatar image" :src="image_path">
            <div class="content">
                <div class="header">{{user_name}}</div>
                <div class="description"> {{user_state}}</div>
            </div>
        </div>`,
    computed: {
        occupied: function () {
            return this.player_info.user_id != -1;
        },
        user_name: function () {
            if (this.player_info.user_id == -1)
                return "";
            return this.player_info.username
        },
        image_path: function () {
            return (1 << this.player_id) + '.png'
        },
        user_state: function () {
            if (this.player_info.user_id == -1)
                return "";
            if (this.player_info.is_auto)
                return "托管中";
            return "在线";
        }
    }
});

Vue.component("playerinfo-table",{
    props: ['players_info'],
    template: `
    <div class="ui vertical segment">
        <div class="left aligned attached ui two item menu">
            <playerinfo-item :player_info="players_info[0]" :player_id="0"></playerinfo-item>
            <playerinfo-item :player_info="players_info[3]" :player_id="3"></playerinfo-item>
        </div>
        <div class="left aligned attached ui two item menu">
            <playerinfo-item :player_info="players_info[1]" :player_id="1"></playerinfo-item>
            <playerinfo-item :player_info="players_info[2]" :player_id="2"></playerinfo-item>
        </div>
    </div>`
});
Vue.component("chat-box", {
    props: ['chat_logs'],
    template: `
        <div class="ui segment">
            <div class="ui horizontal chat-box">
                <p v-for="chat_log in chat_logs"> {{chat_log}}</p>
            </div>
            <div class="ui divider"></div>
            <div class="ui fluid action input">
                <input type="text">
                <button class="ui teal button">发送</button>
            </div>
        </div>`
});

Vue.component("control-panel", {
    props: ['battle_data', 'chat_logs'],
    template: `
        <div class="ui four wide column">
            <chat-box :chat_logs="chat_logs"></chat-box>
            <div class="ui teal fluid toggle button" :class="{disabled: on_game}">托管</div>
            <playerinfo-table :players_info="battle_data.players_info"></playerinfo-table>
        </div> `,
    computed: {
        on_game: function () {
            //todo
            return false
        }
    }
});

Vue.component("battle-interface", {
    props: ['battle_data', 'chat_logs'],
    template: `
        <div class="ui grid container stackable">
            <div class="ui center aligned eleven wide column">
                <div class="ui segment">
                    <canvas height="260px" class="ui container"></canvas>
                </div>
                <div class="ui small grey progress"
                    :class="{disabled: !running}"
                    :data-percent="battle_data.battle_info.battle_process" id="process_bar">
                    <div class="bar">
                        <div class="progress"></div>
                    </div>
                </div>
            </div>
            <control-panel
                :battle_data="battle_data"
                :chat_logs="chat_logs">
            </control-panel>
        </div>`,
    computed: {
        running: function () {
            return this.battle_data.battle_info.started &&
                    !this.battle_data.battle_info.ended
        }
    }
});

function data_gen(){
    current_timestamp =  Math.floor(new Date().valueOf() / 1000) - 120;
    return {
        players_info:[
            { is_auto: false, user_id: 12, username: "QAQ", winning_rate: 13.5 },
            { is_auto: true, user_id: 12, username: "QvQ", winning_rate: 1.5 },
            { user_id: -1},
            { is_auto: false, user_id: 12, username: "oAo", winning_rate: 13 }
        ],
        battle_info:{
            battle_name: "Battle_QAQ",
            accuracy_time: 120,
            additional_time: 10,
            started: true,
            ended: false,
            create_time: current_timestamp + 1,
            start_time: current_timestamp,
            current_user: 1,
            current_time: current_timestamp,
            battle_process: 78
        },
        board_info:{
            board_type: "standard"
        }
    }
}
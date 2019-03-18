var Entity = require('../entity');
var Logger = require('./Logger');
var UserRoleEnum = require("../enum/UserRoleEnum");
var Packet = require("../packet");
var CommandList = require("./CommandList");

var ErrorTextInvalidCommand = "ERROR: Unknown command, type /help for command list";
var ErrorTextBadCommand = "ERROR: Bad command!";


function PlayerCommand(gameServer, playerTracker) {
    this.gameServer = gameServer;
    this.playerTracker = playerTracker;
}

module.exports = PlayerCommand;

PlayerCommand.prototype.writeLine = function (text) {
    this.gameServer.sendChatMessage(null, this.playerTracker, text);
};

PlayerCommand.prototype.executeCommandLine = function (commandLine) {
    if (!commandLine) return;
    var command = commandLine;
    var args = "";
    var index = commandLine.indexOf(' ');
    if (index >= 0) {
        command = commandLine.slice(0, index);
        args = commandLine.slice(index + 1, commandLine.length);
    }
    command = command.trim().toLowerCase();
    if (command.length > 16) {
        this.writeLine(ErrorTextInvalidCommand);
        return;
    }
    for (var i = 0; i < command.length; i++) {
        var c = command.charCodeAt(i);
        if (c < 0x21 || c > 0x7F) {
            this.writeLine(ErrorTextInvalidCommand);
            return;
        }
    }
    if (!playerCommands.hasOwnProperty(command)) {
        this.writeLine(ErrorTextInvalidCommand);
        return;
    }
    var execute = playerCommands[command];
    if (typeof execute == 'function') {
        execute.bind(this)(args);
    } else {
        this.writeLine(ErrorTextBadCommand);
    }
};

var playerCommands = {
    help: function (args) {
        var comList = [
            "/rules - show rules",
            "/kill - self kill",
            "/clear - clear chat",
            "/mute - mute chat",
            "/unmute - unmute chat",
            "/info - get info about server",
            "/share - share this server ip",
            "/pl - playerlist",
            "/help - show this commands list"
        ];
        if (this.playerTracker.userRole == UserRoleEnum.ADMIN) {
            comList.push("", "ADMIN commands:");
            comList.push("/ka or /killall - kill all players");
        }
        this.writeLine("\nAvailable commands:\n" + comList.join("\n"));
    },
    info: function (args) {

        var stats = JSON.parse(this.gameServer.stats);
        this.writeLine('\nServer name: ' + stats.server_name +
            "\nGame mode: " + stats.gamemode +
            "\nPlayers: " + stats.current_players + "/" + stats.max_players +
            "\nSpectators: " + stats.spectators +
            "\nUptime (m): " + stats.uptime +
            "\nUpdate_time: " + stats.update_time);
    },
    // color: function (args) {
    //     var arr = args.trim().split(" ");
    //     if (this.playerTracker.cells.length > 0) {
    //         this.playerTracker.cells[0].setColor({ r: parseInt(arr[1]), g: parseInt(arr[2]), b: parseInt(arr[3]) });
    //     } else {
    //         this.writeLine("Can't be done bacuse you are dead");
    //     }
    //     this.writeLine("color changed");
    // },
    // skin: function (args) {
    //     if (this.playerTracker.cells.length > 0) {
    //         this.writeLine("ERROR: Cannot change skin while player in game!");
    //         return;
    //     }
    //     var skinName = "";
    //     if (args) skinName = args.trim();
    //     if (!this.gameServer.checkSkinName(skinName)) {
    //         this.writeLine("ERROR: Invalid skin name!");
    //         return;
    //     }
    //     this.playerTracker.setSkin(skinName);
    //     if (skinName == "")
    //         this.writeLine("Your skin was removed");
    //     else
    //         this.writeLine("Your skin set to " + skinName);
    // },
    kill: function (args) {
        if (this.playerTracker.cells.length < 1) {
            this.writeLine("You cannot kill yourself, because you're still not joined to the game!");
            return;
        }
        while (this.playerTracker.cells.length > 0) {
            var cell = this.playerTracker.cells[0];
            this.gameServer.removeNode(cell);
            // replace with food
            var food = new Entity.Food(this.gameServer, null, cell.position, this.gameServer.config.playerMinSize);
            food.setColor(this.gameServer.getGrayColor(cell.getColor()));
            this.gameServer.addNode(food);
        }
        this.writeLine("You killed yourself");
    },
    mod_kick: function (args) {
        if (this.playerTracker.userRole < UserRoleEnum.MODER) {
            this.writeLine("ERROR: access denied!");
            return;
        }
        if (this.gameServer.gameMode.coinsBattle) {
            this.writeLine("ERROR: not available in coins battle!");
            return;
        }
        var id = parseInt(args);
        if (isNaN(id)) {
            this.writeLine("Please specify a valid player ID!");
            return;
        }
        this.gameServer.kickId(id, this.playerTracker);
    },
    mod_kill: function (args) {
        if (this.playerTracker.userRole < UserRoleEnum.MODER) {
            this.writeLine("ERROR: access denied!");
            return;
        }
        if (this.gameServer.gameMode.coinsBattle) {
            this.writeLine("ERROR: not available in coins battle!");
            return;
        }
        var id = parseInt(args);
        if (isNaN(id)) {
            this.writeLine("Please specify a valid player ID!");
            return;
        }

        var count = 0;
        for (var i in this.gameServer.clients) {
            if (this.gameServer.clients[i].playerTracker.pID == id) {
                var client = this.gameServer.clients[i].playerTracker;

                if (client.userRole >= UserRoleEnum.MODER) {
                    this.writeLine("ERROR: Can't apply this to MOD");
                    return;
                }
                var len = client.cells.length;
                for (var j = 0; j < len; j++) {
                    this.gameServer.removeNode(client.cells[0]);
                    count++;
                }
                console.log("Removed " + count + " cells");
                this.gameServer.sendChatMessage(this.playerTracker, null, "Killed \"" + client.getFriendlyName() + "\"");
                break;
            }
        }

    },
    mod_mute: function (args) {
        if (this.playerTracker.userRole < UserRoleEnum.MODER) {
            this.writeLine("ERROR: access denied!");
            return;
        }
        args = args.split(" ");
        if (!args || args.length < 1) {
            this.writeLine("Please specify a valid player ID!");
            return;
        }
        var id = parseInt(args[0]);
        var maxDuration = 60;
        var duration = args.length == 2 ? Math.min(maxDuration, parseInt(args[1])) : null; //if no duration do it permanently
        if (isNaN(id)) {
            this.writeLine(this.playerTracker, "Please specify a valid player ID!");
            return;
        }
        var player = this.gameServer.getPlayerById(id);
        if (player == null) {
            this.writeLine("Player with id=" + id + " not found!");
            return;
        }
        if (player.userRole >= UserRoleEnum.MODER) {
            this.writeLine("ERROR: Can't apply this to MOD");
            return;
        }
        if (player.isMuted) {
            this.writeLine("Player with id=" + id + " already muted!");
            return;
        }
        var msg = "Player \"" + player.getFriendlyName() + "\" were muted";
        if (duration) {
            msg += (duration ? " for " + duration + "m" : "");
            setTimeout(function () {
                CommandList.list.unmute(this.gameServer, ["stub", player.playerTracker.pID]);
            }.bind(this), duration * 60 * 1000);
        }

        this.gameServer.sendChatMessage(this.playerTracker, null, msg);
        player.isMuted = true;
    },
    mod_ban: function (args) {
        if (this.playerTracker.userRole < UserRoleEnum.MODER) {
            this.writeLine("ERROR: access denied!");
            return;
        }
        args = args.split(" ");
        var id = parseInt(args[0]);
        var maxDuration = 60;
        var duration = args.length == 2 ? Math.min(maxDuration, parseInt(args[1])) : null; //if no duration do it permanently
        if (isNaN(id)) {
            // If not numerical
            this.writeLine("Please specify a valid player ID!");
            return;
        }
        var ip = null;
        var player = null;
        for (var i in this.gameServer.clients) {
            var client = this.gameServer.clients[i];
            if (client == null || !client.isConnected)
                continue;
            if (client.playerTracker.pID == id) {
                ip = client._socket.remoteAddress;
                player = client.playerTracker;
                break;
            }
        }
        if (player.userRole >= UserRoleEnum.MODER) {
            this.writeLine("ERROR: Can't apply this to MOD");
            return;
        }
        if (ip) {
            this.gameServer.banIp(ip, duration);
            var msg = "Player \"" + player.getFriendlyName() + "\" were banned";
            if (duration) {
                msg += (duration ? " for " + duration + "m" : "");
                setTimeout(function () {
                    CommandList.list.unban(this.gameServer, ["stub", ip]);
                }.bind(this), duration * 60 * 1000);
            }
            this.gameServer.sendChatMessage(this.playerTracker, null, msg);
        }
        else {
            this.gameServer.sendChatMessage(null, this.playerTracker, "Player with id=" + id + " not found!");
        }

    },
    pl: function (args) {
        // if (this.playerTracker.userRole < UserRoleEnum.MODER) {
        //     this.writeLine("ERROR: access denied!");
        //     return;
        // }
        var res = [];
        var sockets = this.gameServer.clients.slice(0);
        for (var i = 0; i < sockets.length; i++) {
            var socket = sockets[i];
            var client = socket.playerTracker;

            var obj = {
                id: client.pID,
                s_id: client.userID, //social id
                nick: client.getFriendlyName(),
                score: (client.getScore() / 100) >> 0
            }
            res.push(obj);
        }
        // console.log(res);
        // this.gameServer.sendChatMessage(null, this.playerTracker, JSON.stringify(res));
        this.playerTracker.socket.sendPacket(new Packet.PlayerList(res));
    },
    login: function (args) {
        var password = (args || "").trim();
        if (password.length < 1) {
            this.writeLine("ERROR: missing password argument!");
            return;
        }
        var user = this.gameServer.userLogin(this.playerTracker.socket.remoteAddress, password);
        if (!user) {
            this.writeLine("ERROR: login failed!");
            return;
        }
        Logger.write("LOGIN        " + this.playerTracker.socket.remoteAddress + ":" + this.playerTracker.socket.remotePort + " as \"" + user.name + "\"");
        this.playerTracker.userRole = user.role;
        this.playerTracker.userAuth = user.name;
        this.writeLine("Login done as \"" + user.name + "\"");
        return;
    },
    logout: function (args) {
        if (this.playerTracker.userRole == UserRoleEnum.GUEST) {
            this.writeLine("ERROR: not logged in");
            return;
        }
        Logger.write("LOGOUT       " + this.playerTracker.socket.remoteAddress + ":" + this.playerTracker.socket.remotePort + " as \"" + this.playerTracker.userAuth + "\"");
        this.playerTracker.userRole = UserRoleEnum.GUEST;
        this.playerTracker.userAuth = null;
        this.writeLine("Logout done");
    },
    shutdown: function (args) {
        if (this.playerTracker.userRole != UserRoleEnum.ADMIN) {
            this.writeLine("ERROR: access denied!");
            return;
        }
        Logger.warn("SHUTDOWN REQUEST FROM " + this.playerTracker.socket.remoteAddress + " as " + this.playerTracker.userAuth);
        process.exit(0);
    },
    killall: function (args) {
        if (this.playerTracker.userRole != UserRoleEnum.ADMIN) {
            this.writeLine("ERROR: access denied!");
            return;
        }
        this.gameServer.commands.killall(this.gameServer, null);
        this.gameServer.sendChatMessage(this.playerTracker, null, "Killed all players");
    },
    ka: function (args) {
        playerCommands.killall.bind(this)(args);
    },
};



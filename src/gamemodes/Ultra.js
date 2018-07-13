var FFA = require('./FFA'); // Base gamemode
var Mode = require('./Mode');
var BinaryWriter = require("../packet/BinaryWriter")

function Ultra() {
    FFA.apply(this, Array.prototype.slice.call(arguments));

    this.ID = 7;
    this.apiId = this.ID + 1;
    this.name = "ULTRA";
    this.specByLeaderboard = true;

    // this.restartInterval = 10000;
    this.downCounter = this.restartInterval / 1000; // counter to show on leaderboard

    this.canRemergeLimit = 200;
    this.newPlayerCellBoostValue = 410;


    // if some player reach this limit, restart timer will be started
    // this.scoreLimit = 25000;
    this.restarting = false;

}

module.exports = Ultra;
Ultra.prototype = new FFA();

// Gamemode Specific Functions

Ultra.prototype.onServerInit = function (gameServer) {

    gameServer.config.serverMaxConnections = 33;

    gameServer.config.serverSpectatorScale = 0.4;

    gameServer.config.borderWidth = 27000;
    gameServer.config.borderHeight = 27000;

    gameServer.config.foodMinSize = 20;
    gameServer.config.foodMaxSize = 40;

    gameServer.config.foodMinAmount = 500;
    gameServer.config.foodMaxAmount = 1000;

    gameServer.config.virusMaxSize = 120;
    gameServer.config.virusMaxAmount = 50;

    gameServer.config.ejectSize = 45;
    gameServer.config.ejectSizeLoss = 50;
    gameServer.config.ejectCooldown = 0;


    gameServer.config.playerMinSize = 85;
    gameServer.config.playerMaxSize = 150000000;
    gameServer.config.playerMinSplitSize = 121;
    gameServer.config.playerStartSize = 500;
    gameServer.config.playerMaxCells = 128;
    gameServer.config.playerSpeed = 1.6;
    gameServer.config.playerDecayRate = .005;
    gameServer.config.playerRecombineTime = 0;

    gameServer.config.ejectSpawnPlayer = 0

    gameServer.config.playerProtection = 0;

    this.restartInterval = gameServer.config.ultraRestartCounterDuration * 1000; // 10 sec
    this.downCounter = this.restartInterval / 1000; // counter to show on leaderboard

    this.scoreLimit = gameServer.config.ultraRestartMassLimit;
};

Ultra.prototype.startRestartTimer = function (gameServer) {

    if (this.restarting) {
        return;
    }
    this.restarting = true;
    setTimeout(function () {
        gameServer.commands.killall(gameServer, null);
        this.downCounter = this.restartInterval / 1000;
        this.restarting = false;
    }.bind(this), this.restartInterval);

}

Ultra.prototype.checkScoreLimit = function (gameServer) {
    for (var i = 0; i < gameServer.clients.length; i++) {
        var client = gameServer.clients[i];
        if (client == null) continue;

        var player = client.playerTracker;
        if (player.isRemoved)
            continue; // Don't add disconnected players to list

        var playerScore = player.getScore();

        if (!this.restarting &&
            playerScore / 100 > this.scoreLimit &&
            player.cells.length > 0) {
            this.startRestartTimer(gameServer);
        }
    }
}

Ultra.prototype.updateLB = function (gameServer) {

    this.checkScoreLimit(gameServer);

    FFA.prototype.updateLB(gameServer); //call parent method

    if (this.restarting) {
        var lb = gameServer.leaderboard;
        lb.length = 0; //hide nicknames
        var timeLeftLabel = "Restart in: " + this.downCounter-- + "s";
        lb.push(mockPlayer(timeLeftLabel));
    }
}

/**
 * We need this to keep usage of UpdateLeaderboard packet for players (opcode 48), which sends players ids
 * (48 = Text List, 49 = List of players, 50 = Pie chart)
 * @param {*} str - mock player name 
 */
function mockPlayer(str) {
    return {
        getNameUnicode: function () {
            return stringToBytes(str);
        }
    }
}

function stringToBytes(str) {
    var writer = new BinaryWriter()
    writer.writeStringZeroUnicode(str);
    this._nameUnicode = writer.toBuffer();
    return writer.toBuffer();
}

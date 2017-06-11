var FFA = require('./FFA'); // Base gamemode
var Mode = require('./Mode');

function SelfFeed() {
    FFA.apply(this, Array.prototype.slice.call(arguments));
    
    this.ID = 5;
    this.name = "SelfFeed";
    this.specByLeaderboard = true;

    this.restartInterval = 120000; // 2 min
}

module.exports = SelfFeed;
SelfFeed.prototype = new FFA();

// Gamemode Specific Functions

SelfFeed.prototype.onServerInit = function (gameServer) {

    gameServer.config.serverMaxConnections = 30;
    gameServer.config.borderWidth = 35000;
    gameServer.config.borderHeight = 35000;
    gameServer.config.foodMinAmount = 100;
    gameServer.config.foodMaxAmount = 100;
    gameServer.config.virusMinAmount = 0;
    gameServer.config.virusMaxAmount = 0;
    gameServer.config.ejectSize = 85;
    gameServer.config.ejectSizeLoss = 50;
    gameServer.config.ejectCooldown = 0;

    gameServer.config.playerMaxSize = 1500000000;
    gameServer.config.playerStartSize = 300
    gameServer.config.playerMaxCells = 24
    gameServer.config.playerRecombineTime = 0

    
    setInterval(function () {
        gameServer.commands.killall(gameServer, null);      
    }, this.restartInterval);
};

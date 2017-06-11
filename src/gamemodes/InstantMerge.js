var FFA = require('./FFA'); // Base gamemode
var Mode = require('./Mode');

function InstantMerge() {
    FFA.apply(this, Array.prototype.slice.call(arguments));
    
    this.ID = 3;
    this.name = "InstantMerge";
    this.specByLeaderboard = true;

    //config
    this.playerRecombineTime = 0;
    this.playerDecayRate = .006;
    this.playerMaxCells = 32;
	
    this.serverMaxConnections = 65;
}

module.exports = InstantMerge;
InstantMerge.prototype = new FFA();

// Gamemode Specific Functions

InstantMerge.prototype.onServerInit = function (gameServer) {
	gameServer.config.playerRecombineTime = this.playerRecombineTime;
	gameServer.config.playerDecayRate = this.playerDecayRate;
	gameServer.config.playerMaxCells = this.playerMaxCells;
	gameServer.config.serverMaxConnections = this.serverMaxConnections;
};

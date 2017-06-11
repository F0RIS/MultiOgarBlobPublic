var FFA = require('./FFA'); // Base gamemode
var Mode = require('./Mode');

function Crazy() {
    FFA.apply(this, Array.prototype.slice.call(arguments));
    
    this.ID = 4;
    this.name = "CRAZY";
    this.specByLeaderboard = true;

    //config
    //this.playerRecombineTime = 0;
    //this.playerDecayRate = .007;
    this.playerMaxCells = 64;
	
    this.serverMaxConnections = 50;
}

module.exports = Crazy;
Crazy.prototype = Object.create(FFA.prototype);

// Gamemode Specific Functions

Crazy.prototype.onServerInit = function (gameServer) {
	//gameServer.config.playerRecombineTime = this.playerRecombineTime;
	//gameServer.config.playerDecayRate = this.playerDecayRate;
	gameServer.config.playerMaxCells = this.playerMaxCells;
	gameServer.config.serverMaxConnections = this.serverMaxConnections;
};

// Import
var BinaryWriter = require("./BinaryWriter");


function SetParams(gameServer) {
    this.gameServer = gameServer;
}

module.exports = SetParams;

SetParams.prototype.build = function (protocol) {
    var writer = new BinaryWriter();
    writer.writeUInt8(0x65);                                // Packet ID
    writer.writeUInt32(this.gameServer.config.serverVersionCode);

    var flags = 0;
    if (this.gameServer.gameMode.hideLeaderBoardNumbers) { //for tournaments
        flags = flags | 1;
    }
    if (this.gameServer.gameMode.showAllPlayersOnMinimap) { //for tournaments
        flags = flags | 2;
    }

    writer.writeUInt32(flags); //flags
    return writer.toBuffer();
};

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
    return writer.toBuffer();
};

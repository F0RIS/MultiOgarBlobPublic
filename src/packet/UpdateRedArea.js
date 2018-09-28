// Import
var BinaryWriter = require("./BinaryWriter");


function UpdateRedArea(gameServer, redArea) {
    this.gameServer = gameServer;
    this.redArea = redArea;
}

module.exports = UpdateRedArea;

UpdateRedArea.prototype.build = function (protocol) {

    var writer = new BinaryWriter();
    writer.writeUInt8(0x7B);                                // Packet ID - dec -> 67

    writer.writeInt16(this.redArea.curPos.x >>> 0);
    writer.writeInt16(this.redArea.curPos.y >>> 0);
   
    writer.writeInt16(this.redArea.nextPos.x >>> 0);
    writer.writeInt16(this.redArea.nextPos.y >>> 0);
   
    writer.writeInt16(this.redArea.curRadius >>> 0);
    writer.writeInt16(this.redArea.nextRadius >>> 0);

    return writer.toBuffer();
}
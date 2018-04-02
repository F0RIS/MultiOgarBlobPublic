// Import
var BinaryWriter = require("./BinaryWriter");


function PlayerList(arr) {
    this.data = arr;
}

module.exports = PlayerList;

PlayerList.prototype.build = function (protocol) {
    
    var writer = new BinaryWriter();
    writer.writeUInt8(0x7A); // Packet ID - dec -> 122
    
    var count = 0;
    writer.writeInt16(this.data.length >>> 0); // Number of elements
    
    for (var i = 0; i < this.data.length; i++) {
        var item = this.data[i];
        writer.writeUInt32(item.id);
        // writer.writeDouble(item.s_id);
        writer.writeUInt32(item.s_id);
        writer.writeStringZeroUnicode(item.nick);
        writer.writeUInt32(item.score);
    }
    
    return writer.toBuffer();
}
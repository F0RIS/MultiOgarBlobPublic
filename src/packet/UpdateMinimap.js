// Import
var BinaryWriter = require("./BinaryWriter");


function UpdateMinimap(playerTracker, clients) {
    this.playerTracker = playerTracker;
    this.clients = clients;
}

module.exports = UpdateMinimap;

UpdateMinimap.prototype.build = function (protocol) {

    var player = this.playerTracker;
    var clients = this.clients;

    if (!player.sendFriendsCoords) {
        return;
    }

    var writer = new BinaryWriter();
    writer.writeUInt8(0x43);                                // Packet ID - dec -> 67
    
    var count = 0;
    for (var i = 0; i < clients.length; i++) {
        if (clients[i].playerTracker.cells.length > 0 && 
            clients[i].playerTracker.userID != 0 &&
            clients[i].playerTracker != player){
           count++;
       }
    }
    writer.writeInt16(count >>> 0);       // Number of elements

    for (var i = 0; i < clients.length; i++) {
        if (clients[i].playerTracker.cells.length > 0 && clients[i].playerTracker.userID != 0){
            //console.log(clients[i].playerTracker.userID+"  "+clients[i].playerTracker.centerPos.x+":"+clients[i].playerTracker.centerPos.y);
            writer.writeDouble(clients[i].playerTracker.userID);
            writer.writeInt16(clients[i].playerTracker.centerPos.x);
            writer.writeInt16(clients[i].playerTracker.centerPos.y);
        }
    }

    return writer.toBuffer();

}
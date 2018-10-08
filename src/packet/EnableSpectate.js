function EnableSpectate() { }

module.exports = EnableSpectate;

EnableSpectate.prototype.build = function (protocol) {
    var buffer = new Buffer(1);
    buffer.writeUInt8(0x01, 0, true);
    return buffer;
};
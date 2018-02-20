var Cell = require('./Cell');
var CellType = require("../enum/CellTypeEnum");

function SpeedBooster() {
    Cell.apply(this, Array.prototype.slice.call(arguments));
    
    this.cellType = CellType.SPEED_BOOSTER;
    
    this.effectValue  = this.gameServer.config.speedBoosterValue;
    this.effectTime = this.gameServer.config.speedBoosterTime; 

    this.setColor({ r: 99, g: 179, b: 228 });
}

module.exports = SpeedBooster;
SpeedBooster.prototype = new Cell();

// Main Functions

SpeedBooster.prototype.onAdd = function (gameServer) {
    gameServer.currentSpeedBoosters++;
};

SpeedBooster.prototype.onRemove = function (gameServer) {
    gameServer.currentSpeedBoosters--;
};

var Cell = require('./Cell');
var CellType = require("../enum/CellTypeEnum");

function MergeBooster() {
    Cell.apply(this, Array.prototype.slice.call(arguments));
    
    this.cellType = CellType.MERGE_BOOSTER;
    
    this.effectValue  = this.gameServer.config.mergeBoosterValue;
    this.effectTime = this.gameServer.config.mergeBoosterTime; 

    this.setColor({ r: 0, g: 145, b: 121 });
}

module.exports = MergeBooster;
MergeBooster.prototype = new Cell();

// Main Functions

MergeBooster.prototype.onAdd = function (gameServer) {
    // gameServer.currentSpeedBoosters++;
    gameServer.boostersCount[this.cellType]++;
};

MergeBooster.prototype.onRemove = function (gameServer) {
    gameServer.boostersCount[this.cellType]--;
};

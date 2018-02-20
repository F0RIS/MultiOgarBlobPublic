var Cell = require('./Cell');
var CellType = require("../enum/CellTypeEnum");

function Food() {
    Cell.apply(this, Array.prototype.slice.call(arguments));
    
    this.cellType = CellType.FOOD;
}

module.exports = Food;
Food.prototype = new Cell();

// Main Functions

Food.prototype.onAdd = function (gameServer) {
    gameServer.currentFood++;
};

Food.prototype.onRemove = function (gameServer) {
    gameServer.currentFood--;
};

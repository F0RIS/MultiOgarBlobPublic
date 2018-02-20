var Cell = require('./Cell');
var CellType = require("../enum/CellTypeEnum");

function EjectedMass() {
    Cell.apply(this, Array.prototype.slice.call(arguments));
    
    this.cellType = CellType.EJECT;
}

module.exports = EjectedMass;
EjectedMass.prototype = new Cell();

// Main Functions

EjectedMass.prototype.onAdd = function (gameServer) {
    // Add to list of ejected mass
    gameServer.nodesEjected.push(this);
};

EjectedMass.prototype.onRemove = function (gameServer) {
    // Remove from list of ejected mass
    var index = gameServer.nodesEjected.indexOf(this);
    if (index != -1) {
        gameServer.nodesEjected.splice(index, 1);
    }
};

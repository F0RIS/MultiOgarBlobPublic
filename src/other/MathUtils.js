function distance(p1, p2) {
    var x = p1.x - p2.x;
    var y = p1.y - p2.y;
    return { x: x, y: y };
}

function length(p) {
    return Math.sqrt(p.x * p.x + p.y * p.y);
}

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

module.exports = {
    distance,
    length,
    getRandomInt
}
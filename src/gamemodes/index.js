module.exports = {
    Mode: require('./Mode'),
    FFA: require('./FFA'),
    Teams: require('./Teams'),
    Experimental: require('./Experimental'),
    InstantMerge: require('./InstantMerge'),
    Crazy: require('./Crazy'),
    SelfFeed: require('./SelfFeed'),
    Ultra: require('./Ultra'),
    Tournament: require('./Tournament'),
    HungerGames: require('./HungerGames'),
    // TS2v2: require('./TS2v2'),
    // BattleRoyal: require('./BattleRoyal'),
    Rainbow: require('./Rainbow'),
    Zombie: require('./Zombie'),
    TeamZ: require('./TeamZ.js'),
    TeamX: require('./TeamX.js')
};

var fs = require('fs');
if (fs.existsSync(__dirname + "//TS2v2.js")) {
    module.exports.TS2v2 = require('./TS2v2');
}

if (fs.existsSync(__dirname + "//BattleRoyal.js")) {
    module.exports.BattleRoyal = require('./BattleRoyal');
}

var get = function (id) {
    var mode;
    switch (parseInt(id)) {
        case 1:// Teams
            mode = new module.exports.Teams();
            break;
        case 2:// Experimental
            mode = new module.exports.Experimental();
            break;
        case 3:// InstantMerge
            mode = new module.exports.InstantMerge();
            break;
        case 4:// Crazy
            mode = new module.exports.Crazy();
            break;
        case 5:// SelfFeed
            mode = new module.exports.SelfFeed();
            break;
        case 6:
            mode = new module.exports.Ultra();
            break;
        case 7:
            mode = new module.exports.TS2v2();
            break;
        case 8:
            mode = new module.exports.BattleRoyal();
            break;
        case 10:// Tournament
            mode = new module.exports.Tournament();
            break;
        case 11:// Hunger Games
            mode = new module.exports.HungerGames();
            break;
        case 12:// Zombie
            mode = new module.exports.Zombie();
            break;
        case 13:// Zombie Team
            mode = new module.exports.TeamZ();
            break;
        case 14:// Experimental Team
            mode = new module.exports.TeamX();
            break;
        case 20:// Rainbow
            mode = new module.exports.Rainbow();
            break;
        default:// FFA is default
            mode = new module.exports.FFA();
            break;
    }
    return mode;
};

module.exports.get = get;

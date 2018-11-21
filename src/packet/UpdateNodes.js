// Import
var BinaryWriter = require("./BinaryWriter");
var Logger = require('../modules/Logger');
var CellType = require("../enum/CellTypeEnum");

var sharedWriter = new BinaryWriter(128 * 1024); // for about 25000 cells per client

const redColor = { r: 255, g: 0, b: 0 }; //used for virused players

function UpdateNodes(playerTracker, addNodes, updNodes, eatNodes, delNodes) {
    this.playerTracker = playerTracker;
    this.addNodes = addNodes;
    this.updNodes = updNodes;
    this.eatNodes = eatNodes;
    this.delNodes = delNodes;
}

module.exports = UpdateNodes;

UpdateNodes.prototype.build = function (protocol) {
    if (!protocol) return null;

    var writer = sharedWriter;
    writer.reset();
    writer.writeUInt8(0x10);                                // Packet ID
    this.writeEatItems(writer);

    if (protocol < 5) this.writeUpdateItems4(writer);
    else if (protocol == 5) this.writeUpdateItems5(writer);
    else this.writeUpdateItems6(writer);

    this.writeRemoveItems(writer, protocol);
    return writer.toBuffer();
};

// protocol 4
UpdateNodes.prototype.writeUpdateItems4 = function (writer) {
    var scrambleX = this.playerTracker.scrambleX;
    var scrambleY = this.playerTracker.scrambleY;
    var scrambleId = this.playerTracker.scrambleId;

    for (var i = 0; i < this.updNodes.length; i++) {
        var node = this.updNodes[i];
        if (node.nodeId == 0)
            continue;
        var cellX = node.position.x + scrambleX;
        var cellY = node.position.y + scrambleY;

        // Write update record
        writer.writeUInt32((node.nodeId ^ scrambleId) >>> 0);         // Cell ID
        writer.writeInt16(cellX >> 0);                // Coordinate X
        writer.writeInt16(cellY >> 0);                // Coordinate Y
        writer.writeUInt16(node.getSize() >>> 0);     // Cell Size (not to be confused with mass, because mass = size*size/100)
        var color = node.getColor();
        writer.writeUInt8(color.r >>> 0);         // Color R
        writer.writeUInt8(color.g >>> 0);         // Color G
        writer.writeUInt8(color.b >>> 0);         // Color B

        var flags = 0;
        if (node.isSpiked)
            flags |= 0x01;      // isVirus
        if (node.isAgitated)
            flags |= 0x10;      // isAgitated
        if (node.cellType == 3)
            flags |= 0x20;      // isEjected
        writer.writeUInt8(flags >>> 0);                  // Flags

        writer.writeUInt16(0);                          // Name
    }
    for (var i = 0; i < this.addNodes.length; i++) {
        var node = this.addNodes[i];
        if (node.nodeId == 0)
            continue;
        var cellX = node.position.x + scrambleX;
        var cellY = node.position.y + scrambleY;
        var cellName = null;
        if (node.owner) {
            cellName = node.owner.getNameUnicode();
        }

        // Write update record
        writer.writeUInt32((node.nodeId ^ scrambleId) >>> 0);         // Cell ID
        writer.writeInt16(cellX >> 0);                // Coordinate X
        writer.writeInt16(cellY >> 0);                // Coordinate Y
        writer.writeUInt16(node.getSize() >>> 0);     // Cell Size (not to be confused with mass, because mass = size*size/100)
        var color = node.getColor();
        writer.writeUInt8(color.r >>> 0);         // Color R
        writer.writeUInt8(color.g >>> 0);         // Color G
        writer.writeUInt8(color.b >>> 0);         // Color B

        var flags = 0;
        if (node.isSpiked)
            flags |= 0x01;      // isVirus
        if (node.isAgitated)
            flags |= 0x10;      // isAgitated
        if (node.cellType == 3)
            flags |= 0x20;      // isEjected
        writer.writeUInt8(flags >>> 0);                  // Flags

        if (cellName != null)
            writer.writeBytes(cellName);        // Name
        else
            writer.writeUInt16(0);                          // Name
    }
    writer.writeUInt32(0);                              // Cell Update record terminator
};

// TODO nicknames for testing
var names = ["13",
    "2ch.hk",
    "4chan",
    "8",
    "8ch",
    "9gag",
    "alien2",
    "alien_",
    "alpaca",
    "android",
    "ankh",
    "apple",
    "arch",
    "argentina",
    "arsenal",
    "australia",
    "austria",
    "ayy lmao",
    "bait",
    "ban",
    "bangladesh",
    "barselona",
    "belgium",
    "berlusconi",
    "blatter",
    "blob",
    "blobio",
    "blood_face",
    "bomb",
    "bomb_",
    "boris",
    "bosnia",
    "botswana",
    "brazil",
    "bread",
    "buffy",
    "bug",
    "bulba",
    "bulgaria",
    "bush",
    "byzantium",
    "cambodia",
    "cameron",
    "canada",
    "candle",
    "captnamerica",
    "char",
    "chavez",
    "chickenleg",
    "chile",
    "china",
    "chrome",
    "cia",
    "clinton",
    "confederate",
    "cookie",
    "cookie_",
    "creeper",
    "croatia",
    "cuba",
    "Czech Republic",
    "deadpool",
    "dems",
    "denmark",
    "diamong",
    "dilma",
    "doge",
    "dondanot",
    "donut",
    "ea",
    "eagle_",
    "earth",
    "edi",
    "enderman",
    "estonia",
    "european union",
    "excalibur",
    "facebook",
    "facepunch",
    "feminism",
    "fidel",
    "finland",
    "flash",
    "france",
    "french kingdom",
    "frog",
    "fuuuu",
    "gangoo",
    "german empire",
    "germany",
    "ghost",
    "greece",
    "harley",
    "heart",
    "hero",
    "hillary",
    "hitler",
    "hollande",
    "hong kong",
    "hungary",
    "huntsman",
    "husky_",
    "hydra",
    "ice_crystal",
    "imperial japan",
    "india",
    "indiana",
    "indonesia",
    "iran",
    "iraq",
    "ireland",
    "irs",
    "italy",
    "jamaica",
    "japan",
    "jason",
    "kc",
    "kim jong-un",
    "king_kong",
    "kolibri_",
    "latvia",
    "lenin",
    "leonard",
    "light_bulb",
    "linux",
    "lithuania",
    "luchador",
    "luxembourg",
    "maldivas",
    "maroo ",
    "maroo_",
    "mars",
    "matriarchy",
    "merkel",
    "messi",
    "mexico",
    "mike",
    "moon",
    "mushroom",
    "nano",
    "nasa",
    "naze",
    "netherlands",
    "nigeria",
    "north korea",
    "norway",
    "nose",
    "not f4mous",
    "nuclear",
    "obama",
    "omg",
    "origin",
    "ozmo",
    "pakistan",
    "palin",
    "patriarchy",
    "peru",
    "piccolo",
    "pika",
    "pirate",
    "pizza",
    "pokerface",
    "poland",
    "portal",
    "portugal",
    "prodota",
    "prussia",
    "putin",
    "qing dynasty",
    "quebec",
    "queen",
    "radar",
    "rainbow",
    "real",
    "receita federal",
    "red",
    "reddit",
    "redhat",
    "rock",
    "rockstar",
    "romania",
    "ronaldo",
    "russia",
    "sanik",
    "satanist",
    "scotland",
    "sealand",
    "sir",
    "skeleton",
    "slime",
    "snakes",
    "somalia",
    "south africa",
    "south korea",
    "spain",
    "spiderman",
    "spir",
    "squi",
    "stalin",
    "starboy",
    "steam",
    "stussy",
    "sun",
    "superman",
    "sweden",
    "switzerland",
    "t-rex",
    "taiwan",
    "target",
    "texas",
    "thailand",
    "trash box",
    "trump",
    "tsarist russia",
    "tsipras",
    "tumblr",
    "turkey",
    "turtle",
    "ubuntu",
    "united kingdom",
    "usa",
    "ussr",
    "valdex",
    "vega",
    "venezuela",
    "vinesauce",
    "vk",
    "war_paint",
    "war_wings",
    "windows",
    "wojak",
    "xbox",
    "yaranaika",
    "youtube",
    "zebra"
];

function stringToBytes(str) {
    // var writer = new BinaryWriter()
    // writer.writeStringZeroUnicode(str);
    // this._nameUnicode = writer.toBuffer();
    // return writer.toBuffer();

    var writer = new BinaryWriter()
    writer.writeStringZeroUnicode(str);
    this._nameUnicode = writer.toBuffer();
    return writer.toBuffer();
}

// protocol 5
UpdateNodes.prototype.writeUpdateItems5 = function (writer) {
    var scrambleX = this.playerTracker.scrambleX;
    var scrambleY = this.playerTracker.scrambleY;
    var scrambleId = this.playerTracker.scrambleId;

    for (var i = 0; i < this.updNodes.length; i++) {
        var node = this.updNodes[i];
        if (node.nodeId == 0)
            continue;
        var cellX = node.position.x + scrambleX;
        var cellY = node.position.y + scrambleY;

        var isVirused = node.owner && node.owner.isVirused;

        // Write update record
        writer.writeUInt32((node.nodeId ^ scrambleId) >>> 0);         // Cell ID
        writer.writeInt32(cellX >> 0);                // Coordinate X
        writer.writeInt32(cellY >> 0);                // Coordinate Y
        writer.writeUInt16(node.getSize() >>> 0);     // Cell Size (not to be confused with mass, because mass = size*size/100)
        var color = node.getColor();
        if (isVirused) {
            color = redColor;
        }
        writer.writeUInt8(color.r >>> 0);         // Color R
        writer.writeUInt8(color.g >>> 0);         // Color G
        writer.writeUInt8(color.b >>> 0);         // Color B

        var flags = 0;
        if (node.isSpiked || isVirused)
            flags |= 0x01;      // isVirus

        if (node.isAgitated)
            flags |= 0x10;      // isAgitated
        if (node.cellType == 3)
            flags |= 0x20;      // isEjected

        if (node.owner && node.owner.protected) {
            flags |= 0x40;
        }
        writer.writeUInt8(flags >>> 0);                  // Flags

        writer.writeUInt16(0);                          // Cell Name
        //if (this.playerTracker.sendOwner){
        //    writer.writeUInt8(0 >>> 0);   					//owner ID already sent
        //}
    }
    for (var i = 0; i < this.addNodes.length; i++) {
        var node = this.addNodes[i];
        if (node.nodeId == 0)
            continue;

        var cellX = node.position.x + scrambleX;
        var cellY = node.position.y + scrambleY;
        var skinName = null;
        if (node.owner) {
            var cellName = stringToBytes(names[node.nodeId % names.length]);
            if (node.nodeId % 10 == 0) {
                cellName = null;
            }
        }

        // var cellName = stringToBytes("ss");
        // if (node.owner) {
        // skinName = node.owner.getSkinUtf8();
        // cellName = node.owner.getNameUnicode();
        // }

        //override cell name, used for coins cell
        cellName = node.customName ? node.customName : cellName;

        var isVirused = node.owner && node.owner.isVirused;

        // Write update record
        writer.writeUInt32((node.nodeId ^ scrambleId) >>> 0);         // Cell ID
        writer.writeInt32(cellX >> 0);                // Coordinate X
        writer.writeInt32(cellY >> 0);                // Coordinate Y
        writer.writeUInt16(node.getSize() >>> 0);     // Cell Size (not to be confused with mass, because mass = size*size/100)
        var color = node.getColor();
        if (isVirused) {
            color = redColor;
        }
        writer.writeUInt8(color.r >>> 0);         // Color R
        writer.writeUInt8(color.g >>> 0);         // Color G
        writer.writeUInt8(color.b >>> 0);         // Color B

        var sendCellType = this.playerTracker.sendCellType;
        var sendOwner = this.playerTracker.sendOwner && node.owner;

        var flags = 0;
        if (node.isSpiked || isVirused)
            flags |= 0x01;      // isVirus


        if (skinName != null)
            flags |= 0x04;      // isSkinPresent
        if (sendOwner)
            flags |= 0x08;      // hasOwnerID
        if (node.isAgitated)
            flags |= 0x10;      // isAgitated (should have waves)
        if (node.cellType == CellType.EJECT)
            flags |= 0x20; //7th
        if (sendCellType) {
            flags |= 0x80; //8th bit   
        }

        writer.writeUInt8(flags >>> 0);                  // Flags

        if (flags & 0x04)
            writer.writeBytes(skinName);       // Skin Name in UTF8

        if (cellName != null)
            writer.writeBytes(cellName);    // Name
        else
            writer.writeUInt16(0);                      // Name

        if (sendOwner) {
            writer.writeUInt32(node.owner.pID);      // owner ID
        }

        if (sendCellType) {
            writer.writeUInt8(node.cellType >> 0);
        }
    }
    writer.writeUInt32(0 >> 0);                         // Cell Update record terminator
};

// protocol 6
UpdateNodes.prototype.writeUpdateItems6 = function (writer) {
    var scrambleX = this.playerTracker.scrambleX;
    var scrambleY = this.playerTracker.scrambleY;
    var scrambleId = this.playerTracker.scrambleId;
    for (var i = 0; i < this.updNodes.length; i++) {
        var node = this.updNodes[i];
        if (node.nodeId == 0)
            continue;

        var cellX = node.position.x + scrambleX;
        var cellY = node.position.y + scrambleY;

        // Write update record
        writer.writeUInt32((node.nodeId ^ scrambleId) >>> 0);         // Cell ID
        writer.writeInt32(cellX >> 0);                // Coordinate X
        writer.writeInt32(cellY >> 0);                // Coordinate Y
        writer.writeUInt16(node.getSize() >>> 0);     // Cell Size (not to be confused with mass, because mass = size*size/100)

        var flags = 0;
        if (node.isSpiked)
            flags |= 0x01;      // isVirus
        if (node.cellType == 0)
            flags |= 0x02;      // isColorPresent (for players only)
        if (node.isAgitated)
            flags |= 0x10;      // isAgitated
        if (node.cellType == 3)
            flags |= 0x20;      // isEjected
        writer.writeUInt8(flags >>> 0);                  // Flags

        if (flags & 0x02) {
            var color = node.getColor();
            writer.writeUInt8(color.r >>> 0);       // Color R
            writer.writeUInt8(color.g >>> 0);       // Color G
            writer.writeUInt8(color.b >>> 0);       // Color B
        }
    }
    for (var i = 0; i < this.addNodes.length; i++) {
        var node = this.addNodes[i];
        if (node.nodeId == 0)
            continue;

        var cellX = node.position.x + scrambleX;
        var cellY = node.position.y + scrambleY;
        var skinName = null;
        var cellName = null;
        if (node.owner) {
            skinName = node.owner.getSkinUtf8();
            cellName = node.owner.getNameUtf8();
        }

        // Write update record
        writer.writeUInt32((node.nodeId ^ scrambleId) >>> 0);         // Cell ID
        writer.writeInt32(cellX >> 0);                // Coordinate X
        writer.writeInt32(cellY >> 0);                // Coordinate Y
        writer.writeUInt16(node.getSize() >>> 0);     // Cell Size (not to be confused with mass, because mass = size*size/100)

        var flags = 0;
        if (node.isSpiked)
            flags |= 0x01;      // isVirus
        if (true)
            flags |= 0x02;      // isColorPresent (always for added)
        if (skinName != null)
            flags |= 0x04;      // isSkinPresent
        if (cellName != null)
            flags |= 0x08;      // isNamePresent
        if (node.isAgitated)
            flags |= 0x10;      // isAgitated
        if (node.cellType == 3)
            flags |= 0x20;      // isEjected
        writer.writeUInt8(flags >>> 0);                  // Flags

        if (flags & 0x02) {
            var color = node.getColor();
            writer.writeUInt8(color.r >>> 0);       // Color R
            writer.writeUInt8(color.g >>> 0);       // Color G
            writer.writeUInt8(color.b >>> 0);       // Color B
        }
        if (flags & 0x04)
            writer.writeBytes(skinName);       // Skin Name in UTF8
        if (flags & 0x08)
            writer.writeBytes(cellName);       // Cell Name in UTF8
    }
    writer.writeUInt32(0);                              // Cell Update record terminator
};

UpdateNodes.prototype.writeEatItems = function (writer) {
    var scrambleId = this.playerTracker.scrambleId;

    writer.writeUInt16(this.eatNodes.length >>> 0);            // EatRecordCount
    for (var i = 0; i < this.eatNodes.length; i++) {
        var node = this.eatNodes[i];
        var hunterId = 0;
        if (node.getKiller()) {
            hunterId = node.getKiller().nodeId;
        }
        writer.writeUInt32((hunterId ^ scrambleId) >>> 0);               // Hunter ID
        writer.writeUInt32((node.nodeId ^ scrambleId) >>> 0);            // Prey ID
    }
};

UpdateNodes.prototype.writeRemoveItems = function (writer, protocol) {
    var scrambleId = this.playerTracker.scrambleId;

    var length = this.eatNodes.length + this.delNodes.length;
    if (protocol < 6)
        writer.writeUInt32(length >>> 0);          // RemoveRecordCount
    else
        writer.writeUInt16(length >>> 0);          // RemoveRecordCount
    for (var i = 0; i < this.eatNodes.length; i++) {
        var node = this.eatNodes[i];
        writer.writeUInt32((node.nodeId ^ scrambleId) >>> 0);                // Cell ID
    }
    for (var i = 0; i < this.delNodes.length; i++) {
        var node = this.delNodes[i];
        writer.writeUInt32((node.nodeId ^ scrambleId) >>> 0);                // Cell ID
    }
};
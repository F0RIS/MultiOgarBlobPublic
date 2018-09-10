var Mode = require('./Mode');
var GamePhase = require('../enum/GamePhaseEnum');

function Tournament() {
    Mode.apply(this, Array.prototype.slice.call(arguments));
    
    this.ID = 4;
    this.name = "Tournament";
    this.packetLB = 48;
    this.IsTournament = true;
    this.hideLeaderBoardNumbers = true;
    this.showAllPlayersOnMinimap = true;
    
    // Config (1 tick = 1000 ms)
    this.prepTime = 5; // Amount of ticks after the server fills up to wait until starting the game
    this.endTime = 15; // Amount of ticks after someone wins to restart the game
    this.autoFill = false;
    this.autoFillPlayers = 1;
    this.dcTime = 0;
    
    // Gamemode Specific Variables
    // this.gamePhase = 0; // 0 = Waiting for players, 1 = Prepare to start, 2 = Game in progress, 3 = End
    this.gamePhase = GamePhase.WAITING_FOR_PLAYERS;
    this.contenders = [];
    this.maxContenders = 12;
    
    this.winner;
    this.timer;
    this.timeLimit = 3600; // in seconds
}

module.exports = Tournament;
Tournament.prototype = new Mode();

// Gamemode Specific Functions

Tournament.prototype.startGamePrep = function (gameServer) {
    this.gamePhase = GamePhase.PREPARE_TO_START;
    this.timer = this.prepTime; // 10 seconds
    
    //save players who start the game
    for (var i = 0; i < this.teamAmount; i++) {
        this.startedGamePlayers[i] = this.teamPlayers[i].slice();
    }
};

Tournament.prototype.startGame = function (gameServer) {
    gameServer.run = true;
    this.gamePhase = GamePhase.GAME_IN_PROGRESS;
    this.getSpectate(); // Gets a random person to spectate
    gameServer.config.playerDisconnectTime = this.dcTime; // Reset config
};

Tournament.prototype.endGame = function (gameServer) {
    this.winner = this.contenders[0];
    this.gamePhase = GamePhase.END_GAME;
    this.timer = this.endTime; // 30 Seconds
};

Tournament.prototype.endGameTimeout = function (gameServer) {
    gameServer.run = false;
    this.gamePhase = GamePhase.END_GAME_TIMEOUT;
    this.timer = this.endTime; // 30 Seconds
};

Tournament.prototype.fillBots = function (gameServer) {
    // Fills the server with bots if there arent enough players
    var fill = this.maxContenders - this.contenders.length;
    for (var i = 0; i < fill; i++) {
        gameServer.bots.addBot();
    }
};

Tournament.prototype.getSpectate = function () {
    // Finds a random person to spectate
    var index = Math.floor(Math.random() * this.contenders.length);
    this.rankOne = this.contenders[index];
};

Tournament.prototype.prepare = function (gameServer) {
    // Remove all cells
    var len = gameServer.nodes.length;
    for (var i = 0; i < len; i++) {
        var node = gameServer.nodes[0];
        
        if (!node) {
            continue;
        }
        
        gameServer.removeNode(node);
    }
    
    gameServer.bots.loadNames();
    
    // Pauses the server
    gameServer.run = false;
    this.gamePhase = GamePhase.WAITING_FOR_PLAYERS;
    
    // Get config values
    if (gameServer.config.tourneyAutoFill > 0) {
        this.timer = gameServer.config.tourneyAutoFill;
        this.autoFill = true;
        this.autoFillPlayers = gameServer.config.tourneyAutoFillPlayers;
    }
    // Handles disconnections
    this.dcTime = gameServer.config.playerDisconnectTime;
    gameServer.config.playerDisconnectTime = 0;
    
    this.prepTime = gameServer.config.tourneyPrepTime;
    this.endTime = gameServer.config.tourneyEndTime;
    this.maxContenders = gameServer.config.tourneyMaxPlayers;
    
    // Time limit
    this.timeLimit = gameServer.config.tourneyTimeLimit * 60; // in seconds
    
    //if game wasn't started for some time, kill this server
    // if (this.autoDie){
    //     var dieFunc = () => {
    //         if (this.gamePhase < GamePhase.GAME_IN_PROGRESS){
    //             gameServer.closeServer();
    //         }
    //     }
    //     setTimeout(dieFunc.bind(this), this.autoDieTime * 1000);
    // }
};

Tournament.prototype.onPlayerDeath = function (players) {
    // Nothing
};

Tournament.prototype.formatTime = function (time) {
    if (time < 0) {
        return "0:00";
    }
    // Format
    var min = Math.floor(this.timeLimit / 60);
    var sec = this.timeLimit % 60;
    sec = (sec > 9) ? sec : "0" + sec.toString();
    return min + ":" + sec;
};

// Override

Tournament.prototype.onServerInit = function (gameServer) {
    this.prepare(gameServer);
};

Tournament.prototype.onPlayerSpawn = function (gameServer, player) {
    // Only spawn players if the game hasnt started yet
    if ((this.gamePhase == GamePhase.WAITING_FOR_PLAYERS) && (this.contenders.length < this.maxContenders)) {
        player.setColor(gameServer.getRandomColor()); // Random color
        this.contenders.push(player); // Add to contenders list
        gameServer.spawnPlayer(player, gameServer.getRandomPosition());
        
        if (this.contenders.length == this.maxContenders) {
            // Start the game once there is enough players
            this.startGamePrep(gameServer);
        }
    }
};

Tournament.prototype.onCellRemove = function (cell) {
    var owner = cell.owner,
    human_just_died = false;
    
    if (owner.cells.length <= 0) {
        // Remove from contenders list
        var index = this.contenders.indexOf(owner);
        if (index != -1) {
            if ('_socket' in this.contenders[index].socket) {
                human_just_died = true;
            }
            if (this.gamePhase == GamePhase.WAITING_FOR_PLAYERS) {
                this.contenders.splice(index, 1);
            }
            if (this.teamPlayers) {
                var index = this.teamPlayers[owner.team].indexOf(owner);
                if (index != -1){
                    owner.pos.free = true;
                    this.teamPlayers[owner.team].splice(index, 1)
                }
            }
        }
        
        // Victory conditions
        var humans = 0;
        for (var i = 0; i < this.contenders.length; i++) {
            if ('_socket' in this.contenders[i].socket) {
                humans++;
            }
        }
        
        // the game is over if:
        // 1) there is only 1 player left, OR
        // 2) all the humans are dead, OR
        // 3) the last-but-one human just died
        if ((this.contenders.length == 1 || humans == 0 || (humans == 1 && human_just_died)) && this.gamePhase == GamePhase.GAME_IN_PROGRESS) {
            //comment this to let normal play with bots
            // this.endGame(cell.owner.gameServer);
        } else {
            // Do stuff
            this.onPlayerDeath(cell.owner);
        }
    }
};

Tournament.prototype.updateLB = function (gameServer, lb) {
    gameServer.leaderboardType = this.packetLB;
    var lb = gameServer.leaderboard;
    
    switch (this.gamePhase) {
        case 0:
        lb[0] = "Waiting for";
        lb[1] = "players: ";
        lb[2] = this.contenders.length + "/" + this.maxContenders;
        if (this.autoFill) {
            if (this.timer <= 0) {
                this.fillBots(gameServer);
            } else if (this.contenders.length >= this.autoFillPlayers) {
                this.timer--;
            }
        }
        break;
        case 1:
        lb[0] = "Game starting in";
        lb[1] = this.timer.toString();
        lb[2] = "Good luck!";
        if (this.timer <= 0) {
            // Reset the game
            this.startGame(gameServer);
        } else {
            this.timer--;
        }
        break;
        case 2:
        lb[0] = "Players Remaining";
        lb[1] = this.contenders.length + "/" + this.maxContenders;
        lb[2] = "Time Limit:";
        lb[3] = this.formatTime(this.timeLimit);
        if (this.timeLimit < 0) {
            // Timed out
            this.endGameTimeout(gameServer);
        } else {
            this.timeLimit--;
        }
        break;
        case 3:
        lb[0] = "Congratulations";
        // lb[1] = this.winner._name;
        lb[1] = this.winner.team == 1 ? "Green Team" : "Red Team";
        lb[2] = "for winning!";
        if (this.timer <= 0) {
            // Reset the game
            process.exit(3);
        } else {
            lb[3] = "Game restarting in";
            lb[4] = this.timer.toString();
            this.timer--;
        }
        break;
        case 4:
        lb[0] = "Time Limit";
        lb[1] = "Reached!";
        if (this.timer <= 0) {
            // Reset the game
            process.exit(3);
        } else {
            lb[2] = "Game restarting in";
            lb[3] = this.timer.toString();
            this.timer--;
        }
        default:
        break;
    }
};

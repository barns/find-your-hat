var promptSync = require('prompt-sync')({ sigint: true });
var DEFAULT_HOLES_PERCENTAGE = 0.2;
var Sprites;
(function (Sprites) {
    Sprites["Hat"] = "^";
    Sprites["Hole"] = "O";
    Sprites["FieldCharacter"] = "\u2591";
    Sprites["PathCharacter"] = "*";
})(Sprites || (Sprites = {}));
var Directions;
(function (Directions) {
    Directions["Up"] = "w";
    Directions["Down"] = "s";
    Directions["Left"] = "a";
    Directions["Right"] = "d";
})(Directions || (Directions = {}));
var GameState;
(function (GameState) {
    GameState[GameState["Playing"] = 0] = "Playing";
    GameState[GameState["Hole"] = 1] = "Hole";
    GameState[GameState["OffField"] = 2] = "OffField";
    GameState[GameState["Won"] = 3] = "Won";
    GameState[GameState["Error"] = 4] = "Error";
})(GameState || (GameState = {}));
var Field = /** @class */ (function () {
    function Field(options) {
        var field = options.field, height = options.height, width = options.width, holesPercentage = options.holesPercentage;
        if (field) {
            this._field = field;
        }
        else if (height && width) {
            this._field = Field.generateField(height, width, holesPercentage);
            this.addSprite(Sprites.PathCharacter);
        }
    }
    Field.generateField = function (height, width, holesPercentage) {
        if (height === void 0) { height = 3; }
        if (width === void 0) { width = 3; }
        if (holesPercentage === void 0) { holesPercentage = DEFAULT_HOLES_PERCENTAGE; }
        var tiles = height * width;
        var numOfHoles = Math.round(tiles * holesPercentage);
        var numOfPaths = tiles - numOfHoles - 1; // Don't forget to take away 1 for the hat! 
        var selectionArray = [Sprites.Hat];
        var playingField = [];
        for (var i = 0; i < tiles - 1; i++) {
            if (i < numOfHoles) {
                selectionArray.push(Sprites.Hole);
            }
            else if (i < numOfHoles + numOfPaths) {
                selectionArray.push(Sprites.FieldCharacter);
            }
        }
        for (var i = 0; i < height; i++) {
            playingField[i] = [];
            for (var j = 0; j < width; j++) {
                var random = Math.floor(Math.random() * selectionArray.length);
                playingField[i] = playingField[i].concat(selectionArray.splice(random, 1));
            }
        }
        return playingField;
    };
    Field.findPlayerInField = function (field) {
        var height = field.length;
        for (var i = 0; i < height; i++) {
            var index = field[i].findIndex(function (tile) { return tile === Sprites.PathCharacter; });
            if (index !== -1) {
                return [index, i];
            }
        }
        return [-1, -1];
    };
    Object.defineProperty(Field.prototype, "field", {
        get: function () {
            return this._field;
        },
        enumerable: false,
        configurable: true
    });
    Field.prototype.addSprite = function (newSprite) {
        var fieldHeight = this._field.length;
        var fieldWidth = this._field[0].length;
        var oldSprite, randomX, randomY;
        do {
            randomX = Math.floor(Math.random() * fieldWidth);
            randomY = Math.floor(Math.random() * fieldHeight);
            oldSprite = this._field[randomY][randomX];
        } while (oldSprite === Sprites.Hat || oldSprite === Sprites.Hole || oldSprite === Sprites.PathCharacter);
        this._field[randomY][randomX] = newSprite;
    };
    Field.prototype.print = function () {
        this._field.forEach(function (row) {
            console.log(row.join(''));
        });
    };
    Field.prototype.setTile = function (coordinate, newSprite) {
        this._field[coordinate[1]][coordinate[0]] = newSprite;
    };
    Field.prototype.checkTile = function (playerCoords) {
        var playerX = playerCoords[0];
        var playerY = playerCoords[1];
        var fieldHeight = this._field.length;
        var fieldWidth = this._field[0].length;
        var currentTileSprite = this._field[playerY][playerX];
        if (playerX < 0 || playerY < 0 || playerX >= fieldWidth || playerY >= fieldHeight) {
            return GameState.OffField;
        }
        switch (currentTileSprite) {
            case Sprites.Hat:
                return GameState.Won;
            case Sprites.Hole:
                return GameState.Hole;
            case Sprites.FieldCharacter:
                this.setTile(playerCoords, Sprites.PathCharacter);
                return GameState.Playing;
            case Sprites.PathCharacter:
                return GameState.Playing;
            default:
                return GameState.Error;
        }
    };
    Field.prototype.move = function (direction, playerCoords) {
        switch (direction) {
            case Directions.Up:
                return [playerCoords[0], playerCoords[1] - 1];
            case Directions.Down:
                return [playerCoords[0], playerCoords[1] + 1];
            case Directions.Left:
                return [playerCoords[0] - 1, playerCoords[1]];
            case Directions.Right:
                return [playerCoords[0] + 1, playerCoords[1]];
            default:
                throw new Error("Error: invalid direction: ".concat(direction, ". Use wasd."));
        }
    };
    return Field;
}());
var Game = /** @class */ (function () {
    function Game(field, hardmode) {
        if (hardmode === void 0) { hardmode = false; }
        this._gamestate = GameState.Playing;
        this._turnNumber = 0;
        this._field = field;
        this._playerCoords = Field.findPlayerInField(field.field);
        this._hardmode = hardmode;
    }
    Object.defineProperty(Game.prototype, "turnNumber", {
        get: function () {
            return this._turnNumber;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Game.prototype, "gamestate", {
        get: function () {
            return this._gamestate;
        },
        enumerable: false,
        configurable: true
    });
    Game.prototype.incrementTurn = function () {
        this._turnNumber++;
    };
    Game.prototype.setGamestate = function (newGamestate) {
        this._gamestate = newGamestate;
    };
    Game.prototype.takeTurn = function () {
        var direction = promptSync('Which direction do you want to move? (use wasd)');
        var movement = this._field.move(direction, this._playerCoords);
        if (Array.isArray(movement)) {
            this._playerCoords = movement;
            this._gamestate = this._field.checkTile(this._playerCoords);
        }
        else {
            console.log('Returned gamestate');
            this._gamestate = movement;
        }
        switch (game.gamestate) {
            case GameState.Won:
                console.log('Congratulations! You found your hat!');
                return;
            case GameState.Hole:
                console.log('Oh no! You fell into a hole! Game over');
                return;
            case GameState.OffField:
                console.log('You moved out of the field! Game over');
                return;
            case GameState.Error:
                console.log('An unknown error occurred');
                return;
        }
    };
    Game.prototype.playGame = function () {
        while (this._gamestate === GameState.Playing) {
            playField.print();
            this.takeTurn();
            this.incrementTurn();
            if (this._hardmode) {
                this._field.addSprite(Sprites.Hole);
            }
        }
    };
    return Game;
}());
var initialField = [
    [Sprites.FieldCharacter, Sprites.FieldCharacter, Sprites.Hole],
    [Sprites.FieldCharacter, Sprites.Hole, Sprites.FieldCharacter],
    [Sprites.FieldCharacter, Sprites.Hat, Sprites.FieldCharacter],
];
// const playField = new Field( { field: initialField } );
var playField = new Field({ height: 4, width: 5 });
var game = new Game(playField, true);
game.playGame();

var promptSync = require('prompt-sync')({ sigint: true });
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
            var playerCoords = Field.findPlayerInField(field);
            this._field = field;
            if (playerCoords[0] === -1, -1) {
                this.addPlayerToField();
            }
            else {
                this._playerCoords = playerCoords;
            }
        }
        else {
            this._field = Field.generateField(height, width, holesPercentage);
            this.addPlayerToField();
        }
    }
    Field.generateField = function (height, width, holesPercentage) {
        if (holesPercentage === void 0) { holesPercentage = 0.2; }
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
    Field.prototype.addPlayerToField = function () {
        var fieldHeight = this._field.length;
        var fieldWidth = this._field[0].length;
        var oldSprite, randomX, randomY;
        do {
            randomX = Math.floor(Math.random() * fieldWidth);
            randomY = Math.floor(Math.random() * fieldHeight);
            oldSprite = this._field[randomY][randomX];
        } while (oldSprite === Sprites.Hat || oldSprite === Sprites.Hole);
        this._playerCoords = [randomX, randomY];
        this._field[randomY][randomX] = Sprites.PathCharacter;
    };
    Field.prototype.print = function () {
        this._field.forEach(function (row) {
            console.log(row.join(''));
        });
    };
    Field.prototype.setTile = function (coordinate, newSprite) {
        this._field[coordinate[1]][coordinate[0]] = newSprite;
    };
    Field.prototype.checkCurrentTile = function () {
        var playerX = this._playerCoords[0];
        var playerY = this._playerCoords[1];
        var currentTileSprite = this._field[playerY][playerX];
        switch (currentTileSprite) {
            case Sprites.Hat:
                return GameState.Won;
            case Sprites.Hole:
                return GameState.Hole;
            case Sprites.FieldCharacter:
                this.setTile(this._playerCoords, Sprites.PathCharacter);
                return GameState.Playing;
            default:
                return GameState.Error;
        }
    };
    Field.prototype.move = function (direction) {
        switch (direction) {
            case Directions.Up:
                if (this._playerCoords[1] === 0) {
                    return GameState.OffField;
                }
                this._playerCoords[1]--;
                break;
            case Directions.Down:
                if (this._playerCoords[1] === this._field.length) {
                    return GameState.OffField;
                }
                this._playerCoords[1]++;
                break;
            case Directions.Left:
                if (this._playerCoords[0] === 0) {
                    return GameState.OffField;
                }
                this._playerCoords[0]--;
                break;
            case Directions.Right:
                if (this._playerCoords[0] === this._field[0].length) {
                    return GameState.OffField;
                }
                this._playerCoords[0]++;
                break;
            default:
                throw new Error("Error: invalid direction: ".concat(direction, ". Use wasd."));
        }
        return this.checkCurrentTile();
    };
    return Field;
}());
var initialField = [
    [Sprites.FieldCharacter, Sprites.FieldCharacter, Sprites.Hole],
    [Sprites.FieldCharacter, Sprites.Hole, Sprites.FieldCharacter],
    [Sprites.FieldCharacter, Sprites.Hat, Sprites.FieldCharacter],
];
var playField = new Field({ field: initialField });
// const playField = new Field({ height: 4, width: 5 });
var playGame = function () {
    while (true) {
        var gameState = void 0;
        playField.print();
        var direction = promptSync('Which direction do you want to move? (use wasd)');
        gameState = playField.move(direction);
        switch (gameState) {
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
    }
};
playGame();

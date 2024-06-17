const promptSync = require('prompt-sync')({sigint: true});

const DEFAULT_HOLES_PERCENTAGE = 0.2;

enum Sprites {
  Hat = '^',
  Hole = 'O',
  FieldCharacter = '░',
  PathCharacter = '*',
}

enum Directions {
  Up = 'w',
  Down = 's',
  Left = 'a',
  Right = 'd',
}

enum GameState {
  Playing,
  Hole,
  OffField,
  Won,
  Error
}

type FieldOptions = {
  field?: PlayingField,
  height?: number,
  width?: number,
  holesPercentage?: number,
}

type Coord = [number, number]; // Coordinates should be given in the format [ x, y ] where [ 0, 0 ] is the top left corner of the field
type PlayingField = Sprites[][];

class Field {
  _field: PlayingField;

  constructor( options: FieldOptions ) {
    const { field, height, width, holesPercentage } = options;

    if( field ) {
      this._field = field;

    } else if( height && width ) {
      this._field = Field.generateField( height, width, holesPercentage );
      this.addSprite( Sprites.PathCharacter );
    }
  }

  static generateField( height = 3, width = 3, holesPercentage = DEFAULT_HOLES_PERCENTAGE): PlayingField {
    const tiles = height * width;
    const numOfHoles = Math.round(tiles * holesPercentage);
    const numOfPaths = tiles - numOfHoles - 1; // Don't forget to take away 1 for the hat! 
    let selectionArray: Sprites[] = [ Sprites.Hat ];
    let playingField: PlayingField = [];

    for( let i = 0; i < tiles - 1; i++ ) {
      if( i < numOfHoles ) {
        selectionArray.push(Sprites.Hole);
      } else if( i < numOfHoles + numOfPaths ) {
        selectionArray.push(Sprites.FieldCharacter);
      }
    }


    for( let i = 0; i < height; i++ ) {
      playingField[i] = [];

      for( let j = 0; j < width; j++) {
        const random = Math.floor(Math.random() * selectionArray.length);
        playingField[i] = playingField[i].concat(selectionArray.splice(random, 1));
      }
    }

    return playingField;
  }

  static findPlayerInField( field: PlayingField ): Coord {
    const height = field.length;

    for( let i = 0; i < height; i++ ) {
      let index = field[i].findIndex( tile => tile === Sprites.PathCharacter);

      if( index !== -1 ) {
        return [ index, i ];
      }
    }

    return [ -1, -1 ];
  }

  get field() {
    return this._field;
  }

  addSprite( newSprite: Sprites ) {
    const fieldHeight = this._field.length;
    const fieldWidth = this._field[0].length;
    let oldSprite: Sprites,
      randomX: number,
      randomY: number;

    do {
      randomX = Math.floor(Math.random() * fieldWidth);
      randomY = Math.floor(Math.random() * fieldHeight);
      oldSprite = this._field[randomY][randomX];
    } while( oldSprite === Sprites.Hat || oldSprite === Sprites.Hole || oldSprite === Sprites.PathCharacter )

    this._field[randomY][randomX] = newSprite;
  }

  print() {
    this._field.forEach( ( row ) => {
      console.log( row.join('') );
    });
  }

  setTile( coordinate: Coord, newSprite: Sprites ) {
    this._field[coordinate[1]][coordinate[0]] = newSprite;
  }

  checkTile( playerCoords: Coord ): GameState {
    const playerX = playerCoords[0];
    const playerY = playerCoords[1];
    const fieldHeight = this._field.length;
    const fieldWidth = this._field[0].length;
    const currentTileSprite = this._field[ playerY ][ playerX ];

    if( playerX < 0 || playerY < 0 || playerX >= fieldWidth || playerY >= fieldHeight ) {
      return GameState.OffField;
    }

    switch( currentTileSprite ) {
      case Sprites.Hat:
        return GameState.Won;

      case Sprites.Hole:
        return GameState.Hole;
      
      case Sprites.FieldCharacter:
        this.setTile( playerCoords, Sprites.PathCharacter );
        return GameState.Playing;

      case Sprites.PathCharacter:
        return GameState.Playing;

      default:
        return GameState.Error;
    }
  }

  move( direction: string, playerCoords: Coord ): Coord | GameState {
    switch( direction ) {
      case Directions.Up:
        return [ playerCoords[0], playerCoords[1] - 1 ];

      case Directions.Down:
        return [ playerCoords[0], playerCoords[1] + 1 ];

      case Directions.Left:
        return [ playerCoords[0] - 1, playerCoords[1] ];

      case Directions.Right:
        return [ playerCoords[0] + 1, playerCoords[1] ];

      default:
        throw new Error( `Error: invalid direction: ${direction}. Use wasd.`);
    }
  }
}

class Game {
  _gamestate: GameState;
  _turnNumber: number;
  _field: Field;
  _hardmode: boolean;
  _playerCoords: Coord;

  constructor( field: Field, hardmode = false ) {
    this._gamestate = GameState.Playing;
    this._turnNumber = 0;
    this._field = field;
    this._playerCoords = Field.findPlayerInField( field.field );
    this._hardmode = hardmode;
  }

  get turnNumber() {
    return this._turnNumber;
  }

  get gamestate() {
    return this._gamestate;
  }

  incrementTurn() {
    this._turnNumber++;
  }

  setGamestate( newGamestate: GameState ) {
    this._gamestate = newGamestate;
  }

  takeTurn() {
    const direction = promptSync( 'Which direction do you want to move? (use wasd)' );
    const movement: GameState | Coord = this._field.move( direction, this._playerCoords );

    if( Array.isArray( movement ) ) {
      this._playerCoords = movement;
      this._gamestate = this._field.checkTile( this._playerCoords );
    } else {
      console.log('Returned gamestate');
      this._gamestate = movement;
    }
    

    switch( game.gamestate ) {
      case GameState.Won:
        console.log('Congratulations! You found your hat!');
        return;

      case GameState.Hole:
        console.log('Oh no! You fell into a hole! Game over');
        return;

      case GameState.OffField:
        console.log( 'You moved out of the field! Game over' );
        return;

      case GameState.Error:
        console.log('An unknown error occurred');
        return;
    }
  }

  playGame() {
    while( this._gamestate === GameState.Playing ) {
      playField.print();
      
      this.takeTurn();
      this.incrementTurn();
  
      if( this._hardmode ) {
        this._field.addSprite( Sprites.Hole );
      }
    }
  }
}

const initialField = [
  [Sprites.FieldCharacter, Sprites.FieldCharacter, Sprites.Hole],
  [Sprites.FieldCharacter, Sprites.Hole, Sprites.FieldCharacter],
  [Sprites.FieldCharacter, Sprites.Hat, Sprites.FieldCharacter],
];

// const playField = new Field( { field: initialField } );
const playField = new Field({ height: 4, width: 5 });

const game = new Game( playField, false );
game.playGame();
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

type Coord = [number, number]; // Coordinates should be given in the format [ x, y ] where [ 0, 0 ] is the top left corner of the field
type PlayingField = Sprites[][];

class Field {
  _field: PlayingField;
  _playerCoords: Coord;

  constructor( options ) {
    const { field, height, width, holesPercentage } = options;

    if( field ) {
      const playerCoords = Field.findPlayerInField( field );
      this._field = field;

      if( playerCoords[0] === -1, -1 ) {
        this.addPlayerToField();
      } else {
        this._playerCoords = playerCoords;
      }
    } else {
      this._field = Field.generateField( height, width, holesPercentage );
      this.addPlayerToField();
    }
  }

  static generateField( height: number, width: number, holesPercentage = DEFAULT_HOLES_PERCENTAGE): PlayingField {
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

  addPlayerToField() {
    const fieldHeight = this._field.length;
    const fieldWidth = this._field[0].length;
    let oldSprite: Sprites,
      randomX: number,
      randomY: number;

    do {
      randomX = Math.floor(Math.random() * fieldWidth);
      randomY = Math.floor(Math.random() * fieldHeight);
      oldSprite = this._field[randomY][randomX];
    } while( oldSprite === Sprites.Hat || oldSprite === Sprites.Hole )

    this._playerCoords = [ randomX, randomY ];
    this._field[randomY][randomX] = Sprites.PathCharacter;
  }

  print() {
    this._field.forEach( ( row ) => {
      console.log( row.join('') );
    });
  }

  setTile( coordinate: Coord, newSprite: Sprites ) {
    this._field[coordinate[1]][coordinate[0]] = newSprite;
  }

  checkCurrentTile(): GameState {
    const playerX = this._playerCoords[0];
    const playerY = this._playerCoords[1];
    const currentTileSprite = this._field[ playerY ][ playerX ];

    switch( currentTileSprite ) {
      case Sprites.Hat:
        return GameState.Won;

      case Sprites.Hole:
        return GameState.Hole;
      
      case Sprites.FieldCharacter:
        this.setTile( this._playerCoords, Sprites.PathCharacter );
        return GameState.Playing;

      default:
        return GameState.Error;
    }
  }

  move( direction: string ): GameState {
    switch( direction ) {
      case Directions.Up:
        if( this._playerCoords[1] === 0 ) {
          return GameState.OffField;
        }

        this._playerCoords[1]--;
        break;

      case Directions.Down:
        if( this._playerCoords[1] === this._field.length ) {
          return GameState.OffField;
        }

        this._playerCoords[1]++;
        break;

      case Directions.Left:
        if( this._playerCoords[0] === 0 ) {
          return GameState.OffField;
        }

        this._playerCoords[0]--;
        break;

      case Directions.Right:
        if( this._playerCoords[0] ===  this._field[0].length ) {
          return GameState.OffField;
        }

        this._playerCoords[0]++;
        break;

      default:
        throw new Error( `Error: invalid direction: ${direction}. Use wasd.`);
    }

    return this.checkCurrentTile();
  }
}

const initialField = [
  [Sprites.FieldCharacter, Sprites.FieldCharacter, Sprites.Hole],
  [Sprites.FieldCharacter, Sprites.Hole, Sprites.FieldCharacter],
  [Sprites.FieldCharacter, Sprites.Hat, Sprites.FieldCharacter],
];

const playField = new Field( { field: initialField } );
// const playField = new Field({ height: 4, width: 5 });

const playGame = () => {
  while( true ) {
    let gameState :GameState;
    playField.print();

    const direction = promptSync( 'Which direction do you want to move? (use wasd)' );
    gameState = playField.move( direction );

    switch( gameState ) {
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
}

playGame();
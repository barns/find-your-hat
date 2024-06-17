# Find your hat
This is a console game written in TypeScript using Node.js as part of the Codecademy Full Stack Developer career path.

To run, just `npm install` and then `node main.js`. If you wish to change any of the options below, remember to recompile using TSC.

The game field can be customised when declaring an instance of `Field`. The constructor accepts an options parameter which is expected to be an object containing either a manually created `PlayingField`, or `height`, `width` and optionally `holesPercentage` parameters to randomly generate a new field.
* If providing a manually created field, this should be a 2-dimensional array of the `PlayingField` type (i.e. 2d array containing `Sprites`). You can either choose a starting location for the player, or leave that out and let the game choose for you.
* If provide `height` and `width` instead, a new field will be generated of the specified size. If you do not provide a `holesPercentage` option, the game defaults to 0.2
* If you provide both a manually created field as well as `width` and `height` options, the game will use the provided field
* I have provided 2 examples on lines 190 and 191 - just uncomment whichever version you want to start with
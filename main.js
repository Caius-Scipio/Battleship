// Initializes the game by setting up event listeners and generating ship locations
function init() {
  let fireButton = document.getElementById("fireButton");
  fireButton.onclick = handleFireButton;
  let guessInput = document.getElementById("guessInput");
  guessInput.onkeydown = handleKeyPress;
  model.generateShipLocations();
  document.querySelectorAll(".cell").forEach(cell => {
    cell.addEventListener("click", handleCellClick);
  });
  const hitSound = document.getElementById('hitSound');
  hitSound.volume = 0.3;
  const missSound = document.getElementById('missSound');
  missSound.volume = 0.3;
};

// Manages the view of the game, including displaying messages and updating the board
let view = {
  displayMessage: function (msg) {
    let messageArea = document.getElementById("messageArea");
    messageArea.innerHTML = msg;
  },
  displayHit: function (location) {
    let cell = document.getElementById(location);
    cell.setAttribute("class", "hit");
  },
  displayMiss: function (location) {
    let cell = document.getElementById(location);
    cell.setAttribute("class", "miss");
  }
};

// Manages the game model, including tracking ship locations and the game state
let model = {
  boardSize: 10,
  numShips: 5,
  shipLength: 3,
  shipsSunk: 0,
  ships: [
    { locations: [0, 0, 0], hits: ["", "", ""] },
    { locations: [0, 0, 0], hits: ["", "", ""] },
    { locations: [0, 0, 0], hits: ["", "", ""] },
    { locations: [0, 0, 0], hits: ["", "", ""] },
    { locations: [0, 0, 0], hits: ["", "", ""] },
  ],
  gameOver: false,

  // Checks the given guess against the ship locations and updates the game state accordingly
  fire: function (guess) {
    if (!this.gameOver) {
      for (let i = 0; i < this.numShips; i++) {
        let ship = this.ships[i];

        // Check if the guess matches a location on the ship
        let index = ship.locations.indexOf(guess);
        if (index >= 0) {
          ship.hits[index] = "hit";
          view.displayHit(guess);
          view.displayMessage("Hit!");
          hitSound.currentTime = 0;
          hitSound.play();
          if (this.isSunk(ship)) {
            view.displayMessage("You sank my battleship!");
            this.shipsSunk++;
            if (this.shipsSunk === this.numShips) {
              view.displayMessage("You sank all my battleships!");
              this.gameOver = true;
            }
          }
          return true;
        }
      }
      missSound.currentTime = 0;
      missSound.play();
      view.displayMiss(guess);
      view.displayMessage("You misssed.");
      return false;
    };
  },

  // Checks if the given ship has been sunk
  isSunk: function (ship) {
    for (let i = 0; i < this.shipLength; i++) {
      if (ship.hits[i] !== "hit") {
        return false;
      }
    }
    return true;
  },

  // Generates random ship locations on the board
  generateShipLocations: function() {
    let locations;
    for (let i = 0; i < this.numShips; i++) {
      do {
        locations = this.generateShip();
      } while (this.collision(locations));
      this.ships[i].locations = locations;
    }
  },

  // Generates a new set of ship locations
  generateShip: function () {
    let direction = Math.floor(Math.random() * 2);
    let row, col;

      // Determine the direction of the ship (horizontal or vertical)
    if (direction === 1) {
      row = Math.floor(Math.random() * this.boardSize);
      col = Math.floor(Math.random() * (this.boardSize - this.shipLength));
    } else {
      row = Math.floor(Math.random() * (this.boardSize - this.shipLength));
      col = Math.floor(Math.random() * this.boardSize);
    }
    let newShipLocations = [];

    // Create an array of locations for the ship based on its direction and length
    for (let i = 0; i < this.shipLength; i++) {
      if (direction === 1) {
        newShipLocations.push(row + "" + (col + i));
      } else {
        newShipLocations.push((row + i) + "" + col);
      }
    }
    return newShipLocations;
  },

  // Checks for collisions between the given locations and existing ships on the board
  collision: function (locations) {
    for (let i = 0; i < this.numShips; i++) {
      let ship = model.ships[i];
      for (let j = 0; j < locations.length; j++) {
        if (ship.locations.indexOf(locations[j]) >= 0) {
          return true;
        }
      }
    }
    return false;
  }
};

// Manages the player's guesses and updates the game state accordingly
let controller = {
  guesses: 0,

  // Processes a player's guess by checking against ship locations and updating the view
  processGuess: function (guess) {
    let location = parseGuess(guess);
    if (location) {
      this.guesses++;
      let hit = model.fire(location);
      if (hit && model.shipsSunk === model.numShips) {
        view.displayMessage("You sank all my battleships, in " + this.guesses + " guesses");
      }
    }
  }
};

// Parses a player's guess from a string into a numerical location
function parseGuess(guess) {
  let alphabet = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J"];
  if (guess === null || guess.length !== 2) {
    alert("Oops, please enter a letter and a number on the board.");
  } else {
    firstChar = guess.charAt(0);

    let row = alphabet.indexOf(firstChar);
    let column = guess.charAt(1);

    if (isNaN(row) || isNaN(column)) {
      alert("Oops, that isn't on the board.");
    } else if (row < 0 || row >= model.boardSize || column < 0 || column >= model.boardSize) {
      alert("Oops, that's off the board!");
    } else {
      return row + column;
    }
  }
  return null;
};

// Handles a click on the fire button
function handleFireButton() {
  let guessInput = document.getElementById("guessInput");
  let guess = guessInput.value;
  controller.processGuess(guess.toUpperCase());
  guessInput.value = "";
};

// Handles a key press on the guess input field
function handleKeyPress(e) {
  let fireButton = document.getElementById("fireButton");
  if (e.keyCode === 13) {
    fireButton.click();
    return false;
  }
};

// Handles a click on a cell on the board
function handleCellClick(event) {
  let cellEvent = event.target;
  let location = cellEvent.id;

  let row = parseInt(location[0]);
  let column = parseInt(location[1]);

  if (row < 0 || row >= model.boardSize || column < 0 || column >= model.boardSize) {
    alert("Oops, that's off the board!");
    return;
  }

  let alphabet = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J"];
  let alphanumericLocation = alphabet[row] + column;

  controller.processGuess(alphanumericLocation.toUpperCase());
};

// Initialize the game when the page loads
window.onload = init;
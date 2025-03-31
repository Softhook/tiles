// Island Hop - P5.js Implementation


const DIRECTIONS = [
  {dx: 0, dy: -1, edge: 0, opposite: 2}, // top
  {dx: 1, dy: 0, edge: 1, opposite: 3},  // right
  {dx: 0, dy: 1, edge: 2, opposite: 0},  // bottom
  {dx: -1, dy: 0, edge: 3, opposite: 1}  // left
];

let gameState = {
  currentPlayer: 0,
  players: [
    { ship: null, tiles: [], movementTokens: 3, color: "#ff4444" },
    { ship: null, tiles: [], movementTokens: 3, color: "#4444ff" }
  ],
  placedTiles: {},
  tileSize: 90,
  tileTypes: [],
  drawPile: [],
  discardPile: [],
  beaconHQ: null,
  gameOver: false,
  score: 0,
  messageLog: [],
  draggedTile: null,
  draggedTileIndex: -1,
  swapMode: false,
  swapTileIndex: -1,
  swapPlayerIndex: -1,
  showInstructions: false,
  movementMode: false,
  discardMode: false,
  gameStarted: false,
  soloMode: false,
  useWindmillsExpansion: false,
  usePiersExpansion: false,
  scoreEnclosedIslands: true,
  selectingTileToKeep: false,
  touchStartPos: null,
  viewX: 0,
  viewY: 0,
  targetViewX: 0,
  targetViewY: 0,
  viewTransitionSpeed: 0.1,
  isViewTransitioning: false,
  shipAnimationProgress: 0,
  shipFromX: 0,
  shipFromY: 0,
  shipToX: 0,
  shipToY: 0,
  isShipMoving: false,

  isPanning: false,       // Is the user currently dragging the view?
  panStartX: 0,         // Screen X where panning started
  panStartY: 0,         // Screen Y where panning started
  panStartViewX: 0,     // View X grid coordinate when panning started
  panStartViewY: 0      // View Y grid coordinate when panning started
};

// Initialize game assets
let shipImages = [];
let tokenBlue, tokenRed;
let backgroundImage;

function setup() {
  createCanvas(windowWidth, windowHeight);
  initializeTileTypes();
  createGameAssets();
  initializeGame();
  
  // Add movement mode to gameState
  gameState.movementMode = false;
  
  // Add instruction button
  let instructionsButton = createButton('Instructions');
  instructionsButton.position(10, 10);
  
  // Add viewport meta tag for mobile devices
  let meta = document.createElement('meta');
  meta.setAttribute('name', 'viewport');
  meta.setAttribute('content', 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no');
  document.getElementsByTagName('head')[0].appendChild(meta);
  
  // Disable default touch behaviors
  document.addEventListener('touchstart', function(e) {
    if (e.target.nodeName !== 'INPUT' && e.target.nodeName !== 'TEXTAREA') {
      e.preventDefault();
    }
  }, { passive: false });
  
  document.addEventListener('touchmove', function(e) {
    if (e.target.nodeName !== 'INPUT' && e.target.nodeName !== 'TEXTAREA') {
      e.preventDefault();
    }
  }, { passive: false });
}

function createGameAssets() {
  // Create ship images - making them larger
  for (let i = 0; i < 2; i++) {
    let shipImg = createGraphics(gameState.tileSize, gameState.tileSize);
    let playerColor = i === 0 ? "#ff4444" : "#4444ff";
    
    // Set background to transparent
    shipImg.clear();
    
    // Simple sideways-facing ship
    shipImg.fill(playerColor);
    shipImg.stroke(0);
    shipImg.strokeWeight(2);
    
    // Hull - simple boat shape facing right
    shipImg.beginShape();
    shipImg.vertex(shipImg.width*0.2, shipImg.height*0.6);  // Bottom left
    shipImg.vertex(shipImg.width*0.8, shipImg.height*0.6);  // Bottom right
    shipImg.vertex(shipImg.width*0.9, shipImg.height*0.4);  // Top right
    shipImg.vertex(shipImg.width*0.2, shipImg.height*0.4);  // Top left
    shipImg.endShape(CLOSE);
    
    // Deck
    shipImg.fill(220, 180, 130);
    shipImg.noStroke();
    shipImg.rect(shipImg.width*0.25, shipImg.height*0.4, shipImg.width*0.5, shipImg.height*0.05);
    
    // Cabin
    shipImg.fill(255);
    shipImg.stroke(0);
    shipImg.strokeWeight(1);
    shipImg.rect(shipImg.width*0.35, shipImg.height*0.3, shipImg.width*0.25, shipImg.height*0.1);
    
    // Smokestack
    shipImg.fill(80);
    shipImg.rect(shipImg.width*0.45, shipImg.height*0.2, shipImg.width*0.1, shipImg.height*0.1);
    
    // Simple steam
    shipImg.noStroke();
    shipImg.fill(255, 255, 255, 150);
    shipImg.ellipse(shipImg.width*0.5, shipImg.height*0.15, shipImg.width*0.1, shipImg.width*0.05);
    shipImg.ellipse(shipImg.width*0.45, shipImg.height*0.15, shipImg.width*0.1, shipImg.width*0.05);
    

    shipImages[i] = shipImg;
  }
  
  // Create token images
  tokenBlue = createGraphics(gameState.tileSize/4, gameState.tileSize/4);
  tokenBlue.noStroke();
  tokenBlue.fill(65, 105, 225); // Royal blue
  tokenBlue.ellipse(tokenBlue.width/2, tokenBlue.height/2, tokenBlue.width, tokenBlue.height);
  tokenBlue.fill(100, 149, 237, 150); // Cornflower blue highlight
  tokenBlue.ellipse(tokenBlue.width/3, tokenBlue.height/3, tokenBlue.width/3, tokenBlue.height/3);
  
  tokenRed = createGraphics(gameState.tileSize/4, gameState.tileSize/4);
  tokenRed.noStroke();
  tokenRed.fill(220, 20, 60); // Crimson red
  tokenRed.ellipse(tokenRed.width/2, tokenRed.height/2, tokenRed.width, tokenRed.height);
  tokenRed.fill(255, 69, 0, 150); // Red-orange highlight
  tokenRed.ellipse(tokenRed.width/3, tokenRed.height/3, tokenRed.width/3, tokenRed.height/3);
  
  // Create background
  backgroundImage = createGraphics(width, height);
  backgroundImage.background(30, 58, 138);
  for (let i = 0; i < 100; i++) {
    backgroundImage.fill(255, 255, 255, random(20, 40));
    backgroundImage.noStroke();
    backgroundImage.ellipse(random(width), random(height), random(1, 3), random(1, 3));
  }
}

function initializeTileTypes() {
  // Create tile types based on the rules
  
  // Format: { id, hasLighthouse, hasBeacon, hasWindmill, isOpenOcean, hasPier, edges: [top, right, bottom, left] }
  // Edge: 0 = water, 1 = land
  
  // Create the Beacon HQ tile
  gameState.beaconHQ = { 
    id: 0, 
    hasLighthouse: true, 
    hasBeacon: false, 
    hasWindmill: false,
    isOpenOcean: true, 
    hasPier: false,
    edges: [0, 0, 0, 0],  // All water edges
    x: 0, 
    y: 0,
    rotation: 0
  };
  
  let tileConfigs = [
    
    // Open ocean tiles (all water edges)
    { id: 1, hasLighthouse: false, hasBeacon: false, hasWindmill: false, isOpenOcean: true, hasPier: false, edges: [0, 0, 0, 0] },
    { id: 2, hasLighthouse: false, hasBeacon: false, hasWindmill: false, isOpenOcean: true, hasPier: false, edges: [0, 0, 0, 0] },
    { id: 3, hasLighthouse: false, hasBeacon: false, hasWindmill: false, isOpenOcean: true, hasPier: false, edges: [0, 0, 0, 0] },
    { id: 4, hasLighthouse: false, hasBeacon: false, hasWindmill: false, isOpenOcean: true, hasPier: false, edges: [0, 0, 0, 0] },
    { id: 5, hasLighthouse: false, hasBeacon: false, hasWindmill: false, isOpenOcean: true, hasPier: false, edges: [0, 0, 0, 0] },
    { id: 6, hasLighthouse: false, hasBeacon: false, hasWindmill: false, isOpenOcean: true, hasPier: false, edges: [0, 0, 0, 0] },

    // Beacons
    { id: 7, hasLighthouse: false, hasBeacon: true, hasWindmill: false, isOpenOcean: true, hasPier: false, edges: [0, 0, 0, 0] },
    { id: 8, hasLighthouse: false, hasBeacon: true, hasWindmill: false, isOpenOcean: true, hasPier: false, edges: [0, 0, 0, 0] },
    { id: 9, hasLighthouse: false, hasBeacon: true, hasWindmill: false, isOpenOcean: true, hasPier: false, edges: [0, 0, 0, 0] },
    { id: 10, hasLighthouse: false, hasBeacon: true, hasWindmill: false, isOpenOcean: true, hasPier: false, edges: [0, 0, 0, 0] },
    { id: 11, hasLighthouse: false, hasBeacon: true, hasWindmill: false, isOpenOcean: true, hasPier: false, edges: [0, 0, 0, 0] },
    { id: 12, hasLighthouse: false, hasBeacon: true, hasWindmill: false, isOpenOcean: true, hasPier: false, edges: [0, 0, 0, 0] },

    // Windmills
    { id: 13, hasLighthouse: false, hasBeacon: false, hasWindmill: true, isOpenOcean: true, hasPier: false, edges: [0, 0, 0, 0] },
    { id: 14, hasLighthouse: false, hasBeacon: false, hasWindmill: true, isOpenOcean: true, hasPier: false, edges: [0, 0, 0, 0] },
    { id: 15, hasLighthouse: false, hasBeacon: false, hasWindmill: true, isOpenOcean: true, hasPier: false, edges: [0, 0, 0, 0] },
    { id: 16, hasLighthouse: false, hasBeacon: false, hasWindmill: true, isOpenOcean: true, hasPier: false, edges: [0, 0, 0, 0] },
    { id: 17, hasLighthouse: false, hasBeacon: false, hasWindmill: true, isOpenOcean: true, hasPier: false, edges: [0, 0, 0, 0] },

    // Bottom edge
    { id: 18, hasLighthouse: false, hasBeacon: false, hasWindmill: false, isOpenOcean: false, hasPier: false, edges: [0, 0, 1, 0] },
    { id: 19, hasLighthouse: false, hasBeacon: false, hasWindmill: false, isOpenOcean: false, hasPier: false, edges: [0, 0, 1, 0] },
    { id: 20, hasLighthouse: false, hasBeacon: true, hasWindmill: false, isOpenOcean: false, hasPier: false, edges: [0, 0, 1, 0] },
    { id: 21, hasLighthouse: false, hasBeacon: true, hasWindmill: false, isOpenOcean: false, hasPier: false, edges: [0, 0, 1, 0] },
    { id: 22, hasLighthouse: true, hasBeacon: false, hasWindmill: false, isOpenOcean: false, hasPier: false, edges: [0, 0, 1, 0] },

    // Top edge
    { id: 23, hasLighthouse: false, hasBeacon: false, hasWindmill: false, isOpenOcean: false, hasPier: false, edges: [1, 0, 0, 0] },
    { id: 24, hasLighthouse: false, hasBeacon: false, hasWindmill: false, isOpenOcean: false, hasPier: false, edges: [1, 0, 0, 0] },
    { id: 25, hasLighthouse: false, hasBeacon: true, hasWindmill: false, isOpenOcean: false, hasPier: false, edges: [1, 0, 0, 0] },
    { id: 26, hasLighthouse: false, hasBeacon: true, hasWindmill: false, isOpenOcean: false, hasPier: false, edges: [1, 0, 0, 0] },
    { id: 27, hasLighthouse: true, hasBeacon: false, hasWindmill: false, isOpenOcean: false, hasPier: false, edges: [1, 0, 0, 0] },

    // Right edge
    { id: 28, hasLighthouse: false, hasBeacon: false, hasWindmill: false, isOpenOcean: false, hasPier: false, edges: [0, 1, 0, 0] },
    { id: 29, hasLighthouse: false, hasBeacon: false, hasWindmill: false, isOpenOcean: false, hasPier: false, edges: [0, 1, 0, 0] },
    { id: 30, hasLighthouse: false, hasBeacon: true, hasWindmill: false, isOpenOcean: false, hasPier: false, edges: [0, 1, 0, 0] },
    { id: 31, hasLighthouse: false, hasBeacon: true, hasWindmill: false, isOpenOcean: false, hasPier: false, edges: [0, 1, 0, 0] },
    { id: 32, hasLighthouse: true, hasBeacon: false, hasWindmill: false, isOpenOcean: false, hasPier: false, edges: [0, 1, 0, 0] },

    // Left edge
    { id: 33, hasLighthouse: false, hasBeacon: false, hasWindmill: false, isOpenOcean: false, hasPier: false, edges: [0, 0, 0, 1] },
    { id: 34, hasLighthouse: false, hasBeacon: false, hasWindmill: false, isOpenOcean: false, hasPier: false, edges: [0, 0, 0, 1] },
    { id: 35, hasLighthouse: false, hasBeacon: true, hasWindmill: false, isOpenOcean: false, hasPier: false, edges: [0, 0, 0, 1] },
    { id: 36, hasLighthouse: false, hasBeacon: true, hasWindmill: false, isOpenOcean: false, hasPier: false, edges: [0, 0, 0, 1] },
    { id: 37, hasLighthouse: true, hasBeacon: false, hasWindmill: false, isOpenOcean: false, hasPier: false, edges: [0, 0, 0, 1] },

    // Top and bottom edge
    { id: 38, hasLighthouse: false, hasBeacon: false, hasWindmill: false, isOpenOcean: false, hasPier: false, edges: [1, 0, 1, 0] },
    { id: 39, hasLighthouse: false, hasBeacon: false, hasWindmill: false, isOpenOcean: false, hasPier: false, edges: [1, 0, 1, 0] },
    { id: 40, hasLighthouse: false, hasBeacon: true, hasWindmill: false, isOpenOcean: false, hasPier: false, edges: [1, 0, 1, 0] },

    // Left and right edge
    { id: 41, hasLighthouse: false, hasBeacon: false, hasWindmill: false, isOpenOcean: false, hasPier: false, edges: [0, 1, 0, 1] },
    { id: 42, hasLighthouse: false, hasBeacon: false, hasWindmill: false, isOpenOcean: false, hasPier: false, edges: [0, 1, 0, 1] },
    { id: 43, hasLighthouse: false, hasBeacon: true, hasWindmill: false, isOpenOcean: false, hasPier: false, edges: [0, 1, 0, 1] },

    // Right and bottom edge
    { id: 44, hasLighthouse: false, hasBeacon: false, hasWindmill: false, isOpenOcean: false, hasPier: false, edges: [0, 1, 1, 0] },
    { id: 45, hasLighthouse: true, hasBeacon: false, hasWindmill: false, isOpenOcean: false, hasPier: false, edges: [0, 1, 1, 0] },
    { id: 46, hasLighthouse: false, hasBeacon: false, hasWindmill: false, isOpenOcean: false, hasPier: true, edges: [0, 1, 1, 0] },

    // Bottom and left edge
    { id: 47, hasLighthouse: false, hasBeacon: false, hasWindmill: false, isOpenOcean: false, hasPier: false, edges: [0, 0, 1, 1] },
    { id: 48, hasLighthouse: true, hasBeacon: false, hasWindmill: false, isOpenOcean: false, hasPier: false, edges: [0, 0, 1, 1] },
    { id: 49, hasLighthouse: false, hasBeacon: false, hasWindmill: false, isOpenOcean: false, hasPier: true, edges: [0, 0, 1, 1] },

    // Right and top edge
    { id: 50, hasLighthouse: false, hasBeacon: false, hasWindmill: false, isOpenOcean: false, hasPier: false, edges: [1, 1, 0, 0] },
    { id: 51, hasLighthouse: true, hasBeacon: false, hasWindmill: false, isOpenOcean: false, hasPier: false, edges: [1, 1, 0, 0] },
    { id: 52, hasLighthouse: false, hasBeacon: false, hasWindmill: false, isOpenOcean: false, hasPier: true, edges: [1, 1, 0, 0] },

    // Top and left edge
    { id: 53, hasLighthouse: false, hasBeacon: false, hasWindmill: false, isOpenOcean: false, hasPier: false, edges: [1, 0, 0, 1] },
    { id: 54, hasLighthouse: true, hasBeacon: false, hasWindmill: false, isOpenOcean: false, hasPier: false, edges: [1, 0, 0, 1] },
    { id: 55, hasLighthouse: false, hasBeacon: false, hasWindmill: false, isOpenOcean: false, hasPier: true, edges: [1, 0, 0, 1] },

    // Left top right
    { id: 56, hasLighthouse: false, hasBeacon: false, hasWindmill: false, isOpenOcean: false, hasPier: false, edges: [1, 1, 0, 1] },
    { id: 57, hasLighthouse: true, hasBeacon: false, hasWindmill: false, isOpenOcean: false, hasPier: false, edges: [1, 1, 0, 1] },

    // Right, bottom, left
    { id: 58, hasLighthouse: false, hasBeacon: false, hasWindmill: false, isOpenOcean: false, hasPier: false, edges: [0, 1, 1, 1] },
    { id: 59, hasLighthouse: true, hasBeacon: false, hasWindmill: false, isOpenOcean: false, hasPier: false, edges: [0, 1, 1, 1] },

    // Top, bottom, left
    { id: 60, hasLighthouse: false, hasBeacon: false, hasWindmill: false, isOpenOcean: false, hasPier: false, edges: [1, 0, 1, 1] },
    { id: 61, hasLighthouse: true, hasBeacon: false, hasWindmill: false, isOpenOcean: false, hasPier: false, edges: [1, 0, 1, 1] },

    // Top, bottom, right
    { id: 62, hasLighthouse: false, hasBeacon: false, hasWindmill: false, isOpenOcean: false, hasPier: false, edges: [1, 1, 1, 0] },
    { id: 63, hasLighthouse: true, hasBeacon: false, hasWindmill: false, isOpenOcean: false, hasPier: false, edges: [1, 1, 1, 0] }
  ];
  
  // Add all tile types to the game state
  gameState.tileTypes = [gameState.beaconHQ, ...tileConfigs];
}

function initializeGame() {
  resetGameState();     // Resets piles, players etc.
  placeHQTile();        // Places the starting tile
  createDrawPile();     // Creates the pile BASED ON EXPANSION FLAGS
  shuffleDrawPile();    // Shuffles the filtered pile
  initializePlayers();  // Players draw initial tiles from the filtered pile
  initializeViewPosition();
  // Reset any lingering modes from previous game/intro
  gameState.movementMode = false;
  gameState.discardMode = false;
  gameState.swapMode = false;
  gameState.selectingTileToKeep = false;
  gameState.showInstructions = false;
  gameState.isShipMoving = false;
  gameState.isViewTransitioning = false;
  gameState.gameOver = false;
}

function resetGameState() {
  gameState.placedTiles = {};
  gameState.drawPile = []; // Cleared here, repopulated by createDrawPile
  gameState.discardPile = [];
  gameState.score = 0;
  gameState.messageLog = [];
  gameState.currentPlayer = 0;
  // DO NOT reset gameState.useWindmillsExpansion or gameState.usePiersExpansion here
  // DO NOT reset gameState.soloMode here
  // DO NOT reset gameState.gameStarted here
  gameState.players = [ // Reset player structure basics
      { ship: null, tiles: [], movementTokens: 3, color: "#ff4444" },
      { ship: null, tiles: [], movementTokens: 3, color: "#4444ff" }
  ];
   // Other necessary resets
  gameState.draggedTile = null;
  gameState.draggedTileIndex = -1;
  // ... etc. reset any other in-game state variables needed
}

function placeHQTile() {
  let hqTile = Object.assign({}, gameState.beaconHQ);
  gameState.placedTiles["0,0"] = hqTile;
}

function createDrawPile() {
  gameState.drawPile = []; // Start with an empty pile

  // gameState.tileTypes contains the HQ at index 0, and tiles 1-63 at indices 1-63.
  // We want to iterate through the actual tile definitions (indices 1 through 63).
  // The total number of non-HQ tile definitions is gameState.tileTypes.length - 1.
  const totalNonHQTiles = gameState.tileTypes.length - 1; // Should be 63 if initialized correctly

  for (let i = 1; i <= totalNonHQTiles; i++) { // Loop from index 1 up to and including the last tile index
    let tileConfig = gameState.tileTypes[i];
    let includeTile = false; // Assume exclusion by default

    // Check if it's a base game tile (neither windmill nor pier)
    if (!tileConfig.hasWindmill && !tileConfig.hasPier) {
      includeTile = true;
    }
    // OR check if it's a windmill tile and the expansion is active
    else if (tileConfig.hasWindmill && gameState.useWindmillsExpansion) {
      includeTile = true;
    }
    // OR check if it's a pier tile and the expansion is active
    else if (tileConfig.hasPier && gameState.usePiersExpansion) {
      includeTile = true;
    }

    // If the tile meets the criteria based on active expansions
    if (includeTile) {
        // Push the tile's ID (which is equal to its index 'i' in this structure)
        gameState.drawPile.push(i);
    }
  }

  console.log(`Created draw pile with ${gameState.drawPile.length} tiles.`); // Add a log to check the count
  // Expected counts:
  // Base only: 54
  // Base + Windmills: 59
  // Base + Piers: 58
  // Base + Both: 63

  // The shuffleDrawPile() function will be called after this in initializeGame()
}

function shuffleDrawPile() {
  gameState.drawPile = shuffleArray(gameState.drawPile);
}

function initializePlayers() {
  if (gameState.soloMode) {
    initializeSoloPlayer();
  } else {
    initializeTwoPlayerMode();
  }
}

function initializeSoloPlayer() {
  gameState.players = [{
    ship: { x: 0, y: 0 },
    tiles: [],
    movementTokens: 4, // Solo mode gets 4 tokens
    color: "#ff4444"
  }];
  
  drawInitialTiles(gameState.players[0], 3);
  addMessage("Solo game started! You have 4 movement tokens.");
}

function initializeTwoPlayerMode() {
  gameState.players = [
    { ship: { x: 0, y: 0 }, tiles: [], movementTokens: 3, color: "#ff4444" },
    { ship: { x: 0, y: 0 }, tiles: [], movementTokens: 3, color: "#4444ff" }
  ];
  
  gameState.players.forEach(player => drawInitialTiles(player, 3));
  addMessage("2-player game started! Player 1's turn");
}

function drawInitialTiles(player, count) {
  for (let i = 0; i < count; i++) {
    if (gameState.drawPile.length > 0) {
      let tileId = gameState.drawPile.pop();
      player.tiles.push(Object.assign({}, gameState.tileTypes[tileId]));
    }
  }
}

function initializeViewPosition() {
  let startPlayer = gameState.players[gameState.currentPlayer];
  gameState.viewX = startPlayer.ship.x;
  gameState.viewY = startPlayer.ship.y;
  gameState.targetViewX = gameState.viewX;
  gameState.targetViewY = gameState.viewY;
}

function draw() {
  if (!gameState.gameStarted) {
    drawIntroScreen();
    return;
  }
  
  // Update animations
  updateAnimations();
  
  // Clear background
  background(30, 58, 138); // North Sea blue
  
  // Draw game board with camera offset
  push();
  translate(width/2 - gameState.viewX * gameState.tileSize, 
           height/2 - gameState.viewY * gameState.tileSize);
  drawBoard();
  pop();
  
  // Draw UI elements (these stay fixed on screen)
  drawPlayerUI();
  drawActionButtons();
  
  // Draw dragged tile if any
  if (gameState.draggedTile) {
    push();
    translate(mouseX, mouseY);
    drawTile(gameState.draggedTile, -gameState.tileSize/2, -gameState.tileSize/2);
    pop();
  }
  
  // Draw message log
  drawMessageLog();
  
  // Draw tiles left counter and current score
  fill(255);
  textAlign(RIGHT, TOP);
  textSize(18);
  text(`Tiles left: ${gameState.drawPile.length}`, width - 20, 20);
  text(`Current Score: ${calculateScore()}`, width - 150, 20);
  
  // Draw game over state
  if (gameState.gameOver) {
    drawGameOver();
  }
  
  // Draw instructions if shown
  if (gameState.showInstructions) {
    drawInstructions();
  }
}

function drawIntroScreen() {
  background(30, 58, 138);

  // Title
  fill(255);
  textAlign(CENTER, CENTER);
  textSize(64);
  text("Island Hop", width / 2, height / 4);

  let buttonWidth = 220;
  let buttonHeight = 50;
  let checkboxSize = 30;
  let spacing = 20;
  let currentY = height / 2 - buttonHeight; // Start position for UI elements

  // --- Expansion Selection ---
  textSize(24);
  textAlign(LEFT, CENTER);

  // Windmills Expansion Toggle
  let windmillCheckboxX = width / 2 - buttonWidth / 2;
  let windmillCheckboxY = currentY;
  fill(gameState.useWindmillsExpansion ? '#4CAF50' : '#cccccc'); // Green if active, grey otherwise
  stroke(0);
  strokeWeight(1);
  rect(windmillCheckboxX, windmillCheckboxY, checkboxSize, checkboxSize, 5);
  if (gameState.useWindmillsExpansion) {
      fill(255);
      textSize(20);
      text("✔", windmillCheckboxX + checkboxSize / 2 - 10, windmillCheckboxY + checkboxSize / 2); // Checkmark
  }
  fill(255);
  textSize(24);
  text("Windmills Expansion", windmillCheckboxX + checkboxSize + spacing, windmillCheckboxY + checkboxSize / 2);
  currentY += buttonHeight + spacing;

  // Piers Expansion Toggle
  let pierCheckboxX = width / 2 - buttonWidth / 2;
  let pierCheckboxY = currentY;
  fill(gameState.usePiersExpansion ? '#4CAF50' : '#cccccc'); // Green if active, grey otherwise
  stroke(0);
  rect(pierCheckboxX, pierCheckboxY, checkboxSize, checkboxSize, 5);
   if (gameState.usePiersExpansion) {
      fill(255);
      textSize(20);
      text("✔", pierCheckboxX + checkboxSize / 2 - 10, pierCheckboxY + checkboxSize / 2); // Checkmark
  }
  fill(255);
  textSize(24);
  text("Piers Expansion", pierCheckboxX + checkboxSize + spacing, pierCheckboxY + checkboxSize / 2);
  currentY += buttonHeight + spacing;

// Score Islands Toggle
let scoreIslandsCheckboxX = width / 2 - buttonWidth / 2;
let scoreIslandsCheckboxY = currentY;
fill(gameState.scoreEnclosedIslands ? '#4CAF50' : '#cccccc'); // Green if active
stroke(0);
rect(scoreIslandsCheckboxX, scoreIslandsCheckboxY, checkboxSize, checkboxSize, 5);
if (gameState.scoreEnclosedIslands) {
    fill(255);
    textSize(20);
    text("✔", scoreIslandsCheckboxX + checkboxSize / 2 - 10, scoreIslandsCheckboxY + checkboxSize / 2); // Checkmark
}
fill(255);
textSize(24);
textAlign(LEFT, CENTER); // Make sure text aligns correctly
text("Score Islands", scoreIslandsCheckboxX + checkboxSize + spacing, scoreIslandsCheckboxY + checkboxSize / 2);
currentY += buttonHeight + spacing * 2; // Extra spacing before start buttons


  // --- Game Mode Buttons ---
  textAlign(CENTER, CENTER);
  let startButtonWidth = 180;
  let startButtonHeight = 60;

  // Solo mode button
  fill(100, 100, 100);
  rect(width/2 - startButtonWidth - spacing/2, currentY, startButtonWidth, startButtonHeight, 10);
  fill(255);
  textSize(24);
  text("Start Solo", width/2 - startButtonWidth/2 - spacing/2, currentY + startButtonHeight/2);

  // 2 Player mode button
  fill(100, 100, 100);
  rect(width/2 + spacing/2, currentY, startButtonWidth, startButtonHeight, 10);
  fill(255);
  text("Start 2 Player", width/2 + startButtonWidth/2 + spacing/2, currentY + startButtonHeight/2);
}

function drawBoard() {
  // Draw placed tiles
  for (let key in gameState.placedTiles) {
    let pos = key.split(',');
    let x = parseInt(pos[0]);
    let y = parseInt(pos[1]);
    
    let screenX = x * gameState.tileSize;
    let screenY = y * gameState.tileSize;
    
    push();
    translate(screenX, screenY);
    drawTile(gameState.placedTiles[key], -gameState.tileSize/2, -gameState.tileSize/2);
    pop();
  }
  
  // Draw ships with animation
  for (let i = 0; i < gameState.players.length; i++) {
    let player = gameState.players[i];
    if (player.ship) {
      let shipX, shipY;
      
      if (i === gameState.currentPlayer && gameState.isShipMoving) {
        // Interpolate position for animated ship
        shipX = lerp(gameState.shipFromX, gameState.shipToX, gameState.shipAnimationProgress);
        shipY = lerp(gameState.shipFromY, gameState.shipToY, gameState.shipAnimationProgress);
      } else {
        shipX = player.ship.x;
        shipY = player.ship.y;
      }
      
      let screenX = shipX * gameState.tileSize - shipImages[i].width/2;
      let screenY = shipY * gameState.tileSize - shipImages[i].height/2;
      
      // Draw active ship indicator
      if (i === gameState.currentPlayer) {
        push();
        translate(shipX * gameState.tileSize, shipY * gameState.tileSize);
        
        if (!gameState.soloMode) {
          noFill();
          stroke(255, 255, 0, 150 + sin(frameCount * 0.1) * 50);
          strokeWeight(3);
          ellipse(0, 0, gameState.tileSize * 0.9, gameState.tileSize * 0.9);
        }
        
        // Direction arrows if in movement mode (show in both modes)
        if (gameState.movementMode && i === gameState.currentPlayer) {
          let arrowSize = gameState.tileSize * 0.2;
          fill(255, 255, 0, 200);
          noStroke();
          
          // Check each direction for valid moves
          let directions = [
            {dx: 0, dy: -1, angle: -PI/2}, // top
            {dx: 1, dy: 0, angle: 0},      // right
            {dx: 0, dy: 1, angle: PI/2},   // bottom
            {dx: -1, dy: 0, angle: PI}     // left
          ];
          
          for (let dir of directions) {
            let newX = player.ship.x + dir.dx;
            let newY = player.ship.y + dir.dy;
            
            if (isValidMoveTarget(newX, newY)) {
              push();
              translate(dir.dx * gameState.tileSize * 0.6, dir.dy * gameState.tileSize * 0.6);
              rotate(dir.angle);
              
              // Arrow
              beginShape();
              vertex(0, -arrowSize);
              vertex(arrowSize, 0);
              vertex(0, arrowSize);
              endShape(CLOSE);
              
              // Pulsing effect
              let pulseSize = 5 + sin(frameCount * 0.2) * 2;
              fill(255, 255, 0, 100);
              ellipse(0, 0, pulseSize, pulseSize);
              pop();
            }
          }
        }
        pop();
      }
      
      image(shipImages[i], screenX, screenY);
    }
  }
  
  // Draw valid placement highlights
  highlightValidPlacements();
}


function drawTile(tile, x, y) {
    let tileSize = gameState.tileSize;
    drawBaseTile(x, y, tileSize);
    let rotatedEdges = rotateEdges(tile.edges, tile.rotation);
    drawEdges(rotatedEdges, tile, x, y, tileSize);
    drawSpecialFeatures(tile, rotatedEdges, x, y, tileSize);
    drawWindmill(tile, x, y, tileSize);
    drawPointsValue(tile, x, y, tileSize);
}

function drawBaseTile(x, y, tileSize) {
    fill(100, 145, 200);
    stroke(0);
    strokeWeight(1);
    rect(x, y, tileSize, tileSize);
}

function drawEdges(rotatedEdges, tile, x, y, tileSize) {
    for (let i = 0; i < 4; i++) {
        push();
        translate(x + tileSize / 2, y + tileSize / 2);
        rotate(i * HALF_PI);
        if (rotatedEdges[i] === 1) {
            drawLandEdge(tile, i, tileSize);
        } else if (!tile.isOpenOcean) {
            // Coastal water - static
        } else {
            drawOpenOceanWaves(tileSize);
        }
        pop();
    }
}

function drawLandEdge(tile, edgeIndex, tileSize) {
    noStroke();
    let tileId = tile.id || 0;
    let seed1 = tileId * 37 + edgeIndex * 13;
    let seed2 = tileId * 23 + edgeIndex * 5;
    let seed3 = tileId * 17 + edgeIndex * 29;
    let cp1x = -tileSize * 0.25 + sin(seed1 * 0.1) * (tileSize * 0.2);
    let cp1y = -tileSize * 0.1 + cos(seed1 * 0.2) * (tileSize * 0.15);
    let cp2x = tileSize * 0.25 + sin(seed2 * 0.1) * (tileSize * 0.2);
    let cp2y = -tileSize * 0.1 + cos(seed2 * 0.2) * (tileSize * 0.15);
    let depth1 = tileSize * (0.6 + sin(seed3 * 0.3) * 0.15);
    let depth2 = tileSize * (0.5 + cos(seed3 * 0.2) * 0.15);
    drawSandBackground(tileSize, depth1);
    drawSandForeground(tileSize, cp1x, cp1y, cp2x, cp2y, depth2);
    drawSandDetails(tileId, edgeIndex, tileSize);
}

function drawSandBackground(tileSize, depth1) {
    fill(255, 200, 140);
    beginShape();
    vertex(-tileSize / 2, -tileSize / 2);
    vertex(tileSize / 2, -tileSize / 2);
    bezierVertex(tileSize / 3, -tileSize / 2 + depth1 * 0.5, -tileSize / 3, -tileSize / 2 + depth1 * 0.8, -tileSize / 2, -tileSize / 2);
    endShape(CLOSE);
}

function drawSandForeground(tileSize, cp1x, cp1y, cp2x, cp2y, depth2) {
    fill(240, 230, 140);
    beginShape();
    vertex(-tileSize / 2, -tileSize / 2);
    vertex(tileSize / 2, -tileSize / 2);
    bezierVertex(tileSize / 4 + cp1x * 0.6, -tileSize / 2 + depth2 * 0.8 + cp1y * 0.6, -tileSize / 4 + cp2x * 0.6, -tileSize / 2 + depth2 * 0.9 + cp2y * 0.6, -tileSize / 2, -tileSize / 2);
    endShape(CLOSE);
}

function drawSandDetails(tileId, edgeIndex, tileSize) {
    fill(230, 210, 130, 150);
    noStroke();
    for (let j = 0; j < 5; j++) {
        let bumpSeed = tileId * 17 + edgeIndex * 19 + j * 31;
        let bumpX = map(sin(bumpSeed), -1, 1, -tileSize / 3, tileSize / 3);
        let bumpY = -tileSize / 2 + map(cos(bumpSeed * 1.5), -1, 1, tileSize / 3, tileSize / 2);
        let bumpSize = map(sin(bumpSeed * 2.7), -1, 1, tileSize / 30, tileSize / 20);
        circle(bumpX, bumpY, bumpSize);
    }
}

function drawOpenOceanWaves(tileSize) {
    stroke(255, 255, 255, 150);
    strokeWeight(1);
    for (let j = 0; j < 3; j++) {
        let y = -tileSize / 2 + j * 5 + 2;
        beginShape();
        for (let x = -tileSize / 2; x <= tileSize / 2; x += 5) {
            vertex(x, y + sin(frameCount * 0.05 + x * 0.1) * 2);
        }
        endShape();
    }
}

function drawSpecialFeatures(tile, rotatedEdges, x, y, tileSize) {
    push();
    translate(x + tileSize / 2, y + tileSize / 2);
    if (tile.hasLighthouse) {
        drawLighthouse(tile, rotatedEdges, tileSize);
    } else if (tile.hasBeacon) {
        drawBeacon(tileSize);
    }
    if (tile.hasPier) {
        drawPier(tile, rotatedEdges, tileSize);
    }
    pop();
}

function drawLighthouse(tile, rotatedEdges, tileSize) {
    let landEdgeIndex = rotatedEdges.indexOf(1);
    fill(200);
    stroke(0);
    strokeWeight(1);
    rect(-tileSize * 0.15, -tileSize * 0.0625, tileSize * 0.3, tileSize * 0.5);
    for (let i = 0; i < 3; i++) {
        fill(255, 0, 0);
        rect(-tileSize * 0.15, tileSize * 0.0625 + i * tileSize * 0.125, tileSize * 0.3, tileSize * 0.0625);
    }
    fill(150);
    rect(-tileSize * 0.1875, -tileSize * 0.1875, tileSize * 0.375, tileSize * 0.125);
    fill(255);
    stroke(0);
    ellipse(0, -tileSize * 0.25, tileSize * 0.25, tileSize * 0.25);
    if (landEdgeIndex !== -1) {
        rotate(landEdgeIndex * HALF_PI);
    }
}

function drawBeacon(tileSize) {
    stroke(0);
    strokeWeight(2);
    fill(255, 0, 0);
    ellipse(0, 0, tileSize * 0.3125, tileSize * 0.3125);
    fill(255);
    noStroke();
    rect(-tileSize * 0.15, -tileSize * 0.0625, tileSize * 0.3, tileSize * 0.125);
    fill(255, 255, 0);
    stroke(0);
    strokeWeight(1);
    ellipse(0, 0, tileSize * 0.125, tileSize * 0.125);
    let blinkSpeed = 0.1;
    let blinkIntensity = 100 + sin(frameCount * blinkSpeed) * 50;
    fill(255, 255, 0, blinkIntensity);
    ellipse(0, 0, tileSize * 0.1875, tileSize * 0.1875);
}


function drawPier(tile, rotatedEdges, tileSize) {
    let landEdgeIndex = rotatedEdges.indexOf(1);
    if (landEdgeIndex !== -1) {
        push();
        rotate(landEdgeIndex * HALF_PI);
        fill(139, 69, 19);
        noStroke();
        rect(-tileSize * 0.3125, -tileSize * 0.1, tileSize * 0.625, tileSize * 0.2);
        stroke(101, 67, 33);
        strokeWeight(1);
        for (let i = -tileSize * 0.25; i < tileSize * 0.25; i += tileSize * 0.0625) {
            line(i, -tileSize * 0.1, i, tileSize * 0.1);
        }
        fill(101, 67, 33);
        noStroke();
        rect(-tileSize * 0.25, -tileSize * 0.125, tileSize * 0.075, tileSize * 0.25);
        rect(0, -tileSize * 0.125, tileSize * 0.075, tileSize * 0.25);
        rect(tileSize * 0.1875, -tileSize * 0.125, tileSize * 0.075, tileSize * 0.25);
        stroke(200);
        strokeWeight(1);
        beginShape();
        for (let x = -tileSize * 0.3125; x < tileSize * 0.3125; x += tileSize * 0.0625) {
            vertex(x, -tileSize * 0.125 + sin(x * 0.2) * 2);
        }
        endShape();
        pop();
    }
}

function drawPointsValue(tile, x, y, tileSize) {
    if (tile.x !== undefined && tile.y !== undefined) {
        let points = calculatePoints(tile);

        if (points > 0) { 
        push();
        fill(255);
        stroke(0);
        strokeWeight(3);
        textSize(tileSize * 0.3);
        textAlign(CENTER, CENTER);
        text(`${points}`, 0, -tileSize * 0.25);
        pop();
      }
    }
}

function calculatePoints(tile) {
    let points = 0;

    // Check for enclosed land mass
    if (gameState.scoreEnclosedIslands) {
        points += checkEnclosedLandMass(tile);
    }

    // Only add feature points if the tile is fully explored
    if (isFullyExplored(tile.x, tile.y)) {

        points += 1; //1 points because its enclosed
        if (tile.hasLighthouse) points += 2;
        if (tile.hasBeacon) points += 1;
        if (tile.hasWindmill) {
            points += calculateWindmillBonus(tile);
        }
    }

    return points;
}

function checkEnclosedLandMass(tile) {
    let points = 0;
    let directions = [
        {dx: 0, dy: -1, edge: 0, opposite: 2}, // top
        {dx: 1, dy: 0, edge: 1, opposite: 3}, // right
        {dx: 0, dy: 1, edge: 2, opposite: 0}, // bottom
        {dx: -1, dy: 0, edge: 3, opposite: 1} // left
    ];

    for (let dir of directions) {
        let adjX = tile.x + dir.dx;
        let adjY = tile.y + dir.dy;
        let adjKey = `${adjX},${adjY}`;
        let adjTile = gameState.placedTiles[adjKey];

        if (adjTile && tile.edges[dir.edge] === 1 && adjTile.edges[dir.opposite] === 1) {
            points += 1;
        }
    }

    return points;
}

function calculateWindmillBonus(tile) {
    let windmillBonus = 0;
    let directions = [
        { dx: 0, dy: -1 },
        { dx: 1, dy: 0 },
        { dx: 0, dy: 1 },
        { dx: -1, dy: 0 }
    ];
    for (let dir of directions) {
        let adjX = tile.x + dir.dx;
        let adjY = tile.y + dir.dy;
        let adjKey = `${adjX},${adjY}`;
        let adjTile = gameState.placedTiles[adjKey];
        if (adjTile && adjTile.isOpenOcean) {
            windmillBonus += 1;
        }
    }
    return windmillBonus;
}

function drawWindmill(tile, x, y, tileSize) {
    if (tile.hasWindmill) {
        push();
        translate(x + tileSize / 2, y + tileSize / 2);
        fill(150, 75, 0);
        stroke(0);
        strokeWeight(1);
        rect(-tileSize * 0.1, -tileSize * 0.0625, tileSize * 0.2, tileSize * 0.4375);
        push();
        translate(0, 0);
        rotate(frameCount * 0.02);
        fill(200);
        stroke(0);
        strokeWeight(1);
        for (let i = 0; i < 4; i++) {
            push();
            rotate(i * HALF_PI);
            beginShape();
            vertex(0, 0);
            vertex(-tileSize * 0.0625, -tileSize * 0.3125);
            vertex(tileSize * 0.0625, -tileSize * 0.3125);
            endShape(CLOSE);
            pop();
        }
        fill(100);
        ellipse(0, 0, tileSize * 0.1, tileSize * 0.1);
        pop();
        pop();
    }
}


function drawPlayerUI() {
    // Draw all players' hands, not just the current player
    for (let playerIndex = 0; playerIndex < gameState.players.length; playerIndex++) {
        let player = gameState.players[playerIndex];

        // Calculate the starting position for the player's hand
        let startX = gameState.soloMode ?
            width / 2 - (player.tiles.length * gameState.tileSize) / 2 : // Center in solo mode
            (playerIndex === 0 ? gameState.tileSize : width - gameState.tileSize * (player.tiles.length + 1)); // Sides in 2-player

        // Draw player background (semi-transparent)
        noStroke();
        let bgOpacity = playerIndex === gameState.currentPlayer ? "44" : "22"; // Hex alpha
        fill(color(player.color + bgOpacity)); // Apply color and opacity
        rect(startX - 5, height - gameState.tileSize * 1.5 - 5, player.tiles.length * gameState.tileSize + 10, gameState.tileSize * 1.2 + 10, 10); // Slightly larger bg

        // Draw movement tokens for current player (positioning logic remains the same)
        if (playerIndex === gameState.currentPlayer) {
            let tokenY = height - gameState.tileSize * 2; // Position above tiles
            let tokenBgX;
            if (gameState.soloMode) {
                tokenBgX = width / 2 - gameState.tileSize * 1.5; // Fixed center position in solo mode
            } else {
                tokenBgX = playerIndex === 0 ?
                    gameState.tileSize : // Left side for player 1
                    width - gameState.tileSize * 4; // Right side for player 2
            }
            noStroke();
            fill(0, 0, 0, 50); // Token background
            rect(tokenBgX, tokenY - 10, gameState.tileSize * 3, gameState.tileSize / 3 + 20, 10);
            let maxTokens = gameState.soloMode ? 4 : 3;
            for (let i = 0; i < maxTokens; i++) {
                let tokenX = tokenBgX + (i * gameState.tileSize / 3) + gameState.tileSize / 4;
                image(i < player.movementTokens ? tokenBlue : tokenRed, tokenX, tokenY);
            }
        }

        // Draw player's tiles
        for (let i = 0; i < player.tiles.length; i++) {
            let tile = player.tiles[i];
            let x = startX + i * gameState.tileSize;
            let y = height - gameState.tileSize * 1.4;

            // --- Draw the tile itself FIRST ---
            drawTile(tile, x, y); // drawTile should handle its own internal push/pop for styles

            // --- THEN draw the highlight if needed, wrapping it ---
            // Highlight the tile if it's the one selected for swapping
            if (gameState.swapMode && gameState.swapTileIndex === i && gameState.swapPlayerIndex === playerIndex) {
                // *** Wrap highlight drawing in push() and pop() ***
                push(); // <--- ADDED: Isolate highlight styles
                stroke(255, 255, 0); // Yellow stroke
                strokeWeight(4);    // Make it slightly thicker to be obvious
                noFill();           // IMPORTANT: Don't fill the highlight rectangle
                rect(x, y, gameState.tileSize, gameState.tileSize); // Draw highlight border
                pop(); // <--- ADDED: Restore previous drawing styles (fill, stroke, weight)
            }
        } // End loop through player's tiles
    } // End loop through players
} // End drawPlayerUI

function drawActionButtons() {
  let buttonY = 50;
  let buttonWidth = 100;
  let buttonHeight = 40;
  let buttonSpacing = buttonWidth + 20;
  let startX = width - buttonWidth * 3 - 60;
  
  // End Turn button
  fill(100, 100, 100);
  rect(startX, buttonY, buttonWidth, buttonHeight, 5);
  fill(255);
  textAlign(CENTER, CENTER);
  text("End Turn", startX + buttonWidth/2, buttonY + buttonHeight/2);
  
  // Show Discard button in both modes
  fill(gameState.discardMode ? color(200, 0, 0) : color(100, 100, 100));
  rect(startX + buttonSpacing * 2, buttonY, buttonWidth, buttonHeight, 5);
  fill(255);
  text("Discard", startX + buttonSpacing * 2 + buttonWidth/2, buttonY + buttonHeight/2);
  
  // Only show Swap Tile button in 2-player mode
  if (!gameState.soloMode) {
    fill(gameState.swapMode ? color(200, 200, 0) : color(100, 100, 100));
    rect(startX + buttonSpacing, buttonY, buttonWidth, buttonHeight, 5);
    fill(255);
    text("Swap Tile", startX + buttonSpacing + buttonWidth/2, buttonY + buttonHeight/2);
  }
}

function drawMessageLog() {
  let logX = 20;
  let logY = 80;
  
  fill(255);
  textAlign(LEFT, TOP);
  textSize(14);
  
  //text("Game Log:", logX, logY);
  
  for (let i = 0; i < Math.min(gameState.messageLog.length, 2); i++) {
    let message = gameState.messageLog[gameState.messageLog.length - 1 - i];
    text(message, logX, logY + 25 + i * 20);
  }
}

function drawGameOver() {
  fill(0, 0, 0, 200);
  rect(0, 0, width, height);
  
  fill(255);
  textAlign(CENTER, CENTER);
  textSize(36);
  text("Game Over!", width/2, height/2 - 50);
  
  textSize(24);
  text(`Final Score: ${gameState.score}`, width/2, height/2);
  
  let ranking = "Novices";
  if (gameState.score > 25) ranking = "Sailors";
  if (gameState.score > 35) ranking = "Captains";
  if (gameState.score > 45) ranking = "Navigators";
  if (gameState.score > 55) ranking = "Cartographers";
  
  text(`Ranking: ${ranking}`, width/2, height/2 + 40);
  
  // Restart button
  fill(100, 100, 100);
  rect(width/2 - 75, height/2 + 100, 150, 50, 5);
  fill(255);
  text("Play Again", width/2, height/2 + 125);
}

function drawInstructions() {
  fill(0, 0, 0, 220);
  rect(0, 0, width, height);
  
  fill(255);
  textAlign(CENTER, TOP);
  textSize(26);
  text("Island Hop - Instructions", width/2, 50);
  
  textAlign(LEFT, TOP);
  textSize(18);
  let instructions = [
    "Objective: Explore features so that they are surrounded on all sides",
    "Scoring:",
    "- Explore tiles with lighthouse: 3 points",
    "- Explore tiles with beacon: 2 points",
    "- Explore tiles with windmill: 1 point for nearby ocean tiles",
    "- Each explored land chunk: 1 point",
    "- Explored tiles: 1 point",
    
    "On Your Turn:",
    "1. Place tiles from your hand (connected to your ship by water)",
    "2. When you place a tile, your ship automatically moves to it (free movement)",
    "3. You can use movement tokens to move your ship to adjacent water tiles",
    "4. You can discard tiles to move one space per discarded tile (no token used)",
    "5. Swap one tile with another player (once per turn)",
    "6. New tiles are drawn at the end of your turn",
    
    "Controls:",
    "- Drag tiles from your hand to place them",
    "- Click your ship and then a valid adjacent tile to move (uses a token)",
    "- Click 'Discard to Move' and select a tile to discard for movement",
    "- Click End Turn when finished"
  ];
  
  let y = 120;
  for (let i = 0; i < instructions.length; i++) {
    if (instructions[i].endsWith(":")) {
      y += 20;
      textSize(22);
      fill(255, 200, 0);
    } else {
      textSize(18);
      fill(255);
    }
    text(instructions[i], width/2 - 300, y);
    y += 30;
  }
  
  // Close button
  fill(100, 100, 100);
  rect(width/2 - 75, height - 100, 150, 50, 5);
  fill(255);
  textAlign(CENTER, CENTER);
  text("Close", width/2, height - 75);
}

function highlightValidPlacements() {
  // Get current player ship position
  let player = gameState.players[gameState.currentPlayer];
  if (!player.ship) return;
  
  let shipX = player.ship.x;
  let shipY = player.ship.y;
  
  // Check adjacent positions
  let directions = [
    {dx: 0, dy: -1, edge: 0, opposite: 2}, // top
    {dx: 1, dy: 0, edge: 1, opposite: 3},  // right
    {dx: 0, dy: 1, edge: 2, opposite: 0},  // bottom
    {dx: -1, dy: 0, edge: 3, opposite: 1}  // left
  ];
  
  // Get the current tile and its rotated edges
  let currentTileKey = `${shipX},${shipY}`;
  let currentTile = gameState.placedTiles[currentTileKey];
  
  if (!currentTile) return; // Safety check
  
  let rotatedEdges = rotateEdges(currentTile.edges, currentTile.rotation || 0);
  
  for (let dir of directions) {
    let newX = shipX + dir.dx;
    let newY = shipY + dir.dy;
    let key = `${newX},${newY}`;
    
    // If position is vacant
    if (!gameState.placedTiles[key]) {
      // Check if current tile has water on the edge
      if (rotatedEdges[dir.edge] === 0) { // If water edge
        noStroke();
        fill(0, 255, 0, 50);
        rect(
          newX * gameState.tileSize - gameState.tileSize/2, 
          newY * gameState.tileSize - gameState.tileSize/2, 
          gameState.tileSize, 
          gameState.tileSize
        );
      }
    } 
    // If we're in movement mode, highlight valid move targets
    else if (gameState.movementMode) {
      if (isValidMoveTarget(newX, newY)) {
        noStroke();
        fill(0, 0, 255, 50);
        rect(
          newX * gameState.tileSize - gameState.tileSize/2, 
          newY * gameState.tileSize - gameState.tileSize/2, 
          gameState.tileSize, 
          gameState.tileSize
        );
      }
    }
  }
}

/**
 * Handles mouse press events. Determines the action based on game state,
 * mouse position, and button pressed. Actions include interacting with UI
 * (intro screen, game buttons, instructions), starting panning (right-click),
 * selecting the ship, initiating tile drag, selecting tiles for discard/swap/keep.
 * Returns false to prevent default browser actions.
 */
function mousePressed() {
    // Always prevent default context menu on right click if game is running
    // to allow for right-click panning without the menu appearing.
    if (gameState.gameStarted && mouseButton === RIGHT) {
        document.oncontextmenu = function() { return false; } // Disable context menu
    }

    // 1. Check Instructions Button (visible anytime)
    // Coordinates and dimensions need to roughly match the button created in setup()
    let instructionsButtonX = 10;
    let instructionsButtonY = 10;
    let instructionsButtonW = 100; // Estimate width based on 'Instructions' text
    let instructionsButtonH = 20;  // Default p5 button height approximation
    if (mouseX >= instructionsButtonX && mouseX <= instructionsButtonX + instructionsButtonW &&
        mouseY >= instructionsButtonY && mouseY <= instructionsButtonY + instructionsButtonH) {
        gameState.showInstructions = !gameState.showInstructions; // Toggle visibility
        // This state change is checked by touchStarted to prevent panning if instructions were toggled.
        return false; // Action handled, prevent defaults
    }

    // 2. Handle Intro Screen Interactions (if game hasn't started)
    if (!gameState.gameStarted) {
        let buttonWidth = 220; // Used for checkbox horizontal area check
        let buttonHeight = 50; // Used for vertical spacing
        let checkboxSize = 30;
        let spacing = 20;
        let currentY = height / 2 - buttonHeight; // Starting Y for intro UI elements
        let checkboxPadding = 10; // Extra clickable area around checkboxes/text

        // Windmills Expansion Toggle
        let windmillCheckboxX = width / 2 - buttonWidth / 2;
        let windmillCheckboxY = currentY;
        if (mouseX >= windmillCheckboxX - checkboxPadding && mouseX <= windmillCheckboxX + buttonWidth + checkboxPadding &&
            mouseY >= windmillCheckboxY - checkboxPadding && mouseY <= windmillCheckboxY + checkboxSize + checkboxPadding) {
            gameState.useWindmillsExpansion = !gameState.useWindmillsExpansion;
            console.log("Windmill Toggle Clicked:", gameState.useWindmillsExpansion);
            return false; // Prevent other clicks
        }
        currentY += buttonHeight + spacing;

        // Piers Expansion Toggle
        let pierCheckboxX = width / 2 - buttonWidth / 2;
        let pierCheckboxY = currentY;
         if (mouseX >= pierCheckboxX - checkboxPadding && mouseX <= pierCheckboxX + buttonWidth + checkboxPadding &&
             mouseY >= pierCheckboxY - checkboxPadding && mouseY <= pierCheckboxY + checkboxSize + checkboxPadding) {
            gameState.usePiersExpansion = !gameState.usePiersExpansion;
            console.log("Pier Toggle Clicked:", gameState.usePiersExpansion);
            return false; // Prevent other clicks
        }
        currentY += buttonHeight + spacing;

        // Score Enclosed Islands Toggle
        let scoreIslandsCheckboxX = width / 2 - buttonWidth / 2;
        let scoreIslandsCheckboxY = currentY;
        if (mouseX >= scoreIslandsCheckboxX - checkboxPadding && mouseX <= scoreIslandsCheckboxX + buttonWidth + checkboxPadding &&
            mouseY >= scoreIslandsCheckboxY - checkboxPadding && mouseY <= scoreIslandsCheckboxY + checkboxSize + checkboxPadding) {
            gameState.scoreEnclosedIslands = !gameState.scoreEnclosedIslands;
            console.log("Score Islands Toggled:", gameState.scoreEnclosedIslands);
            return false; // Prevent other clicks
        }
        currentY += buttonHeight + spacing * 2; // Move Y position down for Start buttons

        // Start Game Buttons
        let startButtonWidth = 180;
        let startButtonHeight = 60;
        let startButtonPadding = 5; // Extra clickable area

        // Solo Mode Button
        let soloButtonX = width/2 - startButtonWidth - spacing/2;
        let soloButtonY = currentY;
        if (mouseX >= soloButtonX - startButtonPadding &&
            mouseX <= soloButtonX + startButtonWidth + startButtonPadding &&
            mouseY >= soloButtonY - startButtonPadding &&
            mouseY <= soloButtonY + startButtonHeight + startButtonPadding) {
            console.log("Start Solo Clicked");
            gameState.soloMode = true;
            gameState.gameStarted = true;
            initializeGame(); // Setup game state for solo mode
            return false; // Action handled
        }

        // 2 Player Mode Button
        let twoPlayerButtonX = width/2 + spacing/2;
        let twoPlayerButtonY = currentY;
        if (mouseX >= twoPlayerButtonX - startButtonPadding &&
            mouseX <= twoPlayerButtonX + startButtonWidth + startButtonPadding &&
            mouseY >= twoPlayerButtonY - startButtonPadding &&
            mouseY <= twoPlayerButtonY + startButtonHeight + startButtonPadding) {
            console.log("Start 2 Player Clicked");
            gameState.soloMode = false;
            gameState.gameStarted = true;
            initializeGame(); // Setup game state for 2-player mode
            return false; // Action handled
        }

        // If click was on intro screen but missed all interactive elements
        console.log("Click on Intro screen missed UI elements");
        return false; // Still prevent default browser actions
    } // End of !gameState.gameStarted block

    // 3. Handle Instructions Screen Close Button (if instructions are showing)
    if (gameState.showInstructions) {
        let closeButtonX = width/2 - 75;
        let closeButtonY = height - 100;
        let closeButtonW = 150;
        let closeButtonH = 50;
        if (mouseX >= closeButtonX && mouseX <= closeButtonX + closeButtonW &&
            mouseY >= closeButtonY && mouseY <= closeButtonY + closeButtonH) {
          gameState.showInstructions = false; // Close the instructions overlay
          // This state change is noted by touchStarted logic.
          return false; // Action handled
        }
        // Ignore clicks elsewhere if instructions are showing
        return false;
    }

    // 4. Handle Game Over Screen Restart Button (if game is over)
    if (gameState.gameOver) {
        let restartButtonX = width/2 - 75;
        let restartButtonY = height/2 + 100;
        let restartButtonW = 150;
        let restartButtonH = 50;
        if (mouseX >= restartButtonX && mouseX <= restartButtonX + restartButtonW &&
            mouseY >= restartButtonY && mouseY <= restartButtonY + restartButtonH) {
          // Reset flags to return to the intro screen
          gameState.gameStarted = false;
          gameState.gameOver = false;
          // Reset view to default for intro screen consistency
          gameState.viewX = 0;
          gameState.viewY = 0;
          gameState.targetViewX = 0;
          gameState.targetViewY = 0;
          return false; // Action handled
        }
        // Ignore clicks elsewhere during game over
        return false;
    }

    // --- Game Active Logic ---

    // 5. Initiate Panning (Right Mouse Button ONLY)
    // Check if conditions are met: Right button pressed AND no other modal action is active.
    let canStartRightClickPanning = !gameState.draggedTile &&
                                  !gameState.movementMode &&
                                  !gameState.swapMode &&
                                  !gameState.discardMode &&
                                  !gameState.selectingTileToKeep;

    if (mouseButton === RIGHT && canStartRightClickPanning) {
        gameState.isPanning = true;
        gameState.panStartX = mouseX;
        gameState.panStartY = mouseY;
        gameState.panStartViewX = gameState.viewX; // Store view state at pan start
        gameState.panStartViewY = gameState.viewY;
        gameState.isViewTransitioning = false; // Stop any automatic camera movement
        console.log("Panning started (right mouse)");
        return false; // Prevent any other mousePressed actions (like context menu)
    }
    // Note: Left-click/touch panning initiation is handled in touchStarted *after* this function runs.

    // 6. Handle In-Game Action Buttons (Top Right Area)
    // These actions should only trigger on LEFT click or TOUCH (handled implicitly as not RIGHT).
    let buttonY = 50;
    let buttonWidth = 100;
    let buttonHeight = 40;
    let buttonSpacing = buttonWidth + 20;
    let actionButtonStartX = width - buttonWidth * 3 - 60; // Start X for the button group

    // End Turn Button
    if (mouseX >= actionButtonStartX && mouseX <= actionButtonStartX + buttonWidth &&
        mouseY >= buttonY && mouseY <= buttonY + buttonHeight && mouseButton !== RIGHT) {
      if (gameState.soloMode && gameState.players[0].tiles.length > 1 && !gameState.selectingTileToKeep) {
        // Start the process of selecting a tile to keep in solo mode
        addMessage("Click on the tile you want to keep");
        gameState.selectingTileToKeep = true; // Enter selection mode
      } else if (gameState.selectingTileToKeep) {
          // Allow clicking End Turn again to cancel the 'select to keep' process
          addMessage("Selection cancelled. Click End Turn again to finish or select a tile.");
          gameState.selectingTileToKeep = false; // Exit selection mode
      } else {
        // Proceed with normal end turn logic (or solo mode if only 0/1 tiles)
        endTurn();
      }
      // touchStarted checks gameState.selectingTileToKeep to prevent panning.
      return false; // Action handled
    }

    // Discard Button
    if (mouseX >= actionButtonStartX + buttonSpacing * 2 && mouseX <= actionButtonStartX + buttonSpacing * 2 + buttonWidth &&
        mouseY >= buttonY && mouseY <= buttonY + buttonHeight && mouseButton !== RIGHT) {
      toggleDiscardMode(); // Toggles discard mode on/off
      // Don't center view here; wait for tile selection if entering mode.
      // touchStarted checks gameState.discardMode to prevent panning.
      return false; // Action handled
    }

    // Swap Tile Button (2-Player Mode Only)
    if (!gameState.soloMode) {
      if (mouseX >= actionButtonStartX + buttonSpacing && mouseX <= actionButtonStartX + buttonSpacing + buttonWidth &&
          mouseY >= buttonY && mouseY <= buttonY + buttonHeight && mouseButton !== RIGHT) {
        toggleSwapMode(); // Toggles swap mode on/off
         // Don't center view; just toggling mode.
         // touchStarted checks gameState.swapMode to prevent panning.
        return false; // Action handled
      }
    }

    // 7. Handle Map Interactions (Ship Selection / Movement Target Click)
    // These should only trigger on LEFT click or TOUCH.
    let clickHandledByMovement = false;
    // Convert mouse click screen coordinates to game grid coordinates
    let gridX = Math.floor((mouseX - width/2 + gameState.viewX * gameState.tileSize) / gameState.tileSize + 0.5);
    let gridY = Math.floor((mouseY - height/2 + gameState.viewY * gameState.tileSize) / gameState.tileSize + 0.5);

    // A. Clicking a Movement Target (if already in movement mode)
    if (gameState.movementMode && mouseButton !== RIGHT) {
        if (isValidMoveTarget(gridX, gridY)) {
            moveShip(gridX, gridY); // Execute the move (starts animation)
            // View centering happens at the *end* of the ship animation.
            clickHandledByMovement = true;
        } else {
            // Clicking somewhere invalid while in movement mode cancels it.
            gameState.movementMode = false;
            addMessage("Movement canceled.");
            clickHandledByMovement = true; // Click was processed (to cancel mode)
        }
    }
    // B. Clicking the Ship (to *initiate* movement mode)
    // Check conditions: Not in other modes, not dragging, not panning, left click/touch.
    else if (!gameState.discardMode && !gameState.swapMode && !gameState.draggedTile && !gameState.isPanning && mouseButton !== RIGHT) {
        let player = gameState.players[gameState.currentPlayer];
        // Check if the player has a ship and movement tokens available
        if (player.ship && player.movementTokens > 0) {
            // Calculate the ship's current position on the screen
            let shipScreenX = width/2 + (player.ship.x - gameState.viewX) * gameState.tileSize;
            let shipScreenY = height/2 + (player.ship.y - gameState.viewY) * gameState.tileSize;
            // Check distance from click to ship center
            let clickDistance = dist(mouseX, mouseY, shipScreenX, shipScreenY);

            if (clickDistance < gameState.tileSize * 0.5) { // Click is within ship's radius
                checkMoveTargets(); // Sets gameState.movementMode = true, shows highlights
                centerViewOnCurrentShip(); // Center view immediately on selecting ship
                addMessage("Ship selected. Click adjacent water tile to move.");
                clickHandledByMovement = true; // Action handled (entered movement mode)
                // touchStarted checks gameState.movementMode to prevent panning.
            }
        }
    }
    // If click was related to ship movement (start or execute), stop further processing.
    if (clickHandledByMovement) {
        return false;
    }


    // 8. Handle Clicks on Tiles in Player Hands (Bottom Area)
    // Iterate through all players (relevant for swap mode)
    for (let playerIndex = 0; playerIndex < gameState.players.length; playerIndex++) {
        let player = gameState.players[playerIndex];
        let handStartX = gameState.soloMode ?
            width / 2 - (player.tiles.length * gameState.tileSize) / 2 : // Centered hand in solo
            (playerIndex === 0 ? gameState.tileSize : width - gameState.tileSize * (player.tiles.length + 1)); // Sides in 2P

        // Iterate through the tiles in the current player's hand
        for (let i = 0; i < player.tiles.length; i++) {
            let tile = player.tiles[i];
            let tileX = handStartX + i * gameState.tileSize;
            let tileY = height - gameState.tileSize * 1.4; // Y position of hand tiles

            // Check if the click is within this tile's bounds AND is a left click/touch
            if (mouseX >= tileX && mouseX <= tileX + gameState.tileSize &&
                mouseY >= tileY && mouseY <= tileY + gameState.tileSize && mouseButton !== RIGHT) {

                // Determine action based on current game mode:

                // A. Selecting Tile to Keep (Solo Mode - End Turn Step 1)
                if (gameState.selectingTileToKeep && playerIndex === gameState.currentPlayer) {
                    let keptTile = player.tiles[i];
                    let discardCount = player.tiles.length - 1;
                    player.tiles = [keptTile]; // Replace hand with only the selected tile
                    addMessage(`Kept tile ${keptTile.id}. Discarded ${discardCount}.`);
                    gameState.selectingTileToKeep = false; // Exit selection mode
                    endTurn(); // Proceed to finish the turn (draws tiles, resets tokens, centers view)
                    return false; // Action handled
                }

                // B. Selecting Tile to Discard for Movement (Current Player Only)
                if (gameState.discardMode && playerIndex === gameState.currentPlayer) {
                    discardTileForMovement(i); // Discards tile, sets movementMode = true
                    centerViewOnCurrentShip(); // Center view to prepare for movement click
                    // touchStarted checks gameState.movementMode to prevent panning.
                    return false; // Action handled
                }

                // C. Selecting Tile for Swap (2-Player Mode Only)
                if (gameState.swapMode && !gameState.soloMode) {
                    if (gameState.swapTileIndex === -1) {
                        // First tile selection (can be from either player's hand)
                        gameState.swapTileIndex = i;
                        gameState.swapPlayerIndex = playerIndex;
                        addMessage(`Selected P${playerIndex + 1}'s tile ${tile.id}. Click tile from other player.`);
                    } else {
                        // Second tile selection
                        if (playerIndex !== gameState.swapPlayerIndex) {
                             // Execute the swap if selected from the *other* player
                             swapTiles(gameState.swapTileIndex, gameState.swapPlayerIndex, i, playerIndex);
                             // swapTiles resets swapMode state. View does not change.
                        } else {
                            // Clicked on the same player's hand again - cancel or reselect? Resetting is simpler.
                             addMessage("Cannot swap with yourself. Selection cleared.");
                             gameState.swapTileIndex = -1;
                             gameState.swapPlayerIndex = -1;
                        }
                    }
                    // touchStarted checks gameState.swapMode to prevent panning.
                    return false; // Action handled (either first select, successful swap, or reset)
                }

                // D. Default: Start Dragging Tile to Place (Current Player Only)
                // Check conditions: Not in other modes, it's the current player, not panning
                if (!gameState.selectingTileToKeep && !gameState.discardMode && !gameState.swapMode &&
                    playerIndex === gameState.currentPlayer && !gameState.isPanning)
                {
                    gameState.draggedTile = player.tiles[i]; // Store ref to tile being dragged
                    gameState.draggedTileIndex = i;         // Store its index in hand for removal on success
                    centerViewOnCurrentShip(); // Center view immediately when drag starts
                    gameState.isViewTransitioning = false; // Stop any ongoing centering instantly
                    console.log("Dragging started for tile:", gameState.draggedTile.id);
                    // touchStarted checks gameState.draggedTile to prevent panning.
                    return false; // Action handled (dragging initiated)
                }

                // If click was on a tile but didn't match any active mode's criteria
                // (e.g., clicking opponent's tile when not swapping).
                console.log(`Clicked on P${playerIndex+1}'s tile ${tile.id} but no action taken in current mode.`);
                return false; // Prevent default browser action

            } // End if click is within tile bounds and left mouse button
        } // End loop through this player's tiles
    } // End loop through all players

    // 9. Unhandled Click
    // If the click wasn't on any UI element, map interaction, or hand tile,
    // and wasn't a right-click pan start, then it's an unhandled click on empty space.
    // We do nothing but prevent default browser actions.
    // Left-click/touch panning initiation is handled by touchStarted *after* this.
    if (mouseButton !== RIGHT) {
         console.log("Left Click/Touch on empty space or unhandled area - no action.");
    }
    return false; // Prevent default browser actions for any clicks reaching this point

} // End of mousePressed function

function mouseDragged() {
    // --- PANNING LOGIC ---
    if (gameState.isPanning && mouseButton === RIGHT) {
        let deltaX = mouseX - gameState.panStartX;
        let deltaY = mouseY - gameState.panStartY;

        // Convert screen pixel delta to grid coordinate delta
        // Dragging mouse right (positive deltaX) should decrease viewX (move view left)
        gameState.viewX = gameState.panStartViewX - deltaX / gameState.tileSize;
        gameState.viewY = gameState.panStartViewY - deltaY / gameState.tileSize;

        // Keep target synced with manual panning to prevent snap-back
        gameState.targetViewX = gameState.viewX;
        gameState.targetViewY = gameState.viewY;

        console.log(`Panning: delta=(${deltaX.toFixed(1)}, ${deltaY.toFixed(1)}), view=(${gameState.viewX.toFixed(2)}, ${gameState.viewY.toFixed(2)})`);
        return false; // Prevent other drag behaviors
    }
    // --- END PANNING LOGIC ---

    // Only handle tile dragging if we have a dragged tile AND not panning
    if (gameState.draggedTile && !gameState.isPanning) {
        // Just for visual feedback during dragging (tile follows mouse in draw())
        // console.log("Dragging tile:", gameState.draggedTile.id); // Can remove if noisy
        return false; // Prevent default behavior
    }

    return false; // Prevent default drag behavior if not handled
}

/**
 * Handles the release of a mouse button.
 * Stops panning if the right button was released.
 * Attempts to place a dragged tile if the left button was released while dragging.
 * Resets dragging/panning states appropriately.
 */
function mouseReleased() {
    // Re-enable context menu if it was disabled by right-click panning start
    // This ensures right-clicking outside the canvas or after the game doesn't stay disabled.
    if (mouseButton === RIGHT && document.oncontextmenu) {
       document.oncontextmenu = null; // Restore default browser behavior
    }

    // --- PANNING LOGIC ---
    // Check if panning was active *and* the button being released is the RIGHT button
    if (gameState.isPanning && mouseButton === RIGHT) {
        gameState.isPanning = false;
        console.log("Panning stopped (right mouse release)");
        // Panning just finished, do not attempt tile placement or other actions.
        return false; // Prevent any default browser actions or other game logic
    }
    // --- END PANNING LOGIC ---

    // Log state at release for debugging, can be commented out later
    // console.log("Mouse released - Button:", mouseButton, "Dragged Tile:", gameState.draggedTile ? gameState.draggedTile.id : "none", "Panning:", gameState.isPanning);

    // --- TILE PLACEMENT LOGIC ---
    // Check if:
    // 1. A tile was being dragged (gameState.draggedTile is not null)
    // 2. The button being released is NOT the right button (i.e., left or middle)
    // 3. The user is NOT currently panning (gameState.isPanning is false)
    if (gameState.draggedTile && mouseButton !== RIGHT && !gameState.isPanning) {
        // console.log(`Attempting to place tile ${gameState.draggedTile.id} at screen (${mouseX}, ${mouseY})`); // Debug log

        // Convert the release coordinates (mouseX, mouseY) from screen space
        // to grid space, taking the current camera view (viewX, viewY) into account.
        // Add 0.5 before floor to effectively round to the nearest grid center.
        let gridX = Math.floor((mouseX - width/2 + gameState.viewX * gameState.tileSize) / gameState.tileSize + 0.5);
        let gridY = Math.floor((mouseY - height/2 + gameState.viewY * gameState.tileSize) / gameState.tileSize + 0.5);

        // console.log(`Converted release coordinates to grid (${gridX}, ${gridY})`); // Debug log

        // Check if the calculated grid position is a valid placement location
        // The isValidPlacement function checks adjacency to ship, water connection, and edge matching with neighbors.
        if (isValidPlacement(gridX, gridY)) {
            // console.log("Placement is valid."); // Debug log

            // Create a *copy* of the dragged tile data to place on the board.
            // This prevents modifying the original tile definition in gameState.tileTypes.
            let newTile = Object.assign({}, gameState.draggedTile);
            newTile.rotation = 0; // Tiles are placed with default rotation (can be enhanced later)
            newTile.x = gridX;     // Store the placed grid position ON the tile object itself for later reference (e.g., scoring)
            newTile.y = gridY;

            // Add the new tile object to the gameState.placedTiles dictionary,
            // using the "x,y" string as the key for easy lookup.
            gameState.placedTiles[`${gridX},${gridY}`] = newTile;

            // Remove the placed tile from the current player's hand array using its stored index.
            gameState.players[gameState.currentPlayer].tiles.splice(gameState.draggedTileIndex, 1);

            // --- Ship Movement ---
            // Move the player's ship instantly to the newly placed tile. This is a free move.
            let player = gameState.players[gameState.currentPlayer];
            player.ship.x = gridX;
            player.ship.y = gridY;

            // --- View Centering ---
            // Center the camera view on the ship's new position smoothly.
            centerViewOnCurrentShip();

            // Add a message to the game log.
            addMessage(`Player ${gameState.currentPlayer + 1} placed tile ${newTile.id} at (${gridX},${gridY})`);
            // console.log(`Placed tile ${newTile.id}. Player hand size: ${player.tiles.length}`); // Debug log

            // --- Game End Check ---
            // Check if the game should end (draw pile empty AND all players' hands empty).
            if (gameState.drawPile.length === 0 &&
                gameState.players.every(p => p.tiles.length === 0)) {
                endGame();
            }
        } else {
            // Placement was invalid. Inform the player.
            addMessage("Invalid placement location.");
            // The tile remains visually attached to the mouse until dragging stops (below),
            // and since it wasn't removed from the hand, it effectively returns there.
            console.log(`Invalid placement at (${gridX}, ${gridY}) for tile ${gameState.draggedTile.id}.`); // Debug log
        }

        // --- Reset Drag State ---
        // Regardless of whether the placement was valid or invalid,
        // reset the dragged tile state, indicating that dragging has ended.
        gameState.draggedTile = null;
        gameState.draggedTileIndex = -1;
        // console.log("Dragging stopped, tile state reset."); // Debug log

        // Prevent default browser behavior or other potential actions after handling the drop.
        return false;
    }
    // --- END TILE PLACEMENT LOGIC ---

    // --- Cleanup Drag State (Edge Case) ---
    // If a tile drag was somehow interrupted (e.g., started drag, then right-clicked,
    // then released left button), ensure the draggedTile state is cleared.
    // This prevents a tile being stuck in the 'dragged' state.
    if (gameState.draggedTile && mouseButton !== RIGHT) {
        // console.log("Resetting potentially orphaned dragged tile on left release."); // Debug log
        gameState.draggedTile = null;
        gameState.draggedTileIndex = -1;
    }

    // If releasing the left button and not dragging a tile or panning, it might be the
    // end of a simple click/tap. Usually, the action for a tap is handled entirely
    // within mousePressed/touchStarted. No specific action needed here typically.
    // console.log("Left mouse released without active drag or pan."); // Debug log

    // Prevent default browser actions for any release event not handled above.
    return false;
}

function isValidPlacement(x, y) {
  let key = `${x},${y}`;
  
  // Check if space is already occupied
  if (gameState.placedTiles[key]) {
    return false;
  }
  
  let player = gameState.players[gameState.currentPlayer];
  let shipX = player.ship.x;
  let shipY = player.ship.y;
  
  // Check if adjacent to current ship position
  let isAdjacent = (
    (Math.abs(x - shipX) === 1 && y === shipY) || // left or right
    (Math.abs(y - shipY) === 1 && x === shipX)    // top or bottom
  );
  
  if (!isAdjacent) {
    console.log("Not adjacent to ship", {x, y, shipX, shipY});
    return false;
  }
  
  // Check if connected by water
  let shipTileKey = `${shipX},${shipY}`;
  let shipTile = gameState.placedTiles[shipTileKey];
  
  let direction = -1;
  if (x === shipX && y === shipY - 1) direction = 0; // top
  if (x === shipX + 1 && y === shipY) direction = 1; // right
  if (x === shipX && y === shipY + 1) direction = 2; // bottom
  if (x === shipX - 1 && y === shipY) direction = 3; // left
  
  // Get rotated edges of the ship's tile
  let shipRotatedEdges = rotateEdges(shipTile.edges, shipTile.rotation || 0);
  
  if (shipRotatedEdges[direction] !== 0) { // Not water
    return false;
  }
  
  // Check if dragged tile matches existing adjacent tiles
  let draggedTile = gameState.draggedTile;
  let rotatedEdges = rotateEdges(draggedTile.edges, 0);
  
  // Check all four sides of the new position
  let directions = [
    {dx: 0, dy: -1, edge: 0, opposite: 2}, // top
    {dx: 1, dy: 0, edge: 1, opposite: 3},  // right
    {dx: 0, dy: 1, edge: 2, opposite: 0},  // bottom
    {dx: -1, dy: 0, edge: 3, opposite: 1}  // left
  ];
  
  for (let dir of directions) {
    let adjX = x + dir.dx;
    let adjY = y + dir.dy;
    let adjKey = `${adjX},${adjY}`;
    
    if (gameState.placedTiles[adjKey]) {
      let adjTile = gameState.placedTiles[adjKey];
      
      // Rotate adjacent tile's edges if needed
      let adjRotatedEdges = rotateEdges(adjTile.edges, adjTile.rotation || 0);
      
      // Check if edges match (water to water, land to land)
      if (rotatedEdges[dir.edge] !== adjRotatedEdges[dir.opposite]) {
        return false;
      }
    }
  }
  
  return true;
}

function rotateEdges(edges, rotation) {
  // Handle undefined or non-array edges
  if (!edges || !Array.isArray(edges)) {
    return [0, 0, 0, 0]; // Default to all water edges
  }

  if (rotation === 0) return [...edges];
  
  let rotated = [...edges];
  for (let i = 0; i < rotation; i++) {
    rotated = [rotated[3], rotated[0], rotated[1], rotated[2]];
  }
  return rotated;
}

function checkMoveTargets() {
  // Implement ship movement logic
  let player = gameState.players[gameState.currentPlayer];
  
  if (player.movementTokens <= 0) {
    addMessage("No movement tokens left!");
    return;
  }
  
  // Set a flag to indicate we're in movement mode
  gameState.movementMode = true;
  
  // Highlight possible move targets
  addMessage("Click an adjacent water tile to move");
}

function moveShip(targetX, targetY) {
  let player = gameState.players[gameState.currentPlayer];
  
  // Store start and end positions for animation
  gameState.shipFromX = player.ship.x;
  gameState.shipFromY = player.ship.y;
  gameState.shipToX = targetX;
  gameState.shipToY = targetY;
  gameState.shipAnimationProgress = 0;
  gameState.isShipMoving = true;
  
  // Update movement tokens and messages as before
  if (gameState.movementMode && !gameState.discardMode) {
    player.movementTokens--;
    addMessage(`Player ${gameState.currentPlayer + 1} moved using a movement token. ${player.movementTokens} tokens left.`);
  } else {
    addMessage(`Player ${gameState.currentPlayer + 1} moved using a discarded tile`);
  }
  
  // Reset movement modes
  gameState.movementMode = false;
  gameState.discardMode = false;
}

function toggleSwapMode() {
  if (gameState.soloMode) {
    addMessage("Swap is not available in solo mode");
    return;
  }
  
  // Toggle swap mode
  gameState.swapMode = !gameState.swapMode;
  
  // Reset swap selection
  gameState.swapTileIndex = -1;
  gameState.swapPlayerIndex = -1;
  
  // Reset other modes
  gameState.movementMode = false;
  gameState.discardMode = false;
  
  if (gameState.swapMode) {
    addMessage("Select one of your tiles to swap with another player");
  } else {
    addMessage("Swap mode canceled");
  }
}

function endTurn() {
  let currentPlayer = gameState.players[gameState.currentPlayer];
  
  if (gameState.soloMode) {
    // Solo mode: optionally keep 1 tile
    if (currentPlayer.tiles.length > 1) {
      let discardedTile = currentPlayer.tiles.pop();
      gameState.discardPile.push(discardedTile.id);
    }
    
    // Draw up to 3 tiles
    let drawnCount = 0;
    while (currentPlayer.tiles.length < 3 && gameState.drawPile.length > 0) {
      let tileId = gameState.drawPile.pop();
      currentPlayer.tiles.push(Object.assign({}, gameState.tileTypes[tileId]));
      drawnCount++;
    }
    
    // Refresh movement tokens in solo mode
    currentPlayer.movementTokens = 4;
    
    if (drawnCount > 0) {
      addMessage(`Drew ${drawnCount} new tiles (${gameState.drawPile.length} remaining)`);
    }
  } else {
    // 2-player mode: discard remaining tiles and draw new ones
    while (currentPlayer.tiles.length > 0) {
      let discardedTile = currentPlayer.tiles.pop();
      gameState.discardPile.push(discardedTile.id);
    }
    
    // Draw 3 new tiles
    for (let i = 0; i < 3; i++) {
      if (gameState.drawPile.length > 0) {
        let tileId = gameState.drawPile.pop();
        currentPlayer.tiles.push(Object.assign({}, gameState.tileTypes[tileId]));
      }
    }
    
    // Refresh movement tokens
    currentPlayer.movementTokens = 3;
    
    // Switch to next player
    gameState.currentPlayer = (gameState.currentPlayer + 1) % gameState.players.length;
    addMessage(`Player ${gameState.currentPlayer + 1}'s turn`);
  }
  
  // Reset modes
  gameState.swapMode = false;
  gameState.swapTileIndex = -1;
  gameState.swapPlayerIndex = -1;
  gameState.movementMode = false;
  gameState.discardMode = false;
  gameState.selectingTileToKeep = false;
  
  // Check for game over
  if (gameState.drawPile.length === 0 && 
      gameState.players.every(p => p.tiles.length === 0)) {
    endGame();
  }
  
  // Center view on current player's ship in both modes
  centerViewOnCurrentShip();
}


function endGame() {
  // Calculate final score
  gameState.score = calculateScore();
  
  // Set game over flag
  gameState.gameOver = true;
  
  addMessage(`Game Over! Final Score: ${gameState.score}`);
}

function addMessage(message) {
  gameState.messageLog.push(message);
  
  // Keep log size manageable
  if (gameState.messageLog.length > 20) {
    gameState.messageLog.shift();
  }
}

function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);

  // Recalculate game scale based on new dimensions
  // This ensures the game remains playable on orientation change
  let minDimension = min(width, height);
  gameState.tileSize = constrain(minDimension / 10, 60, 90);
  backgroundImage = createGraphics(width, height);
  // ... recreate background
}

function isValidMoveTarget(x, y) {
  let key = `${x},${y}`;
  
  // Check if the target position has a tile
  if (!gameState.placedTiles[key]) {
    // Remove the debug logging completely - it's not needed for gameplay
    return false;
  }
  
  // Get the current player's ship position
  let player = gameState.players[gameState.currentPlayer];
  let shipX = player.ship.x;
  let shipY = player.ship.y;
  
  // Check if the target is adjacent to the ship
  let isAdjacent = (
    (Math.abs(x - shipX) === 1 && y === shipY) || // horizontal
    (Math.abs(y - shipY) === 1 && x === shipX)    // vertical
  );
  
  if (!isAdjacent) {
    // Only log when actually clicking, not during movement checks
    if (mouseIsPressed && Math.abs(x - shipX) <= 2 && Math.abs(y - shipY) <= 2) {
      console.log("Target not adjacent to ship");
    }
    return false;
  }
  
  // Check if the target tile has water (can move to water tiles)
  let targetTile = gameState.placedTiles[key];
  
  // Get the direction from ship to target
  let direction = -1;
  if (y === shipY - 1) direction = 0;      // top
  else if (x === shipX + 1) direction = 1;  // right
  else if (y === shipY + 1) direction = 2;  // bottom
  else if (x === shipX - 1) direction = 3;  // left
  
  // Get the opposite direction (from target to ship)
  let oppositeDirection = (direction + 2) % 4;
  
  // Get rotated edges of both tiles
  let targetRotatedEdges = rotateEdges(targetTile.edges, targetTile.rotation || 0);
  let shipTile = gameState.placedTiles[`${shipX},${shipY}`];
  let shipRotatedEdges = rotateEdges(shipTile.edges, shipTile.rotation || 0);
  
  // Check if both edges are water (0)
  let isValid = targetRotatedEdges[oppositeDirection] === 0 && shipRotatedEdges[direction] === 0;
  
  // Only log when actually clicking, not during movement checks
  if (!isValid && isAdjacent && mouseIsPressed) {
    console.log("Cannot move: no water connection between tiles");
  }
  
  return isValid;
}

function toggleDiscardMode() {
  gameState.discardMode = !gameState.discardMode;
  gameState.movementMode = false;
  gameState.swapMode = false;
  
  if (gameState.discardMode) {
    addMessage("Select a tile to discard for movement");
  } else {
    addMessage("Discard mode canceled");
  }
}

function discardTileForMovement(tileIndex) {
  let player = gameState.players[gameState.currentPlayer];
  let discardedTile = player.tiles.splice(tileIndex, 1)[0];
  gameState.discardPile.push(discardedTile.id);
  
  addMessage(`Player ${gameState.currentPlayer + 1} discarded a tile to move`);
  
  // Keep discardMode true while setting movementMode
  // This way we know this is a discard-based movement
  gameState.movementMode = true;
  addMessage("Click an adjacent water tile to move");
}

// Updated swapTiles function to handle indices and player indices for both tiles
function swapTiles(index1, playerIndex1, index2, playerIndex2) {
  // Ensure we are not swapping with the same player (should be caught in mousePressed, but double-check)
  if (playerIndex1 === playerIndex2) {
      console.error("Attempted to swap tiles within the same player's hand.");
      // Reset swap state just in case
      gameState.swapMode = false;
      gameState.swapTileIndex = -1;
      gameState.swapPlayerIndex = -1;
      return;
  }

  // Get references to the player hands
  let hand1 = gameState.players[playerIndex1].tiles;
  let hand2 = gameState.players[playerIndex2].tiles;

  // Check if indices are valid
  if (index1 < 0 || index1 >= hand1.length || index2 < 0 || index2 >= hand2.length) {
      console.error("Invalid tile index during swap.");
      // Reset swap state
      gameState.swapMode = false;
      gameState.swapTileIndex = -1;
      gameState.swapPlayerIndex = -1;
      return;
  }

  // Perform the swap
  let temp = hand1[index1];
  hand1[index1] = hand2[index2];
  hand2[index2] = temp;

  let messagePlayer1 = playerIndex1 + 1;
  let messagePlayer2 = playerIndex2 + 1;
  addMessage(`Player ${messagePlayer1} swapped a tile with Player ${messagePlayer2}`);

  // Exit swap mode and reset selection state
  gameState.swapMode = false;
  gameState.swapTileIndex = -1;
  gameState.swapPlayerIndex = -1;
}

function calculateScore() {
    let score = 0;

    // Check each placed tile
    for (let key in gameState.placedTiles) {
        let tile = gameState.placedTiles[key];
        score += calculatePoints(tile);
    }

    return score;
}

function isFullyExplored(x, y) {
  if (x === undefined || y === undefined) return false;
  
  // Check all four adjacent positions
  let directions = [
    {dx: 0, dy: -1}, // top
    {dx: 1, dy: 0},  // right
    {dx: 0, dy: 1},  // bottom
    {dx: -1, dy: 0}  // left
  ];
  
  for (let dir of directions) {
    let adjX = x + dir.dx;
    let adjY = y + dir.dy;
    let adjKey = `${adjX},${adjY}`;
    
    // If any adjacent position is empty, the tile is not explored
    if (!gameState.placedTiles[adjKey]) {
      return false;
    }
  }
  
  return true;
}

// Add these functions to handle touch events

/**
 * Handles the start of a touch event.
 * Records the start position and triggers mousePressed to handle tap interactions.
 * Determines if the tap point resulted in a UI interaction.
 * Does NOT initiate panning here.
 */
function touchStarted() {
    // Ensure touch data is available
    if (touches.length === 0) return false;

    // Update mouse coordinates for p5 functions that use them (like mousePressed)
    mouseX = touches[0].x;
    mouseY = touches[0].y;

    // Store the initial touch position and add a flag to track interaction
    // We reset interaction to false initially for each new touch.
    gameState.touchStartPos = { x: mouseX, y: mouseY, interaction: false };

    // Clear any lingering panning state from previous gestures (safety)
    gameState.isPanning = false;
    // Also clear view transition flag - a new touch should interrupt transitions unless mousePressed starts one
    // gameState.isViewTransitioning = false; // Let mousePressed/centerView handle this

    // --- Call mousePressed to handle tap actions ---
    // Store state *before* calling mousePressed to detect changes
    let stateBefore = {
        draggedTile: gameState.draggedTile,
        movementMode: gameState.movementMode,
        swapMode: gameState.swapMode,
        discardMode: gameState.discardMode,
        selectingTileToKeep: gameState.selectingTileToKeep,
        showInstructions: gameState.showInstructions
        // Add any other boolean state flags set by mousePressed interactions if needed
    };

    mousePressed(); // Let mousePressed determine if the tap hit a button, tile, ship etc.

    // --- Check if mousePressed resulted in an interaction ---
    // Compare state after mousePressed with the state before
    let interactionOccurred = (
        (gameState.draggedTile !== null && stateBefore.draggedTile === null) || // Started dragging?
        (gameState.movementMode && !stateBefore.movementMode) ||           // Entered movement mode?
        (gameState.swapMode && !stateBefore.swapMode) ||                   // Entered swap mode?
        (gameState.discardMode && !stateBefore.discardMode) ||             // Entered discard mode?
        (gameState.selectingTileToKeep && !stateBefore.selectingTileToKeep) || // Entered keep selection?
        (gameState.showInstructions !== stateBefore.showInstructions)        // Toggled instructions?
        // Add checks if modes can be *cancelled* by click, e.g. (!gameState.movementMode && stateBefore.movementMode)
    );

    // Store the interaction result on the touchStartPos object.
    // This is used by touchMoved to decide if panning is allowed.
    if (gameState.touchStartPos) { // Check touchStartPos hasn't been cleared by a rapid touchEnd
      gameState.touchStartPos.interaction = interactionOccurred;
      // console.log(`Mobile touchStarted: interactionOccurred = ${interactionOccurred}`); // Keep for potential future debug
    }

    // Panning initiation is deferred to touchMoved.
    return false; // Prevent default browser actions (scrolling, zooming)
}

/**
 * Handles touch movement.
 * Initiates panning if the finger moves sufficiently *and* the initial touch didn't interact with UI.
 * Updates the view if panning is active.
 * Updates visual position if dragging a tile.
 */
function touchMoved() {
    // Ensure touch data and start position are available
    if (touches.length === 0 || !gameState.touchStartPos) return false;

    // Update mouse coordinates continuously
    mouseX = touches[0].x;
    mouseY = touches[0].y;

    // --- Initiate Panning (if conditions met) ---
    // Check if:
    // 1. Not already panning.
    // 2. touchStartPos exists (gesture hasn't ended).
    // 3. The initial touch in touchStarted *did not* result in an interaction.
    if (!gameState.isPanning && gameState.touchStartPos && !gameState.touchStartPos.interaction) {
        // Add a small pixel threshold to prevent panning on slight movements during a tap
        let moveThreshold = 10;
        let dx = Math.abs(mouseX - gameState.touchStartPos.x);
        let dy = Math.abs(mouseY - gameState.touchStartPos.y);

        // Check if movement exceeds threshold
        if (dx > moveThreshold || dy > moveThreshold) {
            // Check if the game is actually running (don't pan on intro screen)
            if (gameState.gameStarted) {
                gameState.isPanning = true;
                // Use the *original* start coordinates for calculating view offset later
                gameState.panStartX = gameState.touchStartPos.x;
                gameState.panStartY = gameState.touchStartPos.y;
                gameState.panStartViewX = gameState.viewX; // Capture view state at pan start
                gameState.panStartViewY = gameState.viewY;
                gameState.isViewTransitioning = false; // Stop any automatic centering
                // console.log("Mobile: Panning started on touchMove"); // Keep for potential debug
            }
        }
    }
    // --- End Panning Initiation ---


    // --- Update View (if currently panning) ---
    if (gameState.isPanning) {
        // Calculate the total drag distance from the pan's starting screen position
        let deltaX = mouseX - gameState.panStartX;
        let deltaY = mouseY - gameState.panStartY;

        // Update the view coordinates based on the drag delta and tile size
        // Dragging right (positive deltaX) moves the view left (negative viewX change)
        gameState.viewX = gameState.panStartViewX - deltaX / gameState.tileSize;
        gameState.viewY = gameState.panStartViewY - deltaY / gameState.tileSize;

        // Keep the target view synced during manual panning to prevent snapping back
        gameState.targetViewX = gameState.viewX;
        gameState.targetViewY = gameState.viewY;

        return false; // Prevent default browser scrolling while panning
    }
    // --- End View Update ---


    // --- Update Dragged Tile Visual ---
    // If dragging a tile (state set by mousePressed via touchStarted)
    if (gameState.draggedTile) {
        // The draw() function uses mouseX/mouseY to position the dragged tile,
        // so simply updating mouseX/mouseY above is enough for the visual.
        return false; // Prevent default browser scrolling while dragging a tile
    }

    // If not panning or dragging a tile, still prevent default actions
    return false;
}

/**
 * Handles the end of a touch event.
 * Stops panning if active.
 * Triggers mouseReleased if a tile drag was in progress.
 * Cleans up touch-specific state.
 */
function touchEnded() {
    // --- Stop Panning ---
    if (gameState.isPanning) {
        gameState.isPanning = false;
        // console.log("Mobile: Panning stopped (touch end)"); // Keep for potential debug
        // Clear touch position info - the pan gesture is complete.
        gameState.touchStartPos = null;
        // Do not proceed further; the action was panning.
        return false;
    }
    // --- End Stop Panning ---


    // --- Handle End of Drag or Tap ---
    // Check if touchStartPos exists (meaning touchStarted fired and wasn't immediately followed by touchEnd clearing it)
    // and we weren't panning.
    if (gameState.touchStartPos && !gameState.isPanning) {

        // A. End of Tile Drag
        // Check if a tile drag was in progress (state set by touchStarted->mousePressed)
        if (gameState.draggedTile) {
            // console.log("Mobile: Touch calling mouseReleased for tile drop"); // Keep for potential debug
            // Let mouseReleased handle the placement logic, state cleanup, and view centering
            mouseReleased();
        }
        // B. End of Tap
        // Else: This was the end of a tap. The tap's action (button press, ship select etc.)
        // was already fully handled by the mousePressed() call within touchStarted.
        // No further action needed here for the tap itself. Subsequent state like view centering
        // (triggered by endTurn called from mousePressed) should proceed normally.
        else {
           // console.log("Mobile: Tap gesture ended."); // Keep for potential debug
        }

        // --- Reset Touch State ---
        // Clear the touch start position info now that the gesture is complete.
        gameState.touchStartPos = null;
    }

    // Final safety net: ensure panning is off if touchEnd somehow happens without touchStartPos
    gameState.isPanning = false;

    return false; // Prevent default browser behavior (like potential simulated clicks)
}

// Add new animation update function
function updateAnimations() {
  // Handle view transitions
  if (gameState.isViewTransitioning) {
    let dx = gameState.targetViewX - gameState.viewX;
    let dy = gameState.targetViewY - gameState.viewY;
    
    // Use easing for smooth movement
    gameState.viewX += dx * gameState.viewTransitionSpeed;
    gameState.viewY += dy * gameState.viewTransitionSpeed;
    
    // Check if we've reached the target (with small threshold)
    if (Math.abs(dx) < 0.01 && Math.abs(dy) < 0.01) {
      gameState.viewX = gameState.targetViewX;
      gameState.viewY = gameState.targetViewY;
      gameState.isViewTransitioning = false;
    }
  }
  
  // Handle ship movement animation
  if (gameState.isShipMoving) {
    gameState.shipAnimationProgress += 0.05;
    
    if (gameState.shipAnimationProgress >= 1) {
      // Complete the movement
      gameState.isShipMoving = false;
      gameState.shipAnimationProgress = 0;
      let player = gameState.players[gameState.currentPlayer];
      player.ship.x = gameState.shipToX;
      player.ship.y = gameState.shipToY;
      centerViewOnCurrentShip();
    }
  }
}

// Add function to center view on current ship
function centerViewOnCurrentShip() {
  let player = gameState.players[gameState.currentPlayer];
  gameState.targetViewX = player.ship.x;
  gameState.targetViewY = player.ship.y;
  gameState.isViewTransitioning = true;
}

function getDirection(fromX, fromY, toX, toY) {
  if (toY === fromY - 1) return 0;      // top
  if (toX === fromX + 1) return 1;      // right
  if (toY === fromY + 1) return 2;      // bottom
  if (toX === fromX - 1) return 3;      // left
  return -1;
}
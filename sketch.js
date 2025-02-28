// Beacon Patrol - P5.js Implementation

let gameState = {
  currentPlayer: 0,
  players: [
    { ship: null, tiles: [], movementTokens: 3, color: "#ff4444" },
    { ship: null, tiles: [], movementTokens: 3, color: "#4444ff" }
  ],
  placedTiles: {},
  tileSize: 80,
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
  selectingTileToKeep: false
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
  instructionsButton.mousePressed(() => {
    gameState.showInstructions = !gameState.showInstructions;
  });
}

function createGameAssets() {
  // Create ship images - making them larger
  for (let i = 0; i < 2; i++) {
    let shipImg = createGraphics(gameState.tileSize*0.9, gameState.tileSize*0.9); // Bigger ships
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
    shipImg.vertex(shipImg.width*0.9, shipImg.height*0.5);  // Front point
    shipImg.vertex(shipImg.width*0.8, shipImg.height*0.4);  // Top right
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
    
    // Player number
    //shipImg.fill(255);
    //shipImg.stroke(0);
    //shipImg.strokeWeight(1);
    //shipImg.textSize(16);
    //shipImg.textAlign(CENTER, CENTER);
    //shipImg.text(`${i + 1}`, shipImg.width*0.5, shipImg.height*0.5);
    

    shipImages[i] = shipImg;
  }
  
  // Create token images
  tokenBlue = createGraphics(gameState.tileSize/3, gameState.tileSize/3);
  tokenBlue.background("#4444ff");
  tokenBlue.fill(255);
  tokenBlue.noStroke();
  tokenBlue.ellipse(tokenBlue.width/2, tokenBlue.height/2, tokenBlue.width-10, tokenBlue.height-10);
  tokenBlue.fill(0);
  tokenBlue.textSize(10);
  tokenBlue.textAlign(CENTER, CENTER);
  tokenBlue.text("Move", tokenBlue.width/2, tokenBlue.height/2);
  
  tokenRed = createGraphics(gameState.tileSize/3, gameState.tileSize/3);
  tokenRed.background("#ff4444");
  tokenRed.fill(255);
  tokenRed.noStroke();
  tokenRed.ellipse(tokenRed.width/2, tokenRed.height/2, tokenRed.width-10, tokenRed.height-10);
  tokenRed.fill(0);
  tokenRed.textSize(10);
  tokenRed.textAlign(CENTER, CENTER);
  tokenRed.text("Used", tokenRed.width/2, tokenRed.height/2);
  
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
    // HQ tile (already defined above)
    { id: 0, hasLighthouse: true, hasBeacon: false, hasWindmill: false, isOpenOcean: true, hasPier: false, edges: [0, 0, 0, 0] },
    
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
  // Reset game state
  gameState.placedTiles = {};
  gameState.drawPile = [];
  gameState.discardPile = [];
  gameState.score = 0;
  gameState.messageLog = [];
  gameState.currentPlayer = 0;
  
  // Place the HQ tile
  let hqTile = Object.assign({}, gameState.beaconHQ);
  gameState.placedTiles["0,0"] = hqTile;
  
  // Create draw pile
  for (let i = 0; i < 63; i++) {
    gameState.drawPile.push(i);
  }
  
  // Shuffle the draw pile
  gameState.drawPile = shuffleArray(gameState.drawPile);
  
  if (gameState.soloMode) {
    // Initialize solo player
    gameState.players = [{
      ship: { x: 0, y: 0 },
      tiles: [],
      movementTokens: 4,  // Solo mode gets 4 tokens
      color: "#ff4444"
    }];
    
    // Draw initial 3 tiles
    for (let i = 0; i < 3; i++) {
      if (gameState.drawPile.length > 0) {
        let tileId = gameState.drawPile.pop();
        gameState.players[0].tiles.push(Object.assign({}, gameState.tileTypes[tileId]));
      }
    }
    
    addMessage("Solo game started! You have 4 movement tokens.");
  } else {
    // Initialize 2-player mode
    gameState.players = [
      { ship: { x: 0, y: 0 }, tiles: [], movementTokens: 3, color: "#ff4444" },
      { ship: { x: 0, y: 0 }, tiles: [], movementTokens: 3, color: "#4444ff" }
    ];
    
    // Draw initial tiles for both players
    for (let i = 0; i < 2; i++) {
      for (let j = 0; j < 3; j++) {
        if (gameState.drawPile.length > 0) {
          let tileId = gameState.drawPile.pop();
          gameState.players[i].tiles.push(Object.assign({}, gameState.tileTypes[tileId]));
        }
      }
    }
    
    addMessage("2-player game started! Player 1's turn");
  }
}

function draw() {
  if (!gameState.gameStarted) {
    drawIntroScreen();
    return;
  }
  
  background(30, 58, 138); // North Sea blue
  
  // Draw game board
  push();
  translate(width/2, height/2);
  drawBoard();
  pop();
  
  // Draw player hands and UI
  drawPlayerUI();
  
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
  text("Beacon Patrol", width/2, height/3);
  
  // Game mode buttons
  let buttonWidth = 200;
  let buttonHeight = 60;
  let buttonY = height/2 + 50;
  
  // Solo mode button
  fill(100, 100, 100);
  rect(width/2 - buttonWidth - 20, buttonY, buttonWidth, buttonHeight, 10);
  fill(255);
  textSize(24);
  text("Solo Mode", width/2 - buttonWidth/2 - 20, buttonY + buttonHeight/2);
  
  // 2 Player mode button
  fill(100, 100, 100);
  rect(width/2 + 20, buttonY, buttonWidth, buttonHeight, 10);
  fill(255);
  text("2 Player Mode", width/2 + buttonWidth/2 + 20, buttonY + buttonHeight/2);
}

function drawBoard() {
  // Calculate the grid bounds for what's visible
  let visibleWidth = Math.ceil(width / gameState.tileSize);
  let visibleHeight = Math.ceil(height / gameState.tileSize);
  
  // Draw the grid and placed tiles
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
  
  // Draw ships
  for (let i = 0; i < gameState.players.length; i++) {
    let player = gameState.players[i];
    if (player.ship) {
      let shipX = player.ship.x * gameState.tileSize - shipImages[i].width/2;
      let shipY = player.ship.y * gameState.tileSize - shipImages[i].height/2;
      
      // Draw active ship indicator (only in 2-player mode)
      if (i === gameState.currentPlayer) {
        push();
        translate(player.ship.x * gameState.tileSize, player.ship.y * gameState.tileSize);
        
        // Animated highlight circle (only in 2-player mode)
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
      
      // Draw the ship
      image(shipImages[i], shipX, shipY);
    }
  }
  
  // Highlight valid placement locations for current player
  highlightValidPlacements();
}

function drawTile(tile, x, y) {
  // Draw base tile
  let tileSize = gameState.tileSize;
  
  // Base color based on type
  if (tile.isOpenOcean) {
    fill(65, 105, 225); // Deep blue for open ocean
  } else {
    fill(100, 145, 200); // Lighter blue for coastal waters
  }
  
  stroke(0);
  strokeWeight(1);
  rect(x, y, tileSize, tileSize);
  
  // Draw edges
  let rotatedEdges = rotateEdges(tile.edges, tile.rotation || 0);
  
  // Draw water/land edges more distinctly
  for (let i = 0; i < 4; i++) {
    push();
    translate(x + tileSize/2, y + tileSize/2);
    rotate(i * HALF_PI);
    
    if (rotatedEdges[i] === 1) {
      // Land - more organic shape with irregular coastline
      noStroke();
      // Darker sand at the back
      fill(255, 200, 140);
      beginShape();
      vertex(-tileSize/2, -tileSize/2);
      vertex(tileSize/2, -tileSize/2);
      // Create irregular coastline that reaches the corner
      bezierVertex(
        tileSize/2, -tileSize/2 + tileSize/3,
        -tileSize/3, -tileSize/2 + tileSize/3.5,
        -tileSize/2, -tileSize/2
      );
      endShape(CLOSE);
      
      // Lighter sand at the front
      fill(240, 230, 140);
      beginShape();
      vertex(-tileSize/2, -tileSize/2);
      vertex(tileSize/2, -tileSize/2);
      // Smaller irregular coastline that reaches the corner
      bezierVertex(
        tileSize/2, -tileSize/2 + tileSize/4,
        -tileSize/3, -tileSize/2 + tileSize/4.5,
        -tileSize/2, -tileSize/2
      );
      endShape(CLOSE);
    } else if (!tile.isOpenOcean) {


    } else {
   
      // Animated waves only on open ocean tiles
      stroke(255, 255, 255, 150);
      strokeWeight(1);
      for (let j = 0; j < 3; j++) {
        let y = -tileSize/2 + j * 5 + 2;
        beginShape();
        for (let x = -tileSize/2; x <= tileSize/2; x += 5) {
          vertex(x, y + sin(frameCount * 0.05 + x * 0.1) * 2);
        }
        endShape();
      }
    }
    pop();
  }
  
  // Draw special features
  push();
  translate(x + tileSize/2, y + tileSize/2);
  
  // Draw lighthouse and beacon first
  if (tile.hasLighthouse) {
    // Find the land edge to place the lighthouse
    let landEdgeIndex = rotatedEdges.indexOf(1);


    // Base of lighthouse
    fill(200);
    stroke(0);
    strokeWeight(1);
    rect(-12, -5, 24, 40);
    
    // Stripes
    for (let i = 0; i < 3; i++) {
      fill(255, 0, 0);
      rect(-12, 5 + i * 10, 24, 5);
    }
    
    // Top of lighthouse
    fill(150);
    rect(-15, -15, 30, 10);
    
    // Light room
    fill(255);
    stroke(0);
    ellipse(0, -20, 20, 20);
    
    // Automatically orient the lighthouse to face the water
    if (landEdgeIndex !== -1) {
      rotate(landEdgeIndex * HALF_PI);
    }
  } else if (tile.hasBeacon) {
    // Buoy with more detail
    // Base
    stroke(0);
    strokeWeight(2);
    fill(255, 0, 0);
    ellipse(0, 0, 25, 25);
    
    // Stripes
    fill(255);
    noStroke();
    rect(-12, -5, 24, 10);
    
    // Top light
    fill(255, 255, 0);
    stroke(0);
    strokeWeight(1);
    ellipse(0, 0, 10, 10);

    
    // Animated blinking light
    let blinkSpeed = 0.1;
    let blinkIntensity = 100 + sin(frameCount * blinkSpeed) * 50;
    fill(255, 255, 0, blinkIntensity);
    ellipse(0, 0, 15, 15);
  }
  
  if (tile.hasPier) {
    // Find a land edge to connect the pier
    let landEdgeIndex = rotatedEdges.indexOf(1);
    if (landEdgeIndex !== -1) {
      push();
      rotate(landEdgeIndex * HALF_PI);
      
      // Main pier structure
      fill(139, 69, 19);
      noStroke();
      rect(-25, -8, 50, 16);
      
      // Wooden planks texture
      stroke(101, 67, 33);
      strokeWeight(1);
      for (let i = -20; i < 20; i += 5) {
        line(i, -8, i, 8);
      }
      
      // Support posts
      fill(101, 67, 33);
      noStroke();
      rect(-20, -10, 6, 20);
      rect(0, -10, 6, 20);
      rect(15, -10, 6, 20);
      
      // Rope details
      stroke(200);
      strokeWeight(1);
      beginShape();
      for (let x = -25; x < 25; x += 5) {
        vertex(x, -10 + sin(x * 0.2) * 2);
      }
      endShape();
      pop();
    }
  }
  
  // Draw points value for explored tiles - only if the tile is placed on the board
  if (tile.x !== undefined && tile.y !== undefined) {  // Only check for points on placed tiles
    let isExplored = isFullyExplored(tile.x, tile.y);
    if (isExplored) {
      // Calculate points for this tile
      let points = 1; // Base point
      if (tile.hasLighthouse) points += 2;
      if (tile.hasBeacon) points += 1;
      
      // Calculate windmill points
      if (tile.hasWindmill) {
        // Count adjacent open ocean tiles
        let windmillBonus = 0;
        let directions = [
          {dx: 0, dy: -1},  // top
          {dx: 1, dy: 0},   // right
          {dx: 0, dy: 1},   // bottom
          {dx: -1, dy: 0}   // left
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
        
        points += windmillBonus;
      }
      
      // Draw points value above everything else
      push();
      fill(255);
      stroke(0);
      strokeWeight(3);
      textSize(24);
      textAlign(CENTER, CENTER);
      text(`${points}`, 0, -20); // Moved up above the windmill
      pop();
    }
  }
  
  // Draw windmill last
  if (tile.hasWindmill) {
    // Base of windmill
    fill(150, 75, 0);
    stroke(0);
    strokeWeight(1);
    rect(-8, -5, 16, 35);  // Tower
    
    // Windmill blades with rotation animation
    push();
    translate(0, 0);
    rotate(frameCount * 0.02);  // Rotate blades
    
    fill(200);
    stroke(0);
    strokeWeight(1);
    
    // Draw four blades
    for (let i = 0; i < 4; i++) {
      push();
      rotate(i * HALF_PI);
      beginShape();
      vertex(0, 0);
      vertex(-5, -25);
      vertex(5, -25);
      endShape(CLOSE);
      pop();
    }
    
    // Center hub
    fill(100);
    ellipse(0, 0, 8, 8);
    pop();
  }
  
  pop();
}

function drawPlayerUI() {
  let handY = height - 120;
  let handSpacing = gameState.tileSize + 10;
  
  if (gameState.soloMode) {
    // Center the hand for solo mode
    let handX = width/2 - (handSpacing * 1.5); // Center 3 tiles
    let player = gameState.players[0];
    
    // Draw tiles in hand
    for (let j = 0; j < player.tiles.length; j++) {
      let tileX = handX + j * handSpacing;
      
      push();
      translate(tileX + gameState.tileSize/2, handY + gameState.tileSize/2);
      drawTile(player.tiles[j], -gameState.tileSize/2, -gameState.tileSize/2);
      pop();
    }
    
    // Draw movement tokens
    for (let j = 0; j < 4; j++) {
      let tokenX = handX + j * 40;
      let tokenY = handY + gameState.tileSize + 20;
      
      if (j < player.movementTokens) {
        image(tokenBlue, tokenX, tokenY, 30, 30);
      } else {
        image(tokenRed, tokenX, tokenY, 30, 30);
      }
    }
  } else {
    for (let i = 0; i < gameState.players.length; i++) {
      let player = gameState.players[i];
      let handX = 20 + i * (width / 2);
      
      // Highlight current player's hand
      if (i === gameState.currentPlayer) {
        fill(255, 255, 255, 50);
        rect(handX - 10, handY - 10, handSpacing * 3 + 20, gameState.tileSize + 20, 5);
        
        fill(255);
        textAlign(LEFT, BOTTOM);
        textSize(16);
        text(`Your Turn Player ${i + 1}`, handX, handY - 15);
      } else {
        fill(255);
        textAlign(LEFT, BOTTOM);
        textSize(16);
        text(`Player ${i + 1}`, handX, handY - 15);
      }
      
      // Draw tiles in hand
      for (let j = 0; j < player.tiles.length; j++) {
        let tileX = handX + j * handSpacing;
        
        // If in swap mode, highlight the selected tile
        if (gameState.swapMode && i === gameState.swapPlayerIndex && j === gameState.swapTileIndex) {
          fill(255, 255, 0, 100);
          rect(tileX - 5, handY - 5, gameState.tileSize + 10, gameState.tileSize + 10);
        }
        
        push();
        translate(tileX + gameState.tileSize/2, handY + gameState.tileSize/2);
        drawTile(player.tiles[j], -gameState.tileSize/2, -gameState.tileSize/2);
        pop();
      }
      
      // Draw movement tokens
      for (let j = 0; j < 3; j++) {
        let tokenX = handX + j * 40;
        let tokenY = handY + gameState.tileSize + 20;
        
        if (j < player.movementTokens) {
          image(tokenBlue, tokenX, tokenY, 30, 30);
        } else {
          image(tokenRed, tokenX, tokenY, 30, 30);
        }
      }
    }
  }
  
  // Draw action buttons for current player
  drawActionButtons();
}

function drawActionButtons() {
  let buttonY = 50;
  let buttonWidth = 150;
  let buttonHeight = 40;
  let buttonSpacing = buttonWidth + 20;
  let startX = width - buttonWidth * 3 - 60;
  
  // End Turn button
  fill(100, 100, 100);
  rect(startX, buttonY, buttonWidth, buttonHeight, 5);
  fill(255);
  textAlign(CENTER, CENTER);
  text("End Turn", startX + buttonWidth/2, buttonY + buttonHeight/2);
  
  // Show Discard for Movement button in both modes
  fill(gameState.discardMode ? color(200, 0, 0) : color(100, 100, 100));
  rect(startX + buttonSpacing * 2, buttonY, buttonWidth, buttonHeight, 5);
  fill(255);
  text("Discard to Move", startX + buttonSpacing * 2 + buttonWidth/2, buttonY + buttonHeight/2);
  
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
  let logY = 50;
  
  fill(255);
  textAlign(LEFT, TOP);
  textSize(14);
  
  text("Game Log:", logX, logY);
  
  for (let i = 0; i < Math.min(gameState.messageLog.length, 5); i++) {
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
  if (gameState.score > 35) ranking = "Sailors";
  if (gameState.score > 45) ranking = "Captains";
  if (gameState.score > 55) ranking = "Navigators";
  if (gameState.score > 65) ranking = "Cartographers";
  
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
  textSize(32);
  text("Beacon Patrol - Instructions", width/2, 50);
  
  textAlign(LEFT, TOP);
  textSize(18);
  let instructions = [
    "Objective: Work together to explore as much sea as possible by surrounding tiles.",
    "Scoring:",
    "- Explored tiles (surrounded on all sides): 1 point",
    "- Explored tiles with lighthouse: 3 points",
    "- Explored tiles with beacon buoy: 2 points",
    
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
  let rotatedEdges = rotateEdges(currentTile.edges, currentTile.rotation || 0);
  
  for (let dir of directions) {
    let newX = shipX + dir.dx;
    let newY = shipY + dir.dy;
    let key = `${newX},${newY}`;
    
    // If position is vacant
    if (!gameState.placedTiles[key]) {
      // Check if current tile has water on the edge
      if (rotatedEdges[dir.edge] === 0) { // If water edge
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

function mousePressed() {
  if (!gameState.gameStarted) {
    let buttonWidth = 200;
    let buttonHeight = 60;
    let buttonY = height/2 + 50;
    
    // Check solo mode button
    if (mouseX >= width/2 - buttonWidth - 20 && 
        mouseX <= width/2 - 20 &&
        mouseY >= buttonY && 
        mouseY <= buttonY + buttonHeight) {
      gameState.soloMode = true;
      gameState.gameStarted = true;
      initializeGame();
      return;
    }
    
    // Check 2 player mode button
    if (mouseX >= width/2 + 20 && 
        mouseX <= width/2 + buttonWidth + 20 &&
        mouseY >= buttonY && 
        mouseY <= buttonY + buttonHeight) {
      gameState.soloMode = false;
      gameState.gameStarted = true;
      initializeGame();
      return;
    }
    return;
  }
  
  // Handle clicks on various UI elements
  
  // Check if we clicked the instruction button close
  if (gameState.showInstructions) {
    let closeButtonX = width/2 - 75;
    let closeButtonY = height - 100;
    if (mouseX >= closeButtonX && mouseX <= closeButtonX + 150 &&
        mouseY >= closeButtonY && mouseY <= closeButtonY + 50) {
      gameState.showInstructions = false;
      return;
    }
  }
  
  // If game is over, check for restart button
  if (gameState.gameOver) {
    let buttonX = width/2 - 75;
    let buttonY = height/2 + 100;
    if (mouseX >= buttonX && mouseX <= buttonX + 150 &&
        mouseY >= buttonY && mouseY <= buttonY + 50) {
      // Reset game state and return to intro screen
      gameState.gameStarted = false;
      gameState.gameOver = false;
      return;
    }
    return; // Ignore other clicks during game over
  }
  
  // Handle action buttons
  let buttonY = 50;
  let buttonWidth = 150;
  let buttonHeight = 40;
  let buttonSpacing = buttonWidth + 20;
  let startX = width - buttonWidth * 3 - 60;
  
  // Check for ship click first (for movement)
  if (!gameState.movementMode && !gameState.discardMode && !gameState.swapMode) {
    let player = gameState.players[gameState.currentPlayer];
    if (player.ship && player.movementTokens > 0) {
      // Convert mouse position to grid coordinates
      let gridX = Math.floor((mouseX - width/2) / gameState.tileSize + 0.5);
      let gridY = Math.floor((mouseY - height/2) / gameState.tileSize + 0.5);
      
      // Check if click is on current player's ship
      if (gridX === player.ship.x && gridY === player.ship.y) {
        checkMoveTargets();
        return;
      }
    }
  } else if (gameState.movementMode) {
    // Handle movement target selection
    let gridX = Math.floor((mouseX - width/2) / gameState.tileSize + 0.5);
    let gridY = Math.floor((mouseY - height/2) / gameState.tileSize + 0.5);
    
    if (isValidMoveTarget(gridX, gridY)) {
      moveShip(gridX, gridY);
      gameState.movementMode = false;
      return;
    }
  }

  // End Turn button
  if (mouseX >= startX && mouseX <= startX + buttonWidth &&
      mouseY >= buttonY && mouseY <= buttonY + buttonHeight) {
    if (gameState.soloMode && gameState.players[0].tiles.length > 1) {
      addMessage("Click on the tile you want to keep");
      gameState.selectingTileToKeep = true;
    } else {
      endTurn();
    }
    return;
  }
  
  // Discard for Movement button (available in both modes)
  if (mouseX >= startX + buttonSpacing * 2 && mouseX <= startX + buttonSpacing * 2 + buttonWidth &&
      mouseY >= buttonY && mouseY <= buttonY + buttonHeight) {
    toggleDiscardMode();
    return;
  }
  
  // Swap Tile button (only in 2-player mode)
  if (!gameState.soloMode) {
    if (mouseX >= startX + buttonSpacing && mouseX <= startX + buttonSpacing + buttonWidth &&
        mouseY >= buttonY && mouseY <= buttonY + buttonHeight) {
      toggleSwapMode();
      return;
    }
  }
  
  // Check if clicking on a tile in player's hand
  let handY = height - 120;
  let handSpacing = gameState.tileSize + 10;
  let handX = gameState.soloMode ? 
    width/2 - (handSpacing * 1.5) : // Center for solo mode
    20 + gameState.currentPlayer * (width / 2); // Original 2-player position
  
  let currentPlayer = gameState.players[gameState.currentPlayer];
  
  for (let i = 0; i < currentPlayer.tiles.length; i++) {
    let tileX = handX + i * handSpacing;
    
    if (mouseX >= tileX && mouseX <= tileX + gameState.tileSize &&
        mouseY >= handY && mouseY <= handY + gameState.tileSize) {
      
      // Handle different tile selection modes
      if (gameState.selectingTileToKeep) {
        // Keep this tile and discard others in solo mode
        let keptTile = currentPlayer.tiles[i];
        let discardCount = currentPlayer.tiles.length - 1;
        currentPlayer.tiles = [keptTile];
        addMessage(`Kept 1 tile and discarded ${discardCount} tiles`);
        gameState.selectingTileToKeep = false;
        endTurn();
        return;
      }
      
      if (gameState.discardMode) {
        // Discard tile for movement
        discardTileForMovement(i);
        return;
      }
      
      if (gameState.swapMode) {
        // Handle swap tile selection
        if (gameState.swapTileIndex === -1) {
          // First tile selection
          gameState.swapTileIndex = i;
          gameState.swapPlayerIndex = gameState.currentPlayer;
          addMessage("Now select another player's tile to swap with");
        } else if (gameState.currentPlayer !== gameState.swapPlayerIndex) {
          // Second tile selection (other player's tile)
          swapTiles(gameState.swapTileIndex, i);
        }
        return;
      }
      
      // If no special mode is active, start dragging tile
      gameState.draggedTile = currentPlayer.tiles[i];
      gameState.draggedTileIndex = i;
      return;
    }
  }
  
  // If in swap mode, check for clicks on other player's tiles
  if (gameState.swapMode && gameState.swapTileIndex !== -1) {
    let otherPlayer = (gameState.currentPlayer + 1) % gameState.players.length;
    let otherHandX = 20 + otherPlayer * (width / 2);
    
    for (let i = 0; i < gameState.players[otherPlayer].tiles.length; i++) {
      let tileX = otherHandX + i * handSpacing;
      
      if (mouseX >= tileX && mouseX <= tileX + gameState.tileSize &&
          mouseY >= handY && mouseY <= handY + gameState.tileSize) {
        swapTiles(gameState.swapTileIndex, i);
        return;
      }
    }
  }
}

function mouseDragged() {
  // Only handle dragging if we have a dragged tile
  if (gameState.draggedTile) {
    // Just for visual feedback during dragging
    console.log("Dragging tile:", gameState.draggedTile.id);
    return false; // Prevent default behavior
  }
}

function mouseReleased() {
  console.log("Mouse released, draggedTile:", gameState.draggedTile ? gameState.draggedTile.id : "none");
  
  // If we were dragging a tile, try to place it
  if (gameState.draggedTile) {
    // Convert mouse position to grid position relative to board center
    let gridX = Math.floor((mouseX - width/2) / gameState.tileSize + 0.5);
    let gridY = Math.floor((mouseY - height/2) / gameState.tileSize + 0.5);
    
    console.log("Attempting to place at grid position:", gridX, gridY);
    console.log("Valid placement:", isValidPlacement(gridX, gridY));
    
    // Check if valid placement
    if (isValidPlacement(gridX, gridY)) {
      // Place the tile
      let newTile = Object.assign({}, gameState.draggedTile);
      newTile.rotation = 0; // No rotation
      newTile.x = gridX;
      newTile.y = gridY;
      
      gameState.placedTiles[`${gridX},${gridY}`] = newTile;
      
      // Remove from player's hand
      gameState.players[gameState.currentPlayer].tiles.splice(gameState.draggedTileIndex, 1);
      
      // Required movement: Move ship to the newly placed tile
      // This movement is free and doesn't use a movement token
      let player = gameState.players[gameState.currentPlayer];
      player.ship.x = gridX;
      player.ship.y = gridY;
      
      addMessage(`Player ${gameState.currentPlayer + 1} placed a tile at (${gridX},${gridY}) and moved there`);
      
      // Check for game over condition
      if (gameState.drawPile.length === 0 && 
          gameState.players.every(p => p.tiles.length === 0)) {
        endGame();
      }
    } else {
      console.log("Invalid placement");
    }
    
    // Reset dragged tile
    gameState.draggedTile = null;
    gameState.draggedTileIndex = -1;
    return false; // Prevent default behavior
  }
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
    (x === shipX && y === shipY - 1) || // top
    (x === shipX + 1 && y === shipY) || // right
    (x === shipX && y === shipY + 1) || // bottom
    (x === shipX - 1 && y === shipY)    // left
  );
  
  if (!isAdjacent) {
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

function placeTile(x, y) {
  let player = gameState.players[gameState.currentPlayer];
  let tile = Object.assign({}, gameState.draggedTile);
  
  // Apply rotation
  tile.rotation = 0;
  
  // Add the tile to the board
  let key = `${x},${y}`;
  gameState.placedTiles[key] = tile;
  
  // Move the ship to the new tile
  player.ship.x = x;
  player.ship.y = y;
  
  // Remove the tile from the player's hand
  player.tiles.splice(gameState.draggedTileIndex, 1);
  
  addMessage(`Player ${gameState.currentPlayer + 1} placed a tile at (${x},${y})`);
  
  // Check for game over
  if (gameState.drawPile.length === 0 && 
      gameState.players.every(p => p.tiles.length === 0)) {
    endGame();
  }
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
  
  // Move the ship
  player.ship.x = targetX;
  player.ship.y = targetY;
  
  // Only use a movement token if in movement mode (not discard mode)
  if (gameState.movementMode && !gameState.discardMode) {
    player.movementTokens--;
    addMessage(`Player ${gameState.currentPlayer + 1} moved to (${targetX},${targetY}) using a movement token. ${player.movementTokens} tokens left.`);
  } else if (gameState.discardMode) {
    addMessage(`Player ${gameState.currentPlayer + 1} moved to (${targetX},${targetY}) using a discarded tile`);
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

function handleTileSwap(playerIndex, tileIndex) {
  let currentPlayer = gameState.currentPlayer;
  
  // If this is the first selection, store it
  if (gameState.swapTileIndex === -1) {
    if (playerIndex === currentPlayer) {
      gameState.swapTileIndex = tileIndex;
      addMessage("Now select another player's tile to swap with");
    } else {
      addMessage("Select one of your tiles first");
    }
    return;
  }
  
  // If this is the second selection, perform the swap
  if (playerIndex !== currentPlayer) {
    // Swap tiles
    let temp = gameState.players[currentPlayer].tiles[gameState.swapTileIndex];
    gameState.players[currentPlayer].tiles[gameState.swapTileIndex] = gameState.players[playerIndex].tiles[tileIndex];
    gameState.players[playerIndex].tiles[tileIndex] = temp;
    
    addMessage(`Player ${currentPlayer + 1} swapped a tile with Player ${playerIndex + 1}`);
    
    // Exit swap mode
    gameState.swapMode = false;
    gameState.swapTileIndex = -1;
  } else {
    addMessage("Select a different player's tile to swap with");
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
}

function updateScore() {
  // Check for surrounded tiles
  for (let key in gameState.placedTiles) {
    let tile = gameState.placedTiles[key];
    
    // Skip tiles that are already scored
    if (tile.scored) continue;
    
    let [x, y] = key.split(',').map(Number);
    
    // Check if surrounded on all sides
    let isSurrounded = true;
    let directions = [
      {dx: 0, dy: -1},  // top
      {dx: 1, dy: 0},   // right
      {dx: 0, dy: 1},   // bottom
      {dx: -1, dy: 0}   // left
    ];
    
    for (let dir of directions) {
      let adjX = x + dir.dx;
      let adjY = y + dir.dy;
      let adjKey = `${adjX},${adjY}`;
      
      // If any adjacent position is empty, the tile is not explored
      if (!gameState.placedTiles[adjKey]) {
        isSurrounded = false;
        break;
      }
    }
    
    if (isSurrounded) {
      // Mark as scored
      tile.scored = true;
      
      // Add points based on tile type
      if (tile.hasLighthouse) {
        gameState.score += 3;
        addMessage(`Lighthouse tile surrounded: +3 points`);
      } else if (tile.hasBeacon) {
        gameState.score += 2;
        addMessage(`Beacon tile surrounded: +2 points`);
      } else {
        gameState.score += 1;
        addMessage(`Tile surrounded: +1 point`);
      }
    }
  }
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
}

function isValidMoveTarget(x, y) {
  let key = `${x},${y}`;
  
  // Check if the target position has a tile
  if (!gameState.placedTiles[key]) {
    return false;
  }
  
  // Get the current player's ship position
  let player = gameState.players[gameState.currentPlayer];
  let shipX = player.ship.x;
  let shipY = player.ship.y;
  
  // Check if the target is adjacent to the ship
  let isAdjacent = (
    (x === shipX && y === shipY - 1) || // top
    (x === shipX + 1 && y === shipY) || // right
    (x === shipX && y === shipY + 1) || // bottom
    (x === shipX - 1 && y === shipY)    // left
  );
  
  if (!isAdjacent) {
    return false;
  }
  
  // Check if the target tile has water (can move to water tiles)
  let targetTile = gameState.placedTiles[key];
  
  // Get the direction from ship to target
  let direction = -1;
  if (x === shipX && y === shipY - 1) direction = 0; // top
  if (x === shipX + 1 && y === shipY) direction = 1; // right
  if (x === shipX && y === shipY + 1) direction = 2; // bottom
  if (x === shipX - 1 && y === shipY) direction = 3; // left
  
  // Get the opposite direction (from target to ship)
  let oppositeDirection = (direction + 2) % 4;
  
  // Get rotated edges of the target tile
  let targetRotatedEdges = rotateEdges(targetTile.edges, targetTile.rotation || 0);
  
  // Check if the edge facing the ship is water (0)
  return targetRotatedEdges[oppositeDirection] === 0;
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

function moveShip(targetX, targetY) {
  let player = gameState.players[gameState.currentPlayer];
  
  // Move the ship
  player.ship.x = targetX;
  player.ship.y = targetY;
  
  // Only use a movement token if we're in movement mode AND NOT in discard mode
  if (gameState.movementMode && !gameState.discardMode) {
    player.movementTokens--;
    addMessage(`Player ${gameState.currentPlayer + 1} moved to (${targetX},${targetY}) using a movement token. ${player.movementTokens} tokens left.`);
  } else {
    addMessage(`Player ${gameState.currentPlayer + 1} moved to (${targetX},${targetY}) using a discarded tile`);
  }
  
  // Reset both modes after movement is complete
  gameState.movementMode = false;
  gameState.discardMode = false;
}

function swapTiles(playerTileIndex, otherTileIndex) {
  let currentPlayer = gameState.currentPlayer;
  let otherPlayer = (currentPlayer + 1) % gameState.players.length;
  
  // Swap the tiles
  let temp = gameState.players[currentPlayer].tiles[playerTileIndex];
  gameState.players[currentPlayer].tiles[playerTileIndex] = gameState.players[otherPlayer].tiles[otherTileIndex];
  gameState.players[otherPlayer].tiles[otherTileIndex] = temp;
  
  addMessage(`Player ${currentPlayer + 1} swapped a tile with Player ${otherPlayer + 1}`);
  
  // Exit swap mode
  gameState.swapMode = false;
  gameState.swapTileIndex = -1;
  gameState.swapPlayerIndex = -1;
}

function calculateScore() {
  let score = 0;
  
  // Check each placed tile
  for (let key in gameState.placedTiles) {
    let pos = key.split(',');
    let x = parseInt(pos[0]);
    let y = parseInt(pos[1]);
    
    // Check if the tile is explored (surrounded on all four sides)
    let isExplored = true;
    
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
        isExplored = false;
        break;
      }
    }
    
    // If the tile is explored, add points based on its features
    if (isExplored) {
      let tile = gameState.placedTiles[key];
      
      // Base point for explored tile
      score += 1;
      
      // Additional points for special features
      if (tile.hasLighthouse) {
        score += 2;
      }
      
      if (tile.hasBeacon) {
        score += 1;
      }
      
      if (tile.hasWindmill) {
        // Count adjacent open ocean tiles
        let windmillBonus = 0;
        let directions = [
          {dx: 0, dy: -1},  // top
          {dx: 1, dy: 0},   // right
          {dx: 0, dy: 1},   // bottom
          {dx: -1, dy: 0}   // left
        ];
        
        for (let dir of directions) {
          let adjX = x + dir.dx;
          let adjY = y + dir.dy;
          let adjKey = `${adjX},${adjY}`;
          let adjTile = gameState.placedTiles[adjKey];
          
          if (adjTile && adjTile.isOpenOcean) {
            windmillBonus += 1;
          }
        }
        
        // Add base point plus bonus for adjacent open ocean tiles
        score += windmillBonus;
      }
    }
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
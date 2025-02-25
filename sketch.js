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
  tileRotation: 0,
  swapMode: false,
  swapTileIndex: -1,
  showInstructions: false
};

// Initialize game assets
let tileImages = [];
let shipImages = [];
let tokenBlue, tokenRed;
let backgroundImage;

function preload() {
  // Load tile images
  for (let i = 0; i < 54; i++) {
    tileImages[i] = loadImage(`https://via.placeholder.com/${gameState.tileSize}x${gameState.tileSize}/87CEEB/000000?text=Tile${i+1}`);
  }
  
  // Load ship images
  shipImages[0] = loadImage(`https://via.placeholder.com/${gameState.tileSize/2}x${gameState.tileSize/2}/ff4444/000000?text=Ship1`);
  shipImages[1] = loadImage(`https://via.placeholder.com/${gameState.tileSize/2}x${gameState.tileSize/2}/4444ff/000000?text=Ship2`);
  
  // Load token images
  tokenBlue = loadImage(`https://via.placeholder.com/${gameState.tileSize/3}x${gameState.tileSize/3}/4444ff/ffffff?text=Move`);
  tokenRed = loadImage(`https://via.placeholder.com/${gameState.tileSize/3}x${gameState.tileSize/3}/ff4444/ffffff?text=Used`);
  
  // Load background
  backgroundImage = loadImage(`https://via.placeholder.com/${windowWidth}x${windowHeight}/1e3a8a/ffffff?text=NorthSea`);
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  initializeTileTypes();
  initializeGame();
  
  // Add instruction button
  let instructionsButton = createButton('Instructions');
  instructionsButton.position(10, 10);
  instructionsButton.mousePressed(() => {
    gameState.showInstructions = !gameState.showInstructions;
  });
}

function draw() {
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
    rotate(gameState.tileRotation * HALF_PI);
    drawTile(gameState.draggedTile, -gameState.tileSize/2, -gameState.tileSize/2);
    pop();
  }
  
  // Draw message log
  drawMessageLog();
  
  // Draw game over state
  if (gameState.gameOver) {
    drawGameOver();
  }
  
  // Draw instructions if shown
  if (gameState.showInstructions) {
    drawInstructions();
  }
}

function initializeTileTypes() {
  // Create tile types based on the rules
  // This is a simplified version - in a real implementation you would define each tile's edges
  
  // Format: { id, hasLighthouse, hasBeacon, isOpenOcean, hasPier, edges: [top, right, bottom, left] }
  // Edge: 0 = water, 1 = land
  
  // Create the Beacon HQ tile
  gameState.beaconHQ = { 
    id: 0, 
    hasLighthouse: true, 
    hasBeacon: false, 
    isOpenOcean: false, 
    hasPier: false,
    edges: [0, 0, 0, 0],  // All water edges
    x: 0, 
    y: 0,
    rotation: 0
  };
  
  // Generate 53 more tiles (simplified for this implementation)
  // In a real implementation, you would define each tile's exact configuration
  for (let i = 1; i <= 53; i++) {
    let type = {
      id: i,
      hasLighthouse: Math.random() < 0.2,  // 20% chance for lighthouse
      hasBeacon: !this.hasLighthouse && Math.random() < 0.3,  // 30% chance for beacon if not lighthouse
      isOpenOcean: Math.random() < 0.4,  // 40% chance for open ocean
      hasPier: Math.random() < 0.1,  // 10% chance for pier
      edges: []
    };
    
    // Generate edges - in a real implementation, these would be hardcoded per tile
    if (type.isOpenOcean) {
      type.edges = [0, 0, 0, 0];  // All water for open ocean
    } else {
      // Random mix of land and water
      for (let j = 0; j < 4; j++) {
        type.edges.push(Math.random() < 0.4 ? 1 : 0);
      }
    }
    
    gameState.tileTypes.push(type);
  }
}

function initializeGame() {
  // Place the HQ tile
  let hqTile = Object.assign({}, gameState.beaconHQ);
  gameState.placedTiles["0,0"] = hqTile;
  
  // Create draw pile
  gameState.drawPile = Array.from({length: 53}, (_, i) => i + 1);
  shuffleArray(gameState.drawPile);
  
  // Setup player positions
  for (let i = 0; i < 2; i++) {
    gameState.players[i].ship = { x: 0, y: 0 }; // Start at HQ
    
    // Draw initial tiles
    for (let j = 0; j < 3; j++) {
      if (gameState.drawPile.length > 0) {
        let tileId = gameState.drawPile.pop();
        gameState.players[i].tiles.push(Object.assign({}, gameState.tileTypes[tileId - 1]));
      }
    }
  }
  
  // Add initial message
  addMessage("Game started! Player 1's turn");
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
    rotate(gameState.placedTiles[key].rotation * HALF_PI);
    drawTile(gameState.placedTiles[key], -gameState.tileSize/2, -gameState.tileSize/2);
    pop();
  }
  
  // Draw ships
  for (let i = 0; i < gameState.players.length; i++) {
    let player = gameState.players[i];
    if (player.ship) {
      image(
        shipImages[i], 
        player.ship.x * gameState.tileSize - gameState.tileSize/4, 
        player.ship.y * gameState.tileSize - gameState.tileSize/4, 
        gameState.tileSize/2, 
        gameState.tileSize/2
      );
    }
  }
  
  // Highlight valid placement locations for current player
  highlightValidPlacements();
}

function drawTile(tile, x, y) {
  // Draw base tile
  let imgIndex = tile.id % tileImages.length;
  image(tileImages[imgIndex], x, y, gameState.tileSize, gameState.tileSize);
  
  // Draw special features
  fill(0);
  textAlign(CENTER, CENTER);
  textSize(12);
  
  if (tile.hasLighthouse) {
    fill(255, 0, 0);
    ellipse(x + gameState.tileSize/2, y + gameState.tileSize/2, 20, 20);
    fill(255);
    text("LH", x + gameState.tileSize/2, y + gameState.tileSize/2);
  } else if (tile.hasBeacon) {
    fill(255, 165, 0);
    ellipse(x + gameState.tileSize/2, y + gameState.tileSize/2, 15, 15);
    fill(255);
    text("B", x + gameState.tileSize/2, y + gameState.tileSize/2);
  } else if (tile.hasPier) {
    fill(139, 69, 19);
    rect(x + gameState.tileSize/2 - 15, y + gameState.tileSize/2 - 5, 30, 10);
    fill(255);
    text("PIER", x + gameState.tileSize/2, y + gameState.tileSize/2);
  }
  
  // Draw edge types (water/land)
  for (let i = 0; i < 4; i++) {
    push();
    translate(x + gameState.tileSize/2, y + gameState.tileSize/2);
    rotate(i * HALF_PI);
    
    if (tile.edges[i] === 1) {
      // Land
      fill(240, 230, 140);
      rect(-gameState.tileSize/2, -gameState.tileSize/2, gameState.tileSize/4, gameState.tileSize/10);
    } else {
      // Water
      fill(135, 206, 235, 150);
      rect(-gameState.tileSize/2, -gameState.tileSize/2, gameState.tileSize/4, gameState.tileSize/10);
    }
    pop();
  }
}

function drawPlayerUI() {
  let handY = height - 120;
  let handSpacing = gameState.tileSize + 10;
  
  for (let i = 0; i < gameState.players.length; i++) {
    let player = gameState.players[i];
    let handX = 20 + i * (width / 2);
    
    // Draw player indicator
    fill(player.color);
    textSize(24);
    textAlign(LEFT, TOP);
    let playerName = `Player ${i+1}${i === gameState.currentPlayer ? " (Current)" : ""}`;
    text(playerName, handX, handY - 40);
    
    // Draw hand of tiles
    for (let j = 0; j < player.tiles.length; j++) {
      let tileX = handX + j * handSpacing;
      
      // If in swap mode, highlight the selected tile
      if (gameState.swapMode && i === gameState.currentPlayer && j === gameState.swapTileIndex) {
        fill(255, 255, 0, 100);
        rect(tileX - 5, handY - 5, gameState.tileSize + 10, gameState.tileSize + 10);
      }
      
      push();
      translate(tileX + gameState.tileSize/2, handY + gameState.tileSize/2);
      rotate(0); // No rotation in hand
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
  
  // Draw action buttons for current player
  drawActionButtons();
}

function drawActionButtons() {
  let buttonY = 50;
  let buttonWidth = 150;
  let buttonHeight = 40;
  let buttonSpacing = buttonWidth + 20;
  let startX = width - buttonWidth * 3 - 40;
  
  // End Turn button
  fill(100, 100, 100);
  rect(startX, buttonY, buttonWidth, buttonHeight, 5);
  fill(255);
  textAlign(CENTER, CENTER);
  text("End Turn", startX + buttonWidth/2, buttonY + buttonHeight/2);
  
  // Swap Tile button
  fill(gameState.swapMode ? color(200, 200, 0) : color(100, 100, 100));
  rect(startX + buttonSpacing, buttonY, buttonWidth, buttonHeight, 5);
  fill(255);
  text("Swap Tile", startX + buttonSpacing + buttonWidth/2, buttonY + buttonHeight/2);
  
  // Rotate Tile button
  fill(100, 100, 100);
  rect(startX + buttonSpacing * 2, buttonY, buttonWidth, buttonHeight, 5);
  fill(255);
  text("Rotate Tile", startX + buttonSpacing * 2 + buttonWidth/2, buttonY + buttonHeight/2);
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
    "2. Move your ship using movement tokens (only across water)",
    "3. Swap one tile with another player (once per turn)",
    
    "Controls:",
    "- Drag tiles from your hand to place them",
    "- Click the Rotate button to rotate a tile before placing",
    "- Click your ship and then a valid adjacent tile to move",
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
    {dx: 0, dy: -1, edge: 2, opposite: 0}, // top
    {dx: 1, dy: 0, edge: 3, opposite: 1},  // right
    {dx: 0, dy: 1, edge: 0, opposite: 2},  // bottom
    {dx: -1, dy: 0, edge: 1, opposite: 3}  // left
  ];
  
  for (let dir of directions) {
    let newX = shipX + dir.dx;
    let newY = shipY + dir.dy;
    let key = `${newX},${newY}`;
    
    // If position is vacant
    if (!gameState.placedTiles[key]) {
      // Check if current tile has water on the edge
      let currentTileKey = `${shipX},${shipY}`;
      let currentTile = gameState.placedTiles[currentTileKey];
      
      if (currentTile && currentTile.edges[dir.edge] === 0) { // If water edge
        fill(0, 255, 0, 50);
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
      initializeGame();
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
  let startX = width - buttonWidth * 3 - 40;
  
  // End Turn button
  if (mouseX >= startX && mouseX <= startX + buttonWidth &&
      mouseY >= buttonY && mouseY <= buttonY + buttonHeight) {
    endTurn();
    return;
  }
  
  // Swap Tile button
  if (mouseX >= startX + buttonSpacing && mouseX <= startX + buttonSpacing + buttonWidth &&
      mouseY >= buttonY && mouseY <= buttonY + buttonHeight) {
    toggleSwapMode();
    return;
  }
  
  // Rotate Tile button
  if (mouseX >= startX + buttonSpacing * 2 && mouseX <= startX + buttonSpacing * 2 + buttonWidth &&
      mouseY >= buttonY && mouseY <= buttonY + buttonHeight) {
    if (gameState.draggedTile) {
      gameState.tileRotation = (gameState.tileRotation + 1) % 4;
    }
    return;
  }
  
  // Check if we're in swap mode and clicking on a player's tile
  if (gameState.swapMode) {
    let handY = height - 120;
    let handSpacing = gameState.tileSize + 10;
    
    for (let i = 0; i < gameState.players.length; i++) {
      let handX = 20 + i * (width / 2);
      
      for (let j = 0; j < gameState.players[i].tiles.length; j++) {
        let tileX = handX + j * handSpacing;
        
        if (mouseX >= tileX && mouseX <= tileX + gameState.tileSize &&
            mouseY >= handY && mouseY <= handY + gameState.tileSize) {
          
          handleTileSwap(i, j);
          return;
        }
      }
    }
  }
  
  // Check if we're clicking on current player's tile
  let handY = height - 120;
  let handSpacing = gameState.tileSize + 10;
  let handX = 20 + gameState.currentPlayer * (width / 2);
  
  for (let j = 0; j < gameState.players[gameState.currentPlayer].tiles.length; j++) {
    let tileX = handX + j * handSpacing;
    
    if (mouseX >= tileX && mouseX <= tileX + gameState.tileSize &&
        mouseY >= handY && mouseY <= handY + gameState.tileSize) {
      
      // Start dragging this tile
      gameState.draggedTile = gameState.players[gameState.currentPlayer].tiles[j];
      gameState.draggedTileIndex = j;
      gameState.tileRotation = 0;
      return;
    }
  }
  
  // Check if we're clicking on the current player's ship
  let player = gameState.players[gameState.currentPlayer];
  if (player.ship) {
    let shipScreenX = width/2 + player.ship.x * gameState.tileSize;
    let shipScreenY = height/2 + player.ship.y * gameState.tileSize;
    
    if (mouseX >= shipScreenX - gameState.tileSize/4 && 
        mouseX <= shipScreenX + gameState.tileSize/4 &&
        mouseY >= shipScreenY - gameState.tileSize/4 && 
        mouseY <= shipScreenY + gameState.tileSize/4) {
      
      // Ship clicked, now check for valid move targets
      checkMoveTargets();
      return;
    }
  }
}

function mouseReleased() {
  if (gameState.draggedTile) {
    // Convert mouse position to grid position relative to board center
    let gridX = Math.floor((mouseX - width/2) / gameState.tileSize + 0.5);
    let gridY = Math.floor((mouseY - height/2) / gameState.tileSize + 0.5);
    let key = `${gridX},${gridY}`;
    
    // Check if this is a valid placement
    if (isValidPlacement(gridX, gridY)) {
      placeTile(gridX, gridY);
    }
    
    gameState.draggedTile = null;
    gameState.draggedTileIndex = -1;
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
  
  if (shipTile.edges[direction] !== 0) { // Not water
    return false;
  }
  
  // Check if dragged tile matches existing adjacent tiles
  let draggedTile = gameState.draggedTile;
  let rotatedEdges = rotateEdges(draggedTile.edges, gameState.tileRotation);
  
  // Check all four sides of the new position
  let directions = [
    {dx: 0, dy: -1, edge: 2, opposite: 0}, // top
    {dx: 1, dy: 0, edge: 3, opposite: 1},  // right
    {dx: 0, dy: 1, edge: 0, opposite: 2},  // bottom
    {dx: -1, dy: 0, edge: 1, opposite: 3}  // left
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
  tile.rotation = gameState.tileRotation;
  
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
  
  // Highlight possible move targets
  // This would be implemented in a real game
  addMessage("Click an adjacent water tile to move");
}

function moveShip(targetX, targetY) {
  let player = gameState.players[gameState.currentPlayer];
  
  // Check if move is valid
  // In a real implementation, you would verify water connection
  
  // Move the ship
  player.ship.x = targetX;
  player.ship.y = targetY;
  
  // Use a movement token
  player.movementTokens--;
  
  addMessage(`Player ${gameState.currentPlayer + 1} moved to (${targetX},${targetY})`);
}

function toggleSwapMode() {
  gameState.swapMode = !gameState.swapMode;
  gameState.swapTileIndex = -1;
  
  if (gameState.swapMode) {
    addMessage("Select a tile to swap");
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
  // Draw new tile if available
  let player = gameState.players[gameState.currentPlayer];
  if (gameState.drawPile.length > 0 && player.tiles.length < 3) {
    let tileId = gameState.drawPile.pop();
    player.tiles.push(Object.assign({}, gameState.tileTypes[tileId - 1]));
  }
  
  // Reset movement tokens
  player.movementTokens = 3;
  
  // Check for surrounded tiles and update score
  updateScore();
  
  // Switch to next player
  gameState.currentPlayer = (gameState.currentPlayer + 1) % gameState.players.length;
  
  // Reset swap mode
  gameState.swapMode = false;
  gameState.swapTileIndex = -1;
  
  addMessage(`Player ${gameState.currentPlayer + 1}'s turn`);
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
      let adjKey = `${x + dir.dx},${y + dir.dy}`;
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
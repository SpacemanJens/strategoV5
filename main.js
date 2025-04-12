// jenskh 1234
let me;
let guests;
let shared;

// Game constants
const SCREEN_WIDTH = 2000;
const SCREEN_HEIGHT = 1200;
const GAME_AREA_X = 600;
const GAME_AREA_Y = 50;
const GAME_AREA_WIDTH = 1200;
const GAME_AREA_HEIGHT = 700;
const GAME_AREA_RIGHT = GAME_AREA_X + GAME_AREA_WIDTH;
const GAME_AREA_BOTTOM = GAME_AREA_Y + GAME_AREA_HEIGHT;

const SPACECRAFT_SIZE = 40; // Diameter of spacecraft circles
const SPACECRAFT_SPEED = 4;

// Game state variables
let nameInput;
let chooseTeamBlueButton;
let chooseTeamGreenButton;
let startGameButton;
let newGameButton;
let characterList = [];
let message = ""; // For displaying game info/results

// Define the Stratego pieces
// Rank: Numerical value for comparison (higher is better, except Spy/Bomb/Flag)
// Name: Display name
// Count: How many per team
const CHARACTER_DEFINITIONS = [
  { rank: -1, name: "Core Command", id: "F", count: 1, isFlag: true }, // Special rank -1 for Flag
  { rank: 10, name: "Star Commander", id: "10", count: 1 },
  { rank: 9, name: "Fleet Admiral", id: "9", count: 1 },
  { rank: 8, name: "Star Captain", id: "8", count: 2 },
  { rank: 7, name: "Squadron Leader", id: "7", count: 3 },
  { rank: 6, name: "Ship Captain", id: "6", count: 4 },
  { rank: 5, name: "Lt. Commander", id: "5", count: 4 },
  { rank: 4, name: "Chief P. Officer", id: "4", count: 4 },
  { rank: 3, name: "Engineer", id: "3", count: 5, isMiner: true }, // Special ability
  { rank: 2, name: "Recon Drone", id: "2", count: 8 },
  { rank: 1, name: "Stealth Op", id: "S", count: 1, isSpy: true }, // Special ability (using rank 1 for Spy)
  { rank: 0, name: "Asteroid Field", id: "A", count: 6, isBomb: true, immovable: true }, // Special rank 0 for Bomb
];

// Calculate total pieces (should be 40)
let totalPieces = 0;
CHARACTER_DEFINITIONS.forEach(def => totalPieces += def.count);
console.log("Total pieces per team:", totalPieces); // Verification

// old
//let gameState = "START-SCREEN";

let fixedMinimap
let solarSystem;
let selectedPlanet
let backgroundStarsManager;
let spacecraftImages = [];
let minimapImg = []; // jenskh

let imagesLoaded = 0; // Counter to track loaded images
let totalNumberOfPlanets = 5;
//let totalImagesPerPlanet = [1317, 2190, 1657, 1886, 1889]; // Number of frames for each planet
let totalImagesPerPlanet = [2, 2, 2, 2, 2]; // Number of frames for each planet

// Add these variables for debugging and tracking
let totalExpectedImages = 0;
let loadedCounts = [0, 0, 0, 0, 0]; // Track loading progress for each planet
let debugFrameCount = 0;

//let totalImages = 778;
//let totalImages = 854; 
//let totalImages = 145; 
let animationReady = false;

//let planet3EffectManager;

const detailsLevel = {
  showStarSystem: true,
  showPlanet: true,
  showBackroundStarts: true,
  showGameAreaImage: true,
  showStarPlanetImages: true
}

const screenLayout = {
  screenWidth: 2400, // 2400
  screenHeight: 1200, // 1200
  startPlanetIndex: 0,
  diameterPlanet: 3000, //3838,  // 1500/3838 Must be the same as the actual size of the background image found in preload()
  cropWidth: 1200, // 1800
  cropHeight: 700, // 1200
  xGameArea: 600,
  yGameArea: 50,
};

// ======== Constants ========
const CIRCLE_RADIUS = 400;
const IMAGE_SIZE = 120;
const ANIMATION_FRAMES = 180; // 3 seconds at 60fps.
const SUPERNOVA_MAX_SIZE = 10001;
const SUPERNOVA_THRESHOLD = 0.7;

const gameConstants = {
  planetTurnSpeed: 1, // 1 == fastest, 20 == slowest
  bulletSpeed: 2,
  //canonTowerShootingInterval: 1000,
  diameterSpacecraft: 100, // can be adjusted
  diameterBullet: 15,
  minimapMarkerDiamter: 10,
  warpCooldownTime: 3000, // 30000 seconds cooldown for warping
  shootingIntervals: {
    'Extreem (0.1s)': 100,
    'Very fast (0.3s)': 300,
    'Fast (0.5s)': 500,
    'Normal (1s)': 1000,
    'Slow (2s)': 2000,
    'Very Slow (3s)': 3000
  }
}
let meHost = false;
let counter = 0
let xText = 0;
let gameObjects = []; // Initialize as empty array
//let canonTowerCount = 5; // Store the previous tower count - Declare here
let batchSize = 20; // Number of images to load per batch
let batchIndex = 0; // Keeps track of which batch is loading
let framesLoaded = 0;

let spacecrafts = [];
let activeSpacecrafts = [];
const playerColors = ['green', 'blue', 'red', 'yellow', 'purple', 'orange', 'pink', 'brown', 'cyan', 'magenta', 'lime', 'teal', 'lavender', 'maroon', 'olive']

function loadFrames() {
  // Reset counters before loading
  imagesLoaded = 0;
  loadedCounts = [0, 0, 0, 0, 0];

  for (let planetIndex = 0; planetIndex < totalNumberOfPlanets; planetIndex++) {
    loadFramesForPlanet(planetIndex);
  }
}

function loadFramesForPlanet(planetIndex) {
  let batchIndex = 0; // Reset batchIndex for each planet
  loadNextBatchForPlanet(planetIndex, batchIndex);
}

function loadNextBatchForPlanet(planetIndex, batchIndex) {
  let totalFrames = totalImagesPerPlanet[planetIndex];
  let start = batchIndex * batchSize;
  let end = Math.min(start + batchSize, totalFrames);

  // Only proceed if we have more frames to load
  if (start < totalFrames) {
    //    console.log(`Loading frames ${start} to ${end - 1} for planet ${planetIndex}`);

    for (let i = start; i < end; i++) {
      minimapImg[planetIndex][i] = loadImage(
        `images/planet${planetIndex}/minimap/planet${planetIndex}_${i}.png`,
        () => imageLoaded(planetIndex)
      );
    }

    // Schedule next batch only if there are more frames to load
    if (end < totalFrames) {
      setTimeout(() => loadNextBatchForPlanet(planetIndex, batchIndex + 1), 800);
    }
  }
}

// Track loaded images per planet
function imageLoaded(planetIndex) {
  imagesLoaded++;
  loadedCounts[planetIndex]++;

  // Log progress every 20 images
  if (imagesLoaded % 20 === 0) {
    //    console.log(`Loading progress: ${imagesLoaded}/${totalExpectedImages} images loaded`);
    //    console.log(`Planet progress: [${loadedCounts.join(', ')}]`);
  }

  // Check if all images are loaded
  if (imagesLoaded >= totalExpectedImages) {
    animationReady = true;
    console.log("All images loaded! Starting animation...");
  }
}

function setup() {
  createCanvas(screenLayout.screenWidth, screenLayout.screenHeight);
  //frameRate(30);
  // Initialize the 2D array for minimapImg

  createNameInput();
  initializeCharacterList();

  minimapImg = Array(totalNumberOfPlanets).fill().map(() => []);

  // Out commented while developing
  // Calculate total expected images
  totalExpectedImages = totalImagesPerPlanet.reduce((sum, count) => sum + count, 0);
  console.log(`Total expected images: ${totalExpectedImages}`);
  //loadFrames()

  fixedMinimap = new BasicMinimap(x = 250, y = 250, diameter = 300, color = 'grey', diameterPlanet = screenLayout.diameterPlanet);

  solarSystem = new SolarSystem(xSolarSystemCenter = 1250, ySolarSystemCenter = 900);

  backgroundStarsManager = new BackgroundStarManager(numberOfBackgroundStarts = 300, screenLayout.screenWidth, screenLayout.screenHeight);

  createSpacecrafts();

  if (partyIsHost()) {
    meHost = true;
    updateTowerCount();
  }

  if (me.playerName === "observer") {
    joinGame();
    return;
  }
}

function onLocalScreenArea(xLocal, yLocal) {
  return xLocal >= 0 && xLocal <= screenLayout.cropWidth && yLocal >= 0 && yLocal <= screenLayout.cropHeight;
}

function updateTowerCount() {
  gameObjects = generateTowers(shared.canonTowerCount);
  // Set planetIndex to 3 for all towers
  shared.gameObjects = gameObjects.map(tower => ({
    xGlobal: tower.xGlobal,
    yGlobal: tower.yGlobal,
    diameter: tower.diameter,
    color: tower.color,
    bullets: [],
    angle: 0,
    hits: Array(15).fill(0),
    planetIndex: 3, // Set to planet 3 specifically
    lastShotTime: 0,
  }));
}

function generateTowers(count) {
  const towers = [];

  // Table of predefined tower locations
  const towerTable = [
    { x: 1000, y: 1000, color: 'red' },     // First tower
    { x: 1500, y: 800, color: 'blue' },     // Second tower
    { x: 700, y: 1600, color: 'green' }     // Third tower
  ];

  // Add up to three towers from the table
  const numTowers = Math.min(count, towerTable.length);

  for (let i = 0; i < numTowers; i++) {
    const tower = towerTable[i];

    towers.push(new Canon({
      objectNumber: i,
      objectName: `canon${i}`,
      xGlobal: tower.x,
      yGlobal: tower.y,
      diameter: 60,
      xSpawnGlobal: tower.x,
      ySpawnGlobal: tower.y,
      color: tower.color,
    }));
  }

  return towers;
}

function preload() {
  partyConnect("wss://p5js-spaceman-server-29f6636dfb6c.herokuapp.com", "jkv-stategoV5");

  shared = partyLoadShared("shared", {
    gameObjects: [],  // Start with empty array
    canonTowerHits: Array(15).fill(0),
    canonTowerCount: 3,
    canonTowerShootingInterval: 1000,

    gameState: "GAME-SETUP",
    winningTeam: null,
    resetFlag: false,
    coreCommandLost: false,  // New shared state
  });
  me = partyLoadMyShared({
    playerName: "observer",
    lastWarpTime: 0 // Track when player last used a warp gate
  });
  guests = partyLoadGuestShareds();

  for (let i = 0; i < 13; i++) {
    spacecraftImages[i] = loadImage(`images/spacecraft/spacecraft${i}.png`);
  }
  fixedMinimapImage = [];
  fixedMinimapImage[0] = loadImage("images/planet0/planet0minimapWithWarpGate.png");
  fixedMinimapImage[1] = loadImage("images/planet1/planet1minimapWithWarpGate.png"); // You should replace these with
  fixedMinimapImage[2] = loadImage("images/planet2/planet2minimapWithWarpGate.png"); // actual images for each planet
  fixedMinimapImage[3] = loadImage("images/planet3/planet3minimapWithWarpGate.png"); // when you have them
  fixedMinimapImage[4] = loadImage("images/planet4/planet4minimapWithWarpGate.png");

  planetBackgroundImages = [];
  planetBackgroundImages[0] = loadImage("images/planet0/planet0withWarpGate.png");
  planetBackgroundImages[1] = loadImage("images/planet1/planet1withWarpGate.png"); // You should replace these with
  planetBackgroundImages[2] = loadImage("images/planet2/planet2withWarpGate.png"); // actual images for each planet
  planetBackgroundImages[3] = loadImage("images/planet3/planet3withWarpGate.png"); // when you have them
  planetBackgroundImages[4] = loadImage("images/planet4/planet4withWarpGate.png");
}

// Add a centralized planet color palette after the existing constants
const planetColors = {
  0: { // Blue planet
    center: [20, 50, 160],
    edge: [80, 120, 200],
    name: "Rocky"
  },
  1: { // Green planet
    center: [20, 120, 40],
    edge: [100, 180, 100],
    name: "Organic"
  },
  2: { // Red planet
    center: [120, 20, 20],
    edge: [200, 100, 100],
    name: "Budda"
  },
  3: { // Yellow planet
    center: [120, 120, 20],
    edge: [200, 200, 100],
    name: "Ice cube"
  },
  4: { // Purple planet
    center: [80, 20, 120],
    edge: [150, 80, 200],
    name: "Insect swarm"
  }
};

// Helper function to get planet color scheme
function getPlanetColorScheme(planetIndex) {
  if (planetColors.hasOwnProperty(planetIndex)) {
    return planetColors[planetIndex];
  }
  return {
    center: [50, 50, 50],
    edge: [120, 120, 120],
    name: "Unknown"
  };
}

function draw() {
  background(220);

  // --- Host Logic ---
//  if (partyIsHost()) {
//    handleHostDuties(); 
//  }

  switch (shared.gameState) {
    case "GAME-SETUP":
      drawGameInProgress()
      drawGameSetup()
      break;
    case "IN-GAME":
      drawGameInProgress()


//      drawInGame();
//      if (me.status !== 'inBattle') {
//        handleMovement();
//      }

      //      updateGameState();
      //      validateGameState();
      break;
    case "GAME-FINISHED":
      drawGameFinished();
      break;
    case "GAME-LOST":
      //     showGameState();
      //     showGameOverMessage();
      break;
  }
/*
  console.log("Game State:", shared.gameState);
  fill(255);
  circle(600, 600, 20);
  // Draw Game Area Boundary
  stroke(150);
  noFill();
  rect(GAME_AREA_X, GAME_AREA_Y, GAME_AREA_WIDTH, GAME_AREA_HEIGHT);
  noStroke();

  // --- Draw Player Info in Lower Left ---
  const infoX = 20;
  const infoStartY = SCREEN_HEIGHT - 100;
  const infoLineHeight = 20;
  let currentY = infoStartY;

  fill(255);
  textSize(14);
  textAlign(LEFT, TOP);

  text(`Players: ${activeSpacecrafts.length}`, infoX, currentY);
  currentY += infoLineHeight;

  text(`My Status: ${me.status}`, infoX, currentY);
  currentY += infoLineHeight;

  text(`Game State: ${shared.gameState}`, infoX, currentY);
  currentY += infoLineHeight;
 
  if (partyIsHost()) {
    fill(255, 223, 0);
    textSize(16);
    text("HOST", infoX, currentY);
    fill(255);
    textSize(14);
  }
  // --- End Player Info ---

  // --- Draw Status Messages Above Game Area ---
  const statusMsgX = GAME_AREA_X + GAME_AREA_WIDTH / 2;
  const statusMsgY = GAME_AREA_Y - 30;

  if (me.status === 'inBattle' && me.battleOutcome.result !== 'pending') {
    fill(255, 255, 0);
    textAlign(CENTER, CENTER);
    textSize(20);
    let outcomeMsg = `Battle vs ${me.battleOutcome.opponentInfo?.name || '??'}: ${me.battleOutcome.result.toUpperCase()}! Click anywhere to continue...`;
    text(outcomeMsg, statusMsgX, statusMsgY);
  }
    */
}


function drawGameInProgress() {

  // Debug loading status every 60 frames
  // JENSK Out commented while developing

  debugFrameCount++;
  if (debugFrameCount >= 60) {
    debugFrameCount = 0;
    if (!animationReady) {
      console.log(`Still loading: ${imagesLoaded}/${totalExpectedImages} (${Math.floor(imagesLoaded / totalExpectedImages * 100)}%)`);
    }
  }


  if (!meHost && partyIsHost()) {
    meHost = true;
    updateTowerCount();
  }

  // Make sure me.planetIndex is valid and in range
  if (me.planetIndex === undefined || me.planetIndex < 0 || me.planetIndex >= solarSystem.planets.length) {
    me.planetIndex = 0; // Default to first planet
  }

  selectedPlanet = solarSystem.planets[me.planetIndex];

  // Safety check for selectedPlanet before accessing its properties
  if (!selectedPlanet) {
    console.error("Selected planet is undefined, using default planet");
    selectedPlanet = solarSystem.planets[0]; // Use first planet as fallback
  }

  fixedMinimap.update(selectedPlanet.diameterPlanet, selectedPlanet.xWarpGateUp, selectedPlanet.yWarpGateUp, selectedPlanet.xWarpGateDown, selectedPlanet.yWarpGateDown, selectedPlanet.diameterWarpGate);
  activeSpacecrafts = spacecrafts.filter(f => f.planetIndex >= 0); // Only target visible spacecrafts - changed filter

  // Handle updates
  stepLocal();

  if (partyIsHost()) {
    performHostAction()
  } else {
    receiveNewDataFromHost()
  }

  if (detailsLevel.showBackroundStarts) {
    backgroundStarsManager.move();
  }

  if (me.playerName != "observer") {
    moveMe();
    checkCollisionsWithWarpGate()
    checkCollisions();
  }


  // Draw screen
  background(0);

  if (detailsLevel.showBackroundStarts) {
    backgroundStarsManager.show();
  }

  angleMode(RADIANS);

  drawGameArea()
  if (me.planetIndex === 3) {
    planet3EffectManager.updateAndDraw(me.xGlobal, me.xLocal, me.yGlobal, me.yLocal);
  }

  if (detailsLevel.showPlanet) {
    fixedMinimap.draw();

    activeSpacecrafts.forEach((spacecraft) => {
      if (spacecraft.planetIndex === me.planetIndex) {
        fixedMinimap.drawObject(spacecraft.xGlobal + spacecraft.xLocal, spacecraft.yGlobal + spacecraft.yLocal, gameConstants.minimapMarkerDiamter, spacecraft.color);
      }
    });
    fixedMinimap.drawObject(selectedPlanet.xWarpGateUp, selectedPlanet.yWarpGateUp, gameConstants.minimapMarkerDiamter, 'cyan');
    fixedMinimap.drawObject(selectedPlanet.xWarpGateDown, selectedPlanet.yWarpGateDown, gameConstants.minimapMarkerDiamter, 'magenta');
  }

  // Draw Canon Towers for all players - only on planet 3
  if (me.planetIndex === 3) {
    gameObjects.forEach(canon => {
      canon.drawCanonTower();
      canon.drawBullets();
      canon.drawScore();
    });
  }

  let offSetY = 500;
  if (partyIsHost()) {
    fill('gray')
    text("Host", 20, offSetY);
    offSetY += 20
  }
  textSize(18);
  let numberOfBullets = 0;
  let numberOfVisualBullets = 0;

  // Count visible bullets from spacecrafts
  activeSpacecrafts.forEach((spacecraft) => {
    if (spacecraft.planetIndex >= 0) {
      spacecraft.drawScore(offSetY);
      offSetY += 20;
      numberOfBullets += spacecraft.bullets.length;
      // Count visible bullets
      spacecraft.bullets.forEach(bullet => {
        let xLocal = bullet.xLocal - (me.xGlobal - bullet.xGlobal);
        let yLocal = bullet.yLocal - (me.yGlobal - bullet.yGlobal);
        if (onLocalScreenArea(xLocal, yLocal)) {
          numberOfVisualBullets++;
        }
      });
    }
  });

  // Count visible bullets from canons - only if on planet 3
  if (me.planetIndex === 3) {
    gameObjects.forEach(canon => {
      numberOfBullets += canon.bullets.length;
      // Count visible bullets
      canon.bullets.forEach(bullet => {
        let xLocal = bullet.xGlobal - me.xGlobal;
        let yLocal = bullet.yGlobal - me.yGlobal;
        if (onLocalScreenArea(xLocal, yLocal)) {
          numberOfVisualBullets++;
        }
      });
    });
  }

  fill('gray');
  text("Total number of bullets: " + numberOfBullets, 20, offSetY);
  offSetY += 20;
  text("Number of visible bullets: " + numberOfVisualBullets, 20, offSetY);
  offSetY += 40;
  text("Performance controls:", 20, offSetY);
  offSetY += 20;
  text("Key p: show star system ", 20, offSetY);
  offSetY += 20;
  text("Key o: show detailed minimap ", 20, offSetY);
  offSetY += 20;
  text("Key i: show background starts ", 20, offSetY);
  offSetY += 20;
  text("Key m: Expand game area right ", 20, offSetY);
  offSetY += 20;
  text("Key n: Expand game area down ", 20, offSetY);
  offSetY += 20;
  if (partyIsHost()) {
    text("Key 9, 8, 7, 6: NoOfCanons 18, 9, 3, 0 ", 20, offSetY);
    offSetY += 20;
    text("Key l, k, j: Shooting interval 500, 1000, 2000", 20, offSetY);
    offSetY += 20;
  }

  if (detailsLevel.showStarSystem) {
    push();
    angleMode(DEGREES);

    solarSystem.update();
    solarSystem.draw();
    pop()
    activeSpacecrafts.forEach((spacecraft) => {
      if (spacecraft.planetIndex >= 0) {
        solarSystem.planets[spacecraft.planetIndex].drawSpacecraft(spacecraft);
      }
    });
  }
}

function keyPressed() {

  if (keyCode === 49) { // 1
    me.planetIndex = 0;
    // me.xGlobal = star
  } else if (keyCode === 50) { // 2
    me.planetIndex = 1;
  } else if (keyCode === 51) { // 3
    me.planetIndex = 2;
  } else if (keyCode === 52) { // 4
    me.planetIndex = 3;
  } else if (keyCode === 53) { // 5
    me.planetIndex = 4;
  }

  if (keyCode === 80) { // p 
    detailsLevel.showStarSystem = !detailsLevel.showStarSystem;
  }
  if (keyCode === 79) { // o
    detailsLevel.showPlanet = !detailsLevel.showPlanet;
  }
  if (keyCode === 73) { // i
    detailsLevel.showBackroundStarts = !detailsLevel.showBackroundStarts;
  }
  if (keyCode === 85) { // u
    detailsLevel.showGameAreaImage = !detailsLevel.showGameAreaImage;
  }
  if (keyCode === 89) { // y
    detailsLevel.showStarPlanetImages = !detailsLevel.showStarPlanetImages;
  }
  if (partyIsHost() && keyCode === 57) { // 9
    shared.canonTowerCount = 18;
    updateTowerCount();
  }
  if (partyIsHost() && keyCode === 56) { // 8
    shared.canonTowerCount = 9;
    updateTowerCount();
  }
  if (partyIsHost() && keyCode === 55) { // 7
    shared.canonTowerCount = 3;
    updateTowerCount();
  }
  if (partyIsHost() && keyCode === 54) { // 6
    shared.canonTowerCount = 0;
    updateTowerCount();
  }
  if (partyIsHost() && keyCode === 76) { // l
    shared.canonTowerShootingInterval = 500;
  }
  if (partyIsHost() && keyCode === 75) { // k
    shared.canonTowerShootingInterval = 1000;
  }
  if (partyIsHost() && keyCode === 74) { // j
    shared.canonTowerShootingInterval = 2000;
  }
  if (keyCode === 77) { // m
    if (screenLayout.cropWidth === 1200) {
      screenLayout.cropWidth = 1600;
    } else {
      screenLayout.cropWidth = 1200;
    }
  }
  if (keyCode === 78) { // n
    if (screenLayout.cropHeight === 700) {
      screenLayout.cropHeight = 1100;
      showStarSystem = false
    } else {
      screenLayout.cropHeight = 700;
      showStarSystem = true
    }
  }
}

function performHostAction() {
  // Only process canon logic if on planet 3
  if (me.planetIndex === 3) {
    gameObjects.forEach((canon, index) => {
      canon.move();

      const currentTime = millis();
      const selectedInterval = shared.canonTowerShootingInterval;
      // Check if selectedInterval is a valid number
      if (typeof selectedInterval === 'number') {
        if (currentTime - canon.lastShotTime > selectedInterval) {
          if (activeSpacecrafts.length > 0) {
            // Only target spacecrafts that are on planet 3
            const spacecraftsOnPlanet3 = activeSpacecrafts.filter(f => f.planetIndex === 3);
            if (spacecraftsOnPlanet3.length > 0) {
              const nearestSpacecraft = canon.findNearestSpacecraft(spacecraftsOnPlanet3);

              if (nearestSpacecraft) {
                canon.shoot(nearestSpacecraft);
                canon.lastShotTime = currentTime;
              }
            }
          }
        }
      } else {
        console.warn("Invalid shooting interval:", shootingIntervalSelect.value());
      }

      canon.moveBullets(); // Move bullets before drawing
      canon.checkCollisionsWithSpacecrafts();  // Add this line

      // Sync to shared state
      shared.gameObjects[index] = {
        ...shared.gameObjects[index],
        xGlobal: canon.xGlobal,
        yGlobal: canon.yGlobal,
        bullets: canon.bullets,
        angle: canon.angle,
        lastShotTime: canon.lastShotTime,
        hits: canon.hits,
      };
    });

    // Calculate total hits from canon towers for each player
    let totalCanonHits = Array(15).fill(0);
    gameObjects.forEach(canon => {
      for (let i = 0; i < totalCanonHits.length; i++) {
        totalCanonHits[i] += canon.hits[i];
      }
    });
    shared.canonTowerHits = totalCanonHits;
  }
}

function receiveNewDataFromHost() {

  // Ensure client has same number of towers as host
  while (gameObjects.length < shared.gameObjects.length) {
    const i = gameObjects.length;
    gameObjects.push(new Canon({
      objectNumber: i,
      objectName: `canon${i}`,
      xGlobal: shared.gameObjects[i].xGlobal,
      yGlobal: shared.gameObjects[i].yGlobal,
      diamter: 60,
      color: 'grey',
      xSpawnGlobal: shared.gameObjects[i].xSpawnGlobal,
      ySpawnGlobal: shared.gameObjects[i].ySpawnGlobal
    }));
  }
  // Remove extra towers if host has fewer
  while (gameObjects.length > shared.gameObjects.length) {
    gameObjects.pop();
  }
  // Update existing towers
  gameObjects.forEach((canon, index) => {
    canon.diameter = shared.gameObjects[index].diameter;
    canon.color = shared.gameObjects[index].color;

    canon.xGlobal = shared.gameObjects[index].xGlobal;
    canon.yGlobal = shared.gameObjects[index].yGlobal;
    canon.bullets = shared.gameObjects[index].bullets;
    canon.angle = shared.gameObjects[index].angle;
    canon.lastShotTime = shared.gameObjects[index].lastShotTime; // Sync lastShotTime
    canon.hits = shared.gameObjects[index].hits || Array(15).fill(0);
  });
}

function drawGameArea() {
  if (!selectedPlanet) {
    console.error("Selected planet is undefined in drawGameArea");
    return; // Skip drawing if planet is undefined
  }

  if (detailsLevel.showGameAreaImage) {
    let cropX = me.xGlobal;
    let cropY = me.yGlobal;

    // Use the planet background image that corresponds to the current planet index
    let currentBackgroundImage = planetBackgroundImages[me.planetIndex];

    // Scale the background image to match planet size
    image(currentBackgroundImage,
      screenLayout.xGameArea,
      screenLayout.yGameArea,
      screenLayout.cropWidth,
      screenLayout.cropHeight,
      cropX,
      cropY,
      screenLayout.cropWidth,
      screenLayout.cropHeight
    );

    // Draw the warp gates on top of the background
    drawWarpGateCountDownOnGameArea();

    const colorScheme = getPlanetColorScheme(me.planetIndex);

    push();
    fill('white');
    textAlign(RIGHT, BOTTOM);
    textSize(16);
    text(`${colorScheme.name}`,
      screenLayout.xGameArea + screenLayout.cropWidth - 20,
      screenLayout.yGameArea + screenLayout.cropHeight - 10);
    pop();

  } else {
    // Get colors consistent with the planet type
    const colorScheme = getPlanetColorScheme(me.planetIndex);

    // Draw the planet with a radial gradient
    drawRadialGradient(
      screenLayout.xGameArea - me.xGlobal + selectedPlanet.diameterPlanet / 2,
      screenLayout.yGameArea - me.yGlobal + selectedPlanet.diameterPlanet / 2,
      selectedPlanet.diameterPlanet,
      colorScheme.center,
      colorScheme.edge
    );

    // Black out areas outside the game area
    fill('black');
    rect(0, 0, screenLayout.xGameArea, screenLayout.screenHeight);
    rect(screenLayout.xGameArea + screenLayout.cropWidth, 0, screenLayout.screenWidth, screenLayout.screenHeight);
    rect(0, screenLayout.yGameArea + screenLayout.cropHeight, screenLayout.screenWidth, screenLayout.screenWidth);

    // Also draw warp gates in non-image mode
    drawWarpGatesOnGameArea();

    // Draw planet name in the bottom right of the game area
    push();
    fill('white');
    textAlign(RIGHT, BOTTOM);
    textSize(16);
    text(`${colorScheme.name} Planet`,
      screenLayout.xGameArea + screenLayout.cropWidth - 20,
      screenLayout.yGameArea + screenLayout.cropHeight - 10);
    pop();
  }

  // Draw spacecrafts and bullets on top - only if they're on the same planet
  activeSpacecrafts.forEach((spacecraft) => {
    if (spacecraft.planetIndex === me.planetIndex) {
      spacecraft.drawSpacecraft();
      spacecraft.drawBullets();
    }
  });
}

// Helper function to draw a radial gradient with array colors instead of color() objects
function drawRadialGradient(x, y, diameter, colorCenterArray, colorEdgeArray) {
  push();
  noStroke();
  const radius = diameter / 2;
  const numSteps = 50; // More steps = smoother gradient

  for (let i = numSteps; i > 0; i--) {
    const step = i / numSteps;
    const currentRadius = radius * step;

    // Interpolate between the two colors using arrays instead of color objects
    const r = lerp(colorCenterArray[0], colorEdgeArray[0], 1 - step);
    const g = lerp(colorCenterArray[1], colorEdgeArray[1], 1 - step);
    const b = lerp(colorCenterArray[2], colorEdgeArray[2], 1 - step);

    fill(r, g, b);
    circle(x, y, currentRadius * 2);
  }
  pop();
}

function drawWarpGatesOnGameArea() {
  // Calculate relative position for up warp gate based on global coordinates
  let xLocalUp = selectedPlanet.xWarpGateUp - me.xGlobal;
  let yLocalUp = selectedPlanet.yWarpGateUp - me.yGlobal;

  // Calculate relative position for down warp gate based on global coordinates  
  let xLocalDown = selectedPlanet.xWarpGateDown - me.xGlobal;
  let yLocalDown = selectedPlanet.yWarpGateDown - me.yGlobal;

  // Check if warp gate is in cooldown
  const currentTime = millis();
  const isCooldown = currentTime - me.lastWarpTime < gameConstants.warpCooldownTime;
  const cooldownRatio = isCooldown ?
    (currentTime - me.lastWarpTime) / gameConstants.warpCooldownTime : 1;

  // Draw the "up" warp gate if it's visible on screen
  if (onLocalScreenArea(xLocalUp, yLocalUp)) {
    push();
    if (isCooldown) {
      // Show cooldown state with different colors
      fill('darkblue');
      // Draw cooldown indicator as partial circle
      stroke('white');
      strokeWeight(2);
      circle(screenLayout.xGameArea + xLocalUp, screenLayout.yGameArea + yLocalUp, selectedPlanet.diameterWarpGate);

      // Draw cooldown progress arc
      noFill();
      stroke('cyan');
      strokeWeight(4);
      arc(
        screenLayout.xGameArea + xLocalUp,
        screenLayout.yGameArea + yLocalUp,
        selectedPlanet.diameterWarpGate * 0.8,
        selectedPlanet.diameterWarpGate * 0.8,
        0,
        cooldownRatio * TWO_PI
      );

      // Show remaining seconds
      fill('white');
      noStroke();
      textAlign(CENTER, CENTER);
      textSize(14);
      text(
        Math.ceil((gameConstants.warpCooldownTime - (currentTime - me.lastWarpTime)) / 1000),
        screenLayout.xGameArea + xLocalUp,
        screenLayout.yGameArea + yLocalUp
      );
    } else {
      // Normal active state
      fill('cyan');
      stroke('white');
      strokeWeight(2);
      circle(screenLayout.xGameArea + xLocalUp, screenLayout.yGameArea + yLocalUp, selectedPlanet.diameterWarpGate);

      // Add inner details for the "up" gate
      noFill();
      stroke('white');
      circle(screenLayout.xGameArea + xLocalUp, screenLayout.yGameArea + yLocalUp, selectedPlanet.diameterWarpGate * 0.7);

      // Add arrow indicating "up"
      fill('white');
      noStroke();

      triangle(
        screenLayout.xGameArea + xLocalUp, screenLayout.yGameArea + yLocalUp - 15,
        screenLayout.xGameArea + xLocalUp - 10, screenLayout.yGameArea + yLocalUp + 5,
        screenLayout.xGameArea + xLocalUp + 10, screenLayout.yGameArea + yLocalUp + 5
      );
    }
    pop();
  }

  // Draw the "down" warp gate if it's visible on screen
  if (onLocalScreenArea(xLocalDown, yLocalDown)) {
    push();
    if (isCooldown) {
      // Show cooldown state with different colors
      fill('darkmagenta');
      // Draw cooldown indicator as partial circle
      stroke('white');
      strokeWeight(2);
      circle(screenLayout.xGameArea + xLocalDown, screenLayout.yGameArea + yLocalDown, selectedPlanet.diameterWarpGate);

      // Draw cooldown progress arc
      noFill();
      stroke('magenta');
      strokeWeight(4);
      arc(
        screenLayout.xGameArea + xLocalDown,
        screenLayout.yGameArea + yLocalDown,
        selectedPlanet.diameterWarpGate * 0.8,
        selectedPlanet.diameterWarpGate * 0.8,
        0,
        cooldownRatio * TWO_PI
      );

      // Show remaining seconds
      fill('white');
      noStroke();
      textAlign(CENTER, CENTER);
      textSize(14);
      text(
        Math.ceil((gameConstants.warpCooldownTime - (currentTime - me.lastWarpTime)) / 1000),
        screenLayout.xGameArea + xLocalDown,
        screenLayout.yGameArea + yLocalDown
      );
    } else {
      // Normal active state
      fill('magenta');
      stroke('white');
      strokeWeight(2);
      circle(screenLayout.xGameArea + xLocalDown, screenLayout.yGameArea + yLocalDown, selectedPlanet.diameterWarpGate);

      // Add inner details for the "down" gate
      noFill();
      stroke('white');
      circle(screenLayout.xGameArea + xLocalDown, screenLayout.yGameArea + yLocalDown, selectedPlanet.diameterWarpGate * 0.7);

      // Add arrow indicating "down"
      fill('white');
      noStroke();

      triangle(
        screenLayout.xGameArea + xLocalDown, screenLayout.yGameArea + yLocalDown + 15,
        screenLayout.xGameArea + xLocalDown - 10, screenLayout.yGameArea + yLocalDown - 5,
        screenLayout.xGameArea + xLocalDown + 10, screenLayout.yGameArea + yLocalDown - 5
      );
    }
    pop();
  }
}

// Draw warp gates count down on the game area with cooldown visualization
function drawWarpGateCountDownOnGameArea() {
  // Calculate relative position for up warp gate based on global coordinates
  let xLocalUp = selectedPlanet.xWarpGateUp - me.xGlobal;
  let yLocalUp = selectedPlanet.yWarpGateUp - me.yGlobal;

  // Calculate relative position for down warp gate based on global coordinates  
  let xLocalDown = selectedPlanet.xWarpGateDown - me.xGlobal;
  let yLocalDown = selectedPlanet.yWarpGateDown - me.yGlobal;

  // Check if warp gate is in cooldown
  const currentTime = millis();
  const isCooldown = currentTime - me.lastWarpTime < gameConstants.warpCooldownTime;
  const cooldownRatio = isCooldown ?
    (currentTime - me.lastWarpTime) / gameConstants.warpCooldownTime : 1;

  // Draw the "up" warp gate if it's visible on screen
  if (onLocalScreenArea(xLocalUp, yLocalUp)) {
    push();
    if (isCooldown) {

      // Draw cooldown progress arc
      noFill();
      stroke('cyan');
      strokeWeight(10);

      let diameterCountdown = 30
      arc(
        screenLayout.xGameArea + xLocalUp,
        screenLayout.yGameArea + yLocalUp,
        diameterCountdown * 0.8,
        diameterCountdown * 0.8,
        0,
        cooldownRatio * TWO_PI
      );
      pop();
    }
  }

  // Draw the "down" warp gate if it's visible on screen
  if (onLocalScreenArea(xLocalDown, yLocalDown)) {
    push();
    if (isCooldown) {
      // Draw cooldown progress arc
      noFill();
      stroke('magenta');
      strokeWeight(10);

      let diameterCountdown = 30
      arc(
        screenLayout.xGameArea + xLocalDown,
        screenLayout.yGameArea + yLocalDown,
        diameterCountdown * 0.8,
        diameterCountdown * 0.8,
        0,
        cooldownRatio * TWO_PI
      );
    }
    pop();
  }
}

function moveMe() {

  // Local movement (game area)
  let localOffX = 0;
  let localOffY = 0;
  const localSpeed = 9; // 3
  if (keyIsDown(70)) { localOffX = -localSpeed } // F
  if (keyIsDown(72)) { localOffX = localSpeed }  // H
  if (keyIsDown(84)) { localOffY = -localSpeed } // T
  if (keyIsDown(71)) { localOffY = localSpeed }  // G

  // Global movement (planet)
  const globalSpeed = 12; // 6
  let gOffX = 0, gOffY = 0;
  if (keyIsDown(65)) { gOffX = -globalSpeed } // A
  if (keyIsDown(68)) { gOffX = globalSpeed }  // D
  if (keyIsDown(87)) { gOffY = -globalSpeed } // W
  if (keyIsDown(83)) { gOffY = globalSpeed }  // S

  let xTemp = me.xLocal + localOffX;
  let yTemp = me.yLocal + localOffY;
  let newxGlobal = me.xGlobal + gOffX;
  let newyGlobal = me.yGlobal + gOffY;

  // Keep local position within screen bounds
  xTemp = constrain(xTemp, 0, screenLayout.cropWidth);
  yTemp = constrain(yTemp, 0, screenLayout.cropHeight);

  // Keep global position within planet bounds
  newxGlobal = constrain(newxGlobal, 0, selectedPlanet.diameterPlanet);
  newyGlobal = constrain(newyGlobal, 0, selectedPlanet.diameterPlanet);

  if (selectedPlanet && selectedPlanet.onPlanet(xTemp + newxGlobal, yTemp + newyGlobal)) {
    me.xGlobal = newxGlobal;
    me.yGlobal = newyGlobal;
    me.xLocal = xTemp;
    me.yLocal = yTemp;
  }
  /*
    if (planet.isOnPlanet(xTemp + newxGlobal, yTemp + newyGlobal)) {
      me.xGlobal = newxGlobal;
      me.yGlobal = newyGlobal;
      me.xLocal = xTemp;
      me.yLocal = yTemp;
    }
      */

  me.xMouse = mouseX - screenLayout.xGameArea;
  me.yMouse = mouseY - screenLayout.yGameArea;


  for (let i = me.bullets.length - 1; i >= 0; i--) {
    let bullet = me.bullets[i];
    let bulletVector = createVector(
      int(bullet.xMouseStart) - bullet.xStart,
      int(bullet.yMouseStart) - bullet.yStart,
    ).normalize();
    bullet.xLocal += bulletVector.x * parseInt(gameConstants.bulletSpeed);
    bullet.yLocal += bulletVector.y * parseInt(gameConstants.bulletSpeed);

    // Update global coordinates
    bullet.xGlobal += bulletVector.x * parseInt(gameConstants.bulletSpeed);
    bullet.yGlobal += bulletVector.y * parseInt(gameConstants.bulletSpeed);

    let xLocalTemp = bullet.xLocal - (me.xGlobal - bullet.xGlobal);
    let yLocalTemp = bullet.yLocal - (me.yGlobal - bullet.yGlobal);

    // Remove bullet if it's not on the screen seen from the spacecraft shooting it
    if (!selectedPlanet.onPlanet(bullet.xLocal + bullet.xGlobal, bullet.yLocal + bullet.yGlobal)

      || !onLocalScreenArea(xLocalTemp, yLocalTemp)) {
      me.bullets.splice(i, 1);
    }
  }
}

function checkCollisions() {
  activeSpacecrafts.forEach((spacecraft) => {
    if (spacecraft.playerName != me.playerName && spacecraft.planetIndex === me.planetIndex) {
      checkCollisionsWithSpacecraft(spacecraft);
    }
  });
}

function checkCollisionsWithSpacecraft(spacecraft) {
  for (let i = me.bullets.length - 1; i >= 0; i--) {
    let bullet = me.bullets[i];

    // Calculate bullet's position relative to the spacecraft
    let bulletPosX = bullet.xLocal - (me.xGlobal - bullet.xGlobal);
    let bulletPosY = bullet.yLocal - (me.yGlobal - bullet.yGlobal);

    // Calculate spacecraft's position relative to the bullet
    let spacecraftPosX = spacecraft.xLocal - (me.xGlobal - spacecraft.xGlobal);
    let spacecraftPosY = spacecraft.yLocal - (me.yGlobal - spacecraft.yGlobal);

    let d = dist(spacecraftPosX, spacecraftPosY, bulletPosX, bulletPosY);

    if (d < (spacecraft.diameter + gameConstants.diameterBullet) / 2) {
      me.hits[spacecraft.playerNumber]++;
      me.bullets.splice(i, 1);
    }
  }
}

function checkCollisionsWithWarpGate() {
  if (!selectedPlanet) {
    return; // Skip collision check if planet is undefined
  }

  // Check if warp gate is in cooldown
  const currentTime = millis();
  const isCooldown = currentTime - me.lastWarpTime < gameConstants.warpCooldownTime;

  // Don't allow warping during cooldown
  if (isCooldown) {
    return;
  }

  let di = dist(me.xGlobal + me.xLocal, me.yGlobal + me.yLocal, selectedPlanet.xWarpGateUp, selectedPlanet.yWarpGateUp);

  if (di < selectedPlanet.diameterWarpGate / 2) {
    if (me.planetIndex === 4) {
      me.planetIndex = 0;
    } else {
      me.planetIndex++;
    }
    me.xGlobal = solarSystem.planets[me.planetIndex].xWarpGateUp - me.xLocal;
    me.yGlobal = solarSystem.planets[me.planetIndex].yWarpGateUp - me.yLocal;
    me.lastWarpTime = currentTime; // Set the last warp time

    return;
  }

  di = dist(me.xGlobal + me.xLocal, me.yGlobal + me.yLocal, selectedPlanet.xWarpGateDown, selectedPlanet.yWarpGateDown);

  if (di < selectedPlanet.diameterWarpGate / 2) {
    if (me.planetIndex === 0) {
      me.planetIndex = 4;
    } else {
      me.planetIndex--;
    }
    me.xGlobal = solarSystem.planets[me.planetIndex].xWarpGateDown - me.xLocal;
    me.yGlobal = solarSystem.planets[me.planetIndex].yWarpGateDown - me.yLocal;
    me.lastWarpTime = currentTime; // Set the last warp time
    return;
  }
}

function stepLocal() {

  spacecrafts.forEach(spacecraft => {
    const guest = guests.find((p) => p.playerName === spacecraft.playerName);
    if (guest) {
      spacecraft.syncFromShared(guest);
    } else {
      spacecraft.planetIndex = -1;
    }
  });

}

function mousePressed() {

  if (me.playerName === "observer" || me.bullets.length > 5)
    return

  let bullet = {
    xLocal: me.xLocal,
    yLocal: me.yLocal,
    xStart: me.xLocal,
    yStart: me.yLocal,
    xMouseStart: me.xMouse,
    yMouseStart: me.yMouse,
    xGlobal: me.xGlobal,
    yGlobal: me.yGlobal,
  };
  me.bullets.push(bullet);

  mousePresse2()
}


function createSpacecrafts() {
  for (let i = 0; i < 13; i++) {
    spacecrafts.push(new Spacecraft({
      playerNumber: i,
      playerName: "player" + i,
      playerDisplayName: "playerDisplay" + i,
      teamNumber: 0,
      xLocal: screenLayout.cropWidth / 2 + 100,
      yLocal: screenLayout.cropHeight / 2,
      xGlobal: screenLayout.diameterPlanet / 2 - screenLayout.cropWidth / 2 + 400,
      yGlobal: screenLayout.diameterPlanet / 2 - screenLayout.cropHeight / 2,
      diameter: gameConstants.diameterSpacecraft,
      xMouse: 0,
      yMouse: 0,
      color: playerColors[i % playerColors.length],
      bullets: [],
      hits: Array(15).fill(0),
      planetIndex: -1,

      team: null,
      characterId: null,
      characterRank: null,
      characterName: null,
      characterInstanceId: null, 
      x: -1000,
      y: -1000,
      size: SPACECRAFT_SIZE,
      isReady: false,
      hasCharacter: false,
      isRevealed: false,
      hasBattled: false,
      status: "available", // 'available', 'inBattle', 'lost', 'needsCharacter', 'wonGameTrigger'
      inBattleWith: null,
      battleOutcome: { result: 'pending', opponentInfo: null },
      lastProcessedResetFlag: false
    }));
  }
}

function joinGame() {

  // don't let current players double join
  if (me.playerName.startsWith("player")) return;

  for (let spacecraft of spacecrafts) {
    console.log("Checking spacecraft:", spacecraft.playerName);
    if (!guests.find((p) => p.playerName === spacecraft.playerName)) {
      spawn(spacecraft);
      return;
    }
  }
}

function watchGame() {
  me.playerName = "observer";
}

function spawn(spacecraft) {
  console.log("Spawning spacecraft:", spacecraft.playerName);
  me.playerNumber = spacecraft.playerNumber;
  me.playerName = spacecraft.playerName;
  me.playerDisplayName = spacecraft.playerDisplayName;
  me.xLocal = spacecraft.xLocal;
  me.yLocal = spacecraft.yLocal;
  me.xGlobal = spacecraft.xGlobal;
  me.yGlobal = spacecraft.yGlobal;
  me.diameter = spacecraft.diameter;
  me.color = spacecraft.color;
  me.bullets = [];
  me.hits = Array(15).fill(0);
  me.planetIndex = screenLayout.startPlanetIndex;
  me.lastWarpTime = 0; // Reset warp cooldown when spawning
  me.team = spacecraft.team;
  me.characterId = spacecraft.characterId;
  me.characterRank = spacecraft.characterRank;
  me.characterName = spacecraft.characterName;
  me.characterInstanceId = spacecraft.characterInstanceId;
  me.x = spacecraft.x;
  me.y = spacecraft.y;
  me.size = spacecraft.size;
  me.isReady = spacecraft.isReady;
  me.hasCharacter = spacecraft.hasCharacter;
  me.isRevealed = spacecraft.isRevealed;
  me.hasBattled = spacecraft.hasBattled;
  me.status = spacecraft.status;
  me.inBattleWith = spacecraft.inBattleWith;
  me.battleOutcome = spacecraft.battleOutcome;
  me.lastProcessedResetFlag = spacecraft.lastProcessedResetFlag;
}
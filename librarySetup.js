// --------------------
// Helper Drawing Function for Top Left Info
// --------------------
function drawTopLeftInfo() {
    if (me.isReady) {
        fill(255);
        textSize(18);
        textAlign(LEFT, TOP);
        text(`Welcome, ${me.playerName}! Team: ${me.team === 'blue' ? 'Blue' : 'Green'}.`, 10, 20);
        text("Choose your Spacecraft:", 10, 50);
    }
}

// --------------------
// Game State Drawing Functions
// --------------------

function drawGameSetup() {
  if (!me.isReady) {
    // Show name input elements (handled by reset/initial state)
    fill(255);
    textSize(20);
    textAlign(CENTER, CENTER);
    text("Enter your player name and choose a team:", width / 2, height / 2 - 100);
  } else {
    // Player is ready, hide initial setup UI
    if (nameInput) nameInput.hide();
    if (chooseTeamBlueButton) chooseTeamBlueButton.hide();
    if (chooseTeamGreenButton) chooseTeamGreenButton.hide();

    // Draw welcome text and character list prompt
    drawTopLeftInfo(); // Use the helper function

    // Draw the list of available characters
    drawCharacterList();

    // Centered status message position
    const statusMsgX = GAME_AREA_X + GAME_AREA_WIDTH / 2;
    const statusMsgY = GAME_AREA_Y - 30;

    // --- Host Logic for Setup ---
    if (partyIsHost()) {
      // Check if both teams have chosen their flag
      //let allPlayers = [me, ...guests]; // Need all players to check both teams
      let blueFlagChosen = activeSpacecrafts.some(p => p.team === 'blue' && p.characterId === 'F' && p.hasCharacter);
      let greenFlagChosen = activeSpacecrafts.some(p => p.team === 'green' && p.characterId === 'F' && p.hasCharacter);
      let myTeamFlagChosen = activeSpacecrafts.some(p => p.team === me.team && p.characterId === 'F' && p.hasCharacter);

      if (blueFlagChosen && greenFlagChosen) {
        // Both flags chosen, show the start button (positioned centrally)
        if (!startGameButton) createStartGameButton(); // Create if doesn't exist
        startGameButton.show();
      } else {
        // Hide start button and show centered waiting message if flags aren't ready
        if (startGameButton) startGameButton.hide();
         fill(255, 100, 100);
         textAlign(CENTER, CENTER);
         textSize(20);
         let statusText = "";
         
         if (!myTeamFlagChosen) {
             statusText = "A player from your team must select a Core Command (F)...";
         } else if (!blueFlagChosen || !greenFlagChosen) {
             statusText = "Waiting for the other team to choose a Core Command (F)...";
         }
         
         text(statusText, statusMsgX, statusMsgY);
      }
    }
    // --- Client Logic for Setup ---
    else {
         // Non-hosts don't show the start button
         if (startGameButton) startGameButton.hide();

         // Display specific status messages for client
         //let allPlayers = [me, ...guests];
         let myTeamFlagChosen = activeSpacecrafts.some(p => p.team === me.team && p.characterId === 'F' && p.hasCharacter);
         let otherTeamFlagChosen = activeSpacecrafts.some(p => p.team !== me.team && p.characterId === 'F' && p.hasCharacter);

         fill(255, 100, 100); // Default red color for waiting messages
         textAlign(CENTER, CENTER);
         textSize(20);
         let statusText = "";

         if (!myTeamFlagChosen) {
             statusText = "A player from your team must select a Core Command (F)...";
         } else if (!me.hasCharacter) {
             // My team flag is chosen, but I haven't picked my piece yet
             fill(255, 200, 0); // Yellow color for action needed by player
             statusText = "Please choose a character from the list to the left.";
         } else if (!otherTeamFlagChosen) {
             statusText = "Waiting for the other team to choose a Core Command (F)...";
         } else {
             // Both flags are chosen, waiting for host
             statusText = "Waiting for the HOST to start the game.";
         }

         text(statusText, statusMsgX, statusMsgY);
    }
  }
}

function drawInGame() {
    // Always hide setup/endgame buttons during the game
    if (startGameButton) startGameButton.hide();
    if (newGameButton) newGameButton.hide();

    // Draw welcome text and character list prompt
    drawTopLeftInfo();

    // Draw the character list (for selection if needed)
    drawCharacterList();

    // Draw all active spacecraft
    //let allPlayers = [me, ...guests];
    activeSpacecrafts.forEach(p => {
        if (p.hasCharacter && p.status !== 'lost') {
            drawSpacecraft(p);
        }
    });

    // Display Core Command lost message if applicable
    if (shared.coreCommandLost) {
        fill(255, 0, 0);
        textAlign(CENTER, CENTER);
        textSize(48);
        text("CORE COMMAND LOST OR DRAWN! HOST MUST START A NEW GAME!", 
             GAME_AREA_X + GAME_AREA_WIDTH / 2, 
             GAME_AREA_Y + GAME_AREA_HEIGHT / 2);
    }

    // Display temporary messages (like battle results)
    if (message) {
        fill(255);
        textAlign(CENTER, CENTER);
        textSize(24);
        text(message, GAME_AREA_X + GAME_AREA_WIDTH / 2, GAME_AREA_Y - 25);
    }

    // Prompt to choose a new character if needed
    if (me.status === 'needsCharacter' && !me.hasCharacter) {
        fill(255, 200, 0);
        textAlign(CENTER, CENTER);
        textSize(20);
        text("Your spacecraft was lost! Choose a new one from the list.", 
             GAME_AREA_X + GAME_AREA_WIDTH / 2, 
             GAME_AREA_Y - 30);
    }
}


function drawGameFinished() {
   // Ensure setup/game buttons are hidden
   if (startGameButton) startGameButton.hide();
   if (newGameButton) newGameButton.hide();

  // Display the outcome message centered
  fill(255);
  textSize(48);
  textAlign(CENTER, CENTER);
  let winMsg = "";
  if (shared.winningTeam === "draw") {
    winMsg = "The game is a Draw!";
  } else if (shared.winningTeam && shared.winningPlayerName) {
    // New win message format using winning player name
    winMsg = `Team ${shared.winningTeam.toUpperCase()} is winner of the game.\nPlayer ${shared.winningPlayerName} defeated the Core command`;
     textSize(36); // Slightly smaller text for the longer message
  } else if (shared.winningTeam) {
      // Fallback if winningPlayerName isn't set for some reason (e.g., flag eliminated)
      winMsg = `Team ${shared.winningTeam.toUpperCase()} Wins!`;
  } else {
      // Should ideally not happen if host logic is correct, but have a fallback
      winMsg = "Game Over!";
  }
  // Position the main message in the center of the screen
  text(winMsg, width / 2, height / 2 - 40); // Shift up slightly

  // Host shows "Start New Game" button below the message
  if (partyIsHost()) {
    if (!newGameButton) createNewGameButton(); // Creates button positioned correctly
    newGameButton.show();
  } 
  // Clients show "Waiting for host..." text below the message
  else { 
      if (newGameButton) newGameButton.hide(); // Ensure client never shows the button
      fill(200); // Lighter color for waiting text
      textSize(20);
       textAlign(CENTER, CENTER);
      // Position waiting text below the main message
      text("Waiting for host to start a new game...", width / 2, height/2 + 40); // Position below button area
  }
}

// --------------------
// UI Creation Functions
// --------------------

function createNameInput() {
  let inputX = width / 2 - 150;
  let inputY = height / 2 - 50;

  // Generate a default player name
  const randomNum = Math.floor(Math.random() * 999) + 1; // 1 to 999
  const defaultName = `Player${randomNum}`;

  nameInput = createInput(defaultName); // Set the default value here
  nameInput.position(inputX, inputY);
  nameInput.size(300, 30);
  nameInput.attribute('placeholder', 'Enter Player Name'); // Placeholder still useful if they clear it

  chooseTeamBlueButton = createButton('Join Blue Team');
  chooseTeamBlueButton.position(inputX, inputY + 50);
  chooseTeamBlueButton.size(145, 40);
  chooseTeamBlueButton.style('background-color', 'lightblue');
  chooseTeamBlueButton.mousePressed(() => setPlayerInfo('blue'));

  chooseTeamGreenButton = createButton('Join Green Team');
  chooseTeamGreenButton.position(inputX + 155, inputY + 50);
  chooseTeamGreenButton.size(145, 40);
  chooseTeamGreenButton.style('background-color', 'lightgreen');
  chooseTeamGreenButton.mousePressed(() => setPlayerInfo('green'));
}

function setPlayerInfo(team) {
  const playerName = nameInput.value().trim();
  if (playerName.length > 0) {
    me.playerDisplayName = playerName;
    me.team = team;
    me.isReady = true;
    nameInput.hide();
    chooseTeamBlueButton.hide();
    chooseTeamGreenButton.hide();
  } else {
    alert("Please enter a player name.");
  }
}

function createStartGameButton() {
  startGameButton = createButton('Start Game');
  // Reposition to the middle of the screen
  let buttonWidth = 180;
  let buttonHeight = 50;
  startGameButton.position(width / 2 - buttonWidth / 2, height / 2 - buttonHeight / 2); 
  startGameButton.size(buttonWidth, buttonHeight); 
  startGameButton.style('font-size', '20px'); // Make text larger
  startGameButton.mousePressed(() => {
    if (partyIsHost()) {
      shared.gameState = "IN-GAME";
       // Ensure button is hidden immediately after click 
       startGameButton.hide();
    }
  });
  startGameButton.hide(); // Initially hidden
}

function createNewGameButton() {
    newGameButton = createButton('Start New Game');
    // Position below the centered win message
    let buttonWidth = 180;
    let buttonHeight = 40;
    newGameButton.position(width / 2 - buttonWidth / 2, height / 2 + 20); // Positioned below center text
    newGameButton.size(buttonWidth, buttonHeight);
    newGameButton.mousePressed(() => {
        if (partyIsHost()) {
            // Instead of directly setting gameState, set the resetFlag
            // The host logic in handleHostDuties will see this and reset everything
            shared.resetFlag = true;
            // The host also needs to reset its own state immediately
            resetClientState();
            me.lastProcessedResetFlag = true; // Mark host as processed reset
            newGameButton.hide(); // Hide button after clicking
        }
    });
    newGameButton.hide(); // Initially hidden
}

// --------------------
// Character List Logic
// --------------------

function initializeCharacterList() {
    characterList = [];
    CHARACTER_DEFINITIONS.forEach(def => {
        for (let i = 0; i < def.count; i++) {
            characterList.push({
                ...def,
                instanceId: `${def.id}_${i}`,
                takenByPlayerName: null,
                takenByPlayerId: null,
                isPermanentlyLost: false
            });
        }
    });
}

function drawCharacterList() {
    const listX = 10;
    let listY = 80;
    const itemHeight = 25;
    const itemWidth = 220;

    fill(200);
    textSize(14);
    textAlign(LEFT, TOP);

    //let allPlayers = [me, ...guests];
    let myTeamPlayers = activeSpacecrafts.filter(p => p.team === me.team && p.hasCharacter);
    let takenInstanceIds = new Set(myTeamPlayers.map(p => p.characterInstanceId));
    let takenMap = new Map();
    myTeamPlayers.forEach(p => takenMap.set(p.characterInstanceId, p.playerName));

    characterList.forEach(item => {
        if (!item.isPermanentlyLost) {
            if (takenInstanceIds.has(item.instanceId)) {
                item.takenByPlayerName = takenMap.get(item.instanceId) || 'Taken';
                item.takenByPlayerId = myTeamPlayers.find(p => p.characterInstanceId === item.instanceId)?.id || null;
            } else {
                item.takenByPlayerName = null;
                item.takenByPlayerId = null;
            }
        }
    });

    let canSelectAnyAvailable = (me.status === 'needsCharacter' || (shared.gameState === 'GAME-SETUP' && me.isReady && !me.hasCharacter));
    let myTeamFlagChosen = activeSpacecrafts.some(p => p.team === me.team && p.characterId === 'F' && p.hasCharacter);

    const drawableCharacters = characterList.filter(item => !item.isPermanentlyLost);

    drawableCharacters.forEach((item, index) => {
        let displayY = listY + index * itemHeight;
        let isAvailable = !item.takenByPlayerName;
        let canSelectItem = false;

        if (canSelectAnyAvailable && isAvailable) {
            if (shared.gameState === 'GAME-SETUP') {
                if (item.isFlag) {
                    canSelectItem = !myTeamFlagChosen;
                } else if (!item.immovable) {
                    canSelectItem = myTeamFlagChosen;
                }
            } else if (shared.gameState === 'IN-GAME' && me.status === 'needsCharacter') {
                canSelectItem = !item.immovable;
            }
        }

        if (mouseX > listX && mouseX < listX + itemWidth && mouseY > displayY && mouseY < displayY + itemHeight) {
            if (canSelectItem) {
                fill(0, 150, 200, 150);
                noStroke();
                rect(listX, displayY, itemWidth, itemHeight);
            } else if (isAvailable) {
                 fill(100, 100, 100, 100);
                 noStroke();
                 rect(listX, displayY, itemWidth, itemHeight);
            }
        }

        if (!isAvailable) fill(100);
        else if (canSelectItem) fill(255);
        else fill(150);

        let displayText = `(${item.id}) ${item.name}`;
        if (!isAvailable) displayText += ` - ${item.takenByPlayerName}`;

        textAlign(LEFT, CENTER);
        text(displayText, listX + 5, displayY + itemHeight / 2);
    });

     textAlign(LEFT, TOP);
}


function mousePresse2() {
    if (me.status === 'inBattle' && me.battleOutcome.result !== 'pending') {
        console.log(`Player ${me.playerName} acknowledged battle outcome: ${me.battleOutcome.result}`);
        let outcome = me.battleOutcome.result;

        me.inBattleWith = null;
        me.battleOutcome = { result: 'pending', opponentInfo: null };

        if (outcome === 'win' || outcome === 'opponent_loses') {
            me.status = 'available';
            me.hasBattled = true;
            me.isRevealed = true;
            message = "Battle won! Continue playing.";
             setTimeout(() => { message = ""; }, 2000);
        } else if (outcome === 'loss' || outcome === 'draw') {
            handlePlayerLoss();
             message = "Battle lost. Choose a new unit.";
             setTimeout(() => { message = ""; }, 2000);
        }
        return;
    }

    if (me.isReady && (me.status === 'needsCharacter' || (shared.gameState === 'GAME-SETUP' && !me.hasCharacter))) {
        const listX = 10;
        let listY = 80;
        const itemHeight = 25;
        const itemWidth = 220;

        //let allPlayers = [me, ...guests];
        let myTeamFlagChosen = activeSpacecrafts.some(p => p.team === me.team && p.characterId === 'F' && p.hasCharacter);

        const selectableCharacters = characterList.filter(item => !item.isPermanentlyLost);

        for (let index = 0; index < selectableCharacters.length; index++) {
            const item = selectableCharacters[index];
            let displayY = listY + index * itemHeight;
            let isAvailable = !item.takenByPlayerName;
            let canSelectItem = false;

            if (isAvailable) {
                 if (shared.gameState === 'GAME-SETUP') {
                    if (item.isFlag) {
                        canSelectItem = !myTeamFlagChosen;
                    } else if (!item.immovable) {
                        canSelectItem = myTeamFlagChosen;
                    }
                 } else if (shared.gameState === 'IN-GAME' && me.status === 'needsCharacter') {
                     canSelectItem = !item.immovable;
                 }
            }

            if (canSelectItem && mouseX > listX && mouseX < listX + itemWidth && mouseY > displayY && mouseY < displayY + itemHeight) {
                me.characterId = item.id;
                me.characterRank = item.rank;
                me.characterName = item.name;
                me.characterInstanceId = item.instanceId;
                me.hasCharacter = true;
                me.isRevealed = false;
                me.hasBattled = false;
                me.status = "available";

                if (me.x < GAME_AREA_X || me.y < GAME_AREA_Y) {
                     const startZonePadding = me.size;
                     const startZoneWidth = GAME_AREA_WIDTH / 2 - startZonePadding * 2;
                     const startZoneHeight = GAME_AREA_HEIGHT - startZonePadding * 2;
                     const startZoneY = GAME_AREA_Y + startZonePadding;
                     let startZoneX = (me.team === 'blue')
                         ? GAME_AREA_X + startZonePadding
                         : GAME_AREA_X + GAME_AREA_WIDTH / 2 + startZonePadding;

                     me.x = startZoneX + Math.random() * startZoneWidth;
                     me.y = startZoneY + Math.random() * startZoneHeight;
                     me.x = constrain(me.x, GAME_AREA_X + me.size/2, GAME_AREA_RIGHT - me.size/2);
                     me.y = constrain(me.y, GAME_AREA_Y + me.size/2, GAME_AREA_BOTTOM - me.size/2);
                }

                console.log(`Selected: ${me.characterName} (${me.characterInstanceId})`);
                 break;
            }
        }
    }
}


// --------------------
// Spacecraft Drawing
// --------------------

function drawSpacecraft(playerData) {
    if (!playerData || !playerData.hasCharacter || playerData.status === 'lost' || playerData.x < -playerData.size || playerData.y < -playerData.size) {
       return;
    }
     let drawX = constrain(playerData.x, GAME_AREA_X + playerData.size / 2, GAME_AREA_RIGHT - playerData.size / 2);
     let drawY = constrain(playerData.y, GAME_AREA_Y + playerData.size / 2, GAME_AREA_BOTTOM - playerData.size / 2);


    let col = (playerData.team === 'blue') ? color(0, 150, 255) : color(0, 200, 100);
    if (!playerData.team) col = color(150);

    if (playerData.id === me.id) {
        stroke(255, 255, 0);
        strokeWeight(2);
    } else if (playerData.hasBattled) {
        stroke(255);
        strokeWeight(3);
    } else {
         noStroke();
    }

    fill(col);
    ellipse(drawX, drawY, playerData.size, playerData.size);
    noStroke();

    const shouldRevealRank = playerData.isRevealed || playerData.id === me.id || playerData.status === 'inBattle' || shared.gameState === 'GAME-FINISHED';
    if (shouldRevealRank && playerData.characterId) {
        let brightness = (red(col) * 299 + green(col) * 587 + blue(col) * 114) / 1000;
        fill(brightness > 125 ? 0 : 255);
        textSize(playerData.size * 0.45);
        textAlign(CENTER, CENTER);
        text(playerData.characterId, drawX, drawY + 1);
    }

    fill(200);
    textSize(10);
    textAlign(CENTER, BOTTOM);
    text(playerData.playerName || '?', drawX, drawY + playerData.size / 2 + 12);
}

// --------------------
// Movement and Collision
// --------------------

function handleMovement() {
    if (!me.hasCharacter || me.status !== 'available' || shared.coreCommandLost) return;

    const myDef = CHARACTER_DEFINITIONS.find(c => c.id === me.characterId);
    if (myDef && myDef.immovable && !myDef.isFlag) return;

    let dx = 0;
    let dy = 0;
    let speed = SPACECRAFT_SPEED;

    if (keyIsDown(LEFT_ARROW) || keyIsDown(65)) dx -= speed;
    if (keyIsDown(RIGHT_ARROW) || keyIsDown(68)) dx += speed;
    if (keyIsDown(UP_ARROW) || keyIsDown(87)) dy -= speed;
    if (keyIsDown(DOWN_ARROW) || keyIsDown(83)) dy += speed;

    if (dx === 0 && dy === 0) return;

    let targetX = me.x + dx;
    let targetY = me.y + dy;

    let canMove = true;
   //let allPlayers = [me, ...guests];
    //for (const other of guests) {
    for (const other of activeSpacecrafts) {
        if (other && other.hasCharacter && other.status !== 'lost' && other.id !== me.id) {
            let d = dist(targetX, targetY, other.x, other.y);
            if (d < (me.size / 2 + other.size / 2) * 0.90) {
                canMove = false;
                break;
            }
        }
    }

     if (!canMove) {
         let canMoveX = true;
         let targetXOnly = me.x + dx;
         targetXOnly = constrain(targetXOnly, GAME_AREA_X + me.size / 2, GAME_AREA_RIGHT - me.size / 2);
//         for (const other of guests) {
          for (const other of activeSpacecrafts) {
              if (other && other.hasCharacter && other.status !== 'lost' && other.id !== me.id) {
                  let d = dist(targetXOnly, me.y, other.x, other.y);
                  if (d < (me.size / 2 + other.size / 2) * 0.90) {
                      canMoveX = false;
                      break;
                  }
              }
          }
          if (canMoveX) {
              me.x = targetXOnly;
              return;
          }

          let canMoveY = true;
          let targetYOnly = me.y + dy;
          targetYOnly = constrain(targetYOnly, GAME_AREA_Y + me.size / 2, GAME_AREA_BOTTOM - me.size / 2);
//          for (const other of guests) {
            for (const other of activeSpacecrafts) {
              if (other && other.hasCharacter && other.status !== 'lost' && other.id !== me.id) {
                  let d = dist(me.x, targetYOnly, other.x, other.y);
                  if (d < (me.size / 2 + other.size / 2) * 0.90) {
                      canMoveY = false;
                      break;
                  }
              }
          }
           if (canMoveY) {
              me.y = targetYOnly;
              return;
          }
     } else {
         me.x = targetX;
         me.y = targetY;
     }
}

function handleCollisionsAndBattles() {
    if (me.status === 'inBattle' || !me.hasCharacter || me.status === 'lost' ) return;

    if (me.status === 'available') {
        const myDef = CHARACTER_DEFINITIONS.find(c => c.id === me.characterId);
        if (myDef && !myDef.isFlag) {
//            for (const guest of guests) {
                for (const guest of activeSpacecrafts) {
                 if (guest && guest.hasCharacter && guest.team !== me.team && guest.characterId === 'F' && guest.status !== 'lost') {
                      let d = dist(me.x, me.y, guest.x, guest.y);
                       if (d < (me.size / 2 + guest.size / 2) * 0.95) {
                           console.log(`Player ${me.playerName} touching enemy flag! Triggering win.`);
                           me.status = "wonGameTrigger";
                           me.isRevealed = true;
                           return;
                       }
                 }
             }
        }
    }

    if (me.status === 'available') {
         const myDef = CHARACTER_DEFINITIONS.find(c => c.id === me.characterId);
         if (myDef && myDef.immovable) return;

//        for (const guest of guests) {
            for (const guest of activeSpacecrafts) {
                if (guest && guest.hasCharacter && guest.team !== me.team && guest.status !== 'lost') {
                const guestDef = CHARACTER_DEFINITIONS.find(c => c.id === guest.characterId);
                const isImmovableTarget = guestDef && guestDef.immovable;

                 const canInitiateBattle = (guest.status === 'available' || isImmovableTarget) && guest.inBattleWith === null;

                if (canInitiateBattle) {
                    let d = dist(me.x, me.y, guest.x, guest.y);
                    if (d < (me.size / 2 + guest.size / 2) * 0.95) {
                        console.log(`Collision detected: ${me.playerName}(${me.characterId}) vs ${guest.playerName}(${guest.characterId})`);
                        startBattle(guest);
                        return;
                    }
                }
            }
        }
    }
}


function startBattle(opponent) {
    if (me.status !== 'available') {
         console.warn(`Attempted startBattle when 'me' status was ${me.status}. Aborting.`); return;
    }
    const opponentIsImmovableTarget = opponent.characterId === 'A' || opponent.characterId === 'F';
    if (opponent.inBattleWith !== null) {
         console.warn(`Attempted startBattle when opponent ${opponent.playerName} is already in battle with ${opponent.inBattleWith}. Aborting.`); return;
    }
     if (opponent.status !== 'available' && !opponentIsImmovableTarget) {
          console.warn(`Attempted startBattle when opponent ${opponent.playerName} status was ${opponent.status} (and not immovable). Aborting.`); return;
     }

    console.log(`Battle started: ${me.playerName}(${me.characterId}) initiates vs ${opponent.playerName}(${opponent.characterId})`);

    let myRank = me.characterRank;
    let opRank = opponent.characterRank;
    let myDef = CHARACTER_DEFINITIONS.find(c => c.id === me.characterId);
    let opDef = CHARACTER_DEFINITIONS.find(c => c.id === opponent.characterId);

    if (!myDef || !opDef) {
        console.error("Missing character definition during battle initiation!", me.characterId, opponent.characterId);
        me.battleOutcome = { result: 'loss', opponentInfo: { id: opponent.id, name: opponent.characterName, rank: opponent.characterRank } };
        me.status = 'inBattle';
        me.inBattleWith = opponent.id;
        me.isRevealed = true;
        return;
    }

    let calculatedOutcome = "pending";

    if (opDef.isFlag) { calculatedOutcome = "win"; }
    else if (opDef.isBomb) { calculatedOutcome = myDef.isMiner ? "win" : "loss"; }
    else if (myDef.isSpy && opDef.rank === 10) { calculatedOutcome = "win"; }
    else if (opDef.isSpy && myDef.rank === 10) { calculatedOutcome = "loss"; }
    else if (myRank === opRank) { calculatedOutcome = "draw"; }
    else if (myRank > opRank) { calculatedOutcome = "win"; }
    else { calculatedOutcome = "loss"; }

    console.log(`Battle Result Calculated: ${calculatedOutcome} for ${me.playerName}`);

    me.status = 'inBattle';
    me.inBattleWith = opponent.id;
    me.isRevealed = true;
    me.battleOutcome = {
        result: calculatedOutcome,
        opponentInfo: {
            id: opponent.id,
            name: opponent.characterName,
            rank: opponent.characterRank,
            instanceId: opponent.characterInstanceId
        }
    };

    // Check if Core Command is involved in the battle
    if (myDef.isFlag || opDef.isFlag) {
        if (calculatedOutcome === 'loss' || calculatedOutcome === 'draw') {
            shared.coreCommandLost = true;
            shared.gameState = "GAME-FINISHED";
            shared.winningTeam = "draw";
        }
    }
}

// =============================================================================


// Helper function to handle losing a piece
function handlePlayerLoss() {
    console.log(`Player ${me.playerName} lost ${me.characterName} (${me.characterInstanceId})`);
    let lostInstanceId = me.characterInstanceId; // Keep track of which character was lost

    // Reset player state
    me.hasCharacter = false;
    me.characterId = null;
    me.characterRank = null;
    me.characterName = null;
    me.characterInstanceId = null;
    me.isRevealed = false;
    me.hasBattled = false; // Reset battle flag too
    me.x = -1000;
    me.y = -1000;
    me.inBattleWith = null;
    me.battleOutcome = { result: 'pending', opponentInfo: null };
    me.status = 'lost'; // Set status immediately

    // Find the item in the characterList and mark it as permanently lost for this game
    const lostItem = characterList.find(item => item.instanceId === lostInstanceId);
    if (lostItem) {
        console.log(`Marking ${lostInstanceId} as permanently lost.`);
        lostItem.isPermanentlyLost = true; // Mark as lost
        // No longer need to clear takenByPlayerName/Id, as it won't be shown or selectable
    } else {
        console.warn(`Could not find lost character ${lostInstanceId} in characterList`);
    }

    // Set timeout to allow choosing a new character later
     setTimeout(() => {
          // Check game state and that core command wasn't lost (which ends the game phase)
          if (me.status === 'lost' && shared.gameState === 'IN-GAME' && !shared.coreCommandLost) { 
            me.status = 'needsCharacter';
            console.log(`${me.playerName} now needs a character.`);
         }
     }, 1500);
}


// --------------------
// Host Specific Logic
// --------------------

function handleHostDuties() {
    if (!partyIsHost()) return;

    if (shared.gameState === "IN-GAME") {
        //let allPlayers = [me, ...guests];
        let blueFlagExists = false;
        let greenFlagExists = false;
        let winTriggerPlayer = null;

        activeSpacecrafts.forEach(p => {
             if (p.hasCharacter && p.characterId === 'F' && p.status !== 'lost') {
                 if (p.team === 'blue') blueFlagExists = true;
                 if (p.team === 'green') greenFlagExists = true;
             }
             // Check for win trigger AFTER checking flag status
             if (p.status === 'wonGameTrigger') {
                 // Ensure the opponent's flag still exists for this win to be valid
                 if ((p.team === 'blue' && greenFlagExists) || (p.team === 'green' && blueFlagExists)) {
                    winTriggerPlayer = p;
                 } else {
                    // If opponent flag is already gone, this trigger is invalid (race condition)
                    console.warn(`HOST: Invalid win trigger by ${p.playerName} - opponent flag already captured.`);
                    // Reset their status so they don't keep triggering
                    p.status = 'available';
                    p.isRevealed = false; // Optionally hide them again
                 }
             }
        });

         let newGameState = null;
         let newWinningTeam = null;
         shared.winningPlayerName = null; // Reset initially each check

         if (winTriggerPlayer) {
             if (winTriggerPlayer.team === 'blue') { // Already validated greenFlagExists above
                 newGameState = "GAME-FINISHED";
                 newWinningTeam = "blue";
                 shared.winningPlayerName = winTriggerPlayer.playerName; // Store winner name
                 console.log(`HOST: Win confirmed by ${winTriggerPlayer.playerName} (Blue).`);
             } else if (winTriggerPlayer.team === 'green') { // Already validated blueFlagExists above
                 newGameState = "GAME-FINISHED";
                 newWinningTeam = "green";
                 shared.winningPlayerName = winTriggerPlayer.playerName; // Store winner name
                 console.log(`HOST: Win confirmed by ${winTriggerPlayer.playerName} (Green).`);
             }
             // No else needed here because winTriggerPlayer is only set if valid
         }

         // Check for wins by flag elimination AFTER checking for win trigger
         if (!newGameState) {
             if (!blueFlagExists && !greenFlagExists) {
                 newGameState = "GAME-FINISHED"; newWinningTeam = "draw";
                 console.log("HOST: Both flags gone. Draw.");
             } else if (!blueFlagExists) {
                 newGameState = "GAME-FINISHED"; newWinningTeam = "green";
                 console.log("HOST: Blue flag gone. Green wins.");
             } else if (!greenFlagExists) {
                 newGameState = "GAME-FINISHED"; newWinningTeam = "blue";
                 console.log("HOST: Green flag gone. Blue wins.");
             }
         }


        // Update shared state if changed
        if (newGameState) {
            // Add detailed log before updating shared state
            console.log(`HOST: Setting game state to ${newGameState}, Winning Team: ${newWinningTeam}, Winning Player: ${shared.winningPlayerName || 'N/A'}`); 
            shared.gameState = newGameState;
            shared.winningTeam = newWinningTeam; // Will be 'blue', 'green', or 'draw'
        }
    } else if (shared.gameState === "GAME-SETUP") {
        // ... existing GAME-SETUP host logic ...
         // Check if all ready players have selected a character
//        let allReadyPlayers = [me, ...guests].filter(p => p.isReady);
        let allReadyPlayers = activeSpacecrafts.filter(p => p.isReady);
        let allHaveCharacters = allReadyPlayers.length > 0 && allReadyPlayers.every(p => p.hasCharacter);
        let blueFlagSelected = allReadyPlayers.some(p => p.team === 'blue' && p.characterId === 'F');
        let greenFlagSelected = allReadyPlayers.some(p => p.team === 'green' && p.characterId === 'F');

        if (allHaveCharacters && blueFlagSelected && greenFlagSelected && startGameButton) {
            startGameButton.show();
        } else if (startGameButton) {
            startGameButton.hide();
        }
    } else if (shared.gameState === "GAME-FINISHED") {
         // If the reset flag is set by the 'New Game' button, reset necessary shared state
         if (shared.resetFlag) {
             shared.gameState = "GAME-SETUP";
             shared.winningTeam = null;
             shared.winningPlayerName = null; // Reset winner name here too
             shared.coreCommandLost = false; // Reset core command status
             initializeCharacterList(); // Reset character list availability
             // Resetting player states is handled client-side via resetClientState() triggered by resetFlag check
             // Set flag back to false after a short delay
              // Delay setting resetFlag back to false
             setTimeout(() => {
                shared.resetFlag = false;
             }, 500);
         }
    }
}

// --------------------
// Reset Logic - Updated to skip name/team entry if already set
// --------------------
function resetClientState() {
    console.log(`Client Resetting State for ${me.playerName || 'New Player'}...`);
    // Save name AND team before resetting
    let savedName = me.playerName;
    let savedTeam = me.team;

    // Reset most 'me' properties
    Object.assign(me, {
        characterId: null,
        characterRank: null,
        characterName: null,
        characterInstanceId: null,
        x: -1000,
        y: -1000,
        isReady: true,
        hasCharacter: false,
        isRevealed: false,
        hasBattled: false,
        status: "available",
        inBattleWith: null,
        battleOutcome: { result: 'pending', opponentInfo: null },
        lastProcessedResetFlag: false,
        playerName: savedName,
        team: savedTeam
    });

    // Reset shared state
    shared.coreCommandLost = false;

    message = ""; // Clear any lingering messages

    // Reset UI elements
    // Ensure buttons/inputs are created if they don't exist
    if (!nameInput || !nameInput.elt) createNameInput();
    // We create nameInput which also creates team buttons, so check existence before creating again
    if (!chooseTeamBlueButton || !chooseTeamBlueButton.elt) createNameInput(); // Re-running createNameInput is safe
    if (!chooseTeamGreenButton || !chooseTeamGreenButton.elt) createNameInput();

    // Always hide the name/team selection UI since we're keeping the values
    nameInput.hide();
    chooseTeamBlueButton.hide();
    chooseTeamGreenButton.hide();

    // Ensure game state buttons are hidden initially after reset
    if (startGameButton && startGameButton.elt) startGameButton.hide();
    if (newGameButton && newGameButton.elt) newGameButton.hide();

    // Reset character list availability
    initializeCharacterList();

    // Force a refresh of the character list state
    //let allPlayers = [me, ...guests];
    let myTeamPlayers = activeSpacecrafts.filter(p => p.team === me.team && p.hasCharacter);
    let takenInstanceIds = new Set(myTeamPlayers.map(p => p.characterInstanceId));
    let takenMap = new Map();
    myTeamPlayers.forEach(p => takenMap.set(p.characterInstanceId, p.playerName));

    characterList.forEach(item => {
        if (takenInstanceIds.has(item.instanceId)) {
            item.takenByPlayerName = takenMap.get(item.instanceId) || 'Taken';
            item.takenByPlayerId = myTeamPlayers.find(p => p.characterInstanceId === item.instanceId)?.id || null;
        } else {
            item.takenByPlayerName = null;
            item.takenByPlayerId = null;
        }
    });

    console.log("Client state reset complete.");
}
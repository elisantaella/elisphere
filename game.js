// game.js - Main game implementation for Happiness Toolkit

// Main game class
class HappinessToolkitGame {
  // Add to the constructor in game.js

 
constructor() {
  this.strategyInfoShown = false;
  this.state = GameState.MAIN_MENU;
  this.scene = null;
  this.camera = null;
  this.renderer = null;
  this.controls = null;
  this.player = {
    height: 1.8,
    speed: 0.1,
    turnSpeed: 0.05,
    canMove: false
  };
  this.moveForward = false;
  this.moveBackward = false;
  this.moveLeft = false;
  this.moveRight = false;
  this.currentStrategy = null;
  this.currentDialogueIndex = 0;
  this.assetsLoaded = false;
  this.interactiveObjects = [];
  this.clock = new THREE.Clock();
  
  // Add pause related properties
  this.isPaused = false;
  this.pauseScreen = null;
  this.musicVolumeBeforePause = 0.5;
  
  // Add flag to track if player has met the guide
  this.hasMetGuide = false;
  
  // Create UI
  this.ui = new GameUI(this);
  
  // Initialize the game
  this.init();
}

init() {
  // Initialize the scene
  this.scene = new THREE.Scene();
  this.scene.background = new THREE.Color(0x87ceeb); // Sky blue background
  
  // Set up the camera
  this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
  this.camera.position.y = this.player.height;

  // Set up the renderer
  this.renderer = new THREE.WebGLRenderer({ antialias: true });
  this.renderer.setSize(window.innerWidth, window.innerHeight);
  this.renderer.shadowMap.enabled = true;
  document.body.appendChild(this.renderer.domElement);
 // Try to lock on canvas click
  if (this.state !== GameState.MAIN_MENU && !this.controls.isLocked) {
    console.log("Canvas clicked, requesting pointer lock");
    this.controls.lock();
  }
  // Set up controls
  this.controls = new THREE.PointerLockControls(this.camera, document.body);
  
  // Initialize environment builder
  this.environmentBuilder = new EnvironmentBuilder(this);

  // Event listeners
  window.addEventListener('resize', this.onWindowResize.bind(this));
  document.addEventListener('keydown', this.onKeyDown.bind(this));
  document.addEventListener('keyup', this.onKeyUp.bind(this));

  // Create UI before dialogue system
  this.ui = new GameUI(this);
  
  // Now initialize dialogue system after UI is created
  if (typeof DialogueSystem !== 'undefined') {
    this.dialogueSystem = new DialogueSystem(this);
    console.log("DialogueSystem initialized successfully");
  } else {
    console.error("DialogueSystem is not defined! Make sure dialogue.js is loaded before game.js");
  }

  // Use the loaded assets
  this.setupAssetsAndLoad();
}

  async setupAssetsAndLoad() {
    try {
      // Store references to the loaded models for easy access
      if (window.assetLoader) {
        this.assets = await window.assetLoader.loadAllAssets();
        this.assetsLoaded = true;
      } else {
        console.warn("Asset loader not available. Using fallback assets.");
      }
      
      // Start the game loop
      this.animate();

      // Load the main menu
      this.loadMainMenu();
      
      console.log("Game initialized with assets!");
    } catch (error) {
      console.error("Error setting up game assets:", error);
      // Continue with fallback assets
      this.animate();
      this.loadMainMenu();
    }
  }

// Modify the startGame method to prompt for name:
// In game.js, update the startGame method:
async startGame() {
  console.log("startGame called");
  
  this.ui.hideMenu();
  
  console.log("About to lock controls");
  
  // Try to lock pointer controls, but add error handling
  try {
    this.controls.lock();
  } catch (error) {
    console.error("Error locking controls:", error);
  }
  
  // Explicitly set player movement flags
  this.player.canMove = true;
  
  console.log("Setting state to LOBBY");
  // Change state to lobby
  this.state = GameState.LOBBY;
  console.log("About to load lobby");
  this.loadLobby();
  console.log("Lobby loaded");
  
  // Show controls when gameplay starts
  const gameplayControls = document.getElementById('gameplay-controls');
  if (gameplayControls) {
    gameplayControls.style.display = 'block';
    
    // Hide controls help after 10 seconds
    setTimeout(() => {
      gameplayControls.style.animation = 'fadeIn 0.5s reverse forwards';
      setTimeout(() => {
        gameplayControls.style.display = 'none';
      }, 500);
    }, 10000);
  }
  
  // Add pointer lock event listeners - use proper binding
  this.controls.addEventListener('lock', this.onPointerLock.bind(this));
  this.controls.addEventListener('unlock', this.onPointerUnlock.bind(this));
  
  // Switch to gameplay music
  if (window.musicLoader) {
    window.musicLoader.handleGameStateChange(GameState.LOBBY);
  }
  
  // Double-check controls are locked with a slight delay
  setTimeout(() => {
    if (!this.controls.isLocked) {
      console.log("Controls not locked after starting, trying again...");
      try {
        this.controls.lock();
      } catch (e) {
        console.error("Second attempt to lock controls failed:", e);
      }
    }
  }, 500);
}

// Add explicit handler methods for pointer events
onPointerLock() {
  console.log("Pointer locked successfully");
  if (!this.isPaused) {
    this.player.canMove = true;
    if (this.ui && this.ui.dialogueBox) {
      this.ui.hideDialogue();
    }
  }
}

onPointerUnlock() {
  console.log("Pointer unlocked");
  // Only disable movement if not paused
  if (!this.isPaused) {
    this.player.canMove = false;
    
    // Only show menu if we're not paused and not in dialogue
    if (this.state !== GameState.MAIN_MENU && this.ui && this.ui.dialogueBox && this.ui.dialogueBox.style.display !== 'block') {
      this.pauseGame();
    }
  }
}
// Create a better controls help box that appears only during gameplay
createGameplayControls() {
  // Remove any existing controls-help element
  const existingControlsHelp = document.getElementById('controls-help');
  if (existingControlsHelp) {
    existingControlsHelp.parentNode.removeChild(existingControlsHelp);
  }
  
  // Create a new, styled controls box
  const controlsHelp = document.createElement('div');
  controlsHelp.id = 'gameplay-controls';
  controlsHelp.style.position = 'fixed';
  controlsHelp.style.bottom = '20px';
  controlsHelp.style.left = '20px';
  controlsHelp.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
  controlsHelp.style.color = 'white';
  controlsHelp.style.padding = '15px';
  controlsHelp.style.borderRadius = '5px';
  controlsHelp.style.fontFamily = 'Minecraft, monospace';
  controlsHelp.style.fontSize = '14px';
  controlsHelp.style.border = '2px solid rgba(255, 255, 255, 0.2)';
  controlsHelp.style.boxShadow = '0 0 10px rgba(0, 0, 0, 0.5)';
  controlsHelp.style.zIndex = '90';
  controlsHelp.style.display = 'none';
  controlsHelp.style.animation = 'fadeIn 0.5s forwards';
  
  // Add styled controls content
  controlsHelp.innerHTML = `
    <h3 style="margin-top: 0; color: #4CAF50; margin-bottom: 10px;">Controls:</h3>
    <p style="margin: 5px 0;"><span style="color: #4CAF50; font-weight: bold;">WASD</span> - Move</p>
    <p style="margin: 5px 0;"><span style="color: #4CAF50; font-weight: bold;">Mouse</span> - Look around</p>
    <p style="margin: 5px 0;"><span style="color: #4CAF50; font-weight: bold;">E</span> - Interact</p>
    <p style="margin: 5px 0;"><span style="color: #4CAF50; font-weight: bold;">ESC</span> - Pause</p>
    <p style="margin: 5px 0;"><span style="color: #4CAF50; font-weight: bold;">Enter</span> - Continue dialogue</p>
  `;
  
  document.body.appendChild(controlsHelp);
  return controlsHelp;
}

  // Update the loadMainMenu method to hide any controls
loadMainMenu() {
    // Check if we're already at the main menu to avoid duplication
  if (this.state === GameState.MAIN_MENU && this.ui.menu.style.display === 'flex') {
    console.log("Main menu already loaded, skipping duplication");
    return;
  }
  // Clear any existing scene objects
  while(this.scene.children.length > 0) {
    this.scene.remove(this.scene.children[0]);
  }
  // Switch to main menu music
if (window.musicLoader) {
  window.musicLoader.handleGameStateChange(GameState.MAIN_MENU);
}
  // Position camera to better view the symbols
  this.camera.position.set(0, 5, 20);
  this.camera.lookAt(0, 0, 0);
  
  // Hide any gameplay controls that might be visible
  const gameplayControls = document.getElementById('gameplay-controls');
  if (gameplayControls) {
    gameplayControls.style.display = 'none';
  }

  // Also hide the original controls-help if it exists
  const controlsHelp = document.getElementById('controls-help');
  if (controlsHelp) {
    controlsHelp.style.display = 'none';
  }
  
  // Set the game state
  this.state = GameState.MAIN_MENU;
  
  // Add lighting
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
  this.scene.add(ambientLight);

  const directionalLight = new THREE.DirectionalLight(0xffffff, 1.2);
  directionalLight.position.set(10, 10, 10);
  this.scene.add(directionalLight);
  
  // Add some point lights for better illumination of the symbols
  const colors = [0xff0000, 0x00ff00, 0x0000ff, 0xffff00, 0xff00ff];
  for (let i = 0; i < colors.length; i++) {
    const pointLight = new THREE.PointLight(colors[i], 0.6, 50);
    pointLight.position.set(
      Math.cos(i / colors.length * Math.PI * 2) * 20,
      Math.sin(i / colors.length * Math.PI * 2) * 5 + 5,
      Math.sin(i / colors.length * Math.PI * 2) * 20
    );
    this.scene.add(pointLight);
  }

  // Create a background with floating happiness symbols only
  this.createBackgroundSymbols();
  
  // Show the 2D menu overlay
  this.ui.showMenu();
}

  createBackgroundSymbols() {
    const symbols = [];
    // Create heart
    const heartShape = new THREE.Shape();
    heartShape.moveTo(0, 0);
    heartShape.bezierCurveTo(0, -0.5, -1, -1, -2, 0);
    heartShape.bezierCurveTo(-3, 1, -3, 2, -2, 3);
    heartShape.bezierCurveTo(-1, 4, 0, 5, 0, 5);
    heartShape.bezierCurveTo(0, 5, 1, 4, 2, 3);
    heartShape.bezierCurveTo(3, 2, 3, 1, 2, 0);
    heartShape.bezierCurveTo(1, -1, 0, -0.5, 0, 0);

    const heartGeometry = new THREE.ExtrudeGeometry(heartShape, {
      depth: 0.5,
      bevelEnabled: true,
      bevelSegments: 2,
      steps: 2,
      bevelSize: 0.1,
      bevelThickness: 0.1
    });
    
    // Create star shape
    const starShape = new THREE.Shape();
    const starPoints = 5;
    const innerRadius = 0.4;
    const outerRadius = 1.0;
    
    // Start at the top point
    starShape.moveTo(0, -outerRadius);
    
    // Draw the star points
    for (let i = 0; i < starPoints * 2; i++) {
      const radius = i % 2 === 0 ? innerRadius : outerRadius;
      const angle = (Math.PI / starPoints) * i;
      starShape.lineTo(Math.sin(angle) * radius, -Math.cos(angle) * radius);
    }
    
    const starGeometry = new THREE.ExtrudeGeometry(starShape, {
      depth: 0.2,
      bevelEnabled: true,
      bevelSegments: 1,
      steps: 1,
      bevelSize: 0.1,
      bevelThickness: 0.1
    });

    // Create the symbols and add them to the scene - increased from 20 to 40
    for (let i = 0; i < 40; i++) {
      let geometry;
      let material;
      
      // Alternate between different symbols
      switch(i % 6) {  // Added more variety with 6 types
        case 0: // Heart
          geometry = heartGeometry;
          material = new THREE.MeshStandardMaterial({ 
            color: 0xff4444,
            emissive: 0xff0000,
            emissiveIntensity: 0.3
          });
          break;
        case 1: // Star
          geometry = starGeometry;
          material = new THREE.MeshStandardMaterial({ 
            color: 0xffff44,
            emissive: 0xffff00,
            emissiveIntensity: 0.3
          });
          break;
        case 2: // Sphere (Peace)
          geometry = new THREE.SphereGeometry(0.5, 32, 32);
          material = new THREE.MeshStandardMaterial({ 
            color: 0x44ff44,
            emissive: 0x00ff00,
            emissiveIntensity: 0.3
          });
          break;
        case 3: // Thought bubble (torus)
          geometry = new THREE.TorusGeometry(0.5, 0.2, 16, 32);
          material = new THREE.MeshStandardMaterial({ 
            color: 0x4444ff,
            emissive: 0x0000ff,
            emissiveIntensity: 0.3
          });
          break;
        case 4: // Smile (torus)
          geometry = new THREE.TorusGeometry(0.5, 0.1, 16, 32, Math.PI);
          material = new THREE.MeshStandardMaterial({ 
            color: 0xff44ff,
            emissive: 0xff00ff,
            emissiveIntensity: 0.3
          });
          break;
        case 5: // Diamond
          geometry = new THREE.OctahedronGeometry(0.6, 0);
          material = new THREE.MeshStandardMaterial({ 
            color: 0x00ffff,
            emissive: 0x00ffff,
            emissiveIntensity: 0.3,
            metalness: 0.8,
            roughness: 0.2
          });
          break;
      }
      
      const symbol = new THREE.Mesh(geometry, material);
      
      // Position randomly in a larger space
      symbol.position.x = (Math.random() - 0.5) * 60;
      symbol.position.y = (Math.random() - 0.5) * 30 + 10;
      symbol.position.z = (Math.random() - 0.5) * 60 - 20;
      
      // Random rotation
      symbol.rotation.x = Math.random() * Math.PI;
      symbol.rotation.y = Math.random() * Math.PI;
      symbol.rotation.z = Math.random() * Math.PI;
      
      this.scene.add(symbol);
      symbols.push({
        mesh: symbol,
        rotationSpeed: {
          x: (Math.random() - 0.5) * 0.02,
          y: (Math.random() - 0.5) * 0.02,
          z: (Math.random() - 0.5) * 0.02
        },
        moveSpeed: {
          x: (Math.random() - 0.5) * 0.05,  // Slightly faster movement
          y: (Math.random() - 0.5) * 0.03,
          z: (Math.random() - 0.5) * 0.05
        }
      });
    }

    this.backgroundSymbols = symbols;
  }

  // Update the loadLobby method to rotate player 180 degrees
loadLobby() {
  // Clear any existing scene objects and interactive objects
  while(this.scene.children.length > 0) {
    this.scene.remove(this.scene.children[0]);
  }
  // Ensure proper music is playing
if (window.musicLoader) {
  window.musicLoader.handleGameStateChange(GameState.GAMEPLAY);
}
  this.interactiveObjects = [];
  
  // Reset camera position and set it to face the OPPOSITE direction (180 degrees)
  this.camera.position.set(0, this.player.height, 5); // Changed from -5 to 5 to move to opposite side
  this.controls.getObject().position.set(5, this.player.height, -5);
  
  // Set initial rotation to face the pavilion and guide (but from the opposite side)
  this.camera.lookAt(0, this.player.height, 0);
  
  // Force the camera's rotation to update immediately
  this.camera.updateProjectionMatrix();
  
  // Add lighting
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
  this.scene.add(ambientLight);

  const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
  directionalLight.position.set(50, 50, 50);
  directionalLight.castShadow = true;
  this.scene.add(directionalLight);

  // Create the ground with texture if available
  const groundGeometry = new THREE.CircleGeometry(50, 32);
  let groundMaterial;
  
  if (this.assetsLoaded && this.assets.textures.ground) {
    groundMaterial = new THREE.MeshStandardMaterial({ 
      map: this.assets.textures.ground,
      roughness: 0.8 
    });
  } else {
    groundMaterial = new THREE.MeshStandardMaterial({ 
      color: 0x7cfc00,
      roughness: 0.8 
    });
  }
  
  const ground = new THREE.Mesh(groundGeometry, groundMaterial);
  ground.rotation.x = -Math.PI / 2;
  ground.receiveShadow = true;
  this.scene.add(ground);

  // Create a center pavilion
  this.createPavilion();

  // Create portals to each strategy area
  this.createStrategyPortals();

  // Add some trees and decorations
  this.addLobbyDecorations();

  // Create a skybox
  this.environmentBuilder.createSkybox();
  this.environmentBuilder.addClouds();
  
  // Add Mt. Rushmore in the distance if model is loaded
  if (this.assetsLoaded && this.assets.models.mtRushmore) {
    const rushmore = this.assets.models.mtRushmore.clone();
    
    // Position it in a more prominent location
    rushmore.position.set(-150, 80, -250);
    
    // Rotate to face the player
    rushmore.rotation.y = Math.PI / 5;
    
    // Add a spotlight to highlight Mt. Rushmore
    const spotlight = new THREE.SpotLight(0xffffff, 2);
    spotlight.position.set(-100, 150, -150);
    spotlight.target = rushmore;
    spotlight.angle = Math.PI / 6;
    spotlight.penumbra = 0.1;
    spotlight.decay = 1;
    spotlight.distance = 500;
    spotlight.castShadow = true;
    this.scene.add(spotlight);
    
    this.scene.add(rushmore);
    
    // Add a sign pointing to Mt. Rushmore
    if (this.assetsLoaded && this.assets.fonts.default) {
      const font = this.assets.fonts.default;
      const textGeometry = new THREE.TextGeometry('← Mt. Rushmore', {
        font: font,
        size: 1,
        height: 0.1,
        curveSegments: 12,
        bevelEnabled: true,
        bevelThickness: 0.03,
        bevelSize: 0.02,
        bevelOffset: 0,
        bevelSegments: 5
      });
      
      const textMaterial = new THREE.MeshStandardMaterial({ color: 0xFFFFFF });
      const textMesh = new THREE.Mesh(textGeometry, textMaterial);
      textMesh.position.set(-30, 10, -30);
      textMesh.rotation.y = Math.PI / 4;
      this.scene.add(textMesh);
    }
  }
}
// Method to create a character nameplate
createCharacterNameplate(name, characterMesh, color) {
  // Create a canvas for the nameplate
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');
  canvas.width = 256;
  canvas.height = 64;
  
  // Clear canvas
  context.clearRect(0, 0, canvas.width, canvas.height);
  
  // Set up text style
  context.font = "bold 32px Minecraft, monospace";
  context.textAlign = "center";
  context.textBaseline = "middle";
  
  // Convert color to hex string if needed
  let colorHex;
  if (typeof color === 'number') {
      colorHex = '#' + color.toString(16).padStart(6, '0');
  } else if (color instanceof THREE.Color) {
      colorHex = '#' + color.getHexString();
  } else {
      colorHex = color;
  }
  
  // Draw text outline (black border)
  context.strokeStyle = 'black';
  context.lineWidth = 4;
  context.strokeText(name, canvas.width / 2, canvas.height / 2);
  
  // Draw text fill with the character's color
  context.fillStyle = colorHex;
  context.fillText(name, canvas.width / 2, canvas.height / 2);
  
  // Create texture from canvas
  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  
  // Create a sprite material with the texture
  const material = new THREE.SpriteMaterial({
    map: texture,
    transparent: true
  });
  
  // Create the sprite
  const nameplate = new THREE.Sprite(material);
  
  // Position nameplate above character
  nameplate.position.set(
    characterMesh.position.x,
    characterMesh.position.y + 2.5, // Position above character's head
    characterMesh.position.z
  );
  
  // Scale the sprite to a reasonable size
  nameplate.scale.set(2, 0.5, 1);
  
  // Add to scene
  this.scene.add(nameplate);
  
  // Return the nameplate so we can update it later
  return nameplate;
}
createPavilion() {
  // Center platform
  const platformGeometry = new THREE.CylinderGeometry(10, 10, 0.5, 32);
  const platformMaterial = new THREE.MeshStandardMaterial({ color: 0xe0e0e0 });
  const platform = new THREE.Mesh(platformGeometry, platformMaterial);
  platform.position.y = 0.25;
  platform.receiveShadow = true;
  this.scene.add(platform);
  
  // Columns
  for (let i = 0; i < 8; i++) {
    const angle = (i / 8) * Math.PI * 2;
    const x = Math.cos(angle) * 8;
    const z = Math.sin(angle) * 8;
    
    const columnGeometry = new THREE.CylinderGeometry(0.5, 0.5, 4, 16);
    const columnMaterial = new THREE.MeshStandardMaterial({ color: 0xf5f5f5 });
    const column = new THREE.Mesh(columnGeometry, columnMaterial);
    column.position.set(x, 2, z);
    column.castShadow = true;
    column.receiveShadow = true;
    this.scene.add(column);
  }

  // Roof
  const roofGeometry = new THREE.ConeGeometry(11, 3, 32);
  const roofMaterial = new THREE.MeshStandardMaterial({ color: 0x8b4513 });
  const roof = new THREE.Mesh(roofGeometry, roofMaterial);
  roof.position.y = 5.5;
  roof.castShadow = true;
  this.scene.add(roof);

  // Welcome sign - position it higher and to the side to avoid overlap with guide
  if (this.assetsLoaded && this.assets.fonts.default) {
    const font = this.assets.fonts.default;
    const textGeometry = new THREE.TextGeometry('Welcome to Your\nHappiness Toolkit', {
      font: font,
      size: 0.5,
      height: 0.1,
      curveSegments: 12,
      bevelEnabled: true,
      bevelThickness: 0.03,
      bevelSize: 0.02,
      bevelOffset: 0,
      bevelSegments: 5
    });
    
    textGeometry.center();
    
    const textMaterial = new THREE.MeshStandardMaterial({ color: 0x333333 });
    const textMesh = new THREE.Mesh(textGeometry, textMaterial);
    
    // Position higher and to the side to avoid overlap with guide
    textMesh.position.set(3, 3, 0);
    textMesh.rotation.y = Math.PI;
    this.scene.add(textMesh);
  }

  // Add a central NPC - use custom character model if available
  let npc;
  if (this.assetsLoaded && this.assets.models.character) {
    npc = this.assets.models.character.clone();
    
    // Position the guide character to the side rather than center
    // Move further to the side (x: -5 instead of -3) to prevent overlap
    npc.position.set(-5, 0.5, 0);
    
    // Make the guide character larger and initially facing the player's starting position
    npc.scale.set(1.5, 1.5, 1.5);
    npc.rotation.y = 0; // Changed from Math.PI to 0 to face the opposite direction (player starts on opposite side now)
  } else {
    // Fallback to basic geometry
    const npcGeometry = new THREE.CapsuleGeometry(0.5, 1, 4, 8);
    const npcMaterial = new THREE.MeshStandardMaterial({ color: 0x9370db });
    npc = new THREE.Mesh(npcGeometry, npcMaterial);
    npc.position.set(-5, 1.5, 0);
  }
  
  npc.castShadow = true;
  this.scene.add(npc);
  
  // Add a spotlight to highlight the guide
  const spotlight = new THREE.SpotLight(0xffffff, 1.5);
  spotlight.position.set(-5, 10, 0); // Updated position to match new guide position
  spotlight.target = npc;
  spotlight.angle = Math.PI / 6;
  spotlight.penumbra = 0.2;
  spotlight.decay = 1;
  spotlight.distance = 20;
  spotlight.castShadow = true;
  this.scene.add(spotlight);
  
    // Add interaction trigger for the NPC
  const npcInteraction = {
  position: new THREE.Vector3(npc.position.x, npc.position.y + 1, npc.position.z),
  radius: 5, // Larger interaction radius
  characterObject: npc, // Store reference to character for rotation
  onInteract: async () => {
    // For standalone dialogues, set currentStrategy to null
    this.currentStrategy = null;
    
    // If this is the first interaction with the guide, prompt for name
    if (!this.hasMetGuide) {
      // Show initial greeting before asking for name
      await this.dialogueSystem.showNPCDialogue(
        "Welcome, traveler! I'm your guide to this world of happiness strategies. Before we begin our journey together, may I ask your name?",
        "Your Guide",
        "#9370db"
      );
      
      // Now prompt for the name
      try {
        // Use existing dialogue system name prompt
        this.playerName = await this.dialogueSystem.promptForName();
        console.log(`Player name set to: ${this.playerName}`);
        
        // Mark that the player has met the guide
        this.hasMetGuide = true;
        
        // Show first-time welcome with the player's name
        await this.dialogueSystem.showNPCDialogue(
          `It's wonderful to meet you, {playerName}! Welcome to your personalized Happiness Toolkit.`,
          "Your Guide",
          "#9370db"
        );
      } catch (error) {
        console.error("Error getting player name:", error);
        // Use default name if there was an error
        this.playerName = "Player";
        this.hasMetGuide = true;
      }
    }
    
    // Continue with regular dialogue
    await this.dialogueSystem.showNPCDialogue(
      `Welcome to your Happiness Toolkit, {playerName}! Explore the five portal areas around you to learn about different happiness strategies and their connections to US history.`, 
      "Your Guide",
      "#9370db",
      [
        { 
          text: "Tell me more about this place.", 
          callback: async () => {
            await this.dialogueSystem.showNPCDialogue(
              "This world connects evidence-based happiness strategies with pivotal moments in American history. Each area represents a different approach to well-being, embodied by a historical figure.",
              "Your Guide",
              "#9370db",
              [
                { 
                  text: "How do I explore these areas?", 
                  callback: async () => {
                    await this.dialogueSystem.showNPCDialogue(
                      "Use WASD to move and your mouse to look around. Approach each character and press 'E' to interact. Each historical figure will teach you about their happiness strategy and offer you a chance to practice it!",
                      "Your Guide",
                      "#9370db",
                      [
                        { text: "I'm ready to explore!", callback: null },
                        { text: "Thanks for the information.", callback: null }
                      ]
                    );
                  }
                },
                { text: "I'll figure it out on my own.", callback: null }
              ]
            );
          }
        },
        { 
          text: "I'm ready to explore!", 
          callback: null
        }
      ]
    );
  }
};

  // Create a nameplate for the guide and store reference
  const nameplate = this.createCharacterNameplate(
    "Your Guide", 
    npc,
    0x9370db
  );
  
  // Store nameplate reference in the interaction object
  npcInteraction.nameplate = nameplate;
  
  this.interactiveObjects.push(npcInteraction);
}

createStrategyPortals() {
  this.interactiveObjects = this.interactiveObjects || [];
  // Create a portal for each happiness strategy
  for (let i = 0; i < happinessStrategies.length; i++) {
    const strategy = happinessStrategies[i];
    const angle = (i / happinessStrategies.length) * Math.PI * 2;
    const distance = 25;
    const x = Math.cos(angle) * distance;
    const z = Math.sin(angle) * distance;
    
    // Create a platform
    const platformGeometry = new THREE.CylinderGeometry(5, 5, 0.5, 16);
    const platformMaterial = new THREE.MeshStandardMaterial({ 
      color: this.getStrategyColor(strategy.name)
    });
    const platform = new THREE.Mesh(platformGeometry, platformMaterial);
    platform.position.set(x, 0.25, z);
    platform.receiveShadow = true;
    this.scene.add(platform);
    
    // Create an arch
    this.createPortalArch(x, z, angle, strategy);
    
    // Add character model - use custom character if available
    let character;
    if (this.assetsLoaded && this.assets.models[`${strategy.name.toLowerCase()}Character`]) {
      // Use the strategy-specific character model
      character = this.assets.models[`${strategy.name.toLowerCase()}Character`].clone();
      
      // Position the character at a good spot on the platform, slightly elevated
      // Adjust position to not overlap with text - move it away from the center slightly
      const characterOffset = 2; // Distance from the center of the platform
      character.position.set(
        x + Math.cos(angle) * characterOffset, 
        0.5, 
        z + Math.sin(angle) * characterOffset
      );
      
      // Initial rotation - will be updated in animate()
      character.rotation.y = angle + Math.PI;
      
      // Scale appropriately - larger than before
      character.scale.set(1.2, 1.2, 1.2);
    } else {
      // Fallback to basic geometry
      const characterGeometry = new THREE.CapsuleGeometry(0.5, 1, 4, 8);
      const characterMaterial = new THREE.MeshStandardMaterial({ 
        color: this.getStrategyColor(strategy.name, 0.7)
      });
      character = new THREE.Mesh(characterGeometry, characterMaterial);
      
      // Position with offset
      const characterOffset = 2;
      character.position.set(
        x + Math.cos(angle) * characterOffset, 
        1.5, 
        z + Math.sin(angle) * characterOffset
      );
      character.rotation.y = angle + Math.PI;
    }
    
    character.castShadow = true;
    this.scene.add(character);
    
    // Add interaction trigger - use character's actual position
    const portalInteraction = {
  position: new THREE.Vector3(character.position.x, character.position.y + 1, character.position.z),
  radius: 5, // Increased interaction radius
  strategy: strategy,
  characterObject: character, // Store reference to character for rotation
  onInteract: async () => {
    // Use the new enhanced conversation system
    await this.startStrategyConversation(strategy);
  }
};

    
    // Create nameplate and store reference in the interaction object
    const nameplate = this.createCharacterNameplate(
      strategy.character, 
      character, 
      this.getStrategyColor(strategy.name)
    );
    
    // Store nameplate reference in the interaction object
    portalInteraction.nameplate = nameplate;
    
    this.interactiveObjects.push(portalInteraction);
    
    // Add a spotlight to highlight the character
    const spotlight = new THREE.SpotLight(this.getStrategyColor(strategy.name), 1.5);
    spotlight.position.set(x, 8, z);
    spotlight.target = character;
    spotlight.angle = Math.PI / 6;
    spotlight.penumbra = 0.2;
    spotlight.decay = 1;
    spotlight.distance = 20;
    spotlight.castShadow = true;
    this.scene.add(spotlight);
  }
}
  
  // Create a 3D text nameplate that will face the player
  // Updated createCharacterNameplate method in game.js
createCharacterNameplate(name, character, color) {
  // Create a canvas for the nameplate
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');
  canvas.width = 512;  // Increased width to prevent cutoff
  canvas.height = 128; // Increased height for better visibility
  
  // Clear canvas
  context.clearRect(0, 0, canvas.width, canvas.height);
  
  // Set up text style
  context.font = "bold 40px Minecraft, monospace"; // Slightly larger font
  context.textAlign = "center";
  context.textBaseline = "middle";
  
  // Convert color to hex string if needed
  let colorHex;
  if (typeof color === 'number') {
      colorHex = '#' + color.toString(16).padStart(6, '0');
  } else if (color instanceof THREE.Color) {
      colorHex = '#' + color.getHexString();
  } else {
      colorHex = color;
  }
  
  // Draw text outline (black border)
  context.strokeStyle = 'black';
  context.lineWidth = 6; // Thicker outline
  context.strokeText(name, canvas.width / 2, canvas.height / 2);
  
  // Draw text fill with the character's color
  context.fillStyle = colorHex;
  context.fillText(name, canvas.width / 2, canvas.height / 2);
  
  // Create texture from canvas
  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  
  // Create a sprite material with the texture
  const material = new THREE.SpriteMaterial({
    map: texture,
    transparent: true,
    depthWrite: false // Ensures nameplate is always visible through objects
  });
  
  // Create the sprite
  const nameplate = new THREE.Sprite(material);
  
  // Position nameplate above character
  const characterPosition = character.position || character;
  nameplate.position.set(
    characterPosition.x,
    characterPosition.y + 3, // Higher position above character's head
    characterPosition.z
  );
  
  // Scale the sprite to a reasonable size
  nameplate.scale.set(4, 1, 1); // Wider to accommodate longer names
  
  // Add to scene
  this.scene.add(nameplate);
  
  // Return the nameplate so we can update it later
  return nameplate;
}

// Updated code for the updateNPCRotations method in game.js
updateNPCRotations() {
  // Skip if we don't have interactive objects
  if (!this.interactiveObjects || this.interactiveObjects.length === 0) {
    return;
  }
  
  const playerPosition = this.camera.position.clone();
  
  // For each NPC with a characterObject, make it face the player
  for (const obj of this.interactiveObjects) {
    // Skip non-NPC objects or those without a characterObject
    if (!obj.characterObject) {
      continue;
    }
    
    // Get direction from NPC to player
    const direction = new THREE.Vector3();
    direction.subVectors(playerPosition, obj.position);
    direction.y = 0; // Keep rotation only in the horizontal plane
    
    // Only rotate if there's a significant direction
    if (direction.length() > 0.1) {
      // Calculate target rotation
      const targetRotation = Math.atan2(direction.x, direction.z);
      
      // Smooth rotation (lerp) for more natural movement
      const currentRotation = obj.characterObject.rotation.y;
      const rotationSpeed = 0.05; // Adjust for slower/faster rotation
      
      // Calculate shortest rotation path
      let rotationDiff = targetRotation - currentRotation;
      if (rotationDiff > Math.PI) rotationDiff -= Math.PI * 2;
      if (rotationDiff < -Math.PI) rotationDiff += Math.PI * 2;
      
      // Apply smoothed rotation
      obj.characterObject.rotation.y = currentRotation + rotationDiff * rotationSpeed;
      
      // If the object has a nameplate, make it face the camera
      if (obj.nameplate) {
        // Make nameplate always face the camera by calculating the angle from nameplate to camera
        const nameplateToCamera = new THREE.Vector3();
        nameplateToCamera.subVectors(playerPosition, obj.nameplate.position);
        
        // Calculate the angle in the XZ plane
        const nameplateAngle = Math.atan2(nameplateToCamera.x, nameplateToCamera.z);
        
        // Set the rotation directly (billboarding)
        obj.nameplate.material.rotation = -nameplateAngle;
        
        // Update position to stay above character as they move
        obj.nameplate.position.x = obj.characterObject.position.x;
        obj.nameplate.position.z = obj.characterObject.position.z;
      }
    }
  }
}


createPortalArch(x, z, angle, strategy) {
  // Calculate the direction vectors
  const dirX = Math.cos(angle);
  const dirZ = Math.sin(angle);
  
  // Calculate perpendicular direction (90 degrees to the angle)
  const perpX = -dirZ;
  const perpZ = dirX;
  
  // Fixed distance between pillars
  const pillarDistance = 4;
  
  // Calculate exact pillar positions
  const leftPillarX = x + perpX * (pillarDistance/2);
  const leftPillarZ = z + perpZ * (pillarDistance/2);
  
  const rightPillarX = x - perpX * (pillarDistance/2);
  const rightPillarZ = z - perpZ * (pillarDistance/2);
  
  // Create the arch pillars
  const pillarGeometry = new THREE.CylinderGeometry(0.4, 0.4, 3, 8);
  const pillarMaterial = new THREE.MeshStandardMaterial({ 
    color: this.getStrategyColor(strategy.name, 0.8) 
  });

  // Left pillar
  const leftPillar = new THREE.Mesh(pillarGeometry, pillarMaterial);
  leftPillar.position.set(leftPillarX, 1.5, leftPillarZ);
  leftPillar.castShadow = true;
  this.scene.add(leftPillar);

  // Right pillar
  const rightPillar = new THREE.Mesh(pillarGeometry, pillarMaterial);
  rightPillar.position.set(rightPillarX, 1.5, rightPillarZ);
  rightPillar.castShadow = true;
  this.scene.add(rightPillar);

  // Create the arch using a custom approach
  // Instead of a torus, we'll create a curved tube that properly connects the pillars
  const archCurvePoints = [];
  const segments = 16; // Number of segments in the arch
  const archHeight = 1.5; // How high the arch goes above the pillars
  
  // Create points for a smooth curve from left pillar to right pillar
  for (let i = 0; i <= segments; i++) {
    const t = i / segments;
    const angle = Math.PI * t; // 0 to π for half circle
    
    // Parametric equation for a semi-circle connecting the two pillars
    const archX = leftPillarX + (rightPillarX - leftPillarX) * t;
    const archY = 3 + archHeight * Math.sin(angle); // Height varies with sine curve
    const archZ = leftPillarZ + (rightPillarZ - leftPillarZ) * t;
    
    archCurvePoints.push(new THREE.Vector3(archX, archY, archZ));
  }
  
  // Create a smooth curve from the points
  const archCurve = new THREE.CatmullRomCurve3(archCurvePoints);
  
  // Create a tube geometry along the curve
  const archGeometry = new THREE.TubeGeometry(
    archCurve,
    segments,
    0.3, // Tube radius
    8,   // Tube segments
    false // Closed
  );
  
  const archMaterial = new THREE.MeshStandardMaterial({ 
    color: this.getStrategyColor(strategy.name, 0.9)
  });
  
  const arch = new THREE.Mesh(archGeometry, archMaterial);
  arch.castShadow = true;
  this.scene.add(arch);
  
  // Add a sign with the strategy name - position it in front of the arch
  if (this.assetsLoaded && this.assets.fonts.default) {
    const font = this.assets.fonts.default;
    const textGeometry = new THREE.TextGeometry(strategy.name, {
      font: font,
      size: 0.7, // Increased size for better visibility
      height: 0.2, // Increased depth
      curveSegments: 12,
      bevelEnabled: true,
      bevelThickness: 0.05,
      bevelSize: 0.03,
      bevelOffset: 0,
      bevelSegments: 5
    });
    
    textGeometry.center();
    
    const textMaterial = new THREE.MeshStandardMaterial({ 
      color: this.getStrategyColor(strategy.name), // Use strategy color for better visibility
      metalness: 0.3,
      roughness: 0.4
    });
    const textMesh = new THREE.Mesh(textGeometry, textMaterial);
    
    // Calculate position in front of the arch (toward the center)
    // Get the vector pointing from the portal to the center
    const toCenterX = -dirX;
    const toCenterZ = -dirZ;
    
    // Position the text in front of the arch (between arch and center)
    const textDistance = 3; // Increased distance in front of the arch
    textMesh.position.set(
      x + toCenterX * textDistance, 
      3, // Keep it at the middle height of the arch
      z + toCenterZ * textDistance
    );
    
    // Make the text face the center
    textMesh.lookAt(0, 3, 0);
    
    // REMOVED SPOTLIGHT for text to reduce texture units
    // Instead, make text emissive to ensure visibility
    textMaterial.emissive.set(this.getStrategyColor(strategy.name));
    textMaterial.emissiveIntensity = 0.5;
    
    this.scene.add(textMesh);
  }
}


  addLobbyDecorations() {
    // Add trees
    for (let i = 0; i < 20; i++) {
      const angle = Math.random() * Math.PI * 2;
      const distance = 30 + Math.random() * 15;
      const x = Math.cos(angle) * distance;
      const z = Math.sin(angle) * distance;
      this.environmentBuilder.createTree(x, z);
    }

   

    // Add flowers
    for (let i = 0; i < 50; i++) {
      const angle = Math.random() * Math.PI * 2;
      const distance = 10 + Math.random() * 30;
      const x = Math.cos(angle) * distance;
      const z = Math.sin(angle) * distance;
      
      this.environmentBuilder.createFlower(x, z);
    }
  }

  loadStrategyArea(strategy) {
    // Clear any existing scene objects and interactive objects
    while(this.scene.children.length > 0) { 
      this.scene.remove(this.scene.children[0]); 
    }
    // Ensure proper music is playing for strategy areas
if (window.musicLoader) {
  window.musicLoader.handleGameStateChange(GameState.GAMEPLAY);
}
    this.interactiveObjects = [];
    
    // Reset camera position
    this.camera.position.set(0, this.player.height, 0);
    this.controls.getObject().position.set(0, this.player.height, 0);
    
    // Add lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    this.scene.add(ambientLight);
    
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(50, 50, 50);
    directionalLight.castShadow = true;
    this.scene.add(directionalLight);
    
    // Create a themed environment based on the strategy
    switch(strategy.name) {
      case "Gratitude":
        this.createGratitudeArea();
        break;
      case "Mindfulness":
        this.createMindfulnessArea();
        break;
      case "Social Connection":
        this.createSocialConnectionArea();
        break;
      case "Acts of Kindness":
        this.createKindnessArea();
        break;
      case "Goal Setting":
        this.createGoalSettingArea();
        break;
      default:
        this.createDefaultStrategyArea(strategy);
    }
    
    // Add the character
    this.createStrategyCharacter(strategy);
    
    // Add a return portal
    this.createReturnPortal();
  }

  createDefaultStrategyArea(strategy) {
    // Create the ground
    const groundGeometry = new THREE.CircleGeometry(50, 32);
    const groundMaterial = new THREE.MeshStandardMaterial({ 
      color: this.getStrategyColor(strategy.name, 0.3) 
    });
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    this.scene.add(ground);
    
    // Create a skybox
    const skyGeometry = new THREE.SphereGeometry(500, 32, 32);
    const skyMaterial = new THREE.MeshBasicMaterial({
      color: this.getStrategyColor(strategy.name, 0.1),
      side: THREE.BackSide
    });
    const sky = new THREE.Mesh(skyGeometry, skyMaterial);
    this.scene.add(sky);
    
    // Create decorative elements
    for (let i = 0; i < 30; i++) {
      const angle = Math.random() * Math.PI * 2;
      const distance = 10 + Math.random() * 35;
      const x = Math.cos(angle) * distance;
      const z = Math.sin(angle) * distance;
      
      const geometry = new THREE.SphereGeometry(0.5 + Math.random(), 8, 8);
      const material = new THREE.MeshStandardMaterial({ 
        color: this.getStrategyColor(strategy.name, 0.7 + Math.random() * 0.3) 
      });
      const decoration = new THREE.Mesh(geometry, material);
      decoration.position.set(x, 0.5 + Math.random() * 3, z);
      decoration.castShadow = true;
      this.scene.add(decoration);
    }
  }

  createGratitudeArea() {
    // Create Thanksgiving-themed environment
    
    // Ground
    const groundGeometry = new THREE.CircleGeometry(50, 32);
    const groundMaterial = new THREE.MeshStandardMaterial({ 
      color: 0xCD853F // Sandy brown
    });
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    this.scene.add(ground);
    
    // Create a skybox - autumn colors
    const skyGeometry = new THREE.SphereGeometry(500, 32, 32);
    const skyMaterial = new THREE.MeshBasicMaterial({
      color: 0xFFA07A, // Light salmon
      side: THREE.BackSide
    });
    const sky = new THREE.Mesh(skyGeometry, skyMaterial);
    this.scene.add(sky);
    
    // Create a Thanksgiving table in the center
    this.environmentBuilder.createThanksgivingTable();
    
    // Add fall trees
    for (let i = 0; i < 15; i++) {
      const angle = Math.random() * Math.PI * 2;
      const distance = 20 + Math.random() * 25;
      const x = Math.cos(angle) * distance;
      const z = Math.sin(angle) * distance;
      
      this.environmentBuilder.createFallTree(x, z);
    }
    
    // Fallen leaves particles
    for (let i = 0; i < 200; i++) {
      const angle = Math.random() * Math.PI * 2;
      const distance = Math.random() * 45;
      const x = Math.cos(angle) * distance;
      const z = Math.sin(angle) * distance;
      
      const leafGeometry = new THREE.PlaneGeometry(0.2, 0.2);
      const leafMaterial = new THREE.MeshStandardMaterial({
        color: this.environmentBuilder.getRandomFallColor(),
        side: THREE.DoubleSide
      });
      const leaf = new THREE.Mesh(leafGeometry, leafMaterial);
      leaf.position.set(x, 0.05, z);
      leaf.rotation.x = -Math.PI / 2;
      leaf.rotation.z = Math.random() * Math.PI;
      this.scene.add(leaf);
    }
  }

  
  // Add this new method to HappinessToolkitGame class
beginStrategyDialogue(strategy) {
  // Make sure we have the dialogue system available
  if (!this.dialogueSystem) {
    console.error("Dialogue system not initialized!");
    return;
  }
  
  // Show initial greeting and options
  this.dialogueSystem.showNPCDialogue(
    `Hello {playerName}, I'm ${strategy.character}. Would you like to learn about ${strategy.name}?`,
    strategy.character,
    this.getStrategyColor(strategy.name).toString(),
    [
      { 
        text: "Yes, tell me about it!", 
        callback: () => this.showStrategyInfo(strategy, 0) // Start with the first dialogue
      },
      { 
        text: "Not right now, thanks.", 
        callback: null // Simply closes the dialogue
      }
    ]
  );
}

// Add this method for showing strategy dialogues sequentially
showStrategyInfo(strategy, dialogueIndex) {
  // Check if we've reached the end of dialogues
  if (dialogueIndex >= strategy.dialogues.length) {
    // All dialogues shown, offer to show detailed info
    const infoText = 
      `Strategy: ${strategy.name}\n\n` +
      `Description: ${strategy.description}\n\n` +
      `Historical Connection: ${strategy.historicalConnection}\n\n` +
      `Historical Context: ${strategy.historicalContext}\n\n` +
      `Implementation: ${strategy.implementation}`;
    
    this.dialogueSystem.showNPCDialogue(
      infoText,
      strategy.character,
      this.getStrategyColor(strategy.name).toString(),
      [
        { text: "Thank you for sharing this knowledge!", callback: null },
        { text: "I'll try to apply this in my life.", callback: null }
      ]
    );
    return;
  }
  
  // Show the current dialogue
  this.dialogueSystem.showNPCDialogue(
    strategy.dialogues[dialogueIndex],
    strategy.character,
    this.getStrategyColor(strategy.name).toString(),
    dialogueIndex === strategy.dialogues.length - 1 
      ? [
          // Last dialogue - offer to show more details
          { 
            text: "Tell me more details.", 
            callback: () => this.showStrategyInfo(strategy, strategy.dialogues.length) // Show the detailed info
          },
          { 
            text: "That's enough for now, thanks.", 
            callback: null // Simply closes the dialogue
          }
        ] 
      : [
          // Not the last dialogue - continue to next
          { 
            text: "Please continue.", 
            callback: () => this.showStrategyInfo(strategy, dialogueIndex + 1)  // Show next dialogue
          },
          {
            text: "Skip to the details.", 
            callback: () => this.showStrategyInfo(strategy, strategy.dialogues.length)  // Skip to detailed info
          }
        ]
  );
}  
// Updated sections for game.js - Character interaction methods

// Replace the existing createStrategyCharacter method with this enhanced version:
createStrategyCharacter(strategy) {
  // Create a historical character based on the strategy
  let character;
  if (this.assetsLoaded && this.assets.models[`${strategy.name.toLowerCase()}Character`]) {
    // Use the strategy-specific character model
    character = this.assets.models[`${strategy.name.toLowerCase()}Character`].clone();
    
    // Position the character at the center, but slightly elevated
    character.position.set(0, 0.5, 0);
    
    // Make the character larger for better visibility
    character.scale.set(1.5, 1.5, 1.5);
    
    // Have the character face slightly towards the player's starting position
    character.rotation.y = Math.PI;
  } else {
    // Fallback to basic geometry
    const characterGeometry = new THREE.CapsuleGeometry(0.5, 1.5, 4, 8);
    const characterMaterial = new THREE.MeshStandardMaterial({ 
      color: this.getStrategyColor(strategy.name, 0.7) 
    });
    character = new THREE.Mesh(characterGeometry, characterMaterial);
    character.position.set(0, 1.5, 0);
  }
  
  character.castShadow = true;
  this.scene.add(character);
  
  // Add a spotlight to highlight the character
  const spotlight = new THREE.SpotLight(0xffffff, 1.5);
  spotlight.position.set(0, 10, 5);
  spotlight.target = character;
  spotlight.angle = Math.PI / 6;
  spotlight.penumbra = 0.2;
  spotlight.decay = 1;
  spotlight.distance = 20;
  spotlight.castShadow = true;
  this.scene.add(spotlight);
  
  // Add interaction trigger with NEW enhanced dialogue system
  const characterInteraction = {
    position: new THREE.Vector3(0, 1.5, 0),
    radius: 5, // Larger interaction radius
    strategy: strategy,
    characterObject: character, // Store reference to character
    onInteract: async () => {
      // Set current strategy for reference
      this.currentStrategy = strategy;
      
      // Use the new enhanced dialogue system
      await this.startStrategyConversation(strategy);
    }
  };
  
  // Create and store nameplate
  const nameplate = this.createCharacterNameplate(
    strategy.character,
    character,
    this.getStrategyColor(strategy.name)
  );
  
  // Store nameplate reference in the interaction object
  characterInteraction.nameplate = nameplate;
  
  this.interactiveObjects.push(characterInteraction);
}

// Add this NEW method to handle strategy conversations with mini-game integration:
async startStrategyConversation(strategy) {
  const characterName = strategy.character;
  const strategyName = strategy.name;
  
  // Initial greeting with enhanced options
  await this.dialogueSystem.showNPCDialogue(
    `Hello {playerName}, I'm ${characterName}. I'd love to share my knowledge about ${strategyName} with you.`,
    characterName,
    this.getStrategyColor(strategyName).toString(),
    [
      { 
        text: "Tell me about your strategy", 
        callback: async () => {
          // Show strategy information first
          await this.showStrategyInformation(strategy);
        }
      },
      { 
        text: "Let's practice together!", 
        callback: async () => {
          // Launch mini-game directly
          await this.offerMiniGameExperience(strategy);
        }
      },
      { 
        text: "Not right now, thanks", 
        callback: null 
      }
    ]
  );
}

// Add this NEW method to show strategy information with mini-game option:
async showStrategyInformation(strategy) {
  const characterName = strategy.character;
  const strategyName = strategy.name;
  
  // Show detailed strategy information
  const infoText = 
    `Strategy: ${strategy.name}\n\n` +
    `Description: ${strategy.description}\n\n` +
    `Historical Connection: ${strategy.historicalConnection}\n\n` +
    `Historical Context: ${strategy.historicalContext}\n\n` +
    `Implementation: ${strategy.implementation}`;
  
  await this.dialogueSystem.showNPCDialogue(
    infoText,
    characterName,
    this.getStrategyColor(strategyName).toString(),
    [
      { 
        text: "Now let's practice together!", 
        callback: async () => {
          await this.offerMiniGameExperience(strategy);
        }
      },
      { 
        text: "Thank you for sharing this wisdom", 
        callback: null 
      }
    ]
  );
}

// Add this NEW method to offer mini-game with character-specific prompts:
async offerMiniGameExperience(strategy) {
  const characterName = strategy.character;
  const strategyName = strategy.name;
  
  // Get character-specific mini-game prompt
  const gamePrompt = this.getMiniGamePrompt(characterName, strategyName);
  
  await this.dialogueSystem.showNPCDialogue(
    gamePrompt,
    characterName,
    this.getStrategyColor(strategyName).toString(),
    [
      { 
        text: "Yes, let's practice!", 
        callback: () => {
          // Launch the mini-game
          this.dialogueSystem.launchMiniGame(strategyName, characterName);
        }
      },
      { 
        text: "Tell me more about the strategy first", 
        callback: async () => {
          await this.showStrategyInformation(strategy);
        }
      },
      { 
        text: "Maybe later", 
        callback: null 
      }
    ]
  );
}

// Add this NEW method for character-specific mini-game prompts:
getMiniGamePrompt(characterName, strategyName) {
  const prompts = {
    'Benjamin Franklin': "Would you like to practice gratitude by filling out a daily gratitude journal with me? I'll teach you the same method I used to track my virtues!",
    'Henry David Thoreau': "Shall we take a mindful journey to Walden Pond? I'll guide you through breathing exercises and nature observation to cultivate present-moment awareness.",
    'Laura Ingalls Wilder': "How about we organize a community barn raising? You'll learn how neighbors working together can accomplish what no one could do alone!",
    'Jane Addams': "Would you like to run Hull House with me? We'll help immigrant families and learn how individual acts of kindness can transform entire communities.",
    'John F. Kennedy': "Ready for a mission to the moon? I'll show you how to break down ambitious goals into precise, achievable steps through an Apollo launch sequence!"
  };
  
  return prompts[characterName] || `Would you like to practice ${strategyName} with an interactive experience?`;
}

// Update the createPavilion method to use the new enhanced guide interaction:
// Replace the existing npcInteraction onInteract method with this:


  // Add this to the HappinessToolkitGame class in game.js
createPauseScreen() {
  // Create pause screen container
  const pauseScreen = document.createElement('div');
  pauseScreen.id = 'pause-screen';
  pauseScreen.style.position = 'fixed';
  pauseScreen.style.top = '0';
  pauseScreen.style.left = '0';
  pauseScreen.style.width = '100%';
  pauseScreen.style.height = '100%';
  pauseScreen.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
  pauseScreen.style.display = 'flex';
  pauseScreen.style.flexDirection = 'column';
  pauseScreen.style.justifyContent = 'center';
  pauseScreen.style.alignItems = 'center';
  pauseScreen.style.zIndex = '1000';
  pauseScreen.style.opacity = '0';
  pauseScreen.style.transition = 'opacity 0.3s ease';
  pauseScreen.style.fontFamily = 'Minecraft, monospace';
  pauseScreen.style.display = 'none';
  
  // Add title
  const title = document.createElement('h1');
  title.textContent = 'Game Paused';
  title.style.color = 'white';
  title.style.fontSize = '48px';
  title.style.marginBottom = '40px';
  title.style.textShadow = '0 0 10px rgba(76, 175, 80, 0.7)';
  
  // Create buttons container
  const buttonsContainer = document.createElement('div');
  buttonsContainer.style.display = 'flex';
  buttonsContainer.style.flexDirection = 'column';
  buttonsContainer.style.gap = '15px';
  buttonsContainer.style.width = '300px';
  
  // Add resume button
  const resumeButton = document.createElement('button');
  resumeButton.textContent = 'Resume Game';
  resumeButton.className = 'minecraft-btn';
  resumeButton.onclick = () => this.resumeGame();
  
  // Add settings button
  const settingsButton = document.createElement('button');
  settingsButton.textContent = 'Settings';
  settingsButton.className = 'minecraft-btn';
  settingsButton.onclick = () => this.showSettings();
  
  // Add main menu button
  const menuButton = document.createElement('button');
  menuButton.textContent = 'Main Menu';
  menuButton.className = 'minecraft-btn';
  menuButton.onclick = () => {
    // Show confirmation first
    if (confirm('Return to main menu? Your progress in the current area will be lost.')) {
      this.returnToMainMenu();
    }
  };
  
  // Assemble pause screen
  buttonsContainer.appendChild(resumeButton);
  buttonsContainer.appendChild(settingsButton);
  buttonsContainer.appendChild(menuButton);
  pauseScreen.appendChild(title);
  pauseScreen.appendChild(buttonsContainer);
  
  document.body.appendChild(pauseScreen);
  
  return pauseScreen;
}



// Add pause/resume functionality
pauseGame() {
  // Create pause screen if it doesn't exist
  if (!this.pauseScreen) {
    this.pauseScreen = this.createPauseScreen();
  }
  
  // Unlock pointer controls
  this.controls.unlock();
  
  // Show pause screen with animation
  this.pauseScreen.style.display = 'flex';
  // Force reflow to ensure transition works
  void this.pauseScreen.offsetWidth;
  this.pauseScreen.style.opacity = '1';
  
  // Pause music (but don't stop it)
  if (window.musicLoader && window.musicLoader.gainNode) {
    this.musicVolumeBeforePause = window.musicLoader.gainNode.gain.value;
    window.musicLoader.gainNode.gain.value = this.musicVolumeBeforePause * 0.3; // Reduce volume during pause
  }
  
  // Set game as paused
  this.isPaused = true;
}

resumeGame() {
  if (!this.isPaused) return;
  
  // Hide pause screen with animation
  this.pauseScreen.style.opacity = '0';
  
  // After animation completes
  setTimeout(() => {
    this.pauseScreen.style.display = 'none';
    
    // Lock pointer controls
    this.controls.lock();
    
    // Restore music volume
    if (window.musicLoader && window.musicLoader.gainNode && this.musicVolumeBeforePause !== undefined) {
      window.musicLoader.gainNode.gain.value = this.musicVolumeBeforePause;
    }
    
    // Set game as not paused
    this.isPaused = false;
  }, 300);
}

showSettings() {
  // Create a simple settings menu
  const settingsContainer = document.createElement('div');
  settingsContainer.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
  settingsContainer.style.padding = '20px';
  settingsContainer.style.borderRadius = '10px';
  settingsContainer.style.border = '3px solid #4CAF50';
  settingsContainer.style.width = '400px';
  settingsContainer.style.position = 'absolute';
  settingsContainer.style.top = '50%';
  settingsContainer.style.left = '50%';
  settingsContainer.style.transform = 'translate(-50%, -50%)';
  settingsContainer.style.zIndex = '1001';
  
  // Add settings title
  const title = document.createElement('h2');
  title.textContent = 'Settings';
  title.style.color = 'white';
  title.style.marginBottom = '20px';
  title.style.textAlign = 'center';
  
  // Add music volume slider
  const musicVolumeContainer = document.createElement('div');
  musicVolumeContainer.style.marginBottom = '15px';
  
  const musicLabel = document.createElement('label');
  musicLabel.textContent = 'Music Volume';
  musicLabel.style.color = 'white';
  musicLabel.style.display = 'block';
  musicLabel.style.marginBottom = '5px';
  
  const musicSlider = document.createElement('input');
  musicSlider.type = 'range';
  musicSlider.min = '0';
  musicSlider.max = '100';
  musicSlider.value = window.musicLoader ? Math.round(window.musicLoader.volume * 100) : 50;
  musicSlider.style.width = '100%';
  musicSlider.oninput = () => {
    if (window.musicLoader) {
      window.musicLoader.setVolume(musicSlider.value / 100);
    }
  };
  
  // Add sound effects volume slider
  const sfxVolumeContainer = document.createElement('div');
  sfxVolumeContainer.style.marginBottom = '15px';
  
  const sfxLabel = document.createElement('label');
  sfxLabel.textContent = 'Sound Effects Volume';
  sfxLabel.style.color = 'white';
  sfxLabel.style.display = 'block';
  sfxLabel.style.marginBottom = '5px';
  
  const sfxSlider = document.createElement('input');
  sfxSlider.type = 'range';
  sfxSlider.min = '0';
  sfxSlider.max = '100';
  sfxSlider.value = window.musicLoader ? Math.round(window.musicLoader.sfxVolume * 100) : 50;
  sfxSlider.style.width = '100%';
  sfxSlider.oninput = () => {
    if (window.musicLoader) {
      window.musicLoader.setSFXVolume(sfxSlider.value / 100);
    }
  };
  
  // Close button
  const closeButton = document.createElement('button');
  closeButton.textContent = 'Back';
  closeButton.className = 'minecraft-btn';
  closeButton.style.width = '100%';
  closeButton.style.marginTop = '20px';
  closeButton.onclick = () => {
    document.body.removeChild(settingsContainer);
  };
  
  // Assemble settings menu
  musicVolumeContainer.appendChild(musicLabel);
  musicVolumeContainer.appendChild(musicSlider);
  sfxVolumeContainer.appendChild(sfxLabel);
  sfxVolumeContainer.appendChild(sfxSlider);
  settingsContainer.appendChild(title);
  settingsContainer.appendChild(musicVolumeContainer);
  settingsContainer.appendChild(sfxVolumeContainer);
  settingsContainer.appendChild(closeButton);
  
  document.body.appendChild(settingsContainer);
}

returnToMainMenu() {
  // Hide pause screen
  if (this.pauseScreen) {
    this.pauseScreen.style.display = 'none';
  }
  
  // Hide any dialogue that might be showing
  if (this.ui.dialogueBox.style.display === 'block') {
    this.ui.hideDialogue();
  }
  
  // Hide any dialogue options that might be showing
  if (this.dialogueSystem && this.dialogueSystem.optionsContainer) {
    this.dialogueSystem.hideDialogueOptions();
  }
  
  // Reset isPaused flag
  this.isPaused = false;
  
  // Set game state to main menu BEFORE loading main menu to avoid duplication
  
  // Load main menu
  this.loadMainMenu();
}
  createReturnPortal() {
    // Create a portal to return to the lobby
    const portalGeometry = new THREE.TorusGeometry(2, 0.4, 16, 32);
    const portalMaterial = new THREE.MeshStandardMaterial({ 
      color: 0x4B0082,
      emissive: 0x4B0082,
      emissiveIntensity: 0.3
    });
    const portal = new THREE.Mesh(portalGeometry, portalMaterial);
    portal.position.set(0, 5, 20);
    portal.castShadow = true;
    this.scene.add(portal);
    
    // Glowing center
    const centerGeometry = new THREE.CircleGeometry(1.8, 32);
    const centerMaterial = new THREE.MeshBasicMaterial({ 
      color: 0x9370DB,
      side: THREE.DoubleSide
    });
    const center = new THREE.Mesh(centerGeometry, centerMaterial);
    center.position.set(0, 5, 20);
    this.scene.add(center);
    
    // Return sign
    if (this.assetsLoaded && this.assets.fonts.default) {
      const font = this.assets.fonts.default;
      const textGeometry = new THREE.TextGeometry('Return to Lobby', {
        font: font,
        size: 0.4,
        height: 0.05,
        curveSegments: 12,
        bevelEnabled: true,
        bevelThickness: 0.03,
        bevelSize: 0.02,
        bevelOffset: 0,
        bevelSegments: 5
      });
      
      textGeometry.center();
      
      const textMaterial = new THREE.MeshStandardMaterial({ color: 0xFFFFFF });
      const textMesh = new THREE.Mesh(textGeometry, textMaterial);
      textMesh.position.set(0, 8, 20);
      this.scene.add(textMesh);
    }
    
    // Add interaction trigger
    const portalInteraction = {
      position: new THREE.Vector3(0, 5, 20),
      radius: 3,
      onInteract: () => {
        this.state = GameState.LOBBY;
        this.loadLobby();
      }
    };
    
    this.interactiveObjects.push(portalInteraction);
  }
  
  getStrategyColor(strategyName, alpha = 1) {
  // Return a color based on the strategy name
  let color;
  switch(strategyName) {
    case "Gratitude":
      color = new THREE.Color(0xFF8C00);
      break;
    case "Mindfulness":
      color = new THREE.Color(0x228B22);
      break;
    case "Social Connection":
      color = new THREE.Color(0x4682B4);
      break;
    case "Acts of Kindness":
      color = new THREE.Color(0xDA70D6);
      break;
    case "Goal Setting":
      color = new THREE.Color(0x4B0082);
      break;
    default:
      color = new THREE.Color(0x7B68EE);
  }
  
  if (alpha !== 1) {
    color.multiplyScalar(alpha);
  }
  
  return color;
}

  // Modified method to advance dialogue and show strategy info with character styling
showNextStrategyDialogue() {
  // Show the next dialogue for the current strategy
  if (!this.currentStrategy || !this.currentStrategy.dialogues) {
    return;
  }
  
  // Reset the flag at the beginning of a dialogue sequence
  if (this.currentDialogueIndex === 0) {
    this.strategyInfoShown = false;
  }
  
  if (this.currentDialogueIndex < this.currentStrategy.dialogues.length) {
    // Show dialogue with character name and color
    this.ui.showDialogueWithTyping(
      this.currentStrategy.dialogues[this.currentDialogueIndex],
      this.currentStrategy.character,
      this.getStrategyColor(this.currentStrategy.name).getStyle() // Convert THREE.Color to CSS
    );
    this.currentDialogueIndex++;
  } else {
    // If we're at the end of dialogues, show the full strategy information
    this.showStrategyInfo();
    // Mark that we've shown the strategy info
    this.strategyInfoShown = true;
  }
}
  
  nextDialogue() {
  // Use the dialogue system if it exists and we're in a dialogue conversation
  if (this.dialogueSystem) {
    this.dialogueSystem.advanceDialogue();
    return;
  }
  
  // Fallback for any edge cases
  if (this.ui && this.ui.dialogueBox && this.ui.dialogueBox.style.display === 'block') {
    this.ui.hideDialogue();
  }
}
  
  showStrategyInfo() {
  // Show full information about the current strategy
  if (!this.currentStrategy) {
    return;
  }
  
  const strategy = this.currentStrategy;
  const infoText = 
    `Strategy: ${strategy.name}\n\n` +
    `Description: ${strategy.description}\n\n` +
    `Historical Connection: ${strategy.historicalConnection}\n\n` +
    `Historical Context: ${strategy.historicalContext}\n\n` +
    `Implementation: ${strategy.implementation}`;
  
  this.ui.showDialogueWithTyping(
    infoText,
    strategy.character,
    this.getStrategyColor(strategy.name).toString()
  );
}


  onWindowResize() {
    // Handle window resize
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }
  
onKeyDown(event) {
  // First check if dialogue system has name input active - if so, don't process any game keys
  if (this.dialogueSystem && this.dialogueSystem.isNameInputActive()) {
    return; // Skip all game controls while inputting name
  }
  
  // Check if dialogue system is in transition - don't process keys during transitions
  if (this.dialogueSystem && this.dialogueSystem.isInDialogueTransition) {
    return;
  }
  
  // Check for Enter key to advance dialogue or start game
  if (event.code === 'Enter') {
    // If on main menu, start the game
    if (this.state === GameState.MAIN_MENU) {
      this.startGame();
      return;
    }
    
    // Handle dialogue progression
    if (this.ui && this.ui.dialogueBox && this.ui.dialogueBox.style.display === 'block') {
      // Check if this is a DialogueSystem conversation (Guide NPC with options)
      if (this.dialogueSystem && this.dialogueSystem.dialogueCompleteResolver) {
        // Use the DialogueSystem's advance method for Guide NPC
        this.dialogueSystem.advanceDialogue();
        return;
      }
      
      // Otherwise, handle as strategy NPC dialogue (simple sequential)
      // If typing is still in progress, complete it
      if (this.ui.typingTimeout) {
        this.ui.completeTyping();
        return;
      }
      
      // Handle strategy character dialogues
      if (this.currentStrategy && this.currentStrategy.dialogues) {
        // Increment dialogue index
        this.currentDialogueIndex++;
        
        // If there are more dialogues, show the next one
        if (this.currentDialogueIndex < this.currentStrategy.dialogues.length) {
          this.showStrategyDialogue();
        } 
        // Otherwise, if we haven't shown strategy info yet, show it
        else if (!this.strategyInfoShown) {
          this.showStrategyInfo();
          this.strategyInfoShown = true;
        } 
        // If we've shown everything, hide the dialogue
        else {
          this.ui.hideDialogue();
          this.strategyInfoShown = false;
        }
        return;
      }
      
      // If we don't have a current strategy dialogue, just hide the dialogue
      this.ui.hideDialogue();
      return;
    }
  }
  
  // Handle other key down events as before
  switch (event.code) {
    case 'KeyW':
      this.moveForward = true;
      break;
    case 'KeyS':
      this.moveBackward = true;
      break;
    case 'KeyA':
      this.moveLeft = true;
      break;
    case 'KeyD':
      this.moveRight = true;
      break;
    case 'KeyE':
      this.tryInteract();
      break;
    case 'Escape':
      // Don't toggle pause if input is active or dialogue is showing
      if (this.ui && this.ui.dialogueBox && this.ui.dialogueBox.style.display === 'block') {
        return;
      }
      
      // Toggle pause state
      if (this.isPaused) {
        this.resumeGame();
      } else {
        this.pauseGame();
      }
      break;
  }
}
  
  
onKeyUp(event) {
  // Skip if name input is active
  if (this.dialogueSystem && this.dialogueSystem.isNameInputActive()) {
    return;
  }
  
  // Handle key up events
  switch (event.code) {
    case 'KeyW':
      this.moveForward = false;
      break;
    case 'KeyS':
      this.moveBackward = false;
      break;
    case 'KeyA':
      this.moveLeft = false;
      break;
    case 'KeyD':
      this.moveRight = false;
      break;
  }
}
  
  tryInteract() {
  // Check if the player is near any interactive objects
  if (!this.interactiveObjects || !this.player.canMove) {
    return;
  }
  
  const playerPosition = this.camera.position;
  
  for (const obj of this.interactiveObjects) {
    const distance = playerPosition.distanceTo(obj.position);
    
    if (distance <= obj.radius) {
      // Play interaction sound
      if (window.musicLoader) {
        window.musicLoader.playSoundEffect('interact');
      }
      
      obj.onInteract();
      return;
    }
  }
}
  
  animate() {
    requestAnimationFrame(this.animate.bind(this));
    
    // Get delta time for animations
    const delta = this.clock.getDelta();
    
    // Update character animations if available
    if (this.assetsLoaded) {
      for (let key in window.assetLoader.mixers) {
        if (window.assetLoader.mixers[key]) {
          window.assetLoader.mixers[key].update(delta);
        }
      }
    }
    
    // Always animate background symbols if they exist, regardless of game state
    if (this.backgroundSymbols) {
      for (const symbol of this.backgroundSymbols) {
        symbol.mesh.rotation.x += symbol.rotationSpeed.x;
        symbol.mesh.rotation.y += symbol.rotationSpeed.y;
        symbol.mesh.rotation.z += symbol.rotationSpeed.z;
        
        symbol.mesh.position.x += symbol.moveSpeed.x;
        symbol.mesh.position.y += symbol.moveSpeed.y;
        symbol.mesh.position.z += symbol.moveSpeed.z;
        
        // Wrap positions to keep symbols in view
        if (symbol.mesh.position.x > 20) symbol.mesh.position.x = -20;
        if (symbol.mesh.position.x < -20) symbol.mesh.position.x = 20;
        if (symbol.mesh.position.y > 20) symbol.mesh.position.y = 0;
        if (symbol.mesh.position.y < 0) symbol.mesh.position.y = 20;
        if (symbol.mesh.position.z > 0) symbol.mesh.position.z = -40;
        if (symbol.mesh.position.z < -40) symbol.mesh.position.z = 0;
      }
    }
    
    // Handle player movement if in gameplay state
    if (this.state !== GameState.MAIN_MENU && this.player.canMove) {
      // Handle player movement
      const direction = new THREE.Vector3();
      const rotation = this.camera.getWorldDirection(direction);
      const sideways = new THREE.Vector3(-direction.z, 0, direction.x);
      
      if (this.moveForward) {
        this.controls.getObject().position.add(direction.multiplyScalar(this.player.speed));
      }
      if (this.moveBackward) {
        this.controls.getObject().position.add(direction.multiplyScalar(-this.player.speed));
      }
      if (this.moveLeft) {
        this.controls.getObject().position.add(sideways.multiplyScalar(-this.player.speed));
      }
      if (this.moveRight) {
        this.controls.getObject().position.add(sideways.multiplyScalar(this.player.speed));
      }
      
      // Keep player on the ground
      this.controls.getObject().position.y = this.player.height;
      
      // Make NPCs face the player
      this.updateNPCRotations();
    }
    
    this.renderer.render(this.scene, this.camera);
  }
  
  // New method to update NPC rotations to face the player
  updateNPCRotations() {
    // Skip if we don't have interactive objects
    if (!this.interactiveObjects || this.interactiveObjects.length === 0) {
      return;
    }
    
    const playerPosition = this.camera.position.clone();
    
    // For each NPC with a characterObject, make it face the player
    for (const obj of this.interactiveObjects) {
      // Skip non-NPC objects or those without a characterObject
      if (!obj.characterObject) {
        continue;
      }
      
      // Get direction from NPC to player
      const direction = new THREE.Vector3();
      direction.subVectors(playerPosition, obj.position);
      direction.y = 0; // Keep rotation only in the horizontal plane
      
      // Only rotate if there's a significant direction
      if (direction.length() > 0.1) {
        // Calculate target rotation
        const targetRotation = Math.atan2(direction.x, direction.z);
        
        // Smooth rotation (lerp) for more natural movement
        const currentRotation = obj.characterObject.rotation.y;
        const rotationSpeed = 0.05; // Adjust for slower/faster rotation
        
        // Calculate shortest rotation path
        let rotationDiff = targetRotation - currentRotation;
        if (rotationDiff > Math.PI) rotationDiff -= Math.PI * 2;
        if (rotationDiff < -Math.PI) rotationDiff += Math.PI * 2;
        
        // Apply smoothed rotation
        obj.characterObject.rotation.y = currentRotation + rotationDiff * rotationSpeed;
        
        // Rotate the nameplate to face the player as well
        if (obj.nameplate) {
          obj.nameplate.rotation.y = targetRotation;
        }
      }
    }
  }
  
  // Placeholder methods for strategy area creation
  createMindfulnessArea() {
    // Use the EnvironmentBuilder to create Walden Pond themed environment
    
    // Ground
    const groundGeometry = new THREE.CircleGeometry(50, 32);
    const groundMaterial = new THREE.MeshStandardMaterial({ 
      color: 0x228B22 // Forest green
    });
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    this.scene.add(ground);
    
    // Create a skybox
    this.environmentBuilder.createSkybox(0x87CEEB);
    
    // Create Walden Pond
    const pondGeometry = new THREE.CircleGeometry(15, 32);
    const pondMaterial = new THREE.MeshStandardMaterial({ 
      color: 0x4682B4, // Steel blue
      metalness: 0.1,
      roughness: 0.3
    });
    const pond = new THREE.Mesh(pondGeometry, pondMaterial);
    pond.rotation.x = -Math.PI / 2;
    pond.position.y = 0.05;
    this.scene.add(pond);
    
    // Add trees around the pond
    for (let i = 0; i < 30; i++) {
      const angle = Math.random() * Math.PI * 2;
      const distance = 20 + Math.random() * 25;
      const x = Math.cos(angle) * distance;
      const z = Math.sin(angle) * distance;
      
      this.environmentBuilder.createTree(x, z, 4, 0x228B22);
    }
    
    // Add some rocks for meditation spots
    for (let i = 0; i < 7; i++) {
      const angle = (i / 7) * Math.PI * 2;
      const distance = 10;
      const x = Math.cos(angle) * distance;
      const z = Math.sin(angle) * distance;
      
      const rockGeometry = new THREE.SphereGeometry(0.8, 6, 6);
      const rockMaterial = new THREE.MeshStandardMaterial({ 
        color: 0x808080,
        roughness: 0.9
      });
      const rock = new THREE.Mesh(rockGeometry, rockMaterial);
      rock.position.set(x, 0.4, z);
      rock.scale.y = 0.5;
      rock.castShadow = true;
      this.scene.add(rock);
    }
  }
  
  createSocialConnectionArea() {
    // Create Barn Raising themed environment
    
    // Ground
    const groundGeometry = new THREE.CircleGeometry(50, 32);
    const groundMaterial = new THREE.MeshStandardMaterial({ 
      color: 0xDAA520 // Goldenrod (field)
    });
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    this.scene.add(ground);
    
    // Create a skybox
    this.environmentBuilder.createSkybox(0x87CEEB);
    this.environmentBuilder.addClouds(15);
    
    // Add simple barn structure, settlers, and community elements
    // (simplified implementation for this example)
    for (let i = 0; i < 10; i++) {
      const angle = Math.random() * Math.PI * 2;
      const distance = 20 + Math.random() * 25;
      const x = Math.cos(angle) * distance;
      const z = Math.sin(angle) * distance;
      
      this.environmentBuilder.createTree(x, z, 3, 0x228B22);
    }
    
    // Create a simple barn frame
    const barnBaseGeometry = new THREE.BoxGeometry(15, 0.5, 20);
    const woodMaterial = new THREE.MeshStandardMaterial({ color: 0x8B4513 });
    const barnBase = new THREE.Mesh(barnBaseGeometry, woodMaterial);
    barnBase.position.set(0, 0.25, -15);
    barnBase.receiveShadow = true;
    this.scene.add(barnBase);
    
    // Add some vertical beams
    for (let x = -7; x <= 7; x += 7) {
      for (let z = -25; z <= -5; z += 10) {
        const beamGeometry = new THREE.BoxGeometry(1, 8, 1);
        const beam = new THREE.Mesh(beamGeometry, woodMaterial);
        beam.position.set(x, 4, z);
        beam.castShadow = true;
        this.scene.add(beam);
      }
    }
    
    // Add some horizontal beams
    for (let z = -25; z <= -5; z += 10) {
      const beamGeometry = new THREE.BoxGeometry(15, 1, 1);
      const beam = new THREE.Mesh(beamGeometry, woodMaterial);
      beam.position.set(0, 8, z);
      beam.castShadow = true;
      this.scene.add(beam);
    }
    
    // Add community gathering area with tables
    for (let i = 0; i < 3; i++) {
      const angle = (i / 3) * Math.PI * 2;
      const distance = 10;
      const x = Math.cos(angle) * distance;
      const z = Math.sin(angle) * distance;
      
      // Table
      const tableGeometry = new THREE.BoxGeometry(3, 0.2, 1.5);
      const tableMaterial = new THREE.MeshStandardMaterial({ color: 0x8B4513 });
      const table = new THREE.Mesh(tableGeometry, tableMaterial);
      table.position.set(x, 0.6, z);
      table.rotation.y = angle;
      table.castShadow = true;
      this.scene.add(table);
    }
  }
  
  createKindnessArea() {
    // Simple Hull House Settlement themed environment
    
    // Ground
    const groundGeometry = new THREE.CircleGeometry(50, 32);
    const groundMaterial = new THREE.MeshStandardMaterial({ 
      color: 0x808080 // Gray (urban setting)
    });
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    this.scene.add(ground);
    
    // Create a skybox
    this.environmentBuilder.createSkybox(0x708090);
    
    // Create a simple Hull House building
    const buildingGeometry = new THREE.BoxGeometry(14, 8, 10);
    const buildingMaterial = new THREE.MeshStandardMaterial({ color: 0xA0522D });
    const building = new THREE.Mesh(buildingGeometry, buildingMaterial);
    building.position.set(0, 4, 0);
    building.castShadow = true;
    this.scene.add(building);
    
    // Roof
    const roofGeometry = new THREE.BoxGeometry(16, 2, 12);
    const roofMaterial = new THREE.MeshStandardMaterial({ color: 0x800000 });
    const roof = new THREE.Mesh(roofGeometry, roofMaterial);
    roof.position.set(0, 9, 0);
    roof.castShadow = true;
    this.scene.add(roof);
    
    // Door
    const doorGeometry = new THREE.BoxGeometry(2, 3, 0.2);
    const doorMaterial = new THREE.MeshStandardMaterial({ color: 0x8B4513 });
    const door = new THREE.Mesh(doorGeometry, doorMaterial);
    door.position.set(0, 1.5, 5.1);
    door.castShadow = true;
    this.scene.add(door);
    
    // Simple garden area 
    for (let x = -5; x <= 5; x += 5) {
      for (let z = 10; z <= 15; z += 5) {
        const plotGeometry = new THREE.BoxGeometry(4, 0.3, 4);
        const plotMaterial = new THREE.MeshStandardMaterial({ color: 0x8B4513 });
        const plot = new THREE.Mesh(plotGeometry, plotMaterial);
        plot.position.set(x, 0.15, z);
        plot.receiveShadow = true;
        this.scene.add(plot);
        
        // Add some plants
        for (let px = -1; px <= 1; px += 1) {
          for (let pz = -1; pz <= 1; pz += 1) {
            if (px === 0 && pz === 0) continue;
            this.environmentBuilder.createFlower(x + px, z + pz);
          }
        }
      }
    }
  }
  
  createGoalSettingArea() {
    // Apollo Space Program themed environment
    
    // Ground (moon surface)
    const groundGeometry = new THREE.CircleGeometry(50, 32);
    const groundMaterial = new THREE.MeshStandardMaterial({ 
      color: 0xC0C0C0, // Silver (moon surface)
      roughness: 0.9
    });
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    this.scene.add(ground);
    
    // Create a space skybox
    this.environmentBuilder.createSkybox(0x000000);
    
    // Add stars
    this.environmentBuilder.addStars(1000);
    
    // Add Earth in the distance
    this.environmentBuilder.createEarth();
    
    // Create lunar module
    this.environmentBuilder.createLunarModule();
    
    // Create flag
    this.environmentBuilder.createFlag();
    
    // Add moon craters
    for (let i = 0; i < 30; i++) {
      const angle = Math.random() * Math.PI * 2;
      const distance = 5 + Math.random() * 40;
      const x = Math.cos(angle) * distance;
      const z = Math.sin(angle) * distance;
      
      this.environmentBuilder.createMoonCrater(x, z);
    }
  }
}

// Initialize the game when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', function() {
  // Game will be initialized by the loading sequence in index.html
  console.log("Game script loaded and ready");
});

// Expose the game class for global use
window.HappinessToolkitGame = HappinessToolkitGame;
fixControlsDisplay();
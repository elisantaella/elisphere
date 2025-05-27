// assets.js - Asset loader for Happiness Toolkit Game
// Handles loading 3D models, textures, and other external resources

class AssetLoader {
    constructor() {
      this.models = {};
      this.textures = {};
      this.fonts = {};
      this.loadingManager = new THREE.LoadingManager();
      this.gltfLoader = new THREE.GLTFLoader(this.loadingManager);
      this.fbxLoader = new THREE.FBXLoader(this.loadingManager);
      this.textureLoader = new THREE.TextureLoader(this.loadingManager);
      this.fontLoader = new THREE.FontLoader(this.loadingManager);
      
      // Setup Draco compression for optimized model loading
      const dracoLoader = new THREE.DRACOLoader();
      dracoLoader.setDecoderPath('https://www.gstatic.com/draco/v1/decoders/');
      this.gltfLoader.setDRACOLoader(dracoLoader);
      
      // Animation mixer for character animations
      this.mixers = {};
      
      // Setup loading callbacks
      this.setupLoadingCallbacks();
    }
    
    setupLoadingCallbacks() {
      this.loadingManager.onStart = (url, itemsLoaded, itemsTotal) => {
        console.log(`Started loading: ${url}`);
      };
      
      this.loadingManager.onProgress = (url, itemsLoaded, itemsTotal) => {
        const progress = (itemsLoaded / itemsTotal) * 100;
        console.log(`Loading progress: ${progress.toFixed(2)}%`);
        
        // Update loading bar if it exists
        const loadingProgressElement = document.getElementById('loading-progress');
        if (loadingProgressElement) {
          loadingProgressElement.style.width = `${progress}%`;
        }
      };
      
      this.loadingManager.onLoad = () => {
        console.log('Loading complete!');
      };
      
      this.loadingManager.onError = (url) => {
        console.error(`Error loading: ${url}`);
      };
    }
    loadSkyTexture() {
        return new Promise((resolve, reject) => {
          this.gltfLoader.load(
            './textures/sky.glb',
            (gltf) => {
              let skyTexture = null;
              gltf.scene.traverse((child) => {
                if (child.isMesh && child.material && child.material.map) {
                  skyTexture = child.material.map;
                }
              });
              
              if (skyTexture) {
                this.textures.sky = skyTexture;
                console.log('Sky texture loaded successfully');
                resolve(skyTexture);
              } else {
                console.warn('Sky texture not found in the GLB file');
                resolve(null);
              }
            },
            undefined,
            (error) => {
              console.error('Error loading sky texture:', error);
              reject(error);
            }
          );
        });
      }

    loadCharacterModels() {
        return new Promise((resolve, reject) => {
          // Load the Mixamo character models
          this.gltfLoader.load(
            './textures/character.glb',
            (gltf) => {
              // Scale the model to be larger - increased from 0.01 to 0.04
              gltf.scene.scale.set(0.04, 0.04, 0.04);
              
              // Create mixer for animations
              const mixer = new THREE.AnimationMixer(gltf.scene);
              this.mixers.character = mixer;
              
              // Use existing animations from the GLB if available
              if (gltf.animations && gltf.animations.length > 0) {
                const idleAction = mixer.clipAction(gltf.animations[0]);
                idleAction.play();
              }
              
              // Store the model for future use
              this.models.character = gltf.scene.clone();
              
              // Create different character variations
              this.setupCharacterVariations();
              
              resolve(this.models);
            },
            );
            });
        }
    
    setupCharacterVariations() {
      // Create variations of the character for different historical figures
      const strategies = [
        "Gratitude", 
        "Mindfulness", 
        "Social Connection", 
        "Acts of Kindness", 
        "Goal Setting"
      ];
      
      strategies.forEach(strategy => {
        // Clone the base character model
        const character = this.models.character.clone();
        
        // Customize the character based on the strategy
        const color = this.getStrategyColor(strategy);
        
        // Apply the color to all meshes in the character
        character.traverse(child => {
          if (child.isMesh) {
            child.material = child.material.clone();
            child.material.color.set(color);
          }
        });
        
        // Create a mixer for this character
        const mixer = new THREE.AnimationMixer(character);
        this.mixers[`${strategy.toLowerCase()}Character`] = mixer;
        
        // If animations exist, apply them
        if (this.models.character.animations && this.models.character.animations.length > 0) {
          const idleAction = mixer.clipAction(this.models.character.animations[0]);
          idleAction.play();
        }
        
        // Store the variation
        this.models[`${strategy.toLowerCase()}Character`] = character;
      });
    }
    
    /*loadMtRushmore() {
        return new Promise((resolve, reject) => {
          this.gltfLoader.load(
            './textures/rushmore.glb',
            (gltf) => {
              // Process and store the Mt. Rushmore model
              const model = gltf.scene;
              
              // Scale it much larger to be visible from a distance - increased from 5 to 50
              model.scale.set(50, 50, 50);
              
              this.models.mtRushmore = model;
              resolve(model);
            },
        );
      });
    }
    */
    loadEnvironmentTextures() {
      // Load any additional textures needed for the environment
      return new Promise((resolve) => {
        // Example of loading a ground texture
        this.textureLoader.load(
          'https://threejs.org/examples/textures/terrain/grasslight-big.jpg',
          (texture) => {
            texture.wrapS = THREE.RepeatWrapping;
            texture.wrapT = THREE.RepeatWrapping;
            texture.repeat.set(25, 25);
            this.textures.ground = texture;
            resolve(this.textures);
          }
        );
      });
    }
    
    loadFonts() {
      return new Promise((resolve) => {
        this.fontLoader.load(
          'https://threejs.org/examples/fonts/helvetiker_bold.typeface.json',
          (font) => {
            this.fonts.default = font;
            resolve(this.fonts);
          }
        );
      });
    }
    
    // Helper to get appropriate colors for each strategy
    getStrategyColor(strategyName) {
      switch(strategyName) {
        case "Gratitude":
          return 0xFF8C00; // Dark Orange
        case "Mindfulness":
          return 0x228B22; // Forest Green
        case "Social Connection":
          return 0x4682B4; // Steel Blue
        case "Acts of Kindness":
          return 0xDA70D6; // Orchid
        case "Goal Setting":
          return 0x4B0082; // Indigo
        default:
          return 0x7B68EE; // Medium Slate Blue
      }
    }
    
    async loadAllAssets() {
  try {
    const [characters, mtRushmore, textures, fonts, skyTexture] = await Promise.all([
      this.loadCharacterModels(),
      //this.loadMtRushmore(),
      this.loadEnvironmentTextures(),
      this.loadFonts(),
      this.loadSkyTexture() // Add sky texture loading
    ]);
    
    console.log('All assets loaded successfully!');
    return {
      models: this.models,
      textures: this.textures,
      fonts: this.fonts
    };
  } catch (error) {
    console.error('Failed to load all assets:', error);
    throw error;
  }
}
  }
  
  // Create a global instance to be used in the game
  window.assetLoader = new AssetLoader();
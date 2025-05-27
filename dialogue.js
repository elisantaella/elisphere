// Enhanced dialogue.js - Interactive dialogue system with mini-game integration

class DialogueSystem {
  constructor(game) {
    this.game = game;
    this.ui = game.ui;
    this.playerName = game.playerName || "Player"; 
    this.dialogueHistory = [];
    this.currentDialogueOptions = [];
    this.isWaitingForChoice = false;
    this.optionsContainer = null;
    this.selectedOptionIndex = 0; 
    this.isInputCaptureActive = false;
    
    // Add a key debounce to prevent immediate option selection
    this.lastKeyPressTime = 0;
    this.keyDebounceTime = 400; // ms to wait between key presses
    
    // Add a flag to track if we're in a transition between dialogue states
    this.isInDialogueTransition = false;
    
    // Mini-game integration
    this.miniGameWindow = null;
    this.miniGameActive = false;
    
    // Create the options container for dialogue choices
    this.createDialogueOptionsContainer();
    
    // Add keyboard event listeners for option selection
    this.setupKeyboardControls();
    
    // Setup input capture system
    this.setupInputCapture();
  }
  
  setupInputCapture() {
    this.isInputCaptureActive = false;
    
    document.addEventListener('keydown', (event) => {
      if (this.isInputCaptureActive) {
        const nameModal = document.getElementById('name-input-modal');
        
        if (nameModal && event.target.tagName !== 'INPUT') {
          event.preventDefault();
          event.stopPropagation();
          
          if (event.code === 'Enter') {
            const input = nameModal.querySelector('input');
            if (input) {
              input.focus();
            }
          }
          
          return false;
        }
      }
    }, true);
  }
  
  createDialogueOptionsContainer() {
    // Create a container for dialogue options
    this.optionsContainer = document.createElement('div');
    this.optionsContainer.id = 'dialogue-options';
    
    // Position in the middle of the screen with a hardcoded adjustment
    this.optionsContainer.style.position = 'fixed';
    this.optionsContainer.style.top = '48%';
    this.optionsContainer.style.left = '25%'; // Hardcoded adjustment - moving left from 50%
    this.optionsContainer.style.transform = 'translate(-50%, -50%)';
    
    // Make it properly centered
    this.optionsContainer.style.width = '70%'; // Reduced width
    this.optionsContainer.style.maxWidth = '700px';
    this.optionsContainer.style.display = 'flex';
    this.optionsContainer.style.flexDirection = 'row';
    this.optionsContainer.style.justifyContent = 'center';
    this.optionsContainer.style.alignItems = 'center';
    this.optionsContainer.style.gap = '15px';
    this.optionsContainer.style.zIndex = '101';
    this.optionsContainer.style.display = 'none';
    this.optionsContainer.style.pointerEvents = 'none';
    
    document.body.appendChild(this.optionsContainer);
  }
  
  setupKeyboardControls() {
    document.addEventListener('keydown', (event) => {
      // Check if we're waiting for choice and options are displayed
      if (!this.isWaitingForChoice || this.optionsContainer.style.display === 'none') {
        return;
      }
      
      // Add debouncing to prevent rapid key presses
      const now = Date.now();
      if (now - this.lastKeyPressTime < this.keyDebounceTime) {
        // Too soon after last key press, ignore this one
        event.preventDefault();
        return;
      }
      this.lastKeyPressTime = now;
      
      switch (event.code) {
        case 'ArrowLeft':
          this.updateSelectedOption(-1);
          event.preventDefault();
          break;
        case 'ArrowRight':
          this.updateSelectedOption(1);
          event.preventDefault();
          break;
        case 'Enter':
        case 'Space':
          this.selectCurrentOption();
          event.preventDefault();
          break;
      }
    });
  }
  
  updateSelectedOption(direction) {
    if (window.musicLoader) {
      window.musicLoader.playSoundEffect('buttonClick', 0.2);
    }
    
    const optionElements = this.optionsContainer.querySelectorAll('.dialogue-option');
    this.selectedOptionIndex = (this.selectedOptionIndex + direction) % optionElements.length;
    
    if (this.selectedOptionIndex < 0) {
      this.selectedOptionIndex = optionElements.length - 1;
    }
    
    optionElements.forEach((option, index) => {
      if (index === this.selectedOptionIndex) {
        option.classList.add('selected');
      } else {
        option.classList.remove('selected');
      }
    });
  }
  
  selectCurrentOption() {
    const optionElements = this.optionsContainer.querySelectorAll('.dialogue-option');
    if (optionElements.length > 0 && this.selectedOptionIndex >= 0 && this.selectedOptionIndex < optionElements.length) {
      if (window.musicLoader) {
        window.musicLoader.playSoundEffect('buttonClick');
      }
      
      const selectedOption = this.currentDialogueOptions[this.selectedOptionIndex];
      
      // Hide options immediately to prevent double-selection
      this.hideDialogueOptions();
      
      // Set transition flag to prevent key events from interfering
      this.isInDialogueTransition = true;
      
      // Show player's choice as dialogue with a delay to allow UI to update
      setTimeout(() => {
        this.showPlayerDialogue(selectedOption.text).then(() => {
          // Execute the callback after player's dialogue is complete
          if (selectedOption.callback) {
            // Add delay before executing callback to prevent rapid transitions
            setTimeout(() => {
              this.isInDialogueTransition = false;
              selectedOption.callback();
            }, 300);
          } else {
            this.isInDialogueTransition = false;
          }
        });
      }, 100);
    }
  }
  
  updatePlayerName(name) {
    this.playerName = name;
    if (this.game) {
      this.game.playerName = name;
    }
  }
  
  promptForName() {
    return new Promise((resolve) => {
      this.isInputCaptureActive = true;
      
      const modal = document.createElement('div');
      modal.id = 'name-input-modal';
      modal.style.position = 'fixed';
      modal.style.top = '0';
      modal.style.left = '0';
      modal.style.width = '100%';
      modal.style.height = '100%';
      modal.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
      modal.style.display = 'flex';
      modal.style.flexDirection = 'column';
      modal.style.justifyContent = 'center';
      modal.style.alignItems = 'center';
      modal.style.zIndex = '1000';
      modal.style.fontFamily = 'Minecraft, monospace';
      
      const title = document.createElement('h2');
      title.textContent = 'What is your name?';
      title.style.color = 'white';
      title.style.marginBottom = '20px';
      title.style.fontSize = '32px';
      title.style.textShadow = '2px 2px 4px rgba(0, 0, 0, 0.5)';
      
      const inputContainer = document.createElement('div');
      inputContainer.style.backgroundColor = 'rgba(0, 0, 0, 0.6)';
      inputContainer.style.padding = '20px';
      inputContainer.style.borderRadius = '8px';
      inputContainer.style.border = '3px solid #555';
      inputContainer.style.width = '400px';
      inputContainer.style.textAlign = 'center';
      
      const input = document.createElement('input');
      input.type = 'text';
      input.placeholder = 'Enter your name...';
      input.style.width = '100%';
      input.style.padding = '10px';
      input.style.fontSize = '20px';
      input.style.backgroundColor = '#222';
      input.style.color = 'white';
      input.style.border = '2px solid #4CAF50';
      input.style.borderRadius = '4px';
      input.style.outline = 'none';
      input.style.fontFamily = 'Minecraft, monospace';
      input.style.marginBottom = '20px';
      input.style.textAlign = 'center';
      
      const button = document.createElement('button');
      button.textContent = 'Confirm';
      button.className = 'minecraft-btn';
      button.style.padding = '10px 20px';
      button.style.fontSize = '18px';
      
      const handleSubmit = () => {
        const name = input.value.trim();
        if (name) {
          if (window.musicLoader) {
            window.musicLoader.playSoundEffect('buttonClick');
          }
          
          this.updatePlayerName(name);
          this.isInputCaptureActive = false;
          
          document.body.removeChild(modal);
          
          // Reset key press time to prevent immediate dialogue advancement
          this.lastKeyPressTime = Date.now();
          
          // Add a small delay before resolving to prevent immediate dialogue advancement
          setTimeout(() => {
            resolve(name);
          }, 300);
        } else {
          input.style.border = '2px solid red';
          setTimeout(() => {
            input.style.border = '2px solid #4CAF50';
          }, 500);
        }
      };
      
      button.addEventListener('click', handleSubmit);
      
      const stopPropagation = (event) => {
        event.stopPropagation();
      };
      
      input.addEventListener('keydown', (event) => {
        event.stopPropagation();
        
        if (event.key === 'Enter') {
          handleSubmit();
        }
      });
      
      inputContainer.addEventListener('keydown', stopPropagation);
      modal.addEventListener('keydown', stopPropagation);
      
      setTimeout(() => input.focus(), 100);
      
      inputContainer.appendChild(input);
      inputContainer.appendChild(button);
      modal.appendChild(title);
      modal.appendChild(inputContainer);
      document.body.appendChild(modal);
    });
  }

  isNameInputActive() {
    return this.isInputCaptureActive === true;
  }
  
  // Enhanced NPC dialogue method with mini-game integration
  showNPCDialogue(text, characterName, characterColor, options = []) {
    return new Promise(resolve => {
      // Set transition flag to prevent key events during dialogue setup
      this.isInDialogueTransition = true;
      
      // Replace {playerName} placeholder with actual player name
      const processedText = text.replace(/{playerName}/g, this.playerName);
      
      // Show the dialogue with NPC typing sound
      this.ui.showDialogueWithTyping(processedText, characterName, characterColor, 'npcTyping');
      
      // Store dialogue in history
      this.dialogueHistory.push({
        speaker: characterName,
        text: processedText,
        isPlayer: false
      });
      
      // If we have options, store them for later display
      if (options && options.length > 0) {
        this.currentDialogueOptions = options;
        this.isWaitingForChoice = true;
      } else {
        this.currentDialogueOptions = [];
        this.isWaitingForChoice = false;
      }
      
      // Reset key press time to prevent immediate dialogue advancement
      this.lastKeyPressTime = Date.now();
      
      // Store the resolver to be called later and clear transition flag
      setTimeout(() => {
        this.dialogueCompleteResolver = resolve;
        this.isInDialogueTransition = false;
      }, 300);
    });
  }
  
  showPlayerDialogue(text) {
    return new Promise(resolve => {
      // Set transition flag to prevent key events during dialogue setup
      this.isInDialogueTransition = true;
      
      // Show the dialogue with player typing sound
      this.ui.showDialogueWithTyping(text, this.playerName, '#4CAF50', 'playerTyping');
      
      // Store dialogue in history
      this.dialogueHistory.push({
        speaker: this.playerName,
        text: text,
        isPlayer: true
      });
      
      // Reset key press time to prevent immediate dialogue advancement
      this.lastKeyPressTime = Date.now();
      
      // Store the resolver to be called later and clear transition flag
      setTimeout(() => {
        this.dialogueCompleteResolver = resolve;
        this.isInDialogueTransition = false;
      }, 300);
    });
  }
  
  // NEW: Mini-game integration methods
  launchMiniGame(gameType, characterName) {
    // Prevent multiple games from opening
    if (this.miniGameActive) {
      console.log('Mini-game already active');
      return;
    }
    
    this.miniGameActive = true;
    
    // Map character names to their game files
    const gameFiles = {
      'Benjamin Franklin': './gratitude_journal_game.html',
      'Henry David Thoreau': './walden_mindfulness_game.html', 
      'Laura Ingalls Wilder': './barn_raising_game.html',
      'Jane Addams': './hull_house_kindness_game.html',
      'John F. Kennedy': './apollo_goal_setting_game.html'
    };
    
    const gameFile = gameFiles[characterName];
    if (!gameFile) {
      console.error(`No game file found for character: ${characterName}`);
      this.miniGameActive = false;
      return;
    }
    
    // Create mini-game window
    this.createMiniGameWindow(gameFile, characterName);
    
    // Play mini-game launch sound
    if (window.musicLoader) {
      window.musicLoader.playSoundEffect('buttonClick');
    }
    
    console.log(`Launching ${gameType} mini-game for ${characterName}`);
  }
  
  createMiniGameWindow(gameFile, characterName) {
    // Create overlay
    const overlay = document.createElement('div');
    overlay.id = 'mini-game-overlay';
    overlay.style.position = 'fixed';
    overlay.style.top = '0';
    overlay.style.left = '0';
    overlay.style.width = '100%';
    overlay.style.height = '100%';
    overlay.style.backgroundColor = 'rgba(0, 0, 0, 0.9)';
    overlay.style.zIndex = '2000';
    overlay.style.display = 'flex';
    overlay.style.flexDirection = 'column';
    overlay.style.justifyContent = 'center';
    overlay.style.alignItems = 'center';
    overlay.style.animation = 'fadeIn 0.5s ease';
    
    // Create game container
    const gameContainer = document.createElement('div');
    gameContainer.style.width = '95%';
    gameContainer.style.height = '95%';
    gameContainer.style.maxWidth = '1400px';
    gameContainer.style.maxHeight = '900px';
    gameContainer.style.backgroundColor = 'white';
    gameContainer.style.borderRadius = '15px';
    gameContainer.style.border = '4px solid #4CAF50';
    gameContainer.style.overflow = 'hidden';
    gameContainer.style.position = 'relative';
    gameContainer.style.boxShadow = '0 20px 40px rgba(0,0,0,0.7)';
    
    // Create close button
    const closeButton = document.createElement('button');
    closeButton.innerHTML = '✕';
    closeButton.style.position = 'absolute';
    closeButton.style.top = '10px';
    closeButton.style.right = '15px';
    closeButton.style.zIndex = '2001';
    closeButton.style.background = '#ff4444';
    closeButton.style.color = 'white';
    closeButton.style.border = 'none';
    closeButton.style.borderRadius = '50%';
    closeButton.style.width = '40px';
    closeButton.style.height = '40px';
    closeButton.style.fontSize = '20px';
    closeButton.style.cursor = 'pointer';
    closeButton.style.fontFamily = 'Arial, sans-serif';
    closeButton.style.fontWeight = 'bold';
    closeButton.onclick = () => this.closeMiniGame();
    
    // Create iframe for the game
    const gameFrame = document.createElement('iframe');
    gameFrame.src = gameFile;
    gameFrame.style.width = '100%';
    gameFrame.style.height = '100%';
    gameFrame.style.border = 'none';
    gameFrame.style.borderRadius = '11px';
    
    // Add loading message
    const loadingMsg = document.createElement('div');
    loadingMsg.textContent = `Loading ${characterName}'s Interactive Experience...`;
    loadingMsg.style.position = 'absolute';
    loadingMsg.style.top = '50%';
    loadingMsg.style.left = '50%';
    loadingMsg.style.transform = 'translate(-50%, -50%)';
    loadingMsg.style.color = '#4CAF50';
    loadingMsg.style.fontSize = '24px';
    loadingMsg.style.fontFamily = 'Minecraft, monospace';
    loadingMsg.style.textAlign = 'center';
    loadingMsg.style.zIndex = '1999';
    
    // Remove loading message when iframe loads
    gameFrame.onload = () => {
      setTimeout(() => {
        if (loadingMsg.parentNode) {
          loadingMsg.parentNode.removeChild(loadingMsg);
        }
      }, 1000);
    };
    
    // Assemble the window
    gameContainer.appendChild(loadingMsg);
    gameContainer.appendChild(closeButton);
    gameContainer.appendChild(gameFrame);
    overlay.appendChild(gameContainer);
    
    // Add to DOM
    document.body.appendChild(overlay);
    this.miniGameWindow = overlay;
    
    // Disable main game controls
    if (this.game && this.game.player) {
      this.game.player.canMove = false;
    }
    
    // Pause main game music
    if (window.musicLoader && window.musicLoader.gainNode) {
      this.originalMusicVolume = window.musicLoader.gainNode.gain.value;
      window.musicLoader.gainNode.gain.value = 0;
    }
    
    // Add escape key listener to close game
    this.escapeListener = (e) => {
      if (e.key === 'Escape') {
        this.closeMiniGame();
      }
    };
    document.addEventListener('keydown', this.escapeListener);
  }
  
  closeMiniGame() {
    if (!this.miniGameActive || !this.miniGameWindow) {
      return;
    }
    
    // Remove the mini-game window
    if (this.miniGameWindow.parentNode) {
      this.miniGameWindow.parentNode.removeChild(this.miniGameWindow);
    }
    
    this.miniGameWindow = null;
    this.miniGameActive = false;
    
    // Re-enable main game controls
    if (this.game && this.game.player) {
      this.game.player.canMove = true;
    }
    
    // Restore main game music
    if (window.musicLoader && window.musicLoader.gainNode && this.originalMusicVolume !== undefined) {
      window.musicLoader.gainNode.gain.value = this.originalMusicVolume;
    }
    
    // Remove escape key listener
    if (this.escapeListener) {
      document.removeEventListener('keydown', this.escapeListener);
      this.escapeListener = null;
    }
    
    console.log('Mini-game closed, returning to main experience');
  }
  
  // Enhanced method to create strategy character dialogues with mini-game options
  createStrategyDialogue(strategy) {
    const characterName = strategy.character;
    const strategyName = strategy.name;
    
    return {
      // Initial greeting with game option
      greeting: async () => {
        await this.showNPCDialogue(
          `Hello {playerName}, I'm ${characterName}. I'd love to share my knowledge about ${strategyName} with you.`,
          characterName,
          this.game.getStrategyColor(strategyName).toString(),
          [
            { 
              text: "Tell me about your strategy", 
              callback: () => this.showStrategyInfo(strategy)
            },
            { 
              text: "Let's practice together!", 
              callback: () => this.offerMiniGame(strategy)
            },
            { 
              text: "Not right now, thanks", 
              callback: null 
            }
          ]
        );
      },
      
      // Offer mini-game experience
      offerGame: async () => {
        await this.showNPCDialogue(
          this.getMiniGamePrompt(characterName, strategyName),
          characterName,
          this.game.getStrategyColor(strategyName).toString(),
          [
            { 
              text: "Yes, let's practice!", 
              callback: () => this.launchMiniGame(strategyName, characterName)
            },
            { 
              text: "Tell me more first", 
              callback: () => this.showStrategyInfo(strategy)
            },
            { 
              text: "Maybe later", 
              callback: null 
            }
          ]
        );
      }
    };
  }
  
  offerMiniGame(strategy) {
    const characterName = strategy.character;
    const strategyName = strategy.name;
    
    this.showNPCDialogue(
      this.getMiniGamePrompt(characterName, strategyName),
      characterName,
      this.game.getStrategyColor(strategyName).toString(),
      [
        { 
          text: "Yes, let's practice!", 
          callback: () => this.launchMiniGame(strategyName, characterName)
        },
        { 
          text: "Tell me more about the strategy first", 
          callback: () => this.showStrategyInfo(strategy)
        },
        { 
          text: "Maybe later", 
          callback: null 
        }
      ]
    );
  }
  
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
  
  showStrategyInfo(strategy) {
    const characterName = strategy.character;
    const strategyName = strategy.name;
    
    // Show strategy information with option to play afterwards
    this.showNPCDialogue(
      `${strategy.description}\n\nHistorical Connection: ${strategy.historicalConnection}\n\n${strategy.historicalContext}\n\nImplementation: ${strategy.implementation}`,
      characterName,
      this.game.getStrategyColor(strategyName).toString(),
      [
        { 
          text: "Now let's practice together!", 
          callback: () => this.launchMiniGame(strategyName, characterName)
        },
        { 
          text: "Thank you for the wisdom", 
          callback: null 
        }
      ]
    );
  }

  showDialogueOptions() {
    if (!this.currentDialogueOptions || this.currentDialogueOptions.length === 0) {
      return;
    }
    
    // Reset selected option
    this.selectedOptionIndex = 0;
    
    // Clear any existing options
    this.optionsContainer.innerHTML = '';
    
    // Create each option button
    this.currentDialogueOptions.forEach((option, index) => {
      const button = document.createElement('div');
      button.textContent = option.text;
      button.className = 'dialogue-option';
      button.setAttribute('data-index', index);
      
      // Update styles for horizontal layout
      button.style.width = 'auto';
      button.style.maxWidth = '280px';
      button.style.flex = '0 1 auto'; // Don't stretch, shrink if needed
      button.style.fontSize = '18px';
      button.style.padding = '12px 20px';
      button.style.textAlign = 'center';
      button.style.color = 'white';
      button.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
      button.style.border = '2px solid #4CAF50';
      button.style.borderRadius = '5px';
      button.style.cursor = 'pointer';
      button.style.transition = 'all 0.2s ease';
      button.style.fontFamily = 'Minecraft, monospace';
      
      // Set animation delay
      button.style.setProperty('--delay', index);
      button.style.opacity = '0';
      button.style.animation = 'optionFadeIn 0.3s forwards';
      button.style.animationDelay = `${index * 0.1}s`;
      
      // Make the first option selected by default
      if (index === 0) {
        button.classList.add('selected');
      }
      
      this.optionsContainer.appendChild(button);
    });
    
    // Hide options first to ensure animation works properly on re-display
    this.optionsContainer.style.display = 'none';
    
    // Force a reflow to ensure animation works
    void this.optionsContainer.offsetWidth;
    
    // Show with animation after a small delay
    setTimeout(() => {
      this.optionsContainer.style.display = 'flex';
      this.optionsContainer.style.animation = 'fadeIn 0.5s forwards';
      
      // Reset key debounce to prevent immediate selection
      this.lastKeyPressTime = Date.now();
    }, 200);
  }
  
  hideDialogueOptions() {
    this.optionsContainer.style.animation = 'fadeIn 0.3s reverse forwards';
    setTimeout(() => {
      this.optionsContainer.style.display = 'none';
    }, 300);
    
    this.isWaitingForChoice = false;
  }
  
  advanceDialogue() {
    // Ignore key presses during transitions or too soon after last key press
    if (this.isInDialogueTransition) {
      console.log("In dialogue transition, ignoring key press");
      return;
    }
    
    // Add debouncing to prevent rapid key presses
    const now = Date.now();
    if (now - this.lastKeyPressTime < this.keyDebounceTime) {
      // Too soon after last key press, ignore this one
      console.log("Key debounce active, ignoring key press");
      return;
    }
    this.lastKeyPressTime = now;
    
    // If typing animation is in progress, complete it immediately
    if (this.ui.typingTimeout) {
      console.log("Completing typing animation");
      this.ui.completeTyping();
      return;
    }
    
    // If waiting for dialogue choice, show options with a delay
    if (this.isWaitingForChoice && this.optionsContainer.style.display === 'none') {
      console.log("Showing dialogue options");
      this.isInDialogueTransition = true;
      
      setTimeout(() => {
        this.showDialogueOptions();
        this.isInDialogueTransition = false;
      }, 200);
      return;
    }
    
    // If dialogue is showing, hide it and resolve the promise
    if (this.ui.dialogueBox && this.ui.dialogueBox.style.display === 'block') {
      console.log("Hiding dialogue and resolving promise");
      this.isInDialogueTransition = true;
      
      // Hide dialogue with animation
      this.ui.hideDialogue();
      
      // Resolve after animation completes
      setTimeout(() => {
        if (this.dialogueCompleteResolver) {
          this.dialogueCompleteResolver();
          this.dialogueCompleteResolver = null;
        }
        this.isInDialogueTransition = false;
      }, 350); // Slightly longer than the hide animation
    }
  }
}

// Export for module use
if (typeof module !== 'undefined') {
  module.exports = {
    DialogueSystem
  };
} else {
  // For browser use, add to window
  window.DialogueSystem = DialogueSystem;
}
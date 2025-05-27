// ui.js - Revamped user interface elements for the Happiness Toolkit Game

class GameUI {
    constructor(game) {
      this.game = game;
      this.dialogueBox = null;
      this.dialogueText = null;
      this.dialogueCharacterName = null;
      this.menu = null;
      this.typingTimeout = null;
      this.typingSpeed = 25; // milliseconds per character
      this.createUI();
      this.addGlobalStyles();
    }
  
    addGlobalStyles() {
      // Add global styles for UI elements
      const style = document.createElement('style');
      style.textContent = `
        @keyframes pulse {
          0% { opacity: 0.6; }
          50% { opacity: 1; }
          100% { opacity: 0.6; }
        }
        
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes slideUp {
          from { transform: translateY(20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        
        @keyframes glow {
          0% { box-shadow: 0 0 5px rgba(76,175,80,0.6); }
          50% { box-shadow: 0 0 20px rgba(76,175,80,0.9); }
          100% { box-shadow: 0 0 5px rgba(76,175,80,0.6); }
        }
        
        .minecraft-btn {
          background-color: #4CAF50;
          border: 3px solid #388E3C;
          border-bottom: 6px solid #388E3C;
          color: white;
          font-family: 'Minecraft', monospace;
          padding: 12px 24px;
          font-size: 22px;
          cursor: pointer;
          text-align: center;
          box-shadow: 0 0 15px rgba(76,175,80,0.5);
          transition: all 0.1s ease;
          text-shadow: 2px 2px 0px #388E3C;
        }
        
        .minecraft-btn:hover {
          background-color: #66BB6A;
          box-shadow: 0 0 20px rgba(76,175,80,0.7);
          transform: translateY(-2px);
          animation: glow 2s infinite;
        }
        
        .minecraft-btn:active {
          background-color: #43A047;
          border-bottom: 3px solid #388E3C;
          transform: translateY(3px);
        }
        
        /* Additional styles for dialogue box positioning */
        #dialogue {
          position: fixed !important; 
          bottom: 50px !important;
          left: 50% !important;
          transform: translateX(-50%) !important;
          z-index: 1000 !important;
          max-width: 900px !important;
          width: 85% !important;
        }
        
        /* Mobile-friendly dialogue adjustments */
        @media screen and (max-width: 768px) {
          #dialogue {
            width: 95% !important;
            max-width: 95% !important;
            bottom: 30px !important;
          }
        }
      `;
      document.head.appendChild(style);
    }
  
    createUI() {
       // Check if menu already exists in the DOM to prevent duplication
  if (document.getElementById('menu')) {
    console.log("Menu already exists in DOM, using existing element");
    this.menu = document.getElementById('menu');
    return;
  }

      // Create menu elements with improved styling
      this.menu = document.createElement('div');
      this.menu.id = 'menu';
      this.menu.style.position = 'absolute';
      this.menu.style.width = '100%';
      this.menu.style.height = '100%';
      this.menu.style.background = 'linear-gradient(rgba(0,0,0,0.7), rgba(0,0,0,0.85))';
      this.menu.style.top = '0';
      this.menu.style.left = '0';
      this.menu.style.display = 'flex';
      this.menu.style.flexDirection = 'column';
      this.menu.style.justifyContent = 'center';
      this.menu.style.alignItems = 'center';
      this.menu.style.color = 'white';
      this.menu.style.fontFamily = 'Minecraft, monospace';
      this.menu.style.fontSize = '24px';
      this.menu.style.zIndex = '100';
      document.body.appendChild(this.menu);
      
     // Add event listener for Enter key on the main menu
document.addEventListener('keydown', (event) => {
  if (event.code === 'Enter' && this.menu.style.display === 'flex' && this.game.state === GameState.MAIN_MENU) {
    console.log("Enter key pressed on main menu, starting game...");
    
    // Call startGame method
    this.game.startGame();
    
    // Try to lock the pointer controls explicitly
    if (this.game.controls) {
      console.log("Requesting pointer lock from keydown...");
      this.game.controls.lock();
    }
  }
});
      // Create title with animated effects
      const titleContainer = document.createElement('div');
      titleContainer.style.textAlign = 'center';
      titleContainer.style.marginBottom = '40px';
      titleContainer.style.animation = 'fadeIn 1.5s ease-out';
      
      const title = document.createElement('h1');
      title.textContent = 'My Happiness Toolkit';
      title.style.fontSize = '52px';
      title.style.margin = '0 0 10px 0';
      title.style.fontFamily = 'Minecraft, monospace';
      title.style.textShadow = '0 0 10px rgba(255,255,255,0.5), 3px 3px 0px rgba(0,0,0,0.7)';
      title.style.color = '#FFEB3B';
      
      const titleBorder = document.createElement('div');
      titleBorder.style.width = '200px';
      titleBorder.style.height = '4px';
      titleBorder.style.background = 'linear-gradient(90deg, transparent, #FFEB3B, transparent)';
      titleBorder.style.margin = '0 auto 20px auto';
      
      titleContainer.appendChild(title);
      titleContainer.appendChild(titleBorder);
      this.menu.appendChild(titleContainer);
      
      // Create description with better styling
      const description = document.createElement('div');
      description.style.maxWidth = '700px';
      description.style.textAlign = 'center';
      description.style.marginBottom = '50px';
      description.style.padding = '20px';
      description.style.backgroundColor = 'rgba(0,0,0,0.5)';
      description.style.borderRadius = '10px';
      description.style.border = '2px solid rgba(255,255,255,0.1)';
      description.style.animation = 'fadeIn 1.8s ease-out';
      description.innerHTML = `
        <p>Explore five evidence-based happiness strategies connected to US history.</p>
        <p>Each strategy is linked to a pivotal historical moment that exemplifies its approach.</p>
      `;
      description.style.fontSize = '22px';
      description.style.lineHeight = '1.6';
      this.menu.appendChild(description);
  
      // In ui.js, update the createUI method where the start button is created:
// Create start button with Minecraft styling
const startButton = document.createElement('button');
startButton.textContent = 'Enter the Happiness World';
startButton.className = 'minecraft-btn';
startButton.style.marginBottom = '30px';
startButton.style.animation = 'fadeIn 2s ease-out';
startButton.onclick = (event) => {
  // Prevent default to avoid any browser issues
  event.preventDefault();
  
  // Log that button was clicked
  console.log("Start button clicked, starting game...");
  
  // Call startGame method with a direct reference to ensure proper context
  this.game.startGame();
  
  // Try to lock the pointer controls explicitly
  if (this.game.controls) {
    console.log("Requesting pointer lock...");
    this.game.controls.lock();
  }
};
this.menu.appendChild(startButton);
  
      // Add "Press ENTER to begin" notice with animation
      const enterPrompt = document.createElement('p');
      enterPrompt.textContent = 'Press ENTER to begin';
      enterPrompt.style.fontSize = '20px';
      enterPrompt.style.opacity = '0.9';
      enterPrompt.style.marginTop = '10px';
      enterPrompt.style.animation = 'pulse 1.5s infinite';
      enterPrompt.style.textShadow = '0 0 8px rgba(255,255,255,0.7)';
      enterPrompt.style.letterSpacing = '1px';
      this.menu.appendChild(enterPrompt);
  
      // Create subtitle with improved styling
      const subtitle = document.createElement('p');
      //subtitle.textContent = 'Connecting Well-being Strategies to US History';
      subtitle.textContent =   '                                              ';
      subtitle.style.fontSize = '20px';
      subtitle.style.opacity = '0.8';
      subtitle.style.marginTop = '40px';
      subtitle.style.fontStyle = 'italic';
      subtitle.style.textShadow = '1px 1px 3px rgba(0,0,0,0.5)';
      subtitle.style.animation = 'fadeIn 2.2s ease-out';
      this.menu.appendChild(subtitle);
  
      // Create instructions with improved styling
      const instructions = document.createElement('div');
      instructions.style.position = 'absolute';
      instructions.style.bottom = '30px';
      instructions.style.left = '0';
      instructions.style.right = '0';
      instructions.style.textAlign = 'center';
      instructions.style.padding = '15px';
      instructions.style.backgroundColor = 'rgba(0,0,0,0.7)';
      instructions.style.borderTop = '2px solid rgba(255,255,255,0.1)';
      instructions.style.fontSize = '16px';
      
      // Styled controls display
      instructions.innerHTML = `
        <div style="display: inline-block; margin: 0 10px; font-weight: bold;"><span style="color: #4CAF50;">WASD</span> - Move</div>
        <div style="display: inline-block; margin: 0 10px; font-weight: bold;"><span style="color: #4CAF50;">Mouse</span> - Look around</div>
        <div style="display: inline-block; margin: 0 10px; font-weight: bold;"><span style="color: #4CAF50;">E</span> - Interact</div>
        <div style="display: inline-block; margin: 0 10px; font-weight: bold;"><span style="color: #4CAF50;">ESC</span> - Pause</div>
        <div style="display: inline-block; margin: 0 10px; font-weight: bold;"><span style="color: #4CAF50;">ENTER</span> - Continue dialogue</div>
      `;
      this.menu.appendChild(instructions);
  
      // Create Minecraft-styled dialogue box (hidden by default)
      this.dialogueBox = document.createElement('div');
      this.dialogueBox.id = 'dialogue';
      this.dialogueBox.style.position = 'fixed'; // Changed from 'absolute' to 'fixed'
      this.dialogueBox.style.bottom = '50px';
      this.dialogueBox.style.left = '50%';
      this.dialogueBox.style.transform = 'translateX(-50%)';
      this.dialogueBox.style.width = '85%';
      this.dialogueBox.style.maxWidth = '900px'; // Reduced max width
      this.dialogueBox.style.backgroundColor = 'rgba(0,0,0,0.85)';
      this.dialogueBox.style.color = 'white';
      this.dialogueBox.style.padding = '25px 30px';
      this.dialogueBox.style.borderRadius = '5px';
      this.dialogueBox.style.fontFamily = 'Minecraft, monospace';
      this.dialogueBox.style.fontSize = '18px';
      this.dialogueBox.style.border = '4px solid #555';
      this.dialogueBox.style.boxShadow = '0 0 20px rgba(0,0,0,0.7)';
      this.dialogueBox.style.display = 'none';
      this.dialogueBox.style.zIndex = '1000'; // Increased z-index
      document.body.appendChild(this.dialogueBox);
      
      // Character name header area
      this.dialogueCharacterName = document.createElement('div');
      this.dialogueCharacterName.style.position = 'absolute';
      this.dialogueCharacterName.style.top = '-20px';
      this.dialogueCharacterName.style.left = '20px';
      this.dialogueCharacterName.style.backgroundColor = '#333';
      this.dialogueCharacterName.style.color = 'white';
      this.dialogueCharacterName.style.padding = '5px 15px';
      this.dialogueCharacterName.style.borderRadius = '5px';
      this.dialogueCharacterName.style.border = '2px solid #555';
      this.dialogueCharacterName.style.fontFamily = 'Minecraft, monospace';
      this.dialogueCharacterName.style.fontSize = '16px';
      this.dialogueCharacterName.style.fontWeight = 'bold';
      this.dialogueBox.appendChild(this.dialogueCharacterName);
  
      // Create dialogue text with improved styling
      this.dialogueText = document.createElement('div');
      this.dialogueText.style.margin = '0';
      this.dialogueText.style.lineHeight = '1.6';
      this.dialogueText.style.whiteSpace = 'pre-line';
      this.dialogueText.style.fontFamily = 'Minecraft, monospace';
      this.dialogueText.style.fontSize = '20px';
      this.dialogueText.style.textShadow = '1px 1px 1px rgba(0,0,0,0.5)';
      this.dialogueBox.appendChild(this.dialogueText);
      
      // Add a subtle "Press Enter to continue" prompt
      const dialogueHint = document.createElement('div');
      dialogueHint.style.fontSize = '16px';
      dialogueHint.style.marginTop = '20px';
      dialogueHint.style.textAlign = 'right';
      dialogueHint.style.opacity = '0.7';
      dialogueHint.style.fontStyle = 'italic';
      dialogueHint.style.color = '#AAAAAA';
      dialogueHint.style.animation = 'pulse 1.5s infinite';
      dialogueHint.innerHTML = 'Press <span style="color: #4CAF50; font-weight: bold;">ENTER</span> to continue';
      this.dialogueBox.appendChild(dialogueHint);
    }
  
    showMenu() {
        // Make sure we don't create duplicate menu elements
  if (this.menu && this.menu.style.display === 'flex') {
    console.log("Menu already shown, adjusting visibility only");
    this.menu.style.display = 'flex';
    return;
  }
  
  // Check if menu exists and just needs to be shown
  if (this.menu) {
    this.menu.style.display = 'flex';
    return;
  }
  
    }
  
    hideMenu() {
      this.menu.style.display = 'none';
    }
  
  
showDialogueWithTyping(text, characterName = null, characterColor = null, soundType = 'npcTyping') {
  // Ensure dialogue box is created
  if (!this.dialogueBox) {
    console.warn("Dialogue box doesn't exist yet, creating it now");
    this.createDialogueBox();
  }
  
  // Clear any existing typing animation
  if (this.typingTimeout) {
    clearTimeout(this.typingTimeout);
    this.typingTimeout = null;
  }
  
  // Store the full text for later use when completing typing
  this.fullDialogueText = text;
  
  // Reset any previous hiding animation
  this.isHidingDialogue = false;
  this.dialogueBox.style.animation = '';
  
  // Show the dialogue box immediately
  this.dialogueBox.style.display = 'block';
  this.dialogueBox.style.opacity = '1';
  
  // Set character name if provided
  if (characterName) {
    this.dialogueCharacterName.textContent = characterName;
    this.dialogueCharacterName.style.display = 'block';
    
    // Apply character color if provided
    if (characterColor) {
      this.dialogueCharacterName.style.backgroundColor = characterColor;
      this.dialogueCharacterName.style.borderColor = this.adjustColorBrightness(characterColor, -20);
      this.dialogueCharacterName.style.color = this.getContrastColor(characterColor);
    } else {
      // Default styling
      this.dialogueCharacterName.style.backgroundColor = '#333';
      this.dialogueCharacterName.style.borderColor = '#555';
      this.dialogueCharacterName.style.color = 'white';
    }
  } else {
    this.dialogueCharacterName.style.display = 'none';
  }
  
  // Reset text content
  this.dialogueText.textContent = '';
  if (this.game && this.game.player) {
    this.game.player.canMove = false;
  }
  
  // Start typing animation
  let i = 0;
  
  const typeWriter = () => {
    if (i < text.length) {
      this.dialogueText.textContent += text.charAt(i);
      i++;
      
      // Play typing sound effect for visible characters
      const currentChar = text.charAt(i - 1);
      if (currentChar !== ' ' && currentChar !== '\n' && currentChar !== '\t' && currentChar !== '\r') {
        // Only attempt to play sound effect if musicLoader exists
        try {
          if (window.musicLoader && window.musicLoader.playSoundEffect) {
            window.musicLoader.playSoundEffect(soundType);
          }
        } catch (error) {
          console.warn("Error playing typing sound:", error);
        }
      }
      
      this.typingTimeout = setTimeout(typeWriter, this.typingSpeed);
    }
  };
  
  // Begin the typing animation
  typeWriter();
}

// Add a method to create the dialogue box if it doesn't exist
createDialogueBox() {
  // Create Minecraft-styled dialogue box
  this.dialogueBox = document.createElement('div');
  this.dialogueBox.id = 'dialogue';
  this.dialogueBox.style.position = 'absolute';
  this.dialogueBox.style.bottom = '50px';
  this.dialogueBox.style.left = '50%';
  this.dialogueBox.style.transform = 'translateX(-50%)';
  this.dialogueBox.style.width = '85%';
  this.dialogueBox.style.backgroundColor = 'rgba(0,0,0,0.85)';
  this.dialogueBox.style.color = 'white';
  this.dialogueBox.style.padding = '25px 30px';
  this.dialogueBox.style.borderRadius = '5px';
  this.dialogueBox.style.fontFamily = 'Minecraft, monospace';
  this.dialogueBox.style.fontSize = '18px';
  this.dialogueBox.style.border = '4px solid #555';
  this.dialogueBox.style.boxShadow = '0 0 20px rgba(0,0,0,0.7)';
  this.dialogueBox.style.display = 'none';
  this.dialogueBox.style.zIndex = '100';
  document.body.appendChild(this.dialogueBox);
  
  // Character name header area
  this.dialogueCharacterName = document.createElement('div');
  this.dialogueCharacterName.style.position = 'absolute';
  this.dialogueCharacterName.style.top = '-20px';
  this.dialogueCharacterName.style.left = '20px';
  this.dialogueCharacterName.style.backgroundColor = '#333';
  this.dialogueCharacterName.style.color = 'white';
  this.dialogueCharacterName.style.padding = '5px 15px';
  this.dialogueCharacterName.style.borderRadius = '5px';
  this.dialogueCharacterName.style.border = '2px solid #555';
  this.dialogueCharacterName.style.fontFamily = 'Minecraft, monospace';
  this.dialogueCharacterName.style.fontSize = '16px';
  this.dialogueCharacterName.style.fontWeight = 'bold';
  this.dialogueBox.appendChild(this.dialogueCharacterName);

  // Create dialogue text with improved styling
  this.dialogueText = document.createElement('div');
  this.dialogueText.style.margin = '0';
  this.dialogueText.style.lineHeight = '1.6';
  this.dialogueText.style.whiteSpace = 'pre-line';
  this.dialogueText.style.fontFamily = 'Minecraft, monospace';
  this.dialogueText.style.fontSize = '20px';
  this.dialogueText.style.textShadow = '1px 1px 1px rgba(0,0,0,0.5)';
  this.dialogueBox.appendChild(this.dialogueText);
  
  // Add a subtle "Press Enter to continue" prompt
  const dialogueHint = document.createElement('div');
  dialogueHint.style.fontSize = '16px';
  dialogueHint.style.marginTop = '20px';
  dialogueHint.style.textAlign = 'right';
  dialogueHint.style.opacity = '0.7';
  dialogueHint.style.fontStyle = 'italic';
  dialogueHint.style.color = '#AAAAAA';
  dialogueHint.style.animation = 'pulse 1.5s infinite';
  dialogueHint.innerHTML = 'Press <span style="color: #4CAF50; font-weight: bold;">ENTER</span> to continue';
  this.dialogueBox.appendChild(dialogueHint);
}

// Add a method to create the dialogue box if it doesn't exist
createDialogueBox() {
  // Create Minecraft-styled dialogue box
  this.dialogueBox = document.createElement('div');
  this.dialogueBox.id = 'dialogue';
  this.dialogueBox.style.position = 'absolute';
  this.dialogueBox.style.bottom = '50px';
  this.dialogueBox.style.left = '50%';
  this.dialogueBox.style.transform = 'translateX(-50%)';
  this.dialogueBox.style.width = '85%';
  this.dialogueBox.style.backgroundColor = 'rgba(0,0,0,0.85)';
  this.dialogueBox.style.color = 'white';
  this.dialogueBox.style.padding = '25px 30px';
  this.dialogueBox.style.borderRadius = '5px';
  this.dialogueBox.style.fontFamily = 'Minecraft, monospace';
  this.dialogueBox.style.fontSize = '18px';
  this.dialogueBox.style.border = '4px solid #555';
  this.dialogueBox.style.boxShadow = '0 0 20px rgba(0,0,0,0.7)';
  this.dialogueBox.style.display = 'none';
  this.dialogueBox.style.zIndex = '100';
  document.body.appendChild(this.dialogueBox);
  
  // Character name header area
  this.dialogueCharacterName = document.createElement('div');
  this.dialogueCharacterName.style.position = 'absolute';
  this.dialogueCharacterName.style.top = '-20px';
  this.dialogueCharacterName.style.left = '20px';
  this.dialogueCharacterName.style.backgroundColor = '#333';
  this.dialogueCharacterName.style.color = 'white';
  this.dialogueCharacterName.style.padding = '5px 15px';
  this.dialogueCharacterName.style.borderRadius = '5px';
  this.dialogueCharacterName.style.border = '2px solid #555';
  this.dialogueCharacterName.style.fontFamily = 'Minecraft, monospace';
  this.dialogueCharacterName.style.fontSize = '16px';
  this.dialogueCharacterName.style.fontWeight = 'bold';
  this.dialogueBox.appendChild(this.dialogueCharacterName);

  // Create dialogue text with improved styling
  this.dialogueText = document.createElement('div');
  this.dialogueText.style.margin = '0';
  this.dialogueText.style.lineHeight = '1.6';
  this.dialogueText.style.whiteSpace = 'pre-line';
  this.dialogueText.style.fontFamily = 'Minecraft, monospace';
  this.dialogueText.style.fontSize = '20px';
  this.dialogueText.style.textShadow = '1px 1px 1px rgba(0,0,0,0.5)';
  this.dialogueBox.appendChild(this.dialogueText);
  
  // Add a subtle "Press Enter to continue" prompt
  const dialogueHint = document.createElement('div');
  dialogueHint.style.fontSize = '16px';
  dialogueHint.style.marginTop = '20px';
  dialogueHint.style.textAlign = 'right';
  dialogueHint.style.opacity = '0.7';
  dialogueHint.style.fontStyle = 'italic';
  dialogueHint.style.color = '#AAAAAA';
  dialogueHint.style.animation = 'pulse 1.5s infinite';
  dialogueHint.innerHTML = 'Press <span style="color: #4CAF50; font-weight: bold;">ENTER</span> to continue';
  this.dialogueBox.appendChild(dialogueHint);
}
  
hideDialogue() {
  // Check if dialogueBox exists and not already hiding
  if (!this.dialogueBox || this.isHidingDialogue) {
    return;
  }

  // Set flag to prevent multiple hide operations
  this.isHidingDialogue = true;
  
  // Fade out animation
  this.dialogueBox.style.animation = 'fadeIn 0.3s reverse forwards';
  
  // Actually hide the dialogue after animation completes
  setTimeout(() => {
    if (this.dialogueBox) {
      this.dialogueBox.style.display = 'none';
      this.isHidingDialogue = false;
      
      // Only restore player movement if not in a dialogue sequence
      if (this.game && this.game.player && 
          (!this.game.dialogueSystem || 
           !this.game.dialogueSystem.isWaitingForChoice)) {
        this.game.player.canMove = true;
      }
      
      // Clear the full text reference
      this.fullDialogueText = null;
    }
  }, 300);
  
  // Clear any ongoing typing animation
  if (this.typingTimeout) {
    clearTimeout(this.typingTimeout);
    this.typingTimeout = null;
  }
}
    
    // Helper function to adjust color brightness
    adjustColorBrightness(color, percent) {
      // Convert hex to RGB
      let hex = color;
      if (hex.indexOf('#') === 0) {
        hex = hex.slice(1);
      }
      
      // Convert hex to RGB
      const r = parseInt(hex.slice(0, 2), 16);
      const g = parseInt(hex.slice(2, 4), 16);
      const b = parseInt(hex.slice(4, 6), 16);
      
      // Adjust brightness
      const adjustBrightness = (value) => {
        return Math.min(255, Math.max(0, value + (value * percent / 100)));
      };
      
      // Convert back to hex
      const rr = Math.round(adjustBrightness(r)).toString(16).padStart(2, '0');
      const gg = Math.round(adjustBrightness(g)).toString(16).padStart(2, '0');
      const bb = Math.round(adjustBrightness(b)).toString(16).padStart(2, '0');
      
      return `#${rr}${gg}${bb}`;
    }
    
    // Helper function to get contrast color (black or white)
    getContrastColor(hexColor) {
      // Remove # if present
      const hex = hexColor.replace('#', '');
      
      // Convert hex to RGB
      const r = parseInt(hex.slice(0, 2), 16);
      const g = parseInt(hex.slice(2, 4), 16);
      const b = parseInt(hex.slice(4, 6), 16);
      
      // Calculate perceived brightness using YIQ formula
      const yiq = ((r * 299) + (g * 587) + (b * 114)) / 1000;
      
      // Return black or white based on brightness
      return (yiq >= 128) ? 'black' : 'white';
    }
    
    // Method to skip typing animation and show full text immediately
completeTyping() {
  if (this.typingTimeout) {
    clearTimeout(this.typingTimeout);
    this.typingTimeout = null;
    
    // Display the complete text immediately
    if (this.fullDialogueText) {
      this.dialogueText.textContent = this.fullDialogueText;
    } else if (this.game && this.game.currentStrategy && this.game.currentDialogueIndex > 0) {
      this.dialogueText.textContent = this.game.currentStrategy.dialogues[this.game.currentDialogueIndex - 1];
    }
  }
}

    // Add a reset function for dialogue position
    resetDialoguePosition() {
      if (this.dialogueBox) {
        // Force the correct position styles
        this.dialogueBox.style.position = 'fixed';
        this.dialogueBox.style.bottom = '50px';
        this.dialogueBox.style.left = '50%';
        this.dialogueBox.style.transform = 'translateX(-50%)';
        this.dialogueBox.style.width = '85%';
        this.dialogueBox.style.maxWidth = '900px';
        this.dialogueBox.style.zIndex = '1000';
        
        // Make sure it's properly hidden if it should be
        if (this.dialogueBox.style.display === 'none') {
          this.dialogueBox.style.display = 'none';
        }
      }
    }
  }
  
  // Export for module use
  if (typeof module !== 'undefined') {
    module.exports = {
      GameUI
    };
  } else {
    // For browser use, add to window
    window.GameUI = GameUI;
  }

// Add this code to ensure dialogue positioning works consistently
// Auto-execute after a brief delay to make sure everything is loaded
setTimeout(function() {
  // Find any existing game instance
  if (window.game && window.game.ui) {
    // First reset
    window.game.ui.resetDialoguePosition();
    
    // Set up periodic check
    function ensureDialoguePositioning() {
      if (window.game && window.game.ui && window.game.ui.dialogueBox) {
        window.game.ui.resetDialoguePosition();
      }
      // Call again after a delay
      setTimeout(ensureDialoguePositioning, 2000);
    }
    
    // Start the periodic check
    ensureDialoguePositioning();
  }
}, 1000);
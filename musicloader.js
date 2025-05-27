// musicloader.js - Handle background music and sound effects for Happiness Toolkit Game

class MusicLoader {
  constructor() {
    this.mainMenuMusic = null;
    this.gameplayMusic = [];
    this.currentTrack = null;
    this.isPlaying = false;
    this.gameplayMusicIndex = 0;
    this.volume = 0.5; // Default volume
    this.sfxVolume = 0.3; // Default SFX volume - slightly lower than music
    this.isMuted = false;
    this.previousVolume = this.volume;
    this.audioContext = null;
    this.gainNode = null;
    this.fadeInterval = null;
    
    // Sound effects cache
    this.soundEffects = {};
    
    // Initialize audio
    this.initAudio();
  }
  
  initAudio() {
    try {
      // Create audio context
      window.AudioContext = window.AudioContext || window.webkitAudioContext;
      this.audioContext = new AudioContext();
      
      // Create gain node for volume control
      this.gainNode = this.audioContext.createGain();
      this.gainNode.gain.value = this.volume;
      this.gainNode.connect(this.audioContext.destination);
      
      // Load the main menu music
      this.loadMainMenuMusic();
      
      // Load gameplay music tracks
      this.loadGameplayMusic();
      
      // Load common sound effects
      this.loadSoundEffects();
      
      console.log("Audio system initialized successfully");
    } catch (error) {
      console.error("Error initializing audio system:", error);
    }
  }
  
  // In the loadSoundEffects method of musicloader.js
loadSoundEffects() {
  // Define sound effects to load
  const soundEffectsToLoad = {
    'npcTyping': './textures/sfx/text.wav',
    'playerTyping': './textures/sfx/text2.wav',
    'buttonClick': './textures/sfx/click.ogg',
    'interact': './textures/sfx/interact.ogg'
  };
  
  // Load each sound effect
  for (const [key, path] of Object.entries(soundEffectsToLoad)) {
    this.loadSoundEffect(key, path);
  }
}
  
  loadSoundEffect(name, filePath) {
    this.loadAudioTrack(filePath)
      .then(audioBuffer => {
        this.soundEffects[name] = audioBuffer;
        console.log(`Sound effect loaded: ${name}`);
      })
      .catch(error => {
        console.error(`Error loading sound effect ${name}:`, error);
      });
  }
  
  playSoundEffect(name, volume = null) {
    // Return early if audio is disabled or the effect doesn't exist
    if (this.isMuted || !this.soundEffects[name]) return;
    
    try {
      // Make sure the audio context is running
      if (this.audioContext.state === 'suspended') {
        this.audioContext.resume();
      }
      
      // Create audio source
      const source = this.audioContext.createBufferSource();
      source.buffer = this.soundEffects[name];
      
      // Create a gain node for this specific sound effect
      const effectGain = this.audioContext.createGain();
      effectGain.gain.value = volume !== null ? volume : this.sfxVolume;
      
      // Connect source → effect gain → main output
      source.connect(effectGain);
      effectGain.connect(this.audioContext.destination);
      
      // Play the sound effect
      source.start(0);
      
      // No need to store reference to short sound effects
      // They'll be garbage collected when done playing
    } catch (error) {
      console.warn(`Error playing sound effect ${name}:`, error);
    }
  }
  
  loadMainMenuMusic() {
    const mainMenuMusicPath = './textures/music/theme.mp3';
    
    this.loadAudioTrack(mainMenuMusicPath)
      .then(audioBuffer => {
        this.mainMenuMusic = audioBuffer;
        console.log("Main menu music loaded successfully");
      })
      .catch(error => {
        console.error("Error loading main menu music:", error);
      });
  }
  
  loadGameplayMusic() {
    const gameplayMusicPaths = [
      './textures/music/music1.mp3',
      './textures/music/music2.mp3',
      './textures/music/music3.mp3'
    ];
    
    const loadPromises = gameplayMusicPaths.map(path => {
      return this.loadAudioTrack(path)
        .then(audioBuffer => {
          this.gameplayMusic.push(audioBuffer);
          console.log(`Gameplay music track loaded: ${path}`);
          return audioBuffer;
        })
        .catch(error => {
          console.error(`Error loading gameplay music track ${path}:`, error);
          return null;
        });
    });
    
    Promise.all(loadPromises)
      .then(results => {
        // Filter out any nulls (failed loads)
        this.gameplayMusic = results.filter(buffer => buffer !== null);
        console.log(`Loaded ${this.gameplayMusic.length} gameplay music tracks`);
      });
  }
  
  loadAudioTrack(filePath) {
    return new Promise((resolve, reject) => {
      // Create a network request for the audio file
      const request = new XMLHttpRequest();
      request.open('GET', filePath, true);
      request.responseType = 'arraybuffer';
      
      request.onload = () => {
        // Decode the audio data
        if (request.status === 200) {
          this.audioContext.decodeAudioData(
            request.response,
            buffer => resolve(buffer),
            error => reject(error)
          );
        } else {
          reject(new Error(`Failed to load audio file: ${filePath} (Status: ${request.status})`));
        }
      };
      
      request.onerror = () => {
        reject(new Error(`Network error loading audio file: ${filePath}`));
      };
      
      // Send the request
      request.send();
    });
  }
  
  playMainMenuMusic() {
    if (!this.mainMenuMusic) {
      console.warn("Main menu music not loaded yet");
      // Try loading it again
      this.loadMainMenuMusic();
      return;
    }
    
    // Stop any current music with a fade out
    this.fadeOutAndStop(() => {
      // Start main menu music with fade in
      this.playAudioBuffer(this.mainMenuMusic, true);
      this.fadeIn();
    });
  }
  
  playGameplayMusic() {
    if (this.gameplayMusic.length === 0) {
      console.warn("No gameplay music tracks loaded");
      return;
    }
    
    // Stop current music with a fade out
    this.fadeOutAndStop(() => {
      // Shuffle to a new track
      this.gameplayMusicIndex = Math.floor(Math.random() * this.gameplayMusic.length);
      const nextTrack = this.gameplayMusic[this.gameplayMusicIndex];
      
      // Start gameplay music with fade in
      this.playAudioBuffer(nextTrack, true);
      this.fadeIn();
    });
  }
  
  playNextGameplayTrack() {
    if (this.gameplayMusic.length === 0) {
      console.warn("No gameplay music tracks loaded");
      return;
    }
    
    // Increment index and wrap around if needed
    this.gameplayMusicIndex = (this.gameplayMusicIndex + 1) % this.gameplayMusic.length;
    const nextTrack = this.gameplayMusic[this.gameplayMusicIndex];
    
    // Stop current track with fade out
    this.fadeOutAndStop(() => {
      // Start new track with fade in
      this.playAudioBuffer(nextTrack, true);
      this.fadeIn();
    });
  }
  
  playAudioBuffer(audioBuffer, loop = false) {
    if (!this.audioContext || !audioBuffer) return;
    
    // Make sure the audio context is running (handles autoplay policy)
    if (this.audioContext.state === 'suspended') {
      this.audioContext.resume();
    }
    
    // Create audio source
    const source = this.audioContext.createBufferSource();
    source.buffer = audioBuffer;
    source.loop = loop;
    
    // Connect to gain node
    source.connect(this.gainNode);
    
    // Store the source to be able to stop it later
    this.currentTrack = source;
    
    // Start playback
    source.start(0);
    this.isPlaying = true;
    
    // Handle track end for non-looping tracks
    if (!loop) {
      source.onended = () => {
        this.isPlaying = false;
        this.currentTrack = null;
        // Automatically play next track if in gameplay mode
        if (this.gameplayMusic.includes(audioBuffer)) {
          this.playNextGameplayTrack();
        }
      };
    }
  }
  
  fadeIn(duration = 2000) {
    // Clear any existing fade
    if (this.fadeInterval) {
      clearInterval(this.fadeInterval);
      this.fadeInterval = null;
    }
    
    // Set initial volume to 0
    this.gainNode.gain.value = 0;
    
    // Target volume is the stored volume
    const targetVolume = this.isMuted ? 0 : this.volume;
    const steps = 20;
    const increment = targetVolume / steps;
    const intervalTime = duration / steps;
    
    this.fadeInterval = setInterval(() => {
      if (this.gainNode.gain.value < targetVolume) {
        this.gainNode.gain.value += increment;
      } else {
        clearInterval(this.fadeInterval);
        this.fadeInterval = null;
        this.gainNode.gain.value = targetVolume; // Ensure we hit exactly the target
      }
    }, intervalTime);
  }
  
  fadeOut(duration = 2000) {
    // Clear any existing fade
    if (this.fadeInterval) {
      clearInterval(this.fadeInterval);
      this.fadeInterval = null;
    }
    
    // Start from current volume
    const startVolume = this.gainNode.gain.value;
    const steps = 20;
    const decrement = startVolume / steps;
    const intervalTime = duration / steps;
    
    this.fadeInterval = setInterval(() => {
      if (this.gainNode.gain.value > 0.01) {  // Small threshold to avoid floating point issues
        this.gainNode.gain.value -= decrement;
      } else {
        clearInterval(this.fadeInterval);
        this.fadeInterval = null;
        this.gainNode.gain.value = 0; // Ensure we reach zero
      }
    }, intervalTime);
  }
  
  fadeOutAndStop(callback = null) {
    if (!this.currentTrack || !this.isPlaying) {
      // Nothing is playing, just invoke callback
      if (callback) callback();
      return;
    }
    
    // Fade out current music
    this.fadeOut(1000);
    
    // Stop after fade completes
    setTimeout(() => {
      this.stop();
      if (callback) callback();
    }, 1200); // Slightly longer than fade to ensure it completes
  }
  
  stop() {
    if (this.currentTrack) {
      try {
        this.currentTrack.stop();
      } catch (e) {
        console.warn("Error stopping track:", e);
      }
      this.currentTrack = null;
      this.isPlaying = false;
    }
  }
  
  setVolume(volume) {
    this.volume = Math.max(0, Math.min(1, volume)); // Clamp between 0 and 1
    
    if (!this.isMuted) {
      this.gainNode.gain.value = this.volume;
    }
  }
  
  setSFXVolume(volume) {
    this.sfxVolume = Math.max(0, Math.min(1, volume)); // Clamp between 0 and 1
  }
  
  toggleMute() {
    if (this.isMuted) {
      // Unmute - restore previous volume
      this.isMuted = false;
      this.gainNode.gain.value = this.volume;
    } else {
      // Mute - store current volume and set to 0
      this.isMuted = true;
      this.previousVolume = this.volume;
      this.gainNode.gain.value = 0;
    }
    
    return this.isMuted;
  }
  
  // Update this based on game state
  handleGameStateChange(newState) {
    if (newState === GameState.MAIN_MENU) {
      this.playMainMenuMusic();
    } else {
      this.playGameplayMusic();
    }
  }
}

// Create a global instance
window.musicLoader = new MusicLoader();
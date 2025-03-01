import * as me from 'melonjs';

class VoiceControl {
  constructor() {
    this.player = null;
    this.isListening = false;
    this.recognition = null;
    this.commandHistory = [];  // Keep for logging purposes only
    this.confidenceThreshold = 0.3; // Lower the confidence threshold for more responsive recognition
    this.continuous = true; // Keep listening after processing
    this.maxAlternatives = 3; // Get multiple interpretation alternatives to improve matching chances
    this.restartTimeout = null; // For quick restarts
    
    // Track processed interim results to avoid duplicating commands
    this.lastProcessedText = '';
    
    // Command matching patterns - expanded for better recognition
    this.commands = {
      left: ['left', 'steer left', 'turn left', 'go left', 'move left'],
      right: ['right', 'steer right', 'turn right', 'go right', 'move right'],
      accelerate: ['accelerate', 'speed up', 'faster', 'forward', 'speed', 'go', 'move', 'gas', 'power'],
      brake: ['brake', 'slow', 'slow down', 'stop', 'halt', 'break', 'decelerate'],
      turnback: ['turn back', 'turn around', 'reverse', 'about face', 'one eighty', 'u turn']
    };
    
    // Create minimal UI
    this.createUI();
    
    // Check if speech recognition is supported
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      this.updateStatus('Not Supported');
      console.error('[VoiceControl] Speech recognition not supported in this browser');
    }
  }

  createUI() {
    // Create a simple status element
    this.statusElement = document.createElement('div');
    this.statusElement.id = 'voice-status';
    this.statusElement.style.position = 'absolute';
    this.statusElement.style.top = '10px';
    this.statusElement.style.left = '10px';
    this.statusElement.style.padding = '5px 10px';
    this.statusElement.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
    this.statusElement.style.color = 'white';
    this.statusElement.style.borderRadius = '5px';
    this.statusElement.style.zIndex = '1000';
    this.statusElement.textContent = 'Voice Control: Inactive';
    document.body.appendChild(this.statusElement);

    // Create a command display element with faster transitions
    this.commandDisplayElement = document.createElement('div');
    this.commandDisplayElement.id = 'command-display';
    this.commandDisplayElement.style.position = 'absolute';
    this.commandDisplayElement.style.top = '50%';
    this.commandDisplayElement.style.left = '50%';
    this.commandDisplayElement.style.transform = 'translate(-50%, -50%)';
    this.commandDisplayElement.style.padding = '5px 15px';
    this.commandDisplayElement.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
    this.commandDisplayElement.style.color = 'white';
    this.commandDisplayElement.style.borderRadius = '5px';
    this.commandDisplayElement.style.fontSize = '20px';
    this.commandDisplayElement.style.zIndex = '1000';
    this.commandDisplayElement.style.display = 'none';
    this.commandDisplayElement.style.transition = 'opacity 0.1s ease-out';
    document.body.appendChild(this.commandDisplayElement);

    // Create toggle button
    const toggleButton = document.createElement('button');
    toggleButton.id = 'voice-toggle';
    toggleButton.style.position = 'absolute';
    toggleButton.style.top = '40px';
    toggleButton.style.left = '10px';
    toggleButton.style.padding = '5px 10px';
    toggleButton.style.backgroundColor = '#4CAF50';
    toggleButton.style.color = 'white';
    toggleButton.style.border = 'none';
    toggleButton.style.borderRadius = '5px';
    toggleButton.style.cursor = 'pointer';
    toggleButton.style.zIndex = '1000';
    toggleButton.textContent = 'Start Voice Control';
    toggleButton.addEventListener('click', () => this.toggleVoiceControl());
    document.body.appendChild(toggleButton);
  }

  setPlayer(player) {
    this.player = player;
  }

  toggleVoiceControl() {
    const toggleButton = document.getElementById('voice-toggle');
    if (!this.isListening) {
      toggleButton.textContent = 'Stop Voice Control';
      toggleButton.style.backgroundColor = '#f44336';
      this.startVoiceControl();
    } else {
      toggleButton.textContent = 'Start Voice Control';
      toggleButton.style.backgroundColor = '#4CAF50';
      this.stopVoiceControl();
    }
  }

  startVoiceControl() {
    if (this.isListening) return;
    
    try {
      // Initialize the SpeechRecognition object
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      this.recognition = new SpeechRecognition();
      
      // Configure recognition for maximum responsiveness
      this.recognition.continuous = this.continuous;
      this.recognition.interimResults = true;
      this.recognition.maxAlternatives = this.maxAlternatives;
      this.recognition.lang = 'en-US';
      
      // Event handlers
      this.recognition.onstart = () => {
        console.log('[VoiceControl] Recognition started');
        this.isListening = true;
        this.updateStatus('Listening');
        this.showMessage('Listening', '#4CAF50');
      };
      
      this.recognition.onerror = (event) => {
        console.error(`[VoiceControl] Error: ${event.error}`);
        
        // Restart if error was not due to user abort
        if (event.error !== 'aborted' && this.isListening) {
          console.log('[VoiceControl] Attempting to restart after error');
          
          // Clear any existing timeout
          if (this.restartTimeout) {
            clearTimeout(this.restartTimeout);
          }
          
          // Restart quickly
          this.restartTimeout = setTimeout(() => {
            if (this.isListening) {
              try {
                this.recognition.start();
              } catch (e) {
                console.error('[VoiceControl] Failed to restart recognition:', e);
              }
            }
          }, 100);
        }
        
        this.updateStatus(`Error: ${event.error}`);
      };
      
      this.recognition.onend = () => {
        console.log('[VoiceControl] Recognition ended');
        
        // Restart if this was not a manual stop - more quickly now
        if (this.isListening) {
          console.log('[VoiceControl] Restarting recognition');
          
          // Clear any existing timeout
          if (this.restartTimeout) {
            clearTimeout(this.restartTimeout);
          }
          
          // Restart quickly
          this.restartTimeout = setTimeout(() => {
            if (this.isListening) {
              try {
                this.recognition.start();
              } catch (e) {
                console.error('[VoiceControl] Failed to restart recognition:', e);
                this.isListening = false;
                this.updateStatus('Stopped (Error)');
              }
            }
          }, 10); // Super fast restart
        } else {
          this.updateStatus('Stopped');
        }
      };
      
      this.recognition.onresult = (event) => {
        this.handleSpeechResult(event);
      };
      
      // Start recognition
      this.recognition.start();
      console.log('[VoiceControl] Starting recognition');
      
    } catch (error) {
      console.error('[VoiceControl] Error starting voice control:', error);
      this.updateStatus('Failed to Start');
      this.showMessage('Error Starting Voice Control', '#f44336');
    }
  }
  
  handleSpeechResult(event) {
    // Get the latest result
    const resultIndex = event.results.length - 1;
    
    // Process even interim results with sufficient confidence for responsiveness
    const isInterim = !event.results[resultIndex].isFinal;
    
    // Check all alternatives for the best match
    for (let i = 0; i < event.results[resultIndex].length; i++) {
      const transcript = event.results[resultIndex][i].transcript.trim().toLowerCase();
      const confidence = event.results[resultIndex][i].confidence;
      
      // Avoid duplicate processing of the exact same interim result
      if (isInterim && transcript === this.lastProcessedText) {
        continue;
      }
      
      // Process if confidence is above threshold (lower threshold for interim results)
      const confidenceThreshold = isInterim ? this.confidenceThreshold * 0.7 : this.confidenceThreshold;
      
      if (confidence > confidenceThreshold) {
        console.log(`[VoiceControl] Detected: "${transcript}" (Confidence: ${confidence.toFixed(2)}${isInterim ? ', Interim' : ''})`);
        
        // Match against commands and count repetitions
        const commandWithCount = this.findCommandMatchesWithCount(transcript);
        if (commandWithCount) {
          const { command, count } = commandWithCount;
          
          // Execute command multiple times based on count
          this.executeCommand(command, count);
          
          // Keep track of command history for logging only (limited to 10 entries)
          this.commandHistory.push(`${command} (×${count})`);
          if (this.commandHistory.length > 10) {
            this.commandHistory.shift();
          }
          
          // Save this text to avoid duplicate processing
          if (isInterim) {
            this.lastProcessedText = transcript;
          } else {
            this.lastProcessedText = ''; // Reset for final results
          }
          
          // For interim results, we only want to process the best match
          if (isInterim) break;
        }
      }
    }
    
    // For final results, reset the lastProcessedText
    if (!isInterim) {
      this.lastProcessedText = '';
    }
  }
  
  findCommandMatchesWithCount(transcript) {
    // Check for commands and count repetitions
    for (const [command, phrases] of Object.entries(this.commands)) {
      for (const phrase of phrases) {
        // Start with checking if the phrase exists at all
        if (transcript.includes(phrase)) {
          // Count how many times the phrase appears
          let count = 0;
          let tempTranscript = transcript;
          let boundaryRegex;
          
          // Create a regex that respects word boundaries
          // For single word phrases, use word boundaries
          if (!phrase.includes(' ')) {
            boundaryRegex = new RegExp(`\\b${phrase}\\b`, 'g');
          } else {
            // For multi-word phrases, use the phrase directly
            boundaryRegex = new RegExp(phrase, 'g');
          }
          
          // Count matches
          const matches = tempTranscript.match(boundaryRegex);
          count = matches ? matches.length : 0;
          
          if (count > 0) {
            console.log(`[VoiceControl] Found "${phrase}" ${count} times in "${transcript}"`);
            return { command, count };
          }
        }
      }
    }
    return null;
  }
  
  executeCommand(command, count = 1) {
    if (!this.player) return;
    
    console.log(`[VoiceControl] Executing command: ${command} (${count} times)`);
    
    // Display command with count if more than 1
    if (count > 1) {
      this.showCommandName(`${command} ×${count}`);
    } else {
      this.showCommandName(command);
    }
    
    // Execute the command count times
    for (let i = 0; i < count; i++) {
      switch (command) {
        case 'left':
          this.player.steerLeft();
          break;
        case 'right':
          this.player.steerRight();
          break;
        case 'accelerate':
          this.player.accelerate();
          break;
        case 'brake':
          this.player.brake();
          break;
        case 'turnback':
          this.player.turnBack();
          break;
      }
    }
  }

  stopVoiceControl() {
    if (!this.isListening) return;
    
    // Clear restart timeout if one exists
    if (this.restartTimeout) {
      clearTimeout(this.restartTimeout);
      this.restartTimeout = null;
    }
    
    if (this.recognition) {
      try {
        this.recognition.stop();
        console.log('[VoiceControl] Recognition stopped');
      } catch (e) {
        console.error('[VoiceControl] Error stopping recognition:', e);
      }
    }
    
    this.isListening = false;
    this.updateStatus('Inactive');
    this.showMessage('Voice Control Stopped', '#f44336');
  }

  updateStatus(status) {
    if (this.statusElement) {
      this.statusElement.textContent = `Voice Control: ${status}`;
    }
  }
  
  showMessage(message, color = 'rgba(0, 0, 0, 0.7)') {
    this.commandDisplayElement.textContent = message;
    this.commandDisplayElement.style.backgroundColor = color;
    this.commandDisplayElement.style.display = 'block';
    this.commandDisplayElement.style.opacity = '1';

    setTimeout(() => {
      this.commandDisplayElement.style.opacity = '0';
      setTimeout(() => {
        this.commandDisplayElement.style.display = 'none';
        this.commandDisplayElement.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
      }, 100); // Faster fade out
    }, 300); // Shorter display time
  }

  showCommandName(command) {
    const displayText = command
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, str => str.toUpperCase());
    this.showMessage(displayText);
  }
}

export default VoiceControl;
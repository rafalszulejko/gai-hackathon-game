import * as me from 'melonjs';
import VelocityDisplay from '../entities/VelocityDisplay';
import LaserEntity from '../renderables/laser';
import PowerupEntity from '../renderables/powerup';
import VoiceControl from '../voice-control';

class PlayScreen extends me.Stage {
    /**
     *  action to perform on state change
     */
    onResetEvent() {
        // disable gravity
        me.game.world.gravity.set(0, 0);

        // Initialize score
        this.score = 0;
        this.gameOver = false;

        // register our laser object
        me.pool.register("laser", LaserEntity);
        me.pool.register("powerup", PowerupEntity);

        // load the level
        me.level.load("map");

        // Store reference to player entity
        this.player = me.game.world.getChildByName("mainPlayer")[0];
        
        // Add velocity display in bottom right corner
        // You can customize the position by changing these values
        const x = me.game.viewport.width;  // 200 pixels from right edge
        const y = me.game.viewport.height - 30;  // 80 pixels from bottom
        me.game.world.addChild(new VelocityDisplay(x, y));

        // Add score display
        this.scoreFont = new me.BitmapText(10, me.game.viewport.height - 30, {
            font: "PressStart2P",
            size: 0.5,
            text: "Score: 0"
        });
        this.scoreFont.floating = true;
        me.game.world.addChild(this.scoreFont, 10);

        // Create game over overlay (hidden by default)
        this.gameOverOverlay = new me.Renderable(0, 0, me.game.viewport.width, me.game.viewport.height);
        this.gameOverOverlay.floating = true;
        this.gameOverOverlay.alpha = 0;
        
        // Configure game over text
        this.gameOverFont = new me.BitmapText(me.game.viewport.width / 2, me.game.viewport.height / 2 - 40, {
            font: "PressStart2P",
            size: 1,
            text: "GAME OVER",
            textAlign: "center"
        });
        this.gameOverFont.floating = true;
        this.gameOverFont.pos.x -= this.gameOverFont.width / 2;
        
        // Configure play again text
        this.playAgainFont = new me.BitmapText(me.game.viewport.width / 2, me.game.viewport.height / 2 + 20, {
            font: "PressStart2P",
            size: 0.5,
            text: "Press ENTER to play again",
            textAlign: "center"
        });
        this.playAgainFont.floating = true;
        this.playAgainFont.pos.x -= this.playAgainFont.width / 2;

        // Hide game over elements initially
        this.gameOverFont.alpha = 0;
        this.playAgainFont.alpha = 0;
        
        me.game.world.addChild(this.gameOverOverlay, 10);
        me.game.world.addChild(this.gameOverFont, 11);
        me.game.world.addChild(this.playAgainFont, 11);

        // Bind enter key for restart
        me.input.bindKey(me.input.KEY.ENTER, "restart");

        // Initialize voice control
        this.voiceControl = new VoiceControl();
        this.voiceControl.setPlayer(this.player);

        // Initialize monster spawning
        this.monsterSpawnTimer = 0;
        this.monsterSpawnInterval = 5000; // Spawn a monster every 5 seconds

        // Initialize powerup spawning
        this.powerupSpawnTimer = 0;
        this.powerupSpawnInterval = 8000; // Spawn a powerup every 8 seconds
    }
    
    update(dt) {
        if (this.gameOver) {
            // Only check for restart when game is over
            if (me.input.isKeyPressed("restart")) {
                // Reset game state
                this.resetGame();
                return true;
            }
            return true;
        }

        // Check player health
        if (this.player && this.player.health <= 0 && !this.gameOver) {
            this.triggerGameOver();
            return true;
        }

        // Handle input
        if (this.player) {
            if (me.input.isKeyPressed("left")) {
                this.player.steerLeft();
            }
            if (me.input.isKeyPressed("right")) {
                this.player.steerRight();
            }
            if (me.input.isKeyPressed("up")) {
                this.player.accelerate();
            }
            if (me.input.isKeyPressed("down")) {
                this.player.brake();
            }
            if (me.input.isKeyPressed("turnback")) {
                this.player.turnBack();
            }
        }

        // Update monster spawning
        this.monsterSpawnTimer += dt;
        if (this.monsterSpawnTimer >= this.monsterSpawnInterval) {
            this.spawnMonster();
            this.monsterSpawnTimer = 0;
        }

        // Update powerup spawning
        this.powerupSpawnTimer += dt;
        if (this.powerupSpawnTimer >= this.powerupSpawnInterval) {
            this.spawnPowerup();
            this.powerupSpawnTimer = 0;
        }

        // Update score display
        if (this.scoreFont) {
            this.scoreFont.setText("Score: " + this.score);
        }

        return true;
    }
    
    /**
     * Action to perform when leaving the stage
     */
    onDestroyEvent() {
        // Clean up any resources if needed
        if (this.voiceControl) {
            this.voiceControl.stopVoiceControl();
        }
        
        // Clean up game over elements if they exist
        if (this.gameOverOverlay) {
            me.game.world.removeChild(this.gameOverOverlay);
        }
        if (this.gameOverFont) {
            me.game.world.removeChild(this.gameOverFont);
        }
        if (this.playAgainFont) {
            me.game.world.removeChild(this.playAgainFont);
        }
        if (this.scoreFont) {
            me.game.world.removeChild(this.scoreFont);
        }
        
        // Unbind restart key
        me.input.unbindKey(me.input.KEY.ENTER);
    }

    /**
     * Trigger game over state
     */
    triggerGameOver() {
        this.gameOver = true;
        
        // Fade in overlay and text
        new me.Tween(this.gameOverOverlay)
            .to({ alpha: 0.7 }, 1000)
            .start();
        
        new me.Tween(this.gameOverFont)
            .to({ alpha: 1 }, 1000)
            .start();
        
        new me.Tween(this.playAgainFont)
            .to({ alpha: 1 }, 1000)
            .start();
    }

    /**
     * Increment score when monster is killed
     */
    incrementScore(points = 100) {
        this.score += points;
        // Immediately update score display
        if (this.scoreFont) {
            this.scoreFont.setText("Score: " + this.score);
        }
    }

    /**
     * Spawn a monster at a random position on the map
     */
    spawnMonster() {
        // Define spawn area boundaries (adjust these based on your map)
        const minX = 32;
        const maxX = 448;
        const minY = 32;
        const maxY = 288;

        // Generate random position
        const x = Math.random() * (maxX - minX) + minX;
        const y = Math.random() * (maxY - minY) + minY;

        // Create and add monster to the game world
        const monster = me.pool.pull("monster", x, y, {});
        me.game.world.addChild(monster, 5); // z-order of 5 to appear above background
    }

    /**
     * Spawn a powerup at a random position on the map
     */
    spawnPowerup() {
        // Use same boundaries as monster spawning
        const minX = 32;
        const maxX = 448;
        const minY = 32;
        const maxY = 288;

        // Generate random position
        const x = Math.random() * (maxX - minX) + minX;
        const y = Math.random() * (maxY - minY) + minY;

        // Create and add powerup to the game world
        const powerup = me.pool.pull("powerup", x, y, {});
        me.game.world.addChild(powerup, 5);
    }

    /**
     * Reset the game state
     */
    resetGame() {
        // Remove all existing monsters and powerups
        me.game.world.getChildren().forEach(child => {
            if (child.body && 
                (child.body.collisionType === me.collision.types.ENEMY_OBJECT ||
                 child.body.collisionType === me.collision.types.COLLECTIBLE_OBJECT)) {
                if (child.type !== "laser") { // Keep lasers
                    me.game.world.removeChild(child);
                }
            }
        });

        // Reset game state
        this.gameOver = false;
        this.score = 0;
        
        // Reset player
        if (this.player) {
            this.player.pos.x = 96;  // Initial x position from map
            this.player.pos.y = 232; // Initial y position from map
            this.player.health = 100;
            this.player.force = 0;
            this.player.phi = 0;
            this.player.body.vel.set(0, 0);
        }

        // Reset UI elements
        this.gameOverOverlay.alpha = 0;
        this.gameOverFont.alpha = 0;
        this.playAgainFont.alpha = 0;
        this.scoreFont.setText("Score: 0");

        // Reset timers
        this.monsterSpawnTimer = 0;
        this.powerupSpawnTimer = 0;
    }
}

export default PlayScreen;

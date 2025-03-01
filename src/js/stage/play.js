import * as me from 'melonjs';
import VelocityDisplay from '../entities/VelocityDisplay';
import LaserEntity from '../renderables/laser';
import VoiceControl from '../voice-control';

class PlayScreen extends me.Stage {
    /**
     *  action to perform on state change
     */
    onResetEvent() {
        // disable gravity
        me.game.world.gravity.set(0, 0);

        // register our laser object
        me.pool.register("laser", LaserEntity);

        // load the level
        me.level.load("map");

        // Store reference to player entity
        this.player = me.game.world.getChildByName("mainPlayer")[0];
        
        // Add velocity display in bottom right corner
        // You can customize the position by changing these values
        const x = me.game.viewport.width;  // 200 pixels from right edge
        const y = me.game.viewport.height - 30;  // 80 pixels from bottom
        me.game.world.addChild(new VelocityDisplay(x, y));

        // Initialize voice control
        this.voiceControl = new VoiceControl();
        this.voiceControl.setPlayer(this.player);

        // Initialize monster spawning
        this.monsterSpawnTimer = 0;
        this.monsterSpawnInterval = 5000; // Spawn a monster every 5 seconds
    }
    
    update(dt) {
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
            this.monsterSpawnTimer = 0;
            this.spawnMonster();
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
}

export default PlayScreen;

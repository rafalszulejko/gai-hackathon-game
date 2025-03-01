import * as me from 'melonjs';
import VelocityDisplay from '../entities/VelocityDisplay';
import LaserEntity from '../renderables/laser';

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
        const y = me.game.viewport.height - 10;  // 80 pixels from bottom
        me.game.world.addChild(new VelocityDisplay(x, y));
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
        }
        return true;
    }
    
    /**
     * Action to perform when leaving the stage
     */
    onDestroyEvent() {
        // Clean up any resources if needed
    }
};

export default PlayScreen;

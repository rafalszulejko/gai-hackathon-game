import * as me from 'melonjs';
import VelocityDisplay from '../entities/VelocityDisplay';

class PlayScreen extends me.Stage {
    /**
     *  action to perform on state change
     */
    onResetEvent() {
        // disable gravity
        me.game.world.gravity.set(0, 0);

        // load the level
        me.level.load("map");
        
        // Add velocity display in bottom right corner
        // You can customize the position by changing these values
        const x = me.game.viewport.width;  // 200 pixels from right edge
        const y = me.game.viewport.height - 10;  // 80 pixels from bottom
        me.game.world.addChild(new VelocityDisplay(x, y));
    }
    
    /**
     * Action to perform when leaving the stage
     */
    onDestroyEvent() {
        // Clean up any resources if needed
    }
};

export default PlayScreen;

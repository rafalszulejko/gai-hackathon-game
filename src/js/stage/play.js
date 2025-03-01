import * as me from 'melonjs';

class PlayScreen extends me.Stage {
    /**
     *  action to perform on state change
     */
    onResetEvent() {
        // disable gravity
        me.game.world.gravity.set(0, 0);

        // load the level
        me.level.load("map");
        
        // Add a white background to the game world
    }
    
    /**
     * Action to perform when leaving the stage
     */
    onDestroyEvent() {
        // Clean up any resources if needed
    }
};

export default PlayScreen;

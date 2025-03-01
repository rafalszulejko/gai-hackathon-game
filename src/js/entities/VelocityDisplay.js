import * as me from 'melonjs';

class VelocityDisplay extends me.Renderable {
    constructor(x, y) {
        // Call parent constructor with position and size
        super(x, y, 50, 180); // Increased height to accommodate key states

        // Create font objects for display
        this.font = new me.BitmapText(0, 0, {
            font: "PressStart2P",
            size: 0.5,
            textAlign: "right"
        });

        // Persistent across level change
        this.isPersistent = true;

        // Make it float on top
        this.floating = true;

        this.velocityX = 0;
        this.velocityY = 0;
        this.velocityMag = 0;
        this.phi = 0;
        this.force = 0;
        this.keyStates = {
            up: false,
            down: false,
            left: false,
            right: false
        };
    }

    update(dt) {
        // Get player entity and update velocities if it exists
        const player = me.game.world.getChildByName("mainPlayer")[0];
        if (player) {
            this.velocityX = player.body.vel.x.toFixed(2);
            this.velocityY = player.body.vel.y.toFixed(2);
            // Calculate magnitude using Pythagorean theorem
            this.velocityMag = Math.sqrt(
                Math.pow(player.body.vel.x, 2) + 
                Math.pow(player.body.vel.y, 2)
            ).toFixed(2);
            // Get polar coordinates
            this.phi = ((player.phi * 180 / Math.PI).toFixed(1) + "°"); // Convert to degrees
            this.force = player.force.toFixed(2);
            
            // Update key states
            this.keyStates.up = me.input.isKeyPressed("up");
            this.keyStates.down = me.input.isKeyPressed("down");
            this.keyStates.left = me.input.isKeyPressed("left");
            this.keyStates.right = me.input.isKeyPressed("right");
        }
        return true;
    }

    draw(renderer) {
        // Draw velocity information
        this.font.draw(renderer,
            `Vel X: ${this.velocityX}\nVel Y: ${this.velocityY}\nMag: ${this.velocityMag}\nPhi: ${this.phi}\nForce: ${this.force}\n` +
            `Keys:\n↑: ${this.keyStates.up ? "ON" : "off"}\n↓: ${this.keyStates.down ? "ON" : "off"}\n←: ${this.keyStates.left ? "ON" : "off"}\n→: ${this.keyStates.right ? "ON" : "off"}`,
            this.pos.x,
            this.pos.y
        );
    }
}

export default VelocityDisplay; 
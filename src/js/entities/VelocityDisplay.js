import * as me from 'melonjs';

class VelocityDisplay extends me.Renderable {
    constructor(x, y) {
        // Call parent constructor with position and size
        super(x, y, 50, 100); // Reduced height since we no longer show key states

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
        this.health = 10;
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
            this.phi = ((player.phi * 180 / Math.PI).toFixed(1) + " deg"); // Convert to degrees
            this.force = player.force.toFixed(2);
            this.health = player.health.toFixed(1);
        }
        return true;
    }

    draw(renderer) {
        // Draw velocity information
        this.font.draw(renderer,
            `Health: ${this.health}\nVel X: ${this.velocityX}\nVel Y: ${this.velocityY}\nMag: ${this.velocityMag}\nPhi: ${this.phi}\nForce: ${this.force}`,
            this.pos.x,
            this.pos.y
        );
    }
}

export default VelocityDisplay; 
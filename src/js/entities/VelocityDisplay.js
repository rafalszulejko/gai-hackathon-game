import * as me from 'melonjs';

class VelocityDisplay extends me.Renderable {
    constructor(x, y) {
        // Call parent constructor with position and size
        super(x, y, 50, 80);

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
        }
        return true;
    }

    draw(renderer) {
        // Draw velocity information
        this.font.draw(renderer,
            `Vel X: ${this.velocityX}\nVel Y: ${this.velocityY}\nMag: ${this.velocityMag}`,
            this.pos.x,
            this.pos.y
        );
    }
}

export default VelocityDisplay; 
import * as me from 'melonjs';

class MonsterEntity extends me.Sprite {
    constructor(x, y, settings) {
        // call the constructor with the monster sprite
        super(x, y,
            Object.assign({
                image: "cgalab3",
                framewidth: 16,
                frameheight: 16
            }, settings)
        );

        // Generate random tile ID between 1 and 7
        this.tileId = Math.floor(Math.random() * 7) + 1;
        this.addAnimation("idle", [this.tileId], 150);
        this.setCurrentAnimation("idle");

        // add a physic body
        this.body = new me.Body(this);
        this.body.collisionType = me.collision.types.ENEMY_OBJECT;
        // Add a collision shape
        this.body.addShape(new me.Rect(0, 0, this.width, this.height));
        
        // Set movement properties
        this.body.setMaxVelocity(0.7, 0.7);
        this.body.setFriction(0.1, 0.1);
        this.body.ignoreGravity = true;

        // make sure the monster is always updated
        this.alwaysUpdate = true;
    }

    /**
     * update the monster movement
     */
    update(dt) {
        // Find player entity
        const player = me.game.world.getChildByName("mainPlayer")[0];
        
        if (player) {
            // Calculate vector to player
            const dx = player.pos.x - this.pos.x;
            const dy = player.pos.y - this.pos.y;
            
            // Calculate magnitude of the vector
            const magnitude = Math.sqrt(dx * dx + dy * dy);
            
            if (magnitude > 0) {
                // Normalize and scale the vector to 0.9
                this.body.vel.x = (dx / magnitude) * 0.7;
                this.body.vel.y = (dy / magnitude) * 0.7;
            }
        }

        // check if we moved (an update is required)
        if (this.body.vel.x !== 0 || this.body.vel.y !== 0) {
            super.update(dt);
            return true;
        }
        return super.update(dt);
    }

    /**
     * collision handler
     */
    onCollision(response, other) {
        if (other.body.collisionType === me.collision.types.WORLD_SHAPE) {
            // Collision with walls
            return true;
        } else if (other.body.collisionType === me.collision.types.ENEMY_OBJECT && other.type === "laser") {
            // Collision with laser - monster dies
            me.game.world.removeChild(this);
            // Increment score
            const playScreen = me.state.current();
            if (playScreen && typeof playScreen.incrementScore === "function") {
                playScreen.incrementScore(100);
                console.log("Score incremented:", playScreen.score); // Debug log
            } else {
                console.warn("Could not increment score - PlayScreen not found or incrementScore not available");
            }
            return false;
        } else if (other.body.collisionType === me.collision.types.PLAYER_OBJECT) {
            // Collision with player - decrease player health
            other.health = Math.max(0, other.health - 0.5);
            return false;
        }
        return false;
    }
}

export default MonsterEntity; 
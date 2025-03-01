import * as me from 'melonjs';

class PowerupEntity extends me.Sprite {
    constructor(x, y, settings) {
        // call the constructor
        super(x, y,
            Object.assign({
                image: "cgalab3",
                framewidth: 16,
                frameheight: 16
            }, settings)
        );

        // Set the powerup type randomly (health or instakill)
        this.powerupType = Math.random() < 0.5 ? 'health' : 'instakill';
        
        // Set the tile ID based on powerup type
        const tileId = this.powerupType === 'health' ? 77 : 83;
        
        // Add animation with single frame
        this.addAnimation("idle", [tileId], 150);
        this.setCurrentAnimation("idle");

        // add a physic body with specific settings for powerup
        this.body = new me.Body(this);
        this.body.collisionType = me.collision.types.COLLECTIBLE_OBJECT;
        this.body.setCollisionMask(me.collision.types.PLAYER_OBJECT);
        
        // Add collision shape that matches sprite size
        this.body.addShape(new me.Rect(0, 0, 16, 16));
        
        // make sure the powerup is always updated
        this.alwaysUpdate = true;

        // Set lifespan to 8 seconds
        this.lifespan = 8000; // milliseconds
        this.lifetimer = 0;

        console.log("Powerup created:", this.powerupType, "at", x, y);
    }

    /**
     * Check if player is close enough to collect powerup
     */
    isPlayerInRange(player) {
        // Get centers of both sprites
        const powerupCenterX = this.pos.x + this.width / 2;
        const powerupCenterY = this.pos.y + this.height / 2;
        const playerCenterX = player.pos.x + player.width / 2;
        const playerCenterY = player.pos.y + player.height / 2;

        // Calculate distance between centers
        const dx = powerupCenterX - playerCenterX;
        const dy = powerupCenterY - playerCenterY;
        const distance = Math.sqrt(dx * dx + dy * dy);

        // Collection radius is half the sum of both sprites' widths
        const collectionRadius = (this.width + player.width) / 2;

        return distance <= collectionRadius;
    }

    /**
     * update function
     */
    update(dt) {
        // Update lifespan timer
        this.lifetimer += dt;
        
        // Check for collision with player
        const player = me.game.world.getChildByName("mainPlayer")[0];
        if (player && this.isPlayerInRange(player)) {
            this.applyPowerupEffect(player);
            return false;
        }
        
        // Remove powerup if lifespan is exceeded
        if (this.lifetimer >= this.lifespan) {
            console.log("Powerup expired:", this.powerupType);
            me.game.world.removeChild(this);
            return false;
        }

        return super.update(dt);
    }

    /**
     * Apply powerup effect to player
     */
    applyPowerupEffect(player) {
        console.log("Applying powerup effect:", this.powerupType);
        
        if (this.powerupType === 'health') {
            // Restore player health to max
            player.health = 100;
            console.log("Health restored to:", player.health);
        } else if (this.powerupType === 'instakill') {
            console.log("Activating instakill");
            // Remove all monsters from the game world
            let monstersRemoved = 0;
            me.game.world.getChildren().forEach(child => {
                // Check if it's a monster (instance of MonsterEntity)
                if (child instanceof me.Sprite && 
                    child.body && 
                    child.body.collisionType === me.collision.types.ENEMY_OBJECT && 
                    child.constructor.name === "MonsterEntity") {
                    me.game.world.removeChild(child);
                    monstersRemoved++;
                }
            });
            console.log("Monsters removed:", monstersRemoved);
        }
        
        // Remove the powerup after applying effect
        me.game.world.removeChild(this);
    }

    /**
     * collision handler
     */
    onCollision(response, other) {
        // Always return false to prevent physical collision response
        return false;
    }
}

export default PowerupEntity; 
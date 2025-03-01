import * as me from 'melonjs';

class PlayerEntity extends me.Sprite {
    constructor(x, y, settings) {
        // call the constructor
        super(x, y,
            Object.assign({
                image: "sprites-table-16-16",
                framewidth: 16,
                frameheight: 16
            }, settings)
        );

        // add a physic body
        this.body = new me.Body(this);
        this.body.collisionType = me.collision.types.PLAYER_OBJECT;
        // Add a collision shape
        this.body.addShape(new me.Rect(0, 0, this.width, this.height));
        
        // walking speed
        this.body.setMaxVelocity(1, 1);
        this.body.setFriction(0.00,0.00);
        this.body.ignoreGravity = true;

        // polar coordinate controls
        this.phi = 0; // angle in radians
        this.force = 0; // magnitude of force
        this.maxForce = 1; // maximum force magnitude
        this.forceStep = 0.05; // how much force changes per keypress

        // set the display to follow our position
        me.game.viewport.follow(this, me.game.viewport.AXIS.BOTH);

        // define animations based on sprites
        const baseAnimSpeed = 150; // base animation speed in ms
        this.addAnimation("walk_down", [13, 14, 15], baseAnimSpeed);
        this.addAnimation("walk_right", [29, 30, 31], baseAnimSpeed);
        this.addAnimation("walk_left", [45, 46, 47], baseAnimSpeed);
        this.addAnimation("walk_up", [61, 62, 63], baseAnimSpeed);

        // define inverted animations (same frames, just switch during collision)
        this.addAnimation("walk_down_inverted", [10, 11, 12], baseAnimSpeed);
        this.addAnimation("walk_right_inverted", [26, 27, 28], baseAnimSpeed);
        this.addAnimation("walk_left_inverted", [42, 43, 44], baseAnimSpeed);
        this.addAnimation("walk_up_inverted", [58, 59, 60], baseAnimSpeed);

        // Add idle frames (middle frame of each direction)
        this.addAnimation("idle_down", [14], baseAnimSpeed);
        this.addAnimation("idle_right", [30], baseAnimSpeed);
        this.addAnimation("idle_left", [46], baseAnimSpeed);
        this.addAnimation("idle_up", [62], baseAnimSpeed);
        this.addAnimation("idle_down_inverted", [11], baseAnimSpeed);
        this.addAnimation("idle_right_inverted", [27], baseAnimSpeed);
        this.addAnimation("idle_left_inverted", [43], baseAnimSpeed);
        this.addAnimation("idle_up_inverted", [59], baseAnimSpeed);

        // set default animation
        this.setCurrentAnimation("idle_down");

        // add health property
        this.health = 100;
        
        // track collision state
        this.isInCollision = false;
        this.collisionTimer = 0;
        this.collisionDuration = 50; // duration in milliseconds to show inverted animation

        // Store base animation speed for calculations
        this.baseAnimSpeed = baseAnimSpeed;
    }

    steerLeft() {
        this.phi += -0.3;
    }

    steerRight() {
        this.phi += 0.3;
    }

    accelerate() {
        this.force = Math.min(this.force + this.forceStep, this.maxForce);
    }

    brake() {
        this.force = Math.max(this.force - this.forceStep, 0);
    }

    turnBack() {
        // Add π (180 degrees) to current angle to turn back
        this.phi += Math.PI;
    }

    /**
     * update the player pos
     */
    update(dt) {
        // Natural force decrease when no input
        // this.force = Math.max(this.force - this.forceStep/20, 0);

        // Update collision timer
        if (this.isInCollision) {
            this.collisionTimer += dt;
            if (this.collisionTimer >= this.collisionDuration) {
                this.isInCollision = false;
                this.collisionTimer = 0;
                this.updateAnimation(); // Switch back to normal animation
            }
        }

        // Normalize phi to stay within 0 to 2π
        this.phi = ((this.phi % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);

        // Calculate current velocity angle
        let currentAngle = 0;
        if (this.body.vel.x !== 0 || this.body.vel.y !== 0) {
            currentAngle = Math.atan2(this.body.vel.y, this.body.vel.x);
        }

        // Calculate angle difference and rotate velocity
        const angleDiff = this.phi - currentAngle;
        if (this.body.vel.x === 0 && this.body.vel.y === 0) {
            // If not moving, set velocity in phi direction
            this.body.force.x = this.force * Math.cos(this.phi);
            this.body.force.y = this.force * Math.sin(this.phi);
        } else {
            // Rotate existing velocity to match phi
            const speed = Math.sqrt(this.body.vel.x * this.body.vel.x + this.body.vel.y * this.body.vel.y);
            this.body.vel.x = speed * Math.cos(this.phi);
            this.body.vel.y = speed * Math.sin(this.phi);
            // Apply force in the same direction
            this.body.force.x = this.force * Math.cos(this.phi);
            this.body.force.y = this.force * Math.sin(this.phi);
        }

        // Update animation based on phi instead of velocity angle
        this.updateAnimation();

        // check if we moved (for physics update)
        if (this.body.vel.x !== 0 || this.body.vel.y !== 0) {
            super.update(dt);
            return true;
        }
        return super.update(dt);
    }

    updateAnimation() {
        const suffix = this.isInCollision ? "_inverted" : "";
        
        // Calculate speed for animation
        const speed = Math.sqrt(
            this.body.vel.x * this.body.vel.x + 
            this.body.vel.y * this.body.vel.y
        );

        // Determine if we should use idle or walking animation
        const prefix = speed < 0.1 ? "idle_" : "walk_";

        // Update animation speed based on movement speed
        if (speed >= 0.1) {
            // Scale animation speed inversely with movement speed
            // Faster movement = lower animation duration
            const speedFactor = Math.min(Math.max(speed, 0.5), 1.5);
            const newAnimSpeed = this.baseAnimSpeed / speedFactor;
            
            // Update animation speed for all walking animations
            ["walk_down", "walk_right", "walk_left", "walk_up",
             "walk_down_inverted", "walk_right_inverted", "walk_left_inverted", "walk_up_inverted"
            ].forEach(anim => {
                if (this.anim[anim]) {
                    this.anim[anim].animationspeed = newAnimSpeed;
                }
            });
        }
        
        // Right quadrant (-60° to 60°)
        if (this.phi > -Math.PI/3 && this.phi <= Math.PI/3) {
            if (!this.isCurrentAnimation(prefix + "right" + suffix)) {
                this.setCurrentAnimation(prefix + "right" + suffix);
            }
        }
        // Down quadrant (60° to 120°)
        else if (this.phi > Math.PI/3 && this.phi <= 2*Math.PI/3) {
            if (!this.isCurrentAnimation(prefix + "down" + suffix)) {
                this.setCurrentAnimation(prefix + "down" + suffix);
            }
        }
        // Left quadrant (120° to 240°)
        else if (this.phi > 2*Math.PI/3 && this.phi <= 4*Math.PI/3) {
            if (!this.isCurrentAnimation(prefix + "left" + suffix)) {
                this.setCurrentAnimation(prefix + "left" + suffix);
            }
        }
        // Up quadrant (240° to 300°)
        else {
            if (!this.isCurrentAnimation(prefix + "up" + suffix)) {
                this.setCurrentAnimation(prefix + "up" + suffix);
            }
        }
    }

    /**
     * collision handler
     * (called when colliding with other objects)
     */
    onCollision(response, other) {
        switch (other.body.collisionType) {
            case me.collision.types.WORLD_SHAPE:
                return true;
            case me.collision.types.ENEMY_OBJECT:
                if (other.type === "laser") {
                    this.health = Math.max(0, this.health - 0.05);
                    // Start inverted animation
                    this.isInCollision = true;
                    this.collisionTimer = 0;
                    this.updateAnimation();
                    return false;  // Let the laser pass through but still trigger damage
                }
                return true;  // Solid collision with other enemy objects
            case me.collision.types.COLLECTIBLE_OBJECT:
                // Let powerups handle their own collection logic
                return false;  // No collision response, but trigger collision handling
        }
        return true;
    }
}

export default PlayerEntity;

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
        // Add a collision shape
        this.body.addShape(new me.Rect(0, 0, this.width, this.height));
        
        // walking speed
        this.body.setMaxVelocity(1.5, 1.5);
        this.body.setFriction(0.01,0.01);
        this.body.ignoreGravity = true;

        // polar coordinate controls
        this.phi = 0; // angle in radians
        this.force = 0; // magnitude of force
        this.maxForce = 1; // maximum force magnitude
        this.forceStep = 0.05; // how much force changes per keypress

        // set the display to follow our position
        me.game.viewport.follow(this, me.game.viewport.AXIS.BOTH);

        // define animations based on sprites
        this.addAnimation("walk_down", [13, 14, 15], 200);
        this.addAnimation("walk_right", [29, 30, 31], 200);
        this.addAnimation("walk_left", [45, 46, 47], 200);
        this.addAnimation("walk_up", [61, 62, 63], 200);

        // set default animation
        this.setCurrentAnimation("walk_down");
    }

    steerLeft() {
        this.phi += -0.1;
    }

    steerRight() {
        this.phi += 0.1;
    }

    accelerate() {
        this.force = Math.min(this.force + this.forceStep, this.maxForce);
    }

    brake() {
        this.force = Math.max(this.force - this.forceStep, 0);
    }

    /**
     * update the player pos
     */
    update(dt) {
        // Natural force decrease when no input
        this.force = Math.max(this.force - this.forceStep/20, 0);

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
        // Right quadrant
        if (this.phi > -Math.PI/4 && this.phi <= Math.PI/4) {
            if (!this.isCurrentAnimation("walk_right")) {
                this.setCurrentAnimation("walk_right");
            }
        }
        // Down quadrant
        else if (this.phi > Math.PI/4 && this.phi <= 3*Math.PI/4) {
            if (!this.isCurrentAnimation("walk_down")) {
                this.setCurrentAnimation("walk_down");
            }
        }
        // Left quadrant
        else if (this.phi > 3*Math.PI/4 || this.phi <= -3*Math.PI/4) {
            if (!this.isCurrentAnimation("walk_left")) {
                this.setCurrentAnimation("walk_left");
            }
        }
        // Up quadrant
        else {
            if (!this.isCurrentAnimation("walk_up")) {
                this.setCurrentAnimation("walk_up");
            }
        }

        // check if we moved (for physics update)
        if (this.body.vel.x !== 0 || this.body.vel.y !== 0) {
            super.update(dt);
            return true;
        }
    }

    /**
     * collision handler
     * (called when colliding with other objects)
     */
    onCollision(/*response, other*/) {
        // Make all other objects solid
        return true;
    }
}

export default PlayerEntity;

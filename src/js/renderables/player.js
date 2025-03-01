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
        this.body.setMaxVelocity(2.5, 2.5);
        this.body.setFriction(0.4, 0.4);

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

    /**
     * update the player pos
     */
    update(dt) {
        if (me.input.isKeyPressed("left")) {
            // update the entity velocity
            this.body.force.x = -this.body.maxVel.x;
            if (!this.isCurrentAnimation("walk_left")) {
                this.setCurrentAnimation("walk_left");
            }
        } else if (me.input.isKeyPressed("right")) {
            // update the entity velocity
            this.body.force.x = this.body.maxVel.x;
            if (!this.isCurrentAnimation("walk_right")) {
                this.setCurrentAnimation("walk_right");
            }
        } else {
            this.body.force.x = 0;
        }

        if (me.input.isKeyPressed("up")) {
            // update the entity velocity
            this.body.force.y = -this.body.maxVel.y;
            if (!this.isCurrentAnimation("walk_up") && this.body.vel.x === 0) {
                this.setCurrentAnimation("walk_up");
            }
        } else if (me.input.isKeyPressed("down")) {
            // update the entity velocity
            this.body.force.y = this.body.maxVel.y;
            if (!this.isCurrentAnimation("walk_down") && this.body.vel.x === 0) {
                this.setCurrentAnimation("walk_down");
            }
        } else {
            this.body.force.y = 0;
        }

        // check if we moved
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

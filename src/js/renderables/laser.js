import * as me from 'melonjs';

class LaserEntity extends me.Sprite {
    constructor(x, y, settings) {
        // call the constructor
        super(x, y,
            Object.assign({
                image: "cgalab2",
                framewidth: 16,  // 2x8 pixels wide
                frameheight: 16  // 2x8 pixels high
            }, settings)
        );

        // Define the animation using the provided tile IDs
        this.addAnimation("laser", [20, 31, 42, 53], 150);
        this.body = new me.Body(this);
        this.body.collisionType = me.collision.types.ENEMY_OBJECT;
        // Add collision shape
        this.body.addShape(new me.Rect(0, 0, this.width, this.height));

        // Set the type property for collision checking
        this.type = "laser";

        // Set the animation
        this.setCurrentAnimation("laser");

        // make sure the laser is always visible in the viewport
        this.alwaysUpdate = true;
    }

    /**
     * update the laser animation
     */
    update(dt) {
        // just call the super constructor
        return super.update(dt);
    }
}

export default LaserEntity; 
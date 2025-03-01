import {
    audio,
    loader,
    state,
    device,
    video,
    utils,
    plugin,
    pool,
    input
} from "melonjs";

import "./index.css";

import TitleScreen from "./js/stage/title.js";
import PlayScreen from "./js/stage/play.js";
import PlayerEntity from "./js/renderables/player.js";
import MonsterEntity from "./js/renderables/monster.js";

import DataManifest from "./manifest.js";


device.onReady(() => {

    // initialize the display canvas once the device/browser is ready
    if (!video.init(480, 320, {
        parent: "screen",
        scale: "2",  // Set fixed scaling to 2x
        scaleMethod: "nearest", // Use nearest-neighbor scaling for pixel-perfect rendering
        renderer: video.AUTO,
        subPixel: false // Disable subpixel rendering for pixel-perfect graphics
    })) {
        alert("Your browser does not support HTML5 canvas.");
        return;
    }

    // initialize the debug plugin in development mode.
    if (process.env.NODE_ENV === 'development') {
        import("@melonjs/debug-plugin").then((debugPlugin) => {
            // automatically register the debug panel
            utils.function.defer(plugin.register, this, debugPlugin.DebugPanelPlugin, "debugPanel");
        });
    }

    // Initialize the audio.
    audio.init("mp3,ogg");

    // allow cross-origin for image/texture loading
    loader.setOptions({crossOrigin: "anonymous"});

    // Initialize keyboard controls
    input.bindKey(input.KEY.LEFT, "left");
    input.bindKey(input.KEY.RIGHT, "right");
    input.bindKey(input.KEY.UP, "up");
    input.bindKey(input.KEY.DOWN, "down");
    input.bindKey(input.KEY.SPACE, "turnback");
    
    // set and load all resources.
    loader.preload(DataManifest, function () {
        // set the user defined game stages
        state.set(state.MENU, new TitleScreen());
        state.set(state.PLAY, new PlayScreen());

        // add our player entity in the entity pool
        pool.register("mainPlayer", PlayerEntity);
        pool.register("monster", MonsterEntity);

        // Start the game.
        state.change(state.PLAY);
    });
});

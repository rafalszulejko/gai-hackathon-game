// a melonJS data manifest
const DataManifest = [
    /* Game Maps */
    { name: "map",                          type: "tmx",     src: "data/map/map.tmx" },
    // { name: "cgalab",                       type: "tsx",     src: "data/map/cgalab.tsx" },
    
    /* Tilesets */
    { name: "cgalab",                       type: "image",   src: "data/map/cgalab.png" },
    
    /* Bitmap Text */
    { name: "island-rotated-tiles",         type: "tmx",     src: "data/map/island-1.json" },
    { name: "sprites",                      type: "tsx",     src: "data/map/sprites.json" },
    { name: "sprites-table-16-16",          type: "image",   src: "data/map/sprites-table-16-16.png" },
    
    // Add font for UI if needed
    { name: "PressStart2P",                 type: "image",   src: "./data/fnt/PressStart2P.png" },
    { name: "PressStart2P",                 type: "binary",  src: "./data/fnt/PressStart2P.fnt" }
];

export default DataManifest;

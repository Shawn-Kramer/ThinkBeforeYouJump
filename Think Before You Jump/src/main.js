// Jim Whitehead
// Created: 5/14/2025
// Phaser: 3.70.0
//
// Think Before You Jump
//
// A platformer game where the player starts with 0 jumps and must collect coins
// to gain jumps. The goal is to reach the flag while managing limited jumps.
//

// debug with extreme prejudice
"use strict"

// game config
let config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    backgroundColor: '#4488aa',  // Add a background color to check if canvas is loading
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 300 },
            debug: false
        }
    },
    scene: [Load, ThinkBeforeYouJump]
};

let cursors;
let my = {
    sprite: {}
};

const game = new Phaser.Game(config);
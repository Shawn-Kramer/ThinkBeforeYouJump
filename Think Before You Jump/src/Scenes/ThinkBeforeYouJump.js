class ThinkBeforeYouJump extends Phaser.Scene {
    constructor() {
        super("thinkBeforeYouJumpScene");
        
        // Constants for physics and gameplay
        this.MAX_X_VEL = 300;    // Maximum horizontal velocity
        this.MAX_Y_VEL = 1000;   // Maximum vertical velocity (for fall speed)
        this.ACCELERATION = 1500; // Increased for snappier response
        this.DRAG = 2000;        // Increased for faster deceleration

        this.JUMP_VELOCITY = -500;
        this.SCALE = 2;
        this.jumpsRemaining = 0;
        this.gameWon = false;
    }

    init() {
        // variables and settings
        this.physics.world.gravity.y = 1500;
        this.PARTICLE_VELOCITY = 50;
        
        // Game-specific variables
        this.gameStarted = false;
    }

    create() {
        // Initialize the tilemap
        this.map = this.add.tilemap('level1');

        const tileset = this.map.addTilesetImage('kenny_tilemap_packed', 'tilemap_tiles');
        const backgroundTileset = this.map.addTilesetImage('tilemap-backgrounds_packed', 'background_tiles');

        // Create layers using the correct tilesets
        this.backgroundLayer = this.map.createLayer('BackgroundLayer', [backgroundTileset]);
        this.frontBgLayer = this.map.createLayer('FrontBackgroundLayer', [tileset]);
        this.collisionLayer = this.map.createLayer('CollisionLayer', [tileset]);
        
        // Set up collision for the collision layer
        this.collisionLayer.setCollisionByProperty({ collides: true });

        // Create player avatar with adjusted collision box
        my.sprite.player = this.physics.add.sprite(75, 225, "platformer_characters", "tile_0000.png");
        my.sprite.player.setCollideWorldBounds(true);


        const tileWidth = tileset.tileWidth;
        const tileHeight = tileset.tileHeight;
        const tilesPerRow = tileset.imageWidth / tileWidth;


        // Create coins and flag from Objects layer in tilemap
        this.coins = this.map.createFromObjects("Object Layer", {
            name: "jump coin",
            key: "tilemap_sheet",
            frame: 151
        });
        this.physics.world.enable(this.coins, Phaser.Physics.Arcade.STATIC_BODY);
        this.coinGroup = this.add.group(this.coins);

        this.flag = this.map.createFromObjects("Object Layer", {
            name: "flag",
            key: "tilemap_sheet",
            frame: 112
        });
        this.physics.world.enable(this.flag, Phaser.Physics.Arcade.STATIC_BODY);
        this.flagGroup = this.add.group(this.flag);
        
        this.physics.add.collider(my.sprite.player, this.collisionLayer);

        this.coinParticles = this.add.particles(0, 0, 'tilemap_sheet', {
            frame: 151, 
            lifespan: 800,
            speed: { min: 100, max: 200 },
            scale: { start: 0.6, end: 0 },
            rotate: { start: 0, end: 360 },
            gravityY: 100,
            emitting: false, 
            quantity: 15,
            tint: [0xFFD700, 0xFFC000] 
        });

        // Horizontal movement particles
        this.movementParticles = this.add.particles(0, 0, 'tilemap_sheet', {
            frame: 16, 
            lifespan: 300,
            speed: { min: 30, max: 80 },
            scale: { start: 0.3, end: 0 },
            alpha: { start: 0.6, end: 0 },
            gravityY: 50,
            emitting: false,
            quantity: 3,
        });

        // Jump particles
        this.jumpParticles = this.add.particles(0, 0, 'tilemap_sheet', {
            frame: 16,
            lifespan: 500,
            speed: { min: 50, max: 120 },
            scale: { start: 0.4, end: 0 },
            alpha: { start: 0.8, end: 0 },
            emitting: false,
            quantity: 8,
            tint: 0x00FFFF
        });

        // Coin collision handler
        this.physics.add.overlap(my.sprite.player, this.coins, (obj1, obj2) => {
            const coinX = obj2.x;
            const coinY = obj2.y;
            
            this.jumpsRemaining++;
            obj2.destroy();
            
            this.coinParticles.setPosition(coinX, coinY);
            this.coinParticles.explode();
        });

        // Flag collision handler
        this.physics.add.overlap(my.sprite.player, this.flagGroup, (player, flag) => {
            this.showWinScreen();
        });

        this.jumpsText = this.add.text(20, 20, `Jumps: ${this.jumpsRemaining}`, {
            fontSize: '24px',
            fill: '#ffffff',
            stroke: '#000000',
            strokeThickness: 2
        }).setScrollFactor(0);

        this.instructionText = this.add.text(20, 50, 'Collect coins to gain jumps!', {
            fontSize: '16px',
            fill: '#ffffff',
            stroke: '#000000',
            strokeThickness: 2
        }).setScrollFactor(0);

        // Input setup
        cursors = this.input.keyboard.createCursorKeys();
        this.rKey = this.input.keyboard.addKey('R');


        // Camera setup
        this.cameras.main.setBounds(0, 0, this.map.widthInPixels, this.map.heightInPixels);
        this.cameras.main.startFollow(my.sprite.player, true, 0.25, 0.25);
        this.cameras.main.setDeadzone(50, 50);
        this.cameras.main.setZoom(this.SCALE);
    }

    update() {
        if (this.gameWon) {
            return; 
        }
        this.jumpsText.setText(`Jumps: ${this.jumpsRemaining}`);

        // Horizontal movement
        if (cursors.left.isDown) {
            if (my.sprite.player.body.velocity.x > -this.MAX_X_VEL) {
                my.sprite.player.setAccelerationX(-this.ACCELERATION);
            } else {
                my.sprite.player.setVelocityX(-this.MAX_X_VEL);
                my.sprite.player.setAccelerationX(0);
            }
            my.sprite.player.resetFlip();
            my.sprite.player.anims.play('walk', true);
            
            if (my.sprite.player.body.blocked.down) {
                this.movementParticles.setPosition(
                    my.sprite.player.x + 8, 
                    my.sprite.player.y + 8
                );
                this.movementParticles.emitParticle();
            }
        } else if (cursors.right.isDown) {
            if (my.sprite.player.body.velocity.x < this.MAX_X_VEL) {
                my.sprite.player.setAccelerationX(this.ACCELERATION);
            } else {
                my.sprite.player.setVelocityX(this.MAX_X_VEL);
                my.sprite.player.setAccelerationX(0);
            }
            my.sprite.player.setFlip(true, false);
            my.sprite.player.anims.play('walk', true);
            
            if (my.sprite.player.body.blocked.down) {
                this.movementParticles.setPosition(
                    my.sprite.player.x - 8, 
                    my.sprite.player.y + 8
                );
                this.movementParticles.emitParticle();
            }
        } else {
            my.sprite.player.setAccelerationX(0);
            my.sprite.player.setDragX(this.DRAG);
            my.sprite.player.anims.play('idle');
        }

        // Jumping
        if (!my.sprite.player.body.blocked.down) {
            my.sprite.player.anims.play('jump');
        }
        
        if (my.sprite.player.body.blocked.down && Phaser.Input.Keyboard.JustDown(cursors.up)) {
            if (this.jumpsRemaining > 0) {
                my.sprite.player.body.setVelocityY(this.JUMP_VELOCITY);
                this.jumpsRemaining--;
                
                this.jumpParticles.setPosition(my.sprite.player.x, my.sprite.player.y + 8);
                this.jumpParticles.explode();
                
                console.log("Jump! Remaining:", this.jumpsRemaining);
            }
        }

        if (my.sprite.player.body.velocity.y > this.MAX_Y_VEL) {
            my.sprite.player.setVelocityY(this.MAX_Y_VEL);
        }

        // Restart game
        if (Phaser.Input.Keyboard.JustDown(this.rKey)) {
            this.jumpsRemaining = 0;
            this.scene.restart();
        }
    }

    showWinScreen() {
        // Create win screen
        const winBackground = this.add.rectangle(
            this.cameras.main.centerX, 
            this.cameras.main.centerY, 
            400, 200, 
            0x000000, 0.8
        ).setScrollFactor(0);

        const winText = this.add.text(
            this.cameras.main.centerX, 
            this.cameras.main.centerY - 30, 
            'Level Complete!', {
                fontSize: '32px',
                fill: '#00ff00',
                stroke: '#000000',
                strokeThickness: 3
            }
        ).setOrigin(0.5).setScrollFactor(0);

        const restartText = this.add.text(
            this.cameras.main.centerX, 
            this.cameras.main.centerY + 20, 
            'Press R to restart', {
                fontSize: '18px',
                fill: '#ffffff',
                stroke: '#000000',
                strokeThickness: 2
            }
        ).setOrigin(0.5).setScrollFactor(0);
    }
}
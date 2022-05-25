const bootSceneConfig = {
    key: 'start',
    active: true,
    preload: bootpreload,
    create: bootcreate
};

const levelSceneConfig = {
    key: 'level',
    active: false,
    visible: false,
    preload: preload,
    create: create,
    update: update,
}

const config = {
    width: 800,
    height: 600,
    type: Phaser.AUTO,
    physics: {
        default: 'arcade',
        arcade: {
            gravity: {y: 300},
            debug: true
        }
    },
    scene: [bootSceneConfig, levelSceneConfig]
};

const game = new Phaser.Game(config);

// start screen
function bootpreload() {
    this.load.image('bg', 'https://xasty.xyz/assets/images/background.png');
    this.load.atlas('player', 'https://xasty.xyz/assets/images/kenney_player.png', 'https://xasty.xyz/assets/images/kenney_player_atlas.json');
}

let click2play, welcome, starttime;

function bootcreate() {
    const bgImage = this.add.image(0, 0, 'bg').setOrigin(0, 0);
    const character = this.add.image(200, 80, 'player').setOrigin(0, 0).setScale(4);
    welcome = this.add.text(16, 16, 'Welcome to the Game!', { fontSize: '64px', fill: '#000' });
    click2play = this.add.text(216, 600 - 64, 'Click to play!', { fontSize: '48px', fill: '#000' });
    this.input.on('pointerdown', (pointer) => {
        this.scene.start('level');
        starttime = this.time.now;
    }, this);
}

// level
function preload() {
    this.load.image('spike', 'https://xasty.xyz/assets/images/spike.png');
    this.load.image('diamond', 'https://xasty.xyz/assets/images/diamond.png');
    this.load.image('redblock', 'https://xasty.xyz/assets/images/redblock.png');
    this.load.spritesheet('redbutton', 'https://xasty.xyz/assets/images/redbutton.png', {frameWidth: 64, frameHeight: 33});
    this.load.image('tiles', 'https://xasty.xyz/assets/tilesets/platformPack_tilesheet.png');
    this.load.tilemapTiledJSON('map', 'https://xasty.xyz/assets/tilemaps/level1.json')
}

let score=0, time;

function create() {
    const bgImage = this.add.image(0, 0, 'bg').setOrigin(0, 0);
    bgImage.setScale(2, 2);

    //tilemap
    const map = this.make.tilemap({ key: 'map' });
    const tileset = map.addTilesetImage('kenny_simple_platformer', 'tiles'); // first param is the Tiled Tileset name!!
    const platforms = map.createLayer('Platforms', tileset, 0, 200);
    platforms.setCollisionByExclusion(-1, true);

    //player
    this.player = this.physics.add.sprite(50, 1200, 'player');
    this.player.body.setSize(this.player.width - 30, this.player.height - 30).setOffset(15, 30)
    this.player.setBounce(0);
    this.physics.add.collider(this.player, platforms);
    //animations
    this.anims.create({
      key: 'walk',
      frames: this.anims.generateFrameNames('player', {
        prefix: 'robo_player_',
        start: 2,
        end: 3,
      }),
      frameRate: 10,
      repeat: -1
    });
    this.anims.create({
      key: 'idle',
      frames: [{ key: 'player', frame: 'robo_player_0' }],
      frameRate: 10,
    });
    this.anims.create({
      key: 'jump',
      frames: [{ key: 'player', frame: 'robo_player_1' }],
      frameRate: 10,
    });

    //enable cursor
    this.cursors = this.input.keyboard.createCursorKeys();

    //spikes
    // Create a sprite group for all spikes, set common properties to ensure that
    // sprites in the group don't move via gravity or by player collisions
    this.spikes = this.physics.add.group({
        allowGravity: false,
        immovable: true
    });
    // Let's get the spike objects, these are NOT sprites
    // We'll create spikes in our sprite group for each object in our map
    map.getObjectLayer('Spikes').objects.forEach((spike) => {
        // Add new spikes to our sprite group
        const spikeSprite = this.spikes.create(spike.x, spike.y + 200 - spike.height, 'spike').setOrigin(0);
        spikeSprite.body.setSize(spike.width, spike.height - 30).setOffset(0, 30);
    });
    this.physics.add.collider(this.player, this.spikes, (player, spike) => {
          score = setScore(score, -50, this);
          //this.score.setText('Score: ' + score);
          player.setVelocity(0, 0);
          player.setX(50);
          player.setY(1200);
          player.play('idle', true);
          player.setAlpha(0);
          let tw = this.tweens.add({
            targets: player,
            alpha: 1,
            duration: 100,
            ease: 'Linear',
            repeat: 5,
          });
    }, null, this);

    //diamonds
    this.diamonds = this.physics.add.group({
        allowGravity: false,
        immovable: true
    });
    map.getObjectLayer('Diamonds').objects.forEach((diamond) => {
        // Add new spikes to our sprite group
        const diamondSprite = this.diamonds.create(diamond.x + 10, diamond.y + 200 - diamond.height + 16, 'diamond').setOrigin(0);
        diamondSprite.body.setSize(diamond.width - 29, diamond.height - 36).setOffset(0);
    });
    this.physics.add.overlap(this.player, this.diamonds, (player, diamond) => {
        score = setScore(score, 10, this);
        //score += 10;
        //this.score.setText('Score: ' + score);
        diamond.disableBody(true, true);
    }, null, this);

    //redblocks
    const redblocks = this.physics.add.group({
        allowGravity: false,
        immovable: true,
    });
    map.getObjectLayer('RedBoxes').objects.forEach((rb) => {
        redblocks.create(rb.x + 32, rb.y + 200-32, 'redblock').setOffset(0);
    });
    this.physics.add.collider(this.player, redblocks);

    //redbutton
    const redbutton = this.physics.add.group({
        allowGravity: false,
        immovable: true,
    });
    map.getObjectLayer('RedButton').objects.forEach((rb) => {
        const rbs = redbutton.create(rb.x + 32, rb.y + 200-16, 'redbutton').setOffset(0);
        rbs.body.setSize(rb.width, rb.height - 50).setOffset(0, 18);
    });
    this.physics.add.collider(this.player, redbutton, (player, button) => {
        button.anims.play('pressed');
        redblocks.children.entries.forEach((i) => {
            i.disableBody(true,true);
        });

    }, null, this);
    this.anims.create({
        key: 'pressed',
        frames: [ { key: 'redbutton', frame: 1 } ],
        frameRate: 20,
    });

    //camera
    this.cameras.main.startFollow(this.player);
    this.cameras.main.setBounds(0, 0, map.widthInPixels, map.heightInPixels + 200);
    this.cameras.main.setViewport(0, 0, 800, 600);

    //score
    this.score = this.add.text(16, 16, 'Score: 0', { fontSize: '32px', fill: '#000' });
    this.score.setScrollFactor(0, 0);
    time = this.add.text(16, 38, 'Time: 0', { fontSize: '32px', fill: '#000' });
    time.setScrollFactor(0, 0);

    this.keys = this.input.keyboard.addKeys("R");

}

function update() {
// Control the player with left or right keys
    if (this.cursors.left.isDown) {
        if (this.cursors.shift.isDown && this.player.body.onFloor()) {
            this.player.setVelocityX(-300);
        } else {
            this.player.setVelocityX(-200);
        }
      if (this.player.body.onFloor()) {
        this.player.play('walk', true);
      }
    } else if (this.cursors.right.isDown) {
        if (this.cursors.shift.isDown && this.player.body.onFloor()) {
            this.player.setVelocityX(300);
        } else {
            this.player.setVelocityX(200);
        }
      if (this.player.body.onFloor()) {
        this.player.play('walk', true);
      }
    } else {
      // If no keys are pressed, the player keeps still
      this.player.setVelocityX(0);
      // Only show the idle animation if the player is footed
      // If this is not included, the player would look idle while jumping
      if (this.player.body.onFloor()) {
        this.player.play('idle', true);
      }
    }
    // Player can jump while walking any direction by pressing the space bar
    // or the 'UP' arrow
    if ((this.cursors.space.isDown || this.cursors.up.isDown) && this.player.body.onFloor() && !this.cursors.down.isDown) {
      this.player.setVelocityY(-350);
      this.player.play('jump', true);
    }
    // Player can drop fast while in air when pressing 'DOWN' arrow
    if (this.cursors.down.isDown && !this.player.body.onFloor()) {
        this.player.setVelocityY(400);
    }
    if (this.player.body.velocity.x > 0) {
        this.player.setFlipX(false);
    } else if (this.player.body.velocity.x < 0) {
        // otherwise, make them face the other side
        this.player.setFlipX(true);
    }

    if (this.keys.R.isDown) {
        this.scene.restart();
        starttime = this.time.now;
        score = 0;
    }


  time.setText('Time: ' + createTime(this.time.now - starttime));
}

/* my original time function
function createTimeold(time) {
    let minutes = parseInt(time / 60000);
    let seconds = time - (minutes * 60000);
    return (minutes <= 9 ? '0' + minutes : minutes) +
    ':' +
    (seconds < 1000 ? '00' : seconds < 10000 ? '0' + seconds.toString().substring(0, 1) : seconds.toString().substring(0, 2));
}
*/

// andres time function <3
function createTime(time) {
    let seconds = parseInt((time / 1000) % 60);
    let minutes = parseInt(time / 60000);
    return (minutes <= 9 ? '0' : '') + minutes + ':' +
           (seconds <= 9 ? '0' : '') + seconds;
}


function setScore(score, addition, that) {
    that.score.setText('Score: ' + (score + addition));
    return score + addition;
}

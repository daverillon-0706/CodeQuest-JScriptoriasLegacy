import Bug from "./Bug";

export default class BugManager {
  constructor(scene) {
    this.scene = scene;
    this.bugs = [];
    this.maxBugs = 6; // cap
    this.spawnRadius = 20; // in tiles
    this.TILE_SIZE = scene.TILE_SIZE;
  }

  update(time, delta) {
    // Remove dead bugs
    this.bugs = this.bugs.filter(bug => bug.active);

    // If no bugs, spawn new batch
    if (this.bugs.length === 0) {
      this.spawnNearPlayer();
    }
  }

  addBug(bug) {
    this.bugs.push(bug);
  }

  spawnNearPlayer() {
    const playerTileX = Math.floor(this.scene.player.x / this.TILE_SIZE);
    const playerTileY = Math.floor(this.scene.player.y / this.TILE_SIZE);

    const grasswalkTileset = this.scene.map.tilesets.find(ts => ts.name === "grasswalk");
    if (!grasswalkTileset) return;

    const firstGid = grasswalkTileset.firstgid;
    const lastGid  = firstGid + grasswalkTileset.total - 1;

    let spawned = 0;

    while (spawned < this.maxBugs) {
      // Random offset in tile space
      const offsetX = Math.floor((Math.random() - 0.5) * 2 * this.spawnRadius);
      const offsetY = Math.floor((Math.random() - 0.5) * 2 * this.spawnRadius);

      const x = playerTileX + offsetX;
      const y = playerTileY + offsetY;

      const tile = this.scene.groundLayer.getTileAt(x, y);
      if (!tile) continue;
      if (tile.index < firstGid || tile.index > lastGid) continue;

      const worldX = x * this.TILE_SIZE;
      const worldY = (y + 1) * this.TILE_SIZE;

      // Pick random bug type
      const rand = Math.random();
      let key, typeData;

      if(rand < 0.25){ key='golem'; typeData={dmg:2, detectRange:2, errorCode:'SyntaxError: Unexpected token'}; }
      else if(rand < 0.5){ key='wisp'; typeData={dmg:1, detectRange:5, errorCode:'ReferenceError: undefined'}; }
      else if(rand < 0.75){ key='slime'; typeData={dmg:2, detectRange:7, errorCode:'RangeError: out of range'}; }
      else { key='mimic'; typeData={dmg:1, detectRange:2, errorCode:'TypeError: cannot read property'}; }

      const bug = new Bug(this.scene, worldX, worldY, key, typeData)
        .setOrigin(0,1);

      this.scene.anims.create({ 
        key: `${key}-idle`, 
        frames: this.scene.anims.generateFrameNumbers(key, { start:0, end:1 }),
        frameRate: 2,
        repeat: -1
      });
      bug.play(`${key}-idle`);

      this.addBug(bug);
      spawned++;
    }
  }
  updateHover(pointer) {
  // Optional: highlight bugs under the cursor
  const worldX = pointer.worldX;
  const worldY = pointer.worldY;

  this.bugs.forEach(bug => {
    const dist = Phaser.Math.Distance.Between(worldX, worldY, bug.x, bug.y);
    if(dist < this.TILE_SIZE) bug.setTint(0x00ff00);
    else bug.clearTint();
  });
}

tryLockOn(pointer) {
  const worldX = pointer.worldX;
  const worldY = pointer.worldY;

  const bug = this.bugs.find(b => {
    const dist = Phaser.Math.Distance.Between(worldX, worldY, b.x, b.y);
    return dist < this.TILE_SIZE;
  });

  if(bug) {
    this.lockedBug = bug;
    console.log("Locked on:", bug.texture.key);
  } else {
    this.lockedBug = null;
  }
}

}

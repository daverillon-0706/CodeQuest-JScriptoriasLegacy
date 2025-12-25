// src/utils/SceneTransitions.js
import Phaser from "phaser";

export function setupSceneTriggers(scene, map, player, fadeDuration = 400) {
  const layer = map.getObjectLayer("door objects");
  if (!layer) return null;

  const triggers = [];

  layer.objects.forEach(obj => {
    const zone = scene.add.zone(
      obj.x,
      obj.y,
      obj.width,
      obj.height
    ).setOrigin(0, 0);

    scene.physics.world.enable(zone);
    zone.body.setAllowGravity(false);
    zone.body.setImmovable(true);

    // 🔑 Expand zone downward slightly to meet player feet
    zone.body.setSize(obj.width, obj.height + scene.TILE_SIZE);
    zone.body.setOffset(0, 0);

    zone.targetScene = obj.properties?.find(p => p.name === "targetScene")?.value;
    zone.spawn = obj.properties?.find(p => p.name === "spawn")?.value;

    if (zone.targetScene) triggers.push(zone);
  });

  return {
    getNearbyTrigger() {
      return triggers.find(t =>
        Phaser.Geom.Intersects.RectangleToRectangle(
          player.body,   // ✅ IMPORTANT
          t.body
        )
      );
    },

    activateTrigger(trigger, payload = {}) {
      if (scene.transitioning) return;
      scene.transitioning = true;

      scene.cameras.main.fadeOut(fadeDuration, 0, 0, 0);
      scene.cameras.main.once("camerafadeoutcomplete", () => {
        scene.scene.start(trigger.targetScene, {
          ...payload,
          spawn: trigger.spawn
        });
      });
    }
  };
}


// ---- Helpers ----
function cleanString(value) {
  if (typeof value !== "string") return value;
  return value.replace(/^"(.*)"$/, "$1");
}

import Phaser from 'phaser';

type TextureGraphicsOptions = Phaser.Types.GameObjects.Graphics.Options & { add: false };

export function makeTextureGraphics(scene: Phaser.Scene): Phaser.GameObjects.Graphics {
  const options: TextureGraphicsOptions = { x: 0, y: 0, add: false };
  return scene.make.graphics(options);
}

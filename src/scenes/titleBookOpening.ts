import Phaser from 'phaser';

type Point = { x: number; y: number };

type TitleBookOpeningOptions = {
  width: number;
  height: number;
  content: Phaser.GameObjects.Container;
  onComplete: () => void;
};

export function playTitleBookOpening(
  scene: Phaser.Scene,
  { width, height, content, onComplete }: TitleBookOpeningOptions,
): void {
  const dimmer = scene.add.rectangle(0, 0, width, height, 0x05030a, 0.82)
    .setOrigin(0)
    .setDepth(998);
  const blocker = scene.add.rectangle(0, 0, width, height, 0x000000, 0)
    .setOrigin(0)
    .setDepth(1001)
    .setInteractive();
  const book = scene.add.graphics().setDepth(999);
  const state = { progress: 0 };

  content.setAlpha(0);

  const draw = () => {
    const p = smooth(state.progress);
    
    content.setAlpha(Phaser.Math.Clamp((p - 0.4) / 0.48, 0, 1));
    dimmer.setAlpha(Phaser.Math.Linear(0.82, 0.08, p));

    book.clear();

    // Setup shared 3D parameters
    const centerX = width / 2;
    const centerY = height / 2;

    const spineW = 40;     
    const T = spineW / 2;
    // Allow the book to be larger than the viewport in narrow mode
    // Base the maximum size on height rather than clamping purely to width.
    // If it's very narrow (e.g. mobile portrait), the pages will extend off-screen.
    // A standard book aspect ratio is around 1:1.4.
    const H = Math.min(height - 180, 700);
    // Try to fit the width up to 1000px, but maintain a decent aspect ratio with height.
    // The width of one page should be proportional to H.
    let W = H * 0.75; 
    
    // Still constrain by a maximum absolute size, but not strictly by screen width
    if (W > 500) W = 500;

    const camZ = 1600; // Flatter perspective
    const camX = 0;
    const camY = -180; // Camera height above the table
    const bookRotationX = -0.12; // Angle looking down at the table
    const offsetY = 120; // Shift everything down on screen

    const rotateX = (pt: Point3D): Point3D => {
      const cos = Math.cos(bookRotationX);
      const sin = Math.sin(bookRotationX);
      return {
        x: pt.x,
        y: pt.y * cos - pt.z * sin,
        z: pt.y * sin + pt.z * cos
      };
    };

    const project = (pt: Point3D): Point => {
      const rotated = rotateX(pt);
      const scale = camZ / (camZ - rotated.z);
      return {
        x: centerX + (rotated.x - camX) * scale,
        y: centerY + offsetY + (rotated.y - camY) * scale
      };
    };

    drawBook3D(book, p, W, H, spineW, T, camX, camY, camZ, rotateX, project);
  };

  draw();

  scene.tweens.add({
    targets: state,
    progress: 1,
    delay: 120,
    duration: 2300,
    ease: 'Sine.easeInOut',
    onUpdate: draw,
    onComplete: () => {
      content.setAlpha(1);
      scene.tweens.add({
        targets: [book, dimmer],
        alpha: 0,
        duration: 320,
        ease: 'Sine.easeOut',
        onComplete: () => {
          book.destroy();
          dimmer.destroy();
          blocker.destroy();
          onComplete();
        },
      });
    },
  });
}

type Point3D = { x: number, y: number, z: number };

type BookSlab = {
  F0: Point3D;
  F1: Point3D;
  F2: Point3D;
  F3: Point3D;
  B0: Point3D;
  B1: Point3D;
  B2: Point3D;
  B3: Point3D;
};

function drawBook3D(
  g: Phaser.GameObjects.Graphics,
  p: number,
  W: number,
  H: number,
  spineW: number,
  T: number,
  camX: number,
  camY: number,
  camZ: number,
  rotateX: (pt: Point3D) => Point3D,
  project: (pt: Point3D) => Point
): void {
  // Angle goes from 0 (closed, standing vertical) to Math.PI/2 (open flat on table)
  const openAngle = p * Math.PI / 2;

  // Build the slabs
  // Spine is on Z axis (from -H/2 to H/2).
  // Pivot for right cover is X = spineW/2, Y = 0 (on table).
  // Pivot for left cover is X = -spineW/2, Y = 0.
  // Both covers rotate around the Z axis.
  
  const buildSlab = (side: number) => {
    // side = 1 (right cover), -1 (left cover)
    // When closed (openAngle=0), both covers extend UP (-Y).
    // As it opens, right rotates to +X, left rotates to -X.
    
    // Vector from spine to fore-edge
    const v_along = { x: side * Math.sin(openAngle), y: -Math.cos(openAngle), z: 0 };
    // Normal vector pointing "outward" from the book cover
    const v_normal = { x: side * Math.cos(openAngle), y: Math.sin(openAngle), z: 0 };

    const pivotX = side * spineW / 2;
    const pivotY = 0;
    
    // "Front" edge of spine (closer to camera, +Z)
    const F0 = { x: pivotX, y: pivotY, z: H / 2 };
    const F1 = { x: pivotX + W * v_along.x, y: pivotY + W * v_along.y, z: H / 2 };
    const F2 = { x: pivotX + T * v_normal.x, y: pivotY + T * v_normal.y, z: H / 2 }; // thickness
    const F3 = { x: F1.x + T * v_normal.x, y: F1.y + T * v_normal.y, z: H / 2 };

    // "Back" edge of spine (further from camera, -Z)
    const B0 = { ...F0, z: -H / 2 };
    const B1 = { ...F1, z: -H / 2 };
    const B2 = { ...F2, z: -H / 2 };
    const B3 = { ...F3, z: -H / 2 };

    return { F0, F1, F2, F3, B0, B1, B2, B3 };
  };

  const rightSlab = buildSlab(1);
  const leftSlab = buildSlab(-1);

  type Polygon = {
    points: Point3D[];
    color: number;
    alpha: number;
    strokeColor?: number;
    strokeWidth?: number;
    strokeAlpha?: number;
    avgZ: number;
  };

  const polygons: Polygon[] = [];

  const addPoly = (pts: Point3D[], color: number, strokeColor: number) => {
    // Apply world rotation to points for culling and lighting
    const rotPts = pts.map(rotateX);
    
    // Calculate normal from rotated points
    const u = { x: rotPts[1]!.x - rotPts[0]!.x, y: rotPts[1]!.y - rotPts[0]!.y, z: rotPts[1]!.z - rotPts[0]!.z };
    const v = { x: rotPts[2]!.x - rotPts[0]!.x, y: rotPts[2]!.y - rotPts[0]!.y, z: rotPts[2]!.z - rotPts[0]!.z };
    const nx = u.y * v.z - u.z * v.y;
    const ny = u.z * v.x - u.x * v.z;
    const nz = u.x * v.y - u.y * v.x;

    // View vector from rotated point
    const cx = camX - rotPts[0]!.x;
    const cy = camY - rotPts[0]!.y;
    const cz = camZ - rotPts[0]!.z;

    const dot = nx * cx + ny * cy + nz * cz;
    if (dot > 0) {
      let sumZ = 0;
      for (const p of rotPts) sumZ += p.z;
      
      // Calculate lighting based on normal
      const length = Math.sqrt(nx * nx + ny * ny + nz * nz);
      const lnx = nx / length;
      const lny = ny / length;
      const lnz = nz / length;
      
      // Light source from top-front
      const lx = 0.4, ly = -0.8, lz = 0.4;
      let diff = lnx * lx + lny * ly + lnz * lz;
      diff = Phaser.Math.Clamp(diff, 0, 1);
      
      // Base color shading
      const baseR = (color >> 16) & 0xff;
      const baseG = (color >> 8) & 0xff;
      const baseB = color & 0xff;
      
      const ambient = 0.6;
      const shade = ambient + (1 - ambient) * diff;
      const finalColor = (Math.floor(baseR * shade) << 16) | (Math.floor(baseG * shade) << 8) | Math.floor(baseB * shade);

      polygons.push({
        points: pts,
        color: finalColor,
        alpha: 1,
        strokeColor,
        strokeWidth: 2,
        strokeAlpha: 0.6,
        avgZ: sumZ / pts.length // We use rotated Z for depth sorting!
      });
    }
  };

  // Colors
  const coverColor = 0x2b1810;
  const coverLine = 0xb98342;
  const pageColor = 0xf4dfad;
  const pageLine = 0xe7ca8c;
  const edgeColor = 0xe0c080;

  const addSlabPolys = (slab: BookSlab, side: number) => {
    const { F0, F1, F2, F3, B0, B1, B2, B3 } = slab;
    
    if (side === 1) {
      // Outer Cover
      addPoly([F2, F3, B3, B2], coverColor, coverLine);
      // Inner Page
      addPoly([F0, B0, B1, F1], pageColor, pageLine);
      // Top Edge
      addPoly([B0, B2, B3, B1], edgeColor, pageLine);
      // Bottom Edge
      addPoly([F0, F1, F3, F2], edgeColor, pageLine);
      // Fore-edge
      addPoly([F1, B1, B3, F3], edgeColor, pageLine);
    } else {
      // Outer Cover
      addPoly([F2, B2, B3, F3], coverColor, coverLine);
      // Inner Page
      addPoly([F0, F1, B1, B0], pageColor, pageLine);
      // Top Edge
      addPoly([B0, B1, B3, B2], edgeColor, pageLine);
      // Bottom Edge
      addPoly([F0, F2, F3, F1], edgeColor, pageLine);
      // Fore-edge
      addPoly([F1, F3, B3, B1], edgeColor, pageLine);
    }
  };

  // Spine (lies flat on table, Y=0)
  // Let's add the top face and back cap for completeness, in case they are visible
  addPoly([
    { x: -spineW / 2, y: 0, z: H / 2 },
    { x: spineW / 2, y: 0, z: H / 2 },
    { x: spineW / 2, y: -T, z: H / 2 },
    { x: -spineW / 2, y: -T, z: H / 2 }
  ], 0x3b2517, 0xc28a47); // front cap (tail edge)
  
  addPoly([
    { x: -spineW / 2, y: 0, z: -H / 2 },
    { x: -spineW / 2, y: -T, z: -H / 2 },
    { x: spineW / 2, y: -T, z: -H / 2 },
    { x: spineW / 2, y: 0, z: -H / 2 }
  ], 0x3b2517, 0xc28a47); // back cap (head edge)

  addPoly([
    { x: -spineW / 2, y: 0, z: H / 2 },
    { x: -spineW / 2, y: 0, z: -H / 2 },
    { x: spineW / 2, y: 0, z: -H / 2 },
    { x: spineW / 2, y: 0, z: H / 2 }
  ], 0x3b2517, 0xc28a47); // top face (inner spine surface)

  addPoly([
    { x: -spineW / 2, y: -T, z: H / 2 },
    { x: spineW / 2, y: -T, z: H / 2 },
    { x: spineW / 2, y: -T, z: -H / 2 },
    { x: -spineW / 2, y: -T, z: -H / 2 }
  ], 0x3b2517, 0xc28a47); // bottom face (outer spine resting on table)

  addSlabPolys(leftSlab, -1);
  addSlabPolys(rightSlab, 1);

  // Sort back to front
  polygons.sort((a, b) => a.avgZ - b.avgZ);

  // Draw
  for (const poly of polygons) {
    const projPts = poly.points.map(project);
    g.fillStyle(poly.color, poly.alpha);
    g.fillPoints(projPts, true);
    if (poly.strokeColor !== undefined) {
      g.lineStyle(poly.strokeWidth!, poly.strokeColor, poly.strokeAlpha!);
      g.strokePoints(projPts, true);
    }
  }
}


function smooth(value: number): number {
  const t = Phaser.Math.Clamp(value, 0, 1);
  return t * t * (3 - 2 * t);
}

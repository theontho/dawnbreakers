import fs from 'fs';

// Straight-on Perspective Projection
function project(x, y, z) {
  const cx = 0;
  const cy = 650; // Camera height above the book
  const cz = 950; // Camera distance from the book

  // Look down at origin
  const tilt = Math.atan2(cy, cz);
  
  const tx = x - cx;
  const ty = y - cy;
  const tz = z - cz;

  // Pitch rotation
  const rx = tx;
  const ry = ty * Math.cos(tilt) - tz * Math.sin(tilt);
  const rz = ty * Math.sin(tilt) + tz * Math.cos(tilt);

  let depth = -rz;
  if (depth < 1) depth = 1;

  const fov = 1000;
  const scale = fov / depth;

  const px = 400 + rx * scale;
  const py = 350 - ry * scale; // SVG Y goes down

  return [px.toFixed(2), py.toFixed(2)];
}

const pageWidth = 280;
const pageHeight = 400;
const zHalf = pageHeight / 2;
const frames = 120;
const dur = "5s";

let paths = {
  leftCover: [],
  leftPage: [],
  bg: [],
  castleLeft: [],
  castleRight: [],
  fgLeft: [],
  fgRight: []
};

function transformRight(w, h, Z0, A) {
    const angle = A / 4; 
    const X = w * Math.cos(angle);
    const Y = h * Math.sin(A / 2);
    const Z = Z0 + w * Math.sin(angle);
    return project(X, Y, Z);
}

function transformLeft(w, h, Z0, A) {
    const angle = A - A / 4; 
    const X = w * Math.cos(angle);
    const Y = h * Math.sin(A / 2);
    const Z = Z0 + w * Math.sin(A / 4);
    return project(X, Y, Z);
}

function transformBg(w, h, Z0, A) {
    const X = w;
    const Y = h * Math.sin(A / 2);
    const Z = Z0;
    return project(X, Y, Z);
}

function getLeftPagePoint(x, y, z, A) {
    let X = x * Math.cos(A) - y * Math.sin(A);
    let Y = x * Math.sin(A) + y * Math.cos(A);
    return project(X, Y, z);
}

// Right Cover & Page
let cr1 = project(0, -8, -zHalf - 12);
let cr2 = project(pageWidth + 12, -8, -zHalf - 12);
let cr3 = project(pageWidth + 12, -8, zHalf + 12);
let cr4 = project(0, -8, zHalf + 12);
const rightCoverD = `M ${cr1[0]} ${cr1[1]} L ${cr2[0]} ${cr2[1]} L ${cr3[0]} ${cr3[1]} L ${cr4[0]} ${cr4[1]} Z`;

let r1 = project(0, 0, -zHalf);
let r2 = project(pageWidth, 0, -zHalf);
let r3 = project(pageWidth, 0, zHalf);
let r4 = project(0, 0, zHalf);
const rightPageD = `M ${r1[0]} ${r1[1]} L ${r2[0]} ${r2[1]} L ${r3[0]} ${r3[1]} L ${r4[0]} ${r4[1]} Z`;

// Shapes (w, h)
const bgPoints = [
    [-260, 0], [-260, 100], [-180, 180], [-100, 120], [-40, 220],
    [40, 160], [120, 200], [180, 130], [260, 180], [260, 0]
];

const castleRightPoints = [
    [0, 0], [140, 0], [140, 70], [130, 70], [130, 80], [110, 80], [110, 70],
    [100, 70], [100, 140], [80, 180], [60, 140], [60, 90], [40, 90], [40, 110], [0, 150]
];

const fgRightPoints = [
    [0, 0], [120, 0], [120, 30], [100, 70], [80, 40], [60, 80], [40, 30],
    [20, 60], [0, 40]
];

function buildPath(points, transformFn, Z0, A) {
    let mapped = points.map(([w, h]) => transformFn(w, h, Z0, A));
    let d = `M ${mapped[0][0]} ${mapped[0][1]}`;
    for(let i=1; i<mapped.length; i++) {
        d += ` L ${mapped[i][0]} ${mapped[i][1]}`;
    }
    return d + ' Z';
}

for (let i = 0; i <= frames; i++) {
    let t = i / frames;
    // Smooth easing
    let easedT = t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
    let A = Math.PI * 0.03 + easedT * (Math.PI * 0.94); // 5.4 to 174.6 degrees

    // Left Cover & Page
    let lc1 = getLeftPagePoint(0, 8, -zHalf - 12, A);
    let lc2 = getLeftPagePoint(pageWidth + 12, 8, -zHalf - 12, A);
    let lc3 = getLeftPagePoint(pageWidth + 12, 8, zHalf + 12, A);
    let lc4 = getLeftPagePoint(0, 8, zHalf + 12, A);
    paths.leftCover.push(`M ${lc1[0]} ${lc1[1]} L ${lc2[0]} ${lc2[1]} L ${lc3[0]} ${lc3[1]} L ${lc4[0]} ${lc4[1]} Z`);

    let lp1 = getLeftPagePoint(0, 0, -zHalf, A);
    let lp2 = getLeftPagePoint(pageWidth, 0, -zHalf, A);
    let lp3 = getLeftPagePoint(pageWidth, 0, zHalf, A);
    let lp4 = getLeftPagePoint(0, 0, zHalf, A);
    paths.leftPage.push(`M ${lp1[0]} ${lp1[1]} L ${lp2[0]} ${lp2[1]} L ${lp3[0]} ${lp3[1]} L ${lp4[0]} ${lp4[1]} Z`);

    // Pop-ups
    paths.bg.push(buildPath(bgPoints, transformBg, -100, A));
    paths.castleRight.push(buildPath(castleRightPoints, transformRight, 0, A));
    paths.castleLeft.push(buildPath(castleRightPoints, transformLeft, 0, A));
    paths.fgRight.push(buildPath(fgRightPoints, transformRight, 100, A));
    paths.fgLeft.push(buildPath(fgRightPoints, transformLeft, 100, A));
}

const animateTag = (pathArray) => `<animate attributeName="d" values="${pathArray.join(';')}" dur="${dur}" fill="freeze" repeatCount="indefinite" direction="alternate" />`;
const visibilityOpen = `<animate attributeName="visibility" values="hidden; hidden; visible; visible" keyTimes="0; 0.499; 0.5; 1" dur="${dur}" fill="freeze" repeatCount="indefinite" direction="alternate" />`;
const visibilityClosed = `<animate attributeName="visibility" values="visible; visible; hidden; hidden" keyTimes="0; 0.499; 0.5; 1" dur="${dur}" fill="freeze" repeatCount="indefinite" direction="alternate" />`;

const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600" width="100%" height="100%">
  <defs>
    <radialGradient id="sky" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#2c3e50" />
      <stop offset="100%" stop-color="#1a252f" />
    </radialGradient>
    <filter id="shadow">
      <feDropShadow dx="0" dy="12" stdDeviation="15" flood-opacity="0.4" />
    </filter>
  </defs>
  
  <rect width="800" height="600" fill="url(#sky)" />
  
  <g filter="url(#shadow)">
    <!-- Right Cover and Page -->
    <path d="${rightCoverD}" fill="#8e44ad" stroke="#732d91" stroke-width="2" stroke-linejoin="round" />
    <path d="${rightPageD}" fill="#fdfae4" stroke="#e0d6b8" stroke-width="1.5" stroke-linejoin="round" />
    
    <!-- Left pages OPEN state (drawn behind popups) -->
    <g>
      ${visibilityOpen}
      <path d="${paths.leftCover[0]}" fill="#9b59b6" stroke="#8e44ad" stroke-width="2" stroke-linejoin="round">${animateTag(paths.leftCover)}</path>
      <path d="${paths.leftPage[0]}" fill="#fffae6" stroke="#e0d6b8" stroke-width="1.5" stroke-linejoin="round">${animateTag(paths.leftPage)}</path>
    </g>
    
    <!-- Spine Line -->
    <line x1="${r1[0]}" y1="${r1[1]}" x2="${r4[0]}" y2="${r4[1]}" stroke="#d1c7a8" stroke-width="2" />
    
    <!-- Pop-ups -->
    <g>
      <path d="${paths.bg[0]}" fill="#34495e" stroke="#2c3e50" stroke-width="1.5" stroke-linejoin="round">${animateTag(paths.bg)}</path>
      <path d="${paths.castleLeft[0]}" fill="#d35400" stroke="#ba4a00" stroke-width="1.5" stroke-linejoin="round">${animateTag(paths.castleLeft)}</path>
      <path d="${paths.castleRight[0]}" fill="#e67e22" stroke="#d35400" stroke-width="1.5" stroke-linejoin="round">${animateTag(paths.castleRight)}</path>
      <path d="${paths.fgLeft[0]}" fill="#27ae60" stroke="#1e8449" stroke-width="1.5" stroke-linejoin="round">${animateTag(paths.fgLeft)}</path>
      <path d="${paths.fgRight[0]}" fill="#2ecc71" stroke="#27ae60" stroke-width="1.5" stroke-linejoin="round">${animateTag(paths.fgRight)}</path>
    </g>
    
    <!-- Left pages CLOSED state (drawn over popups) -->
    <g>
      ${visibilityClosed}
      <path d="${paths.leftPage[0]}" fill="#fffae6" stroke="#e0d6b8" stroke-width="1.5" stroke-linejoin="round">${animateTag(paths.leftPage)}</path>
      <path d="${paths.leftCover[0]}" fill="#9b59b6" stroke="#8e44ad" stroke-width="2" stroke-linejoin="round">${animateTag(paths.leftCover)}</path>
    </g>
  </g>
</svg>`;

fs.writeFileSync('book-animation.svg', svg);
console.log('Final SVG generated successfully!');

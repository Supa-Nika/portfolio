import Matter from 'matter-js';

const { Engine, Render, Runner, Bodies, Composite, Mouse, MouseConstraint } = Matter;

const underscore = document.querySelector("#underscore");
const title = document.querySelector("#title");

setInterval(() => {
  underscore.classList.toggle("transparency");
}, 1000);

const fonts = [
  "'Cinzel', serif",
  "'Space Grotesk', sans-serif",
  "'Syne', sans-serif",
  "'Syne Tactile', system-ui",
  "'Playwrite CA Guides', cursive",
  "'Libre Caslon Condensed', serif",
  "'Dancing Script', cursive",
  "'Isometra', serif",
  "'Black Ops One', system-ui",
  "'VT323', monospace",
];

const TARGET_CAP = 0.7;

function measureScales() {
  const ctx = document.createElement("canvas").getContext("2d");
  return fonts.map((font) => {
    ctx.font = `100px ${font}`;
    const cap = ctx.measureText("H").actualBoundingBoxAscent / 100;
    return cap > 0 ? TARGET_CAP / cap : 1;
  });
}

async function init() {
  await Promise.all(fonts.map((f) => document.fonts.load(`100px ${f}`)));
  const scales = measureScales();

  let index = 0;
  setInterval(() => {
    title.style.fontFamily = fonts[index];
    title.style.setProperty("--font-scale", scales[index]);
    index = (index + 1) % fonts.length;
  }, 100);
}
init();


// 1. Create Engine
const engine = Engine.create();

const W = 320;
const H = 320;

const render = Render.create({
  element: document.querySelector('#render'),
  engine: engine,
  options: {
    width: W,
    height: H,
    wireframes: false,
    background: '#1e1e24'
  }
});


const modules = import.meta.glob('/src/assets/langLogos/*.{png,jpg,jpeg,webp,svg}', {
  eager: true,
  query: '?url',
  import: 'default',
});

class Logo {
  static MAX_SIZE = 80; // longest side in px; set to Infinity for native image size
  static RESTITUTION = 0.6;
  static FRICTION = 0.1;

  constructor(x, y, type, img) {
    this.x = x;
    this.y = y;
    this.type = type;
    this.img = img; // a loaded HTMLImageElement
  }

  // Draws the image onto a white background, clipped to a circle if needed
  makeTexture(w, h, isCircle) {
    const canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext('2d');

    if (isCircle) {
      ctx.beginPath();
      ctx.arc(w / 2, h / 2, w / 2, 0, Math.PI * 2);
      ctx.clip();
    }

    ctx.fillStyle = '#fff';
    ctx.fillRect(0, 0, w, h);

    // "cover" fit: fills the shape, crops the overflow (exact fit for rectangles)
    const s = Math.max(w / this.img.naturalWidth, h / this.img.naturalHeight);
    const dw = this.img.naturalWidth * s;
    const dh = this.img.naturalHeight * s;
    ctx.drawImage(this.img, (w - dw) / 2, (h - dh) / 2, dw, dh);

    return canvas.toDataURL();
  }

  create(world) {
    const { naturalWidth: iw, naturalHeight: ih } = this.img;
    const scale = Math.min(1, Logo.MAX_SIZE / Math.max(iw, ih));
    const isCircle = this.type === 'circle';

    // circle: diameter = shorter side; rectangle: same aspect ratio as the image
    const w = Math.round((isCircle ? Math.min(iw, ih) : iw) * scale);
    const h = Math.round((isCircle ? Math.min(iw, ih) : ih) * scale);

    const options = {
      restitution: Logo.RESTITUTION,
      friction: Logo.FRICTION,
      render: {
        sprite: { texture: this.makeTexture(w, h, isCircle), xScale: 1, yScale: 1 },
      },
    };

    const body = isCircle
      ? Bodies.circle(this.x, this.y, w / 2, options)
      : Bodies.rectangle(this.x, this.y, w, h, options);

    Composite.add(world, body);
    return body;
  }
}

const urls = Object.values(modules);

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`Failed to load ${src}`));
    img.src = src;
  });
}

async function spawnAll() {
  const images = await Promise.all(urls.map(loadImage));

  images.forEach((img, i) => {
    // Random x inside the walls, staggered so they don't all spawn at once
    setTimeout(() => {
      const x = 30 + Math.random() * (W - 60);
      const type = Math.random() < 0.5 ? 'circle' : 'square';
      new Logo(x, 30, type, img).create(engine.world);
    }, i * 200);
  });
}


spawnAll();

// 4. Add static walls and floor (thick, and placed just outside the canvas)
const T = 100; // wall thickness

const ground = Bodies.rectangle(W / 2, H + T / 2, W + T * 2, T, { isStatic: true });
const leftWall = Bodies.rectangle(-T / 2, H / 2, T, H * 2, { isStatic: true });
const rightWall = Bodies.rectangle(W + T / 2, H / 2, T, H * 2, { isStatic: true });

Composite.add(engine.world, [ground, leftWall, rightWall]);

// 6. Start loops
Render.run(render);
Runner.run(Runner.create(), engine);

const mouse = Mouse.create(render.canvas);

const mouseConstraint = MouseConstraint.create(engine, {
  mouse,
  constraint: {
    stiffness: 0.2,
    render: { visible: false }, // hides the drag line
  },
});

Composite.add(engine.world, mouseConstraint);

// keeps the mouse in sync with the renderer (needed if you ever scale the canvas)
render.mouse = mouse
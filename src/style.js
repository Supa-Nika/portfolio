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
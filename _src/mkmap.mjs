import { feature } from 'topojson-client';
import { geoContains } from 'd3-geo';
import { readFileSync, writeFileSync } from 'fs';
const topo = JSON.parse(readFileSync('node_modules/world-atlas/land-110m.json', 'utf8'));
const land = feature(topo, topo.objects.land);
const step = 2.4, pts = [];
for (let lat = 78; lat >= -56; lat -= step) for (let lon = -180; lon < 180; lon += step) {
  if (geoContains(land, [lon, lat])) pts.push([lon + 180, 78 - lat]);
}
const f = (v) => v.toFixed(1).replace(/\.0$/, '');
const d = pts.map(([x, y]) => `M${f(x)} ${f(y)}h.01`).join('');
const P = (lon, lat) => [lon + 180, 78 - lat];
const hub = P(78, 21);
const targets = [[-0.1, 51.5], [-74, 40.7], [-46.6, -23.5], [28, -26], [55, 25], [103.8, 1.3], [151, -33.9], [139.7, 35.7], [-122.4, 37.8], [13.4, 52.5], [36.8, -1.3], [-99, 19.4], [30, 60]];
const arcs = targets.map(([lo, la]) => { const [x, y] = P(lo, la); const mx = (hub[0] + x) / 2, my = (hub[1] + y) / 2 - Math.hypot(x - hub[0], y - hub[1]) * 0.28; return { d: `M${f(hub[0])} ${f(hub[1])}Q${f(mx)} ${f(my)} ${f(x)} ${f(y)}`, x: +f(x), y: +f(y) }; });
writeFileSync('map.json', JSON.stringify({ dots: d, hub, arcs, n: pts.length, w: 360, h: 134 }));
console.log('dots', pts.length, 'bytes', d.length);

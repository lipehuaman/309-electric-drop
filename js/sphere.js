/* =====================================================================
   309 TECHNOLOGY · HERO PARTICLE SPHERE
   Vanilla canvas 2D. A rotating sphere built from a dense field of
   "dust" points plus a sparser network of brighter nodes joined by
   circuit lines (modular synergy, made ambient). No WebGL, no deps.
   Honours prefers-reduced-motion (renders a single static frame) and
   pauses when the hero scrolls out of view.
   ===================================================================== */
(function () {
  "use strict";

  var canvas = document.getElementById("hero-sphere");
  if (!canvas || !canvas.getContext) return;
  var ctx = canvas.getContext("2d");
  var REDUCED = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var DPR = Math.min(window.devicePixelRatio || 1, 2);

  var W = 0, H = 0, CX = 0, CY = 0, R = 0;
  var dust = [], nodes = [], edges = [];
  var GREEN = "88,255,0";

  function resize() {
    var rect = canvas.getBoundingClientRect();
    W = Math.max(1, rect.width);
    H = Math.max(1, rect.height);
    canvas.width = Math.round(W * DPR);
    canvas.height = Math.round(H * DPR);
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    CX = W / 2;
    CY = H / 2;
    R = Math.min(W, H) * (W < 640 ? 0.40 : 0.33);
  }

  // even point distribution on a sphere (Fibonacci lattice)
  function fib(n) {
    var pts = [], gold = Math.PI * (3 - Math.sqrt(5));
    for (var i = 0; i < n; i++) {
      var y = 1 - (i / (n - 1)) * 2;
      var r = Math.sqrt(Math.max(0, 1 - y * y));
      var th = gold * i;
      pts.push({ x: Math.cos(th) * r, y: y, z: Math.sin(th) * r });
    }
    return pts;
  }

  function build() {
    dust = fib(window.innerWidth < 640 ? 650 : 1100);
    nodes = fib(window.innerWidth < 640 ? 64 : 96);
    edges = [];
    for (var i = 0; i < nodes.length; i++) {
      var near = [];
      for (var j = 0; j < nodes.length; j++) {
        if (i === j) continue;
        var dx = nodes[i].x - nodes[j].x, dy = nodes[i].y - nodes[j].y, dz = nodes[i].z - nodes[j].z;
        near.push({ j: j, d: dx * dx + dy * dy + dz * dz });
      }
      near.sort(function (a, b) { return a.d - b.d; });
      for (var k = 0; k < 2; k++) { if (near[k] && i < near[k].j) edges.push([i, near[k].j]); }
    }
  }

  function rotate(p, ax, ay) {
    var cy = Math.cos(ay), sy = Math.sin(ay);
    var x = p.x * cy - p.z * sy;
    var z = p.x * sy + p.z * cy;
    var cx = Math.cos(ax), sx = Math.sin(ax);
    var y = p.y * cx - z * sx;
    z = p.y * sx + z * cx;
    return { x: x, y: y, z: z };
  }

  var t = 0;
  function render() {
    ctx.clearRect(0, 0, W, H);
    var ay = t * 0.16;
    var ax = 0.20 + Math.sin(t * 0.07) * 0.22;

    // dust
    for (var i = 0; i < dust.length; i++) {
      var p = rotate(dust[i], ax, ay);
      var depth = (p.z + 1) / 2;            // 0 (back) .. 1 (front)
      var a = 0.08 + depth * 0.42;
      var s = 0.5 + depth * 1.4;
      ctx.fillStyle = "rgba(" + GREEN + "," + a.toFixed(3) + ")";
      ctx.fillRect(CX + p.x * R, CY + p.y * R, s, s);
    }

    // edges (draw the front-facing half only)
    ctx.lineWidth = 1;
    for (var e = 0; e < edges.length; e++) {
      var a1 = rotate(nodes[edges[e][0]], ax, ay);
      var b1 = rotate(nodes[edges[e][1]], ax, ay);
      var dep = ((a1.z + b1.z) / 2 + 1) / 2;
      if (dep < 0.4) continue;
      ctx.strokeStyle = "rgba(" + GREEN + "," + (dep * 0.45).toFixed(3) + ")";
      ctx.beginPath();
      ctx.moveTo(CX + a1.x * R, CY + a1.y * R);
      ctx.lineTo(CX + b1.x * R, CY + b1.y * R);
      ctx.stroke();
    }

    // nodes
    for (var n = 0; n < nodes.length; n++) {
      var q = rotate(nodes[n], ax, ay);
      var d = (q.z + 1) / 2;
      var rad = 0.8 + d * 2.2;
      ctx.fillStyle = "rgba(" + GREEN + "," + (0.35 + d * 0.6).toFixed(3) + ")";
      ctx.beginPath();
      ctx.arc(CX + q.x * R, CY + q.y * R, rad, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  var raf = null, running = false;
  function loop() { render(); t += 0.016; raf = requestAnimationFrame(loop); }
  function start() { if (running || REDUCED) return; running = true; loop(); }
  function stop() { running = false; if (raf) cancelAnimationFrame(raf); }

  function init() {
    resize();
    build();
    render();                 // paint one frame immediately (also the static frame for reduced motion)
    if (REDUCED) return;
    start();
    if ("IntersectionObserver" in window) {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) { en.isIntersecting ? start() : stop(); });
      }, { threshold: 0 });
      io.observe(canvas);
    }
  }

  var rt;
  window.addEventListener("resize", function () {
    clearTimeout(rt);
    rt = setTimeout(function () { resize(); build(); render(); }, 150);
  }, { passive: true });

  window.HeroSphere = { init: init };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else { init(); }
})();

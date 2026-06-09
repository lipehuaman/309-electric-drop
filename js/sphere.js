/* =====================================================================
   309 TECHNOLOGY · PARTICLE SPHERE / MESH (factory)
   Vanilla canvas 2D. Mounts on every <canvas data-sphere>. A rotating
   sphere of dust points plus a network of brighter nodes joined by
   circuit lines. Theme-aware: on the positive (light) surface it shifts
   to a deeper green with boosted alpha so the mesh stays visible on white.
   Honours prefers-reduced-motion (single static frame) and pauses when
   the canvas scrolls out of view.
   ===================================================================== */
(function () {
  "use strict";

  var REDUCED = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var DPR = Math.min(window.devicePixelRatio || 1, 2);

  function palette() {
    var positive = document.documentElement.getAttribute("data-theme") === "positive";
    // strict palette stays #58ff00 on dark; on light we deepen the green so
    // the decorative mesh reads against white (brand green is invisible there).
    return positive ? { rgb: "26,150,0", mul: 1.8 } : { rgb: "88,255,0", mul: 1.0 };
  }
  function clamp(v) { return v < 0 ? 0 : (v > 1 ? 1 : v); }

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

  function createSphere(canvas) {
    var ctx = canvas.getContext("2d");
    if (!ctx) return;
    var d = canvas.dataset;
    var smallScreen = window.innerWidth < 640;
    var DUST = parseInt(d.dust || "1000", 10);
    var NODES = parseInt(d.nodes || "90", 10);
    var RADIUS = parseFloat(d.radius || "0.33");
    var K = parseInt(d.edges || "2", 10);
    if (smallScreen) { DUST = Math.round(DUST * 0.6); NODES = Math.round(NODES * 0.7); }

    var W = 0, H = 0, CX = 0, CY = 0, R = 0;
    var dust = [], nodes = [], edges = [];
    var t = 0, raf = null, running = false;

    function resize() {
      var rect = canvas.getBoundingClientRect();
      W = Math.max(1, rect.width); H = Math.max(1, rect.height);
      canvas.width = Math.round(W * DPR); canvas.height = Math.round(H * DPR);
      ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
      CX = W / 2; CY = H / 2;
      R = Math.min(W, H) * (smallScreen ? RADIUS + 0.06 : RADIUS);
    }

    function build() {
      dust = fib(DUST); nodes = fib(NODES); edges = [];
      for (var i = 0; i < nodes.length; i++) {
        var near = [];
        for (var j = 0; j < nodes.length; j++) {
          if (i === j) continue;
          var dx = nodes[i].x - nodes[j].x, dy = nodes[i].y - nodes[j].y, dz = nodes[i].z - nodes[j].z;
          near.push({ j: j, q: dx * dx + dy * dy + dz * dz });
        }
        near.sort(function (a, b) { return a.q - b.q; });
        for (var k = 0; k < K; k++) { if (near[k] && i < near[k].j) edges.push([i, near[k].j]); }
      }
    }

    function rotate(p, ax, ay) {
      var cy = Math.cos(ay), sy = Math.sin(ay);
      var x = p.x * cy - p.z * sy, z = p.x * sy + p.z * cy;
      var cx = Math.cos(ax), sx = Math.sin(ax);
      var y = p.y * cx - z * sx; z = p.y * sx + z * cx;
      return { x: x, y: y, z: z };
    }

    function render() {
      var pal = palette(), rgb = pal.rgb, mul = pal.mul;
      ctx.clearRect(0, 0, W, H);
      var ay = t * 0.16, ax = 0.20 + Math.sin(t * 0.07) * 0.22;

      for (var i = 0; i < dust.length; i++) {
        var p = rotate(dust[i], ax, ay);
        var depth = (p.z + 1) / 2;
        var a = clamp((0.08 + depth * 0.42) * mul);
        var s = 0.5 + depth * 1.4;
        ctx.fillStyle = "rgba(" + rgb + "," + a.toFixed(3) + ")";
        ctx.fillRect(CX + p.x * R, CY + p.y * R, s, s);
      }

      ctx.lineWidth = 1;
      for (var e = 0; e < edges.length; e++) {
        var a1 = rotate(nodes[edges[e][0]], ax, ay);
        var b1 = rotate(nodes[edges[e][1]], ax, ay);
        var dep = ((a1.z + b1.z) / 2 + 1) / 2;
        if (dep < 0.4) continue;
        ctx.strokeStyle = "rgba(" + rgb + "," + clamp(dep * 0.45 * mul).toFixed(3) + ")";
        ctx.beginPath();
        ctx.moveTo(CX + a1.x * R, CY + a1.y * R);
        ctx.lineTo(CX + b1.x * R, CY + b1.y * R);
        ctx.stroke();
      }

      for (var n = 0; n < nodes.length; n++) {
        var q = rotate(nodes[n], ax, ay);
        var dd = (q.z + 1) / 2;
        var rad = 0.8 + dd * 2.2;
        ctx.fillStyle = "rgba(" + rgb + "," + clamp((0.35 + dd * 0.6) * mul).toFixed(3) + ")";
        ctx.beginPath();
        ctx.arc(CX + q.x * R, CY + q.y * R, rad, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    function loop() { render(); t += 0.016; raf = requestAnimationFrame(loop); }
    function start() { if (running || REDUCED) return; running = true; loop(); }
    function stop() { running = false; if (raf) cancelAnimationFrame(raf); }

    resize(); build(); render();
    if (!REDUCED) {
      start();
      if ("IntersectionObserver" in window) {
        new IntersectionObserver(function (en) {
          en.forEach(function (x) { x.isIntersecting ? start() : stop(); });
        }, { threshold: 0 }).observe(canvas);
      }
    }

    var rt;
    window.addEventListener("resize", function () {
      clearTimeout(rt);
      rt = setTimeout(function () { resize(); build(); render(); }, 150);
    }, { passive: true });

    // expose a repaint hook (used on theme change for the static/reduced case)
    return { render: render };
  }

  var instances = [];
  function init() {
    var canvases = Array.prototype.slice.call(document.querySelectorAll("canvas[data-sphere]"));
    canvases.forEach(function (c) { var inst = createSphere(c); if (inst) instances.push(inst); });
  }

  // repaint all when the theme flips (matters for reduced-motion static frames)
  window.addEventListener("themechange", function () {
    if (REDUCED) instances.forEach(function (s) { s.render(); });
  });

  window.HeroSphere = { init: init };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else { init(); }
})();

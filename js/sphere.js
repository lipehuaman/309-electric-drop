/* =====================================================================
   309 TECHNOLOGY · PARTICLE SPHERE / MESH (factory)
   Vanilla canvas 2D. Mounts on every <canvas data-sphere>. A rotating
   form built from a dust cloud + a network of nodes joined by lines.
   Options (data-*): dust, nodes, radius, edges (k-nearest), jitter
   (spiky radius variance), longlinks (random crossing chords).
   Mouse-interactive: the form tilts toward the pointer. Theme-aware:
   deepens to a darker green on the light surface so it stays visible.
   Honours prefers-reduced-motion (single static frame) and pauses when
   the canvas scrolls out of view.
   ===================================================================== */
(function () {
  "use strict";

  var REDUCED = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var DPR = Math.min(window.devicePixelRatio || 1, 2);

  // shared pointer (one listener for all instances)
  var pointer = { x: null, y: null };
  window.addEventListener("pointermove", function (e) { pointer.x = e.clientX; pointer.y = e.clientY; }, { passive: true });
  window.addEventListener("pointerleave", function () { pointer.x = pointer.y = null; }, { passive: true });
  window.addEventListener("blur", function () { pointer.x = pointer.y = null; });

  function palette() {
    var positive = document.documentElement.getAttribute("data-theme") === "positive";
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
    var small = window.innerWidth < 640;
    var DUST = parseInt(d.dust || "1000", 10);
    var NODES = parseInt(d.nodes || "90", 10);
    var RADIUS = parseFloat(d.radius || "0.33");
    var K = parseInt(d.edges || "2", 10);
    var JIT = parseFloat(d.jitter || "0");
    var LONG = parseInt(d.longlinks || "0", 10);
    if (small) { DUST = Math.round(DUST * 0.6); NODES = Math.round(NODES * 0.75); }

    var W = 0, H = 0, CX = 0, CY = 0, R = 0;
    var dust = [], nodes = [], nodeR = [], edges = [];
    var t = 0, raf = null, running = false;
    var mx = 0, my = 0; // smoothed mouse influence

    function resize() {
      var rect = canvas.getBoundingClientRect();
      W = Math.max(1, rect.width); H = Math.max(1, rect.height);
      canvas.width = Math.round(W * DPR); canvas.height = Math.round(H * DPR);
      ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
      CX = W / 2; CY = H / 2;
      R = Math.min(W, H) * (small ? RADIUS + 0.05 : RADIUS);
    }

    function build() {
      dust = fib(DUST);
      nodes = fib(NODES);
      nodeR = [];
      for (var a = 0; a < nodes.length; a++) { nodeR.push(1 + (Math.random() * 2 - 1) * JIT); }
      edges = [];
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
      // random crossing chords for a more complex web
      for (var l = 0; l < LONG; l++) {
        var u = (Math.random() * nodes.length) | 0, v = (Math.random() * nodes.length) | 0;
        if (u !== v) edges.push([u, v]);
      }
    }

    function rotate(p, ax, ay, rr) {
      var cy = Math.cos(ay), sy = Math.sin(ay);
      var x = p.x * cy - p.z * sy, z = p.x * sy + p.z * cy;
      var cx = Math.cos(ax), sx = Math.sin(ax);
      var y = p.y * cx - z * sx; z = p.y * sx + z * cx;
      return { x: x * rr, y: y * rr, z: z * rr };
    }

    function mouseTarget() {
      if (pointer.x == null) return { x: 0, y: 0 };
      var rect = canvas.getBoundingClientRect();
      var dxn = (pointer.x - (rect.left + rect.width / 2)) / window.innerWidth;
      var dyn = (pointer.y - (rect.top + rect.height / 2)) / window.innerHeight;
      return { x: Math.max(-1, Math.min(1, dxn)) * 1.1, y: Math.max(-1, Math.min(1, dyn)) * 0.9 };
    }

    function render() {
      var pal = palette(), rgb = pal.rgb, mul = pal.mul;
      var tg = mouseTarget();
      mx += (tg.x - mx) * 0.06;
      my += (tg.y - my) * 0.06;
      ctx.clearRect(0, 0, W, H);
      var ay = t * 0.16 + mx;
      var ax = 0.20 + Math.sin(t * 0.07) * 0.22 + my;

      for (var i = 0; i < dust.length; i++) {
        var p = rotate(dust[i], ax, ay, 1.12);
        var depth = (p.z + 1) / 2;
        var aa = clamp((0.08 + depth * 0.42) * mul);
        var s = 0.5 + depth * 1.4;
        ctx.fillStyle = "rgba(" + rgb + "," + aa.toFixed(3) + ")";
        ctx.fillRect(CX + p.x * R, CY + p.y * R, s, s);
      }

      ctx.lineWidth = 1;
      for (var e = 0; e < edges.length; e++) {
        var ia = edges[e][0], ib = edges[e][1];
        var a1 = rotate(nodes[ia], ax, ay, nodeR[ia]);
        var b1 = rotate(nodes[ib], ax, ay, nodeR[ib]);
        var dep = ((a1.z + b1.z) / 2 + 1) / 2;
        if (dep < 0.4) continue;
        ctx.strokeStyle = "rgba(" + rgb + "," + clamp(dep * 0.42 * mul).toFixed(3) + ")";
        ctx.beginPath();
        ctx.moveTo(CX + a1.x * R, CY + a1.y * R);
        ctx.lineTo(CX + b1.x * R, CY + b1.y * R);
        ctx.stroke();
      }

      for (var n = 0; n < nodes.length; n++) {
        var q = rotate(nodes[n], ax, ay, nodeR[n]);
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

    return { render: render };
  }

  var instances = [];
  function init() {
    if (window.matchMedia("(max-width: 620px)").matches) return; // mobile: no sphere
    var canvases = Array.prototype.slice.call(document.querySelectorAll("canvas[data-sphere]"));
    canvases.forEach(function (c) { var inst = createSphere(c); if (inst) instances.push(inst); });
  }

  window.addEventListener("themechange", function () {
    if (REDUCED) instances.forEach(function (s) { s.render(); });
  });

  window.HeroSphere = { init: init };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else { init(); }
})();

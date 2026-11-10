/* 教師執業證書 · 資料站 —— 零依賴前端邏輯 */
(function () {
  "use strict";

  /* ---------- 閱讀進度條 ---------- */
  var bar = document.getElementById("progress");
  var ticking = false;

  function onScroll() {
    if (ticking) return;
    ticking = true;
    window.requestAnimationFrame(function () {
      var h = document.documentElement;
      var max = h.scrollHeight - h.clientHeight;
      var p = max > 0 ? (h.scrollTop || document.body.scrollTop) / max : 0;
      bar.style.width = Math.min(100, Math.max(0, p * 100)) + "%";
      ticking = false;
    });
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---------- 導覽高亮（scroll spy） ---------- */
  var links = Array.prototype.slice.call(document.querySelectorAll("#navlinks a"));
  var targets = links
    .map(function (a) {
      var id = a.getAttribute("href");
      var el = id && id.length > 1 ? document.querySelector(id) : null;
      return el ? { link: a, el: el } : null;
    })
    .filter(Boolean);

  if ("IntersectionObserver" in window && targets.length) {
    var visible = {};

    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (e) {
          visible[e.target.id] = e.isIntersecting ? e.intersectionRatio : 0;
        });

        var best = null;
        var bestVal = 0;
        targets.forEach(function (t) {
          var v = visible[t.el.id] || 0;
          if (v > bestVal) {
            bestVal = v;
            best = t;
          }
        });

        if (best) {
          links.forEach(function (l) {
            l.classList.toggle("active", l === best.link);
          });
        }
      },
      { rootMargin: "-72px 0px -55% 0px", threshold: [0, 0.15, 0.4, 0.75] }
    );

    targets.forEach(function (t) {
      io.observe(t.el);
    });
  }

  /* ---------- CPD 計算機 ---------- */
  var TARGET = 150; // 每三年週期目標時數
  var inputs = [
    document.getElementById("h1"),
    document.getElementById("h2"),
    document.getElementById("h3")
  ].filter(Boolean);
  var totalEl = document.getElementById("total");
  var fillEl = document.getElementById("barfill");
  var noteEl = document.getElementById("calcnote");

  function num(el) {
    var v = parseFloat(el.value);
    if (!isFinite(v) || v < 0) return 0;
    return Math.floor(v);
  }

  function render() {
    if (!inputs.length || !totalEl) return;
    var total = inputs.reduce(function (s, el) {
      return s + num(el);
    }, 0);
    var pct = Math.min(100, (total / TARGET) * 100);
    var short = Math.max(0, TARGET - total);

    totalEl.textContent = String(total);
    fillEl.style.width = pct.toFixed(1) + "%";

    if (total >= TARGET) {
      noteEl.innerHTML =
        "已達標，超出 <b style=\"color:#fff\">" +
        (total - TARGET) +
        "</b> 小時。記得保留所有出席證明，並確認其中至少 30 小時屬核心培訓（兩範疇各不少於 6 小時）。";
    } else {
      noteEl.innerHTML =
        "尚差 <b style=\"color:#fff\">" +
        short +
        "</b> 小時（" +
        pct.toFixed(0) +
        "%）。剩餘時間平均每年需約 <b style=\"color:#fff\">" +
        Math.ceil(short / 3) +
        "</b> 小時；亦可在單一年度集中補足。";
    }
  }

  inputs.forEach(function (el) {
    el.addEventListener("input", render);
    el.addEventListener("change", render);
    el.addEventListener("wheel", function () {
      el.blur();
    }, { passive: true });
  });
  render();

  /* ---------- 平滑跳轉（尊重減少動態效果設定） ---------- */
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduce) {
    document.documentElement.style.scrollBehavior = "auto";
  }
})();

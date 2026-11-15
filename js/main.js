/* Séquence « Station d'accueil iPod shuffle » : comportements communs.
   Fonctionne en ouvrant les fichiers directement (file://), sans serveur.
   La progression reste dans le navigateur de l'élève (localStorage). */
(function () {
  "use strict";
  var KEY = "station-ipod-multi-v1";
  var S = { done: {}, ctrl: {}, items: {}, level: "standard", ideas: [], cdc: {}, cdcn: {}, ev: {}, hat: 0 };
  try { var raw = localStorage.getItem(KEY); if (raw) { var p = JSON.parse(raw); for (var k in p) S[k] = p[k]; } } catch (e) {}
  function save() { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) {} }
  function $(id) { return document.getElementById(id); }
  function esc(s) { return String(s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }
  function fr(n) { return n.toLocaleString("fr-FR"); }

  /* ---- repères ✓ dans la barre de navigation ---- */
  function markNav() {
    Array.prototype.forEach.call(document.querySelectorAll("[data-step]"), function (a) {
      a.classList.toggle("done", !!S.done[a.getAttribute("data-step")]);
    });
  }
  markNav();

  /* ---- niveaux de différenciation ---- */
  var lvBtns = document.querySelectorAll(".lv");
  if (lvBtns.length) {
    var desc = {
      guide: "Chaque consigne est découpée en petites actions, avec des repères pour avancer pas à pas.",
      standard: "Les consignes du sujet, telles qu'elles sont données dans le document original.",
      autonome: "Seul l'objectif et ce qu'on attend dans le dossier sont donnés. À vous de choisir la méthode."
    };
    var setLevel = function (lv) {
      S.level = lv; save();
      Array.prototype.forEach.call(lvBtns, function (b) { b.setAttribute("aria-pressed", String(b.dataset.level === lv)); });
      Array.prototype.forEach.call(document.querySelectorAll(".lvpane"), function (p) { p.hidden = p.dataset.level !== lv; });
      var d = $("lvdesc"); if (d) d.textContent = desc[lv];
    };
    Array.prototype.forEach.call(lvBtns, function (b) { b.addEventListener("click", function () { setLevel(b.dataset.level); }); });
    setLevel(S.level);
  }

  /* ---- éléments à insérer dans le dossier à rendre ---- */
  var dits = document.querySelectorAll("input[data-item]");
  if (dits.length) {
    var count = function () {
      var n = 0; Array.prototype.forEach.call(dits, function (c) { if (c.checked) n++; });
      var out = $("dcount"); if (out) out.textContent = n + " sur " + dits.length + " élément" + (dits.length > 1 ? "s" : "") + " inséré" + (n > 1 ? "s" : "") + " dans le dossier.";
    };
    Array.prototype.forEach.call(dits, function (c) {
      c.checked = !!S.items[c.dataset.item];
      c.addEventListener("change", function () { S.items[c.dataset.item] = c.checked; save(); count(); });
    });
    count();
  }

  /* ---- filtre des vidéos d'aide ---- */
  var vfbs = document.querySelectorAll(".vfb");
  if (vfbs.length) {
    Array.prototype.forEach.call(vfbs, function (b) {
      b.addEventListener("click", function () {
        Array.prototype.forEach.call(vfbs, function (o) { o.setAttribute("aria-pressed", String(o === b)); });
        Array.prototype.forEach.call(document.querySelectorAll(".vcard"), function (c) {
          c.hidden = !(b.dataset.vf === "all" || c.dataset.vlevel === b.dataset.vf);
        });
      });
    });
  }

  /* ---- cases « terminée » et « contrôlée » ---- */
  var cd = $("cdone"), cc = $("cctrl");
  if (cd && cc) {
    var n = cd.dataset.step;
    cd.checked = !!S.done[n]; cc.checked = !!S.ctrl[n];
    cd.addEventListener("change", function () { S.done[n] = cd.checked; save(); markNav(); });
    cc.addEventListener("change", function () { S.ctrl[n] = cc.checked; save(); });
  }
  var ip = $("indexprog");
  if (ip) {
    var d = 0, c = 0; for (var i = 1; i <= 6; i++) { if (S.done[i]) d++; if (S.ctrl[i]) c++; }
    ip.textContent = d ? d + " étape" + (d > 1 ? "s" : "") + " terminée" + (d > 1 ? "s" : "") + " sur 6, " + c + " contrôlée" + (c > 1 ? "s" : "") + "." : "Aucune étape terminée pour l'instant.";
  }

  /* ---- cahier des charges ---- */
  var BR = [
    { fn: "Prendre en compte les données environnementales", cr: "Être éco-conçue" },
    { fn: "Être transportable", cr: "Compacte" },
    { fn: "Intégrer des haut-parleurs", cr: "1 ou 2 HP" },
    { fn: "Susciter l'intérêt de l'utilisateur", cr: "Design innovant" },
    { fn: "Accueillir l'iPod shuffle", cr: "Surface d'appui" },
    { fn: "Se connecter à l'iPod", cr: "Prise jack 3.5mm" }
  ];

  /* ---- brainstorming, chapeaux ---- */
  if ($("mind")) {
    $("branch").innerHTML = BR.map(function (b, i) { return '<option value="' + i + '">' + esc(b.fn) + "</option>"; }).join("");
    var brHTML = function (i) {
      var b = BR[i], items = S.ideas.map(function (x, k) { return { x: x, k: k }; }).filter(function (o) { return o.x.b === i; });
      var h = '<div class="br"><h5>' + esc(b.fn) + '</h5><div class="cr">' + esc(b.cr) + "</div>";
      if (items.length) h += "<ul>" + items.map(function (o) { return "<li><span>" + esc(o.x.t) + '</span><button type="button" data-del="' + o.k + '" aria-label="Retirer cette idée">×</button></li>'; }).join("") + "</ul>";
      else h += '<div class="empty">Aucune idée pour l\'instant.</div>';
      return h + "</div>";
    };
    var renderMind = function () {
      $("mind").innerHTML = '<div class="side">' + [0, 1, 2].map(brHTML).join("") + '</div><div class="hub"><div>Station iPod<small>Cahier des charges</small></div></div><div class="side">' + [3, 4, 5].map(brHTML).join("") + "</div>";
      Array.prototype.forEach.call($("mind").querySelectorAll("[data-del]"), function (b) {
        b.addEventListener("click", function () { S.ideas.splice(+b.dataset.del, 1); save(); renderMind(); });
      });
    };
    $("addf").addEventListener("submit", function (e) {
      e.preventDefault(); var v = $("idea").value.trim(); if (!v) return;
      S.ideas.push({ t: v, b: +$("branch").value }); save(); $("idea").value = ""; renderMind(); $("idea").focus();
    });
    renderMind();

    var left = 300, tm = null;
    var clock = function () { var m = Math.floor(left / 60), s = left % 60; $("clock").textContent = (m < 10 ? "0" : "") + m + ":" + (s < 10 ? "0" : "") + s; };
    $("tstart").addEventListener("click", function () {
      if (tm) { clearInterval(tm); tm = null; $("tstart").textContent = "Reprendre"; return; }
      if (left <= 0) left = 300;
      $("tstart").textContent = "Pause";
      tm = setInterval(function () { left--; clock(); if (left <= 0) { clearInterval(tm); tm = null; $("tstart").textContent = "Démarrer"; } }, 1000);
    });
    $("treset").addEventListener("click", function () { if (tm) { clearInterval(tm); tm = null; } left = 300; clock(); $("tstart").textContent = "Démarrer"; });

    var HATS = [
      { n: "Blanc", c: "#ffffff", r: "Les faits", q: ["Quelles sont les dimensions de l'appareil à accueillir ?", "Qu'impose le cahier des charges : prise jack 3,5 mm, 1 ou 2 haut-parleurs ?", "Que sait-on sur les stations existantes ?"] },
      { n: "Rouge", c: "#d93a3a", r: "Les émotions", q: ["Qu'est-ce qui donne envie de la toucher, de la posséder ?", "Que ressent l'utilisateur en la voyant sur un bureau ?"] },
      { n: "Noir", c: "#222226", r: "La prudence", q: ["Qu'est-ce qui peut glisser, casser, gêner ?", "Où votre idée est-elle trop chère ou trop lourde à transporter ?"] },
      { n: "Jaune", c: "#f2c230", r: "Les avantages", q: ["Quels bénéfices pour l'utilisateur ?", "En quoi votre solution est-elle meilleure que celle d'un concurrent ?"] },
      { n: "Vert", c: "#2fa05a", r: "La créativité", q: ["Quelle idée jamais vue pourrait-on essayer ?", "Et si la station accueillait aussi un autre appareil mobile ?", "Comment réduire l'impact environnemental dès la forme ?"] },
      { n: "Bleu", c: "#2f6fe0", r: "L'organisation", q: ["Où en est le groupe ? Quelle idée retient-on ?", "Qui fait quoi, et qu'est-ce qui sera prêt pour le contrôle ?"] }
    ];
    var renderHats = function () {
      $("hats").innerHTML = HATS.map(function (h, i) { return '<button type="button" class="hat" data-h="' + i + '" aria-pressed="' + (S.hat === i) + '"><i style="background:' + h.c + '"></i>' + h.n + "</button>"; }).join("");
      var h = HATS[S.hat];
      $("hatbox").innerHTML = "<b>Chapeau " + h.n.toLowerCase() + " · " + h.r + "</b><ul>" + h.q.map(function (q) { return "<li>" + esc(q) + "</li>"; }).join("") + "</ul>";
      Array.prototype.forEach.call($("hats").querySelectorAll(".hat"), function (b) { b.addEventListener("click", function () { S.hat = +b.dataset.h; save(); renderHats(); }); });
    };
    renderHats();
  }

  /* ---- validation du cahier des charges (étape 6) ---- */
  if ($("cdcgrid")) {
    var cdcSum = function () {
      var o = 0, p = 0, n = 0;
      for (var i = 0; i < 6; i++) { var v = S.cdc[i]; if (v === "o") o++; else if (v === "p") p++; else if (v === "n") n++; }
      $("cdcsum").textContent = (o + p + n) ? o + " critère" + (o > 1 ? "s" : "") + " validé" + (o > 1 ? "s" : "") + ", " + p + " partiel" + (p > 1 ? "s" : "") + ", " + n + " non validé" + (n > 1 ? "s" : "") + " sur 6." : "Aucune fonction évaluée pour l'instant.";
    };
    $("cdcgrid").innerHTML = BR.map(function (b, i) {
      var v = S.cdc[i] || "";
      var r = function (val, lab) { return '<label><input type="radio" name="cdc' + i + '" value="' + val + '"' + (v === val ? " checked" : "") + "> " + lab + "</label>"; };
      return '<div class="ex"><div class="fn">' + esc(b.fn) + '</div><div class="cv"><small>Critère</small><b>' + esc(b.cr) + '</b></div><div class="seg" role="radiogroup" aria-label="Validation : ' + esc(b.fn) + '">' + r("o", "Oui") + r("p", "Partiel") + r("n", "Non") + '</div><input type="text" id="cdcn' + i + '" placeholder="Justification du choix, à recopier dans le compte-rendu" value="' + esc(S.cdcn[i] || "") + '" aria-label="Preuve : ' + esc(b.fn) + '" maxlength="140"></div>';
    }).join("");
    BR.forEach(function (b, i) {
      Array.prototype.forEach.call(document.getElementsByName("cdc" + i), function (el) { el.addEventListener("change", function () { S.cdc[i] = el.value; save(); cdcSum(); }); });
      $("cdcn" + i).addEventListener("input", function (e) { S.cdcn[i] = e.target.value; save(); });
    });
    cdcSum();
  }

  /* ---- barème et note sur 20 ---- */
  if ($("crits")) {
    var G = [
      { g: "Étude du cahier des charges", c: [
        { id: 1, t: "Énoncer le besoin", o: 0.5, p: 0 },
        { id: 2, t: "Diagrammes de contexte, de cas d'utilisations expliqués et justifiés", o: 2, p: 1 },
        { id: 3, t: "Croquis de l'iPod, DAO et mise en plan-cotation", o: 2, p: 1 }] },
      { g: "Choix de solutions", c: [
        { id: 4, t: "Justifier le choix de la solution retenue sur le plan économique (pourquoi votre solution est meilleure que celle des concurrents dans le segment de marché retenu), technologique (besoins satisfaits) et environnemental", o: 3, p: 1.5 },
        { id: 5, t: "Frontières de la solution retenue (coût, dimensions, masse, autonomie, …)", o: 1, p: 0.5 },
        { id: 6, t: "Représenter avec un logiciel de DAO la solution retenue", o: 2, p: 1 }] },
      { g: "Organisation de réalisation", c: [
        { id: 7, t: "Créativité : brainstorming, carte mentale, croquis", o: 2, p: 1 },
        { id: 8, t: "Justifier la construction de la solution retenue sur un logiciel de DAO", o: 1, p: 0.5 },
        { id: 9, t: "Assemblage de la station d'accueil avec les haut-parleurs et la prise jack fournis", o: 2, p: 1 },
        { id: 10, t: "Compte-rendu « Projet de la station d'accueil iPod » (remis au format numérique dans Devoirs à Restituer)", o: 2, p: 1 }] },
      { g: "Présentation", c: [
        { id: 11, t: "Support lisible, esthétique et illustré", o: 1, p: 0.5 },
        { id: 12, t: "Présentation orale audible, vocabulaire adapté", o: 1, p: 0.5 },
        { id: 13, t: "Répartition de la parole", o: 0.5, p: 0 }] }
    ];
    var CR = {}; G.forEach(function (g) { g.c.forEach(function (c) { CR[c.id] = c; }); });
    var total = function () {
      var t = 0; for (var id in CR) { var v = S.ev[id]; if (v === "o") t += CR[id].o; else if (v === "p") t += CR[id].p; }
      $("tot").innerHTML = fr(t) + "<small>/ 20</small>";
      $("ringfg").style.strokeDashoffset = String(326.7 * (1 - t / 20));
    };
    var renderEv = function () {
      var h = "";
      G.forEach(function (g) {
        var max = g.c.reduce(function (a, c) { return a + c.o; }, 0);
        h += '<div class="grp"><h4><span>' + esc(g.g) + "</span><span>" + fr(max) + " pts</span></h4>";
        g.c.forEach(function (c) {
          var v = S.ev[c.id] || "";
          var r = function (val, lab, pts) { return '<label><input type="radio" name="ev' + c.id + '" value="' + val + '"' + (v === val ? " checked" : "") + "> " + lab + " · " + fr(pts) + "</label>"; };
          h += '<div class="row"><p>' + esc(c.t) + '</p><div class="seg" role="radiogroup" aria-label="' + esc(c.t.slice(0, 60)) + '">' + r("o", "Oui", c.o) + r("p", "Partiel", c.p) + r("n", "Non", 0) + "</div></div>";
        });
        h += "</div>";
      });
      $("crits").innerHTML = h;
      Array.prototype.forEach.call($("crits").querySelectorAll("input[type=radio]"), function (el) {
        el.addEventListener("change", function () { S.ev[+el.name.slice(2)] = el.value; save(); total(); });
      });
      total();
    };
    $("resetev").addEventListener("click", function () { S.ev = {}; save(); renderEv(); });
    renderEv();
  }
  /* ---- annexe : ouvrir la fiche ciblée par l'ancre ---- */
  var openHash = function () {
    var h = location.hash.slice(1), el = h && document.getElementById(h);
    if (el && el.tagName === "DETAILS") { el.open = true; }
  };
  window.addEventListener("hashchange", openHash); openHash();
})();

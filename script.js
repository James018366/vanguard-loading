/*
 * Loading screen Clone Wars Vanguard — JavaScript ES5 (compatible avec le navigateur de Garry's Mod).
 * Garry's Mod appelle : GameDetails, SetFilesTotal, SetFilesNeeded, DownloadingFile, SetStatusChanged.
 * Ouvert dans un navigateur normal (GitHub Pages), une démo de chargement se lance toute seule.
 */
(function () {
	"use strict";

	var cfg = window.CONFIG || {};
	var $ = function (id) { return document.getElementById(id); };

	var raf = window.requestAnimationFrame || window.webkitRequestAnimationFrame ||
		function (cb) { return setTimeout(function () { cb(new Date().getTime()); }, 16); };

	function text(id, value) { var el = $(id); if (el) { el.textContent = value; } }

	// ------------------------------------------------------------------
	// Paramètres de l'URL : ?steamid=%s&map=%m (remplis par sv_loadingurl)
	// ------------------------------------------------------------------
	function param(name) {
		var match = new RegExp("[?&]" + name + "=([^&#]*)").exec(window.location.search);
		return match ? decodeURIComponent(match[1].replace(/\+/g, " ")) : "";
	}

	// ------------------------------------------------------------------
	// Espace : étoiles en parallaxe, nébuleuses bleue / rouge, sauts en hyperespace
	// ------------------------------------------------------------------
	var canvas = $("space");
	var ctx = canvas.getContext("2d");
	var W = 0, H = 0, stars = [], streaks = [], ships = [];

	function resize() {
		W = canvas.width = window.innerWidth;
		H = canvas.height = window.innerHeight;
		stars = [];
		var count = Math.floor(W * H / 2600);
		for (var i = 0; i < count; i++) {
			stars.push({ x: Math.random() * W, y: Math.random() * H, z: Math.random() * 0.9 + 0.1, t: Math.random() * 6.28 });
		}
	}

	function spawnShip() {
		var s = 0.5 + Math.random() * 0.9;
		ships.push({ x: -200, y: H * (0.12 + Math.random() * 0.25), s: s, v: 0.15 + s * 0.25 });
	}

	function nebula(x, y, r, color) {
		var g = ctx.createRadialGradient(x, y, 0, x, y, r);
		g.addColorStop(0, color);
		g.addColorStop(1, "rgba(0,0,0,0)");
		ctx.fillStyle = g;
		ctx.fillRect(x - r, y - r, r * 2, r * 2);
	}

	function drawShip(sh) {
		var k = H * 0.028 * sh.s;
		ctx.save();
		ctx.translate(sh.x, sh.y);
		ctx.fillStyle = "rgba(14,18,26,0.95)";
		ctx.beginPath();
		ctx.moveTo(k * 2.4, 0);
		ctx.lineTo(-k * 1.5, k * 0.38);
		ctx.lineTo(-k * 1.5, -k * 0.2);
		ctx.closePath();
		ctx.fill();
		ctx.fillRect(-k * 0.7, -k * 0.46, k * 0.38, k * 0.28);
		ctx.strokeStyle = "rgba(160,180,210,0.25)";
		ctx.lineWidth = 1;
		ctx.stroke();
		var glow = ctx.createRadialGradient(-k * 1.55, k * 0.08, 0, -k * 1.55, k * 0.08, k * 0.6);
		glow.addColorStop(0, "rgba(150,210,255,0.9)");
		glow.addColorStop(1, "rgba(80,150,255,0)");
		ctx.fillStyle = glow;
		ctx.fillRect(-k * 2.2, -k * 0.6, k * 1.3, k * 1.3);
		ctx.restore();
	}

	var last = 0, time = 0;

	function frame(now) {
		var dt = last ? Math.min((now - last) / 1000, 0.05) : 0.016;
		last = now;
		time += dt;

		ctx.fillStyle = "#03060c";
		ctx.fillRect(0, 0, W, H);

		// nébuleuses (bleu République à gauche, rouge Séparatiste à droite)
		ctx.globalCompositeOperation = "lighter";
		nebula(W * 0.18 + Math.sin(time * 0.05) * 40, H * 0.45, H * 0.85, "rgba(30,70,170,0.22)");
		nebula(W * 0.85 + Math.cos(time * 0.04) * 40, H * 0.55, H * 0.8, "rgba(170,35,30,0.20)");
		nebula(W * 0.55, H * 1.05, H * 0.6, "rgba(240,170,70,0.06)");
		ctx.globalCompositeOperation = "source-over";

		// étoiles
		for (var i = 0; i < stars.length; i++) {
			var st = stars[i];
			st.x -= st.z * st.z * 14 * dt;
			if (st.x < -2) { st.x = W + 2; st.y = Math.random() * H; }
			var a = (0.3 + 0.7 * st.z) * (0.75 + 0.25 * Math.sin(time * (1 + st.z * 3) + st.t));
			ctx.fillStyle = "rgba(225,235,255," + a.toFixed(3) + ")";
			var size = st.z * 1.8 + 0.4;
			ctx.fillRect(st.x, st.y, size, size);
		}

		// vaisseaux de la flotte, au loin
		if (Math.random() < dt * 0.06 && ships.length < 4) { spawnShip(); }
		for (var s = ships.length - 1; s >= 0; s--) {
			ships[s].x += ships[s].v * 60 * dt;
			drawShip(ships[s]);
			if (ships[s].x > W + 300) { ships.splice(s, 1); }
		}

		// sorties d'hyperespace : traînées lumineuses
		if (Math.random() < dt * 0.25) {
			streaks.push({ x: Math.random() * W, y: Math.random() * H * 0.8, len: 0, life: 0 });
		}
		for (var k = streaks.length - 1; k >= 0; k--) {
			var sk = streaks[k];
			sk.life += dt;
			var p = sk.life / 0.7;
			if (p >= 1) { streaks.splice(k, 1); continue; }
			var len = 260 * (1 - p);
			var grad = ctx.createLinearGradient(sk.x - len, sk.y, sk.x, sk.y);
			grad.addColorStop(0, "rgba(160,200,255,0)");
			grad.addColorStop(1, "rgba(220,235,255," + (0.8 * (1 - p)).toFixed(3) + ")");
			ctx.strokeStyle = grad;
			ctx.lineWidth = 1.5;
			ctx.beginPath();
			ctx.moveTo(sk.x - len, sk.y);
			ctx.lineTo(sk.x, sk.y);
			ctx.stroke();
		}

		raf(frame);
	}

	// ------------------------------------------------------------------
	// Barre de progression segmentée
	// ------------------------------------------------------------------
	var SEGMENTS = 48, segEls = [], shownPercent = 0, targetPercent = 0;

	function buildBar() {
		var bar = $("bar");
		bar.innerHTML = "";
		segEls = [];
		var width = bar.offsetWidth || 800;
		var segW = Math.max(4, Math.floor(width / SEGMENTS) - 3);
		for (var i = 0; i < SEGMENTS; i++) {
			var el = document.createElement("span");
			el.className = "seg";
			el.style.width = segW + "px";
			bar.appendChild(el);
			segEls.push(el);
		}
		renderBar();
	}

	function renderBar() {
		var lit = Math.round(shownPercent / 100 * SEGMENTS);
		for (var i = 0; i < segEls.length; i++) {
			segEls[i].className = "seg" + (i < lit ? (i === lit - 1 && shownPercent < 100 ? " on head" : " on") : "");
		}
		text("percent", Math.floor(shownPercent) + "%");
	}

	function setPercent(p) {
		targetPercent = Math.max(targetPercent, Math.min(100, p));
	}

	setInterval(function () {
		if (shownPercent < targetPercent) {
			shownPercent = Math.min(targetPercent, shownPercent + Math.max(0.4, (targetPercent - shownPercent) * 0.12));
			renderBar();
		}
	}, 40);

	// ------------------------------------------------------------------
	// Statut traduit
	// ------------------------------------------------------------------
	var STATUS = [
		[/workshop/i, "SYNCHRONISATION DU WORKSHOP"],
		[/lua/i, "DÉCRYPTAGE DES PROTOCOLES LUA"],
		[/client info/i, "ENVOI DE L'IDENTIFICATION"],
		[/retrieving server info/i, "RÉCUPÉRATION DES DONNÉES DU SERVEUR"],
		[/mounting/i, "MONTAGE DES ADDONS"],
		[/starting lua/i, "DÉMARRAGE DES SYSTÈMES"],
		[/sending client info/i, "ENVOI DE L'IDENTIFICATION"],
		[/parsing game info/i, "ANALYSE DU THÉÂTRE D'OPÉRATIONS"],
		[/precaching/i, "PRÉCHARGEMENT DES MODÈLES"],
		[/textures|materials/i, "CHARGEMENT DES TEXTURES"],
		[/download/i, "TÉLÉCHARGEMENT DES FICHIERS"]
	];

	function translateStatus(status) {
		for (var i = 0; i < STATUS.length; i++) {
			if (STATUS[i][0].test(status)) { return STATUS[i][1]; }
		}
		return String(status || "").toUpperCase();
	}

	// ------------------------------------------------------------------
	// API Garry's Mod
	// ------------------------------------------------------------------
	var filesTotal = 0, filesNeeded = 1, inGame = false, audio = null, gameVolume = 1;

	window.GameDetails = function (servername, serverurl, mapname, maxplayers, steamid, gamemode, volume) {
		inGame = true;
		text("srv", servername || cfg.serverName);
		text("map", (mapname || "—").toUpperCase());
		text("mode", (cfg.gamemodeLabel || gamemode || "—").toUpperCase());
		text("sid", steamid || "—");
		if (typeof volume === "number") { gameVolume = volume; }
		if (audio) { audio.volume = (cfg.musicVolume || 0.35) * gameVolume; }
		setPercent(4);
	};

	window.SetFilesTotal = function (total) {
		inGame = true;
		filesTotal = total;
		updateFiles();
	};

	window.SetFilesNeeded = function (needed) {
		inGame = true;
		filesNeeded = needed;
		updateFiles();
	};

	window.DownloadingFile = function (fileName) {
		inGame = true;
		text("file", "↓ " + fileName);
		filesNeeded = Math.max(filesNeeded - 1, 0);
		updateFiles();
	};

	window.SetStatusChanged = function (status) {
		inGame = true;
		text("status", translateStatus(status));
		// le chargement Lua / Workshop arrive après les téléchargements : on avance la barre
		if (/workshop/i.test(status)) { setPercent(Math.max(targetPercent, 60)); }
		if (/lua|starting/i.test(status)) { setPercent(Math.max(targetPercent, 85)); }
		if (/sending client info/i.test(status)) { setPercent(97); }
	};

	function updateFiles() {
		if (filesTotal > 0) {
			var done = Math.max(filesTotal - filesNeeded, 0);
			text("files", done + " / " + filesTotal + " FICHIERS");
			setPercent(5 + done / filesTotal * 55);
		}
	}

	// ------------------------------------------------------------------
	// Astuces : effet machine à écrire
	// ------------------------------------------------------------------
	var tips = (cfg.tips || []).slice(), tipIndex = -1, typing = null;

	function shuffle(a) {
		for (var i = a.length - 1; i > 0; i--) {
			var j = Math.floor(Math.random() * (i + 1)), t = a[i];
			a[i] = a[j]; a[j] = t;
		}
	}

	function nextTip() {
		if (!tips.length) { return; }
		tipIndex = (tipIndex + 1) % tips.length;
		var full = tips[tipIndex], i = 0, el = $("tip");
		clearInterval(typing);
		typing = setInterval(function () {
			i += 2;
			el.innerHTML = "";
			el.appendChild(document.createTextNode(full.substring(0, i)));
			var caret = document.createElement("span");
			caret.className = "caret";
			el.appendChild(caret);
			if (i >= full.length) { clearInterval(typing); }
		}, 28);
	}

	// ------------------------------------------------------------------
	// Bandeau HoloNet
	// ------------------------------------------------------------------
	var tickerX = 0, tickerEl = $("ticker-text"), tickerW = 0;

	function buildTicker() {
		var news = cfg.news || [], html = "";
		for (var r = 0; r < 2; r++) {
			for (var i = 0; i < news.length; i++) {
				html += "<span class=\"bullet\">◆</span>" + news[i].replace(/</g, "&lt;");
			}
		}
		tickerEl.innerHTML = html;
		tickerW = tickerEl.offsetWidth / 2;
		tickerX = 0;
	}

	setInterval(function () {
		if (tickerW > 0) {
			tickerX -= 1.2;
			if (-tickerX >= tickerW) { tickerX += tickerW; }
			tickerEl.style.webkitTransform = "translateX(" + tickerX + "px)";
			tickerEl.style.transform = "translateX(" + tickerX + "px)";
		}
	}, 16);

	// ------------------------------------------------------------------
	// Horloge
	// ------------------------------------------------------------------
	function pad(n) { return (n < 10 ? "0" : "") + n; }
	setInterval(function () {
		var d = new Date();
		text("clock", "HEURE GALACTIQUE " + pad(d.getHours()) + ":" + pad(d.getMinutes()) + ":" + pad(d.getSeconds()));
	}, 500);

	// ------------------------------------------------------------------
	// Musique
	// ------------------------------------------------------------------
	function startMusic() {
		if (!cfg.music) { return; }
		try {
			audio = new Audio(cfg.music);
			audio.loop = true;
			audio.volume = (cfg.musicVolume || 0.35) * gameVolume;
			var p = audio.play();
			if (p && p["catch"]) { p["catch"](function () {}); }
		} catch (e) {}
	}

	// ------------------------------------------------------------------
	// Démo hors du jeu (GitHub Pages)
	// ------------------------------------------------------------------
	var DEMO_FILES = [
		"models/player/smitty/bf2_reg/501st_trooper/501st_trooper.mdl",
		"materials/models/clones/104th/body_diff.vtf",
		"sound/weapons/dc15a/fire1.wav",
		"models/fisher/rogue/501st/501st.mdl",
		"materials/clonewars/logo.png",
		"lua/arccw/shared/attachments/republic_scope.lua",
		"maps/rp_venator_v3.bsp"
	];

	function demo() {
		window.GameDetails(cfg.serverName + " " + cfg.serverSub + " | RP Français", "", param("map") || "rp_venator_v3", 64,
			param("steamid") || "76561198000000000", "ixclonewars", 1);
		inGame = false;
		var total = 140, needed = total, step = 0;
		window.SetFilesTotal(total);
		window.SetStatusChanged("Retrieving server info...");
		var timer = setInterval(function () {
			step++;
			if (needed > 0) {
				needed = Math.max(needed - Math.ceil(Math.random() * 4), 0);
				window.SetFilesNeeded(needed + 1);
				window.DownloadingFile(DEMO_FILES[step % DEMO_FILES.length]);
				if (step === 3) { window.SetStatusChanged("Downloading..."); }
			} else if (step % 25 === 0) {
				var order = ["Mounting Workshop addons", "Starting Lua...", "Sending client info..."];
				var idx = Math.floor(step / 25) % (order.length + 1);
				if (idx < order.length) { window.SetStatusChanged(order[idx]); }
				else {
					// on recommence la démo
					targetPercent = shownPercent = 0; needed = total; renderBar();
					window.SetStatusChanged("Retrieving server info...");
				}
			}
		}, 120);
	}

	// ------------------------------------------------------------------
	// Démarrage
	// ------------------------------------------------------------------
	function init() {
		text("title", cfg.serverName || "CLONE WARS");
		text("sub", cfg.serverSub || "");
		text("tagline", cfg.tagline || "");
		text("srv", (cfg.serverName || "") + " " + (cfg.serverSub || ""));
		text("map", (param("map") || "—").toUpperCase());
		text("mode", (cfg.gamemodeLabel || "").toUpperCase());
		text("sid", param("steamid") || "—");
		if (cfg.discord) { text("discord", "DISCORD · " + cfg.discord.toUpperCase()); }

		var code = ((cfg.serverName || "") + " " + (cfg.serverSub || "")).toUpperCase().replace(/\s+/g, " · ").split("").join(" ");
		text("code", code);

		resize();
		buildBar();
		buildTicker();
		shuffle(tips);
		nextTip();
		setInterval(nextTip, 8000);
		startMusic();
		raf(frame);

		// hors du jeu : démo après 1,5 s sans appel de Garry's Mod
		setTimeout(function () { if (!inGame) { demo(); } }, 1500);
	}

	window.onresize = function () { resize(); buildBar(); };

	if (document.readyState === "complete" || document.readyState === "interactive") {
		setTimeout(init, 0);
	} else {
		document.addEventListener("DOMContentLoaded", init);
	}
})();

/* Pont Atlas UI — moteur Excel via PontSim */
(() => {
  const KEY = PontSim.STORAGE_KEY;
  const DEFAULTS = PontSim.DEFAULT_PARAMS;
  const MONTHS_FR = ["janv.","févr.","mars","avr.","mai","juin","juil.","août","sept.","oct.","nov.","déc."];
  const LINES = [
    ["alimentation", "Alimentation"],
    ["sorties", "Vie sociale"],
    ["voiture", "Voiture (usage)"],
    ["escapades", "Escapades"],
    ["sante", "Santé"],
    ["vetements", "Vêtements"],
    ["belgique", "Belgique"],
    ["cadeaux", "Cadeaux"],
    ["loyer", "Loyer (phase 2)"],
    ["charges", "Charges + ménage"],
  ];

  const eur0 = new Intl.NumberFormat("fr-BE", { style: "currency", currency: "EUR", maximumFractionDigits: 0 });
  const eur2 = new Intl.NumberFormat("fr-BE", { style: "currency", currency: "EUR", maximumFractionDigits: 2 });
  const num0 = new Intl.NumberFormat("fr-BE", { maximumFractionDigits: 0 });

  const formatEur = (v, fine) => (fine ? eur2 : eur0).format(fine ? Math.round(v * 100) / 100 : Math.round(v));
  const formatNum = (v) => num0.format(Math.round(v));
  function compactEur(value) {
    const abs = Math.abs(value);
    const sign = value < 0 ? "\u2212" : "";
    if (abs >= 1_000_000) return `${sign}${(abs / 1_000_000).toLocaleString("fr-BE", { maximumFractionDigits: 1 })} M\u20ac`;
    if (abs >= 10_000) return `${sign}${Math.round(abs / 1000).toLocaleString("fr-BE")} k\u20ac`;
    return formatEur(value);
  }
  function formatMonthLabel(yyyyMm) {
    const [y, m] = String(yyyyMm).split("-").map(Number);
    return `${MONTHS_FR[(m || 1) - 1] || ""} ${y}`;
  }

  function get(obj, path) {
    return path.split(".").reduce((o, k) => (o == null ? o : o[k]), obj);
  }
  function set(obj, path, value) {
    const parts = path.split(".");
    const last = parts.pop();
    let cur = obj;
    for (const p of parts) cur = cur[p];
    cur[last] = value;
  }

  function loadParams() {
    try {
      const raw = localStorage.getItem(KEY);
      if (!raw) return structuredClone(DEFAULTS);
      const parsed = JSON.parse(raw);
      return {
        ...structuredClone(DEFAULTS),
        ...parsed,
        central: { ...DEFAULTS.central, ...(parsed.central || {}) },
        prudent: { ...DEFAULTS.prudent, ...(parsed.prudent || {}) },
      };
    } catch {
      return structuredClone(DEFAULTS);
    }
  }

  const SECTIONS = [
    { title: "D\u00e9part", fields: [
      { path: "dateDepart", label: "Date de d\u00e9part", kind: "month", hint: "1er du mois" },
      { path: "dateNaissance", label: "Date de naissance", kind: "date" },
      { path: "dureeParents", label: "Dur\u00e9e chez les parents", kind: "int", suffix: "mois" },
      { path: "ageFinal", label: "Horizon (\u00e2ge final)", kind: "int", suffix: "ans" },
    ]},
    { title: "Vente Bruxelles", fields: [
      { path: "prixVente", label: "Prix de vente", kind: "num", suffix: "\u20ac", step: 1000 },
      { path: "fraisAgence", label: "Frais d'agence", kind: "pct", step: 0.01 },
      { path: "indemniteMois", label: "Indemnit\u00e9 de remploi", kind: "num", suffix: "mois", hint: "Mois d'int\u00e9r\u00eats dus \u00e0 Argenta" },
      { path: "mainlevee", label: "Mainlev\u00e9e hypoth\u00e9caire", kind: "num", suffix: "\u20ac" },
      { path: "tauxCredit", label: "Taux du cr\u00e9dit", kind: "pct", step: 0.01 },
      { path: "offsetPaiement", label: "Offset paiement Argenta", kind: "int", hint: "paiement_no = ann\u00e9e\u00d712 + mois + offset" },
    ]},
    { title: "\u00c9pargne & installation", fields: [
      { path: "epargne", label: "\u00c9pargne disponible", kind: "num", suffix: "\u20ac", step: 100 },
      { path: "voitureDh", label: "Voiture", kind: "num", suffix: "DH", step: 1000 },
      { path: "equipementDh", label: "Équipement (base 2026)", kind: "num", suffix: "DH" },
      { path: "eurMad", label: "Taux EUR / MAD", kind: "num", step: 0.1 },
      { path: "equipementDiffere", label: "Équipement différé à l'emménagement", kind: "bool", full: true, hint: "Sinon déduit du capital-pont au départ" },
    ]},
    { title: "Hypothèses macro", fields: [
      { path: "central.rendement", label: "Rendement — Central", kind: "pct", step: 0.1 },
      { path: "prudent.rendement", label: "Rendement — Prudent", kind: "pct", step: 0.1 },
      { path: "central.inflation", label: "Inflation — Central", kind: "pct", step: 0.1 },
      { path: "prudent.inflation", label: "Inflation — Prudent", kind: "pct", step: 0.1 },
      { path: "central.indexationLoyers", label: "Index. loyers — Central", kind: "pct", step: 0.1 },
      { path: "prudent.indexationLoyers", label: "Index. loyers — Prudent", kind: "pct", step: 0.1 },
    ]},
    { title: "Budget mensuel (base 2026)", fields: [
      { path: "alim", label: "Alimentation", kind: "num", suffix: "€" },
      { path: "sorties", label: "Vie sociale", kind: "num", suffix: "€" },
      { path: "voitureUsage", label: "Voiture (usage)", kind: "num", suffix: "€" },
      { path: "escapades", label: "Escapades Maroc", kind: "num", suffix: "€" },
      { path: "vetements", label: "Vêtements", kind: "num", suffix: "€" },
      { path: "belgique", label: "Belgique", kind: "num", suffix: "€" },
      { path: "cadeaux", label: "Cadeaux", kind: "num", suffix: "€" },
      { path: "loyerPhase2", label: "Loyer Harhoura", kind: "num", suffix: "€" },
      { path: "chargesPhase2", label: "Charges + ménage", kind: "num", suffix: "€" },
      { path: "nomPhase1", label: "Nom phase 1", kind: "text" },
      { path: "nomPhase2", label: "Nom phase 2", kind: "text" },
    ]},
    { title: "Santé", fields: [
      { path: "santeBase", label: "Santé base 2026", kind: "num", suffix: "€" },
      { path: "seuilAge1", label: "Seuil d'âge 1", kind: "int", suffix: "ans" },
      { path: "multAge1", label: "Multiplicateur 1", kind: "num", step: 0.05 },
      { path: "seuilAge2", label: "Seuil d'âge 2", kind: "int", suffix: "ans" },
      { path: "multAge2", label: "Multiplicateur 2", kind: "num", step: 0.05 },
      { path: "seuilAge3", label: "Seuil d'âge 3", kind: "int", suffix: "ans" },
      { path: "multAge3", label: "Multiplicateur 3", kind: "num", step: 0.05 },
    ]},
    { title: "Réduction sociale", fields: [
      { path: "ageSocial", label: "Âge seuil (vie sociale + escapades)", kind: "int", suffix: "ans" },
      { path: "facteurSocial", label: "Facteur", kind: "num", step: 0.05, hint: "0,5 = −50 %" },
    ]},
    { title: "Témara — locatif", fields: [
      { path: "temaraLoyerDh", label: "Loyer brut (base 2026)", kind: "num", suffix: "DH" },
      { path: "fractionAnnee", label: "Fraction d'année louée", kind: "num", step: 0.05, hint: "Phase 2 seulement. Pas de vacance en plus." },
      { path: "syndicDh", label: "Syndic (base 2026)", kind: "num", suffix: "DH" },
      { path: "taxeDh", label: "Taxe annuelle", kind: "num", suffix: "DH" },
    ]},
    { title: "Pension légale", fields: [
      { path: "pensionBrut", label: "Brut base 2026 (réel)", kind: "num", suffix: "€", hint: "mypension.be — en général une carrière jusqu’à 67 ans" },
      { path: "carriereDebut", label: "Début de carrière", kind: "date" },
      { path: "carriereAnsPlein", label: "Carrière complète", kind: "int", suffix: "ans", hint: "Belgique : 45 ans" },
      { path: "prorataCarriere", label: "Prorata à l’arrêt d’activité", kind: "bool", full: true, hint: "Réduit le brut aux années prestées jusqu’au départ" },
      { path: "precompte", label: "Précompte non-résident", kind: "pct" },
      { path: "indexationBelge", label: "Indexation belge", kind: "pct", hint: "Indice-santé, avant et après liquidation — pas l’inflation Maroc" },
      { path: "dateLiquidation", label: "Date de liquidation", kind: "month", full: true, hint: "Activation pension + versement Ethias" },
    ]},
    { title: "Ethias — 2e pilier", fields: [
      { path: "ethiasReserve", label: "Réserve au 01/01/2025", kind: "num", suffix: "€", step: 0.01 },
      { path: "ethiasPrime", label: "Prime annuelle", kind: "num", suffix: "€", step: 0.01 },
      { path: "ethiasDebut", label: "Début des cotisations", kind: "date" },
      { path: "ethiasImpot", label: "Imposition du capital", kind: "pct", hint: "16,5 % = sortie anticipée. À 67 ans, souvent 10 %" },
      { path: "ethiasSocial", label: "Prélèvements sociaux", kind: "pct" },
    ]},
  ];

  let params = loadParams();
  let result = PontSim.simulate(params);
  let monthN = 0;
  let tab = "budget";

  function displayValue(field, p) {
    const v = get(p, field.path);
    if (field.kind === "month") return String(v).slice(0, 7);
    if (field.kind === "pct") return Number((Number(v) * 100).toFixed(4));
    if (field.kind === "bool") return v ? "true" : "false";
    return v;
  }

  function parseValue(field, raw) {
    if (field.kind === "month") return raw.length === 7 ? `${raw}-01` : raw;
    if (field.kind === "pct") return Number(raw) / 100;
    if (field.kind === "bool") return raw === "true" || raw === true;
    if (field.kind === "text" || field.kind === "date") return raw;
    if (field.kind === "int") return Math.round(Number(raw) || 0);
    return Number(raw);
  }

  function fieldHTML(f) {
    const id = "f-" + f.path.replace(/\./g, "-");
    const val = displayValue(f, params);
    const full = f.full ? " full" : "";
    let control;
    if (f.kind === "bool") {
      control = `<select id="${id}" data-path="${f.path}" data-kind="${f.kind}">
        <option value="true"${val === "true" ? " selected" : ""}>Oui</option>
        <option value="false"${val === "true" ? "" : " selected"}>Non</option>
      </select>`;
    } else if (f.kind === "text") {
      control = `<input id="${id}" data-path="${f.path}" data-kind="${f.kind}" type="text" value="${String(val).replace(/"/g, "'")}">`;
    } else {
      const type = f.kind === "month" ? "month" : f.kind === "date" ? "date" : "number";
      const step = f.step != null ? ` step="${f.step}"` : f.kind === "int" ? ' step="1"' : "";
      control = `<input id="${id}" data-path="${f.path}" data-kind="${f.kind}" type="${type}" value="${val}"${step}>`;
    }
    const hint = f.hint ? `<span class="tiny">${f.hint}${f.suffix ? " · " + f.suffix : ""}</span>` : (f.suffix ? `<span class="tiny">${f.suffix}</span>` : "");
    return `<div class="field${full}"><label for="${id}">${f.label}</label>${control}${hint}</div>`;
  }

  function formHTML() {
    return SECTIONS.map((s) =>
      `<div class="section"><h3>${s.title}</h3><div class="fields">${s.fields.map(fieldHTML).join("")}</div></div><hr>`
    ).join("") + `<div style="display:grid;gap:0.5rem">
      <button type="button" class="btn btn-cedar" data-export style="width:100%">Exporter JSON</button>
      <button type="button" class="btn" data-reset style="width:100%">Réinitialiser les paramètres</button>
    </div>`;
  }

  function planPayload() {
    return {
      app: "pont-atlas",
      version: 1,
      exportedAt: new Date().toISOString(),
      storageKey: KEY,
      params,
      kpis: result && result.kpis ? result.kpis : null
    };
  }

  async function exportPlan() {
    const text = JSON.stringify(planPayload(), null, 2);
    const stamp = new Date().toISOString().slice(0, 10);
    const filename = `pont-atlas-${stamp}.json`;
    try {
      await navigator.clipboard.writeText(text);
    } catch {}
    const blob = new Blob([text], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    const btn = document.querySelector("[data-export]");
    if (btn) {
      const prev = btn.textContent;
      btn.textContent = "JSON copié + téléchargé";
      setTimeout(() => { btn.textContent = prev; }, 1600);
    }
  }

  function bindForm(root) {
    root.addEventListener("input", onForm);
    root.addEventListener("change", onForm);
    root.addEventListener("click", (e) => {
      if (e.target.closest("[data-export]")) {
        exportPlan();
        return;
      }
      if (e.target.closest("[data-reset]")) {
        params = structuredClone(DEFAULTS);
        try { localStorage.removeItem(KEY); } catch {}
        document.querySelectorAll(".params-root").forEach((el) => { el.innerHTML = formHTML(); });
        run();
      }
    });
  }

  function onForm(e) {
    const el = e.target;
    if (!el.dataset || !el.dataset.path) return;
    const field = SECTIONS.flatMap((s) => s.fields).find((f) => f.path === el.dataset.path);
    if (!field) return;
    set(params, field.path, parseValue(field, el.value));
    try { localStorage.setItem(KEY, JSON.stringify(params)); } catch {}
    const other = document.querySelectorAll(`[data-path="${field.path}"]`);
    other.forEach((n) => { if (n !== el) n.value = el.value; });
    run();
  }

  function pickMarkers(months) {
    const marks = [];
    const add = (n, label) => {
      if (n >= 0 && n < months.length && !marks.some((m) => m.n === n)) marks.push({ n, label });
    };
    add(0, "Départ");
    const emmenage = months.findIndex((m, i) => i > 0 && m.phase !== months[0]?.phase);
    if (emmenage > 0) add(emmenage, "Emménagement");
    const liq = months.findIndex((m) => m.apresLiq);
    if (liq >= 0) add(liq, "Liquidation");
    for (const age of [65, 75, 80, 85]) {
      const i = months.findIndex((m) => m.age >= age);
      if (i >= 0) add(i, `${age} ans`);
    }
    add(months.length - 1, "Horizon");
    return marks.sort((a, b) => a.n - b.n);
  }

  function kpiCell(label, c, p) {
    const tc = c < 0 ? " neg" : "";
    const tp = p < 0 ? " neg" : "";
    return `<div class="kpi"><div class="lbl">${label}</div><div class="c${tc}">${formatEur(c)}</div><div class="p${tp}">Prudent ${formatEur(p)}</div></div>`;
  }

  function renderKpis() {
    const k = result.kpis;
    const troughDate = result.months[k.troughNCentral]?.date;
    const bothOk = k.viableCentral && k.viablePrudent;
    const badge = document.getElementById("viable");
    badge.textContent = bothOk ? "Viable" : k.viableCentral ? "Prudent à risque" : "À risque";
    badge.className = "badge" + (bothOk ? "" : " risk");
    document.getElementById("kpis").innerHTML =
      kpiCell("Capital au départ", k.capitalDepartCentral, k.capitalDepartPrudent) +
      kpiCell(troughDate ? `Plus bas · ${formatMonthLabel(troughDate)}` : "Plus bas", k.minCentral, k.minPrudent) +
      kpiCell("Après Ethias", k.afterEthiasCentral ?? k.minCentral, k.afterEthiasPrudent ?? k.minPrudent) +
      kpiCell("Capital final", k.finalCentral, k.finalPrudent);
    document.getElementById("subtitle").textContent =
      `Retraite anticipée · Belgique → Maroc · départ ${formatMonthLabel(params.dateDepart.slice(0, 7))}`;
  }

  function renderBudget() {
    const months = result.months;
    if (!months.length) return;
    monthN = Math.min(monthN, months.length - 1);
    const row = months[monthN];
    const markers = pickMarkers(months);
    const chips = markers.map((m) =>
      `<button type="button" class="chip${m.n === monthN ? " on" : ""}" data-n="${m.n}">${m.label}</button>`
    ).join("");
    const body = LINES.map(([key, label]) => {
      const c = row.central.lines[key];
      const p = row.prudent.lines[key];
      if ((key === "loyer" || key === "charges") && !c && !p) return "";
      return `<tr><td>${label}</td><td>${formatEur(c)}</td><td>${formatEur(p)}</td></tr>`;
    }).join("");
    document.getElementById("tab-budget").innerHTML = `
      <div class="chips">${chips}</div>
      <label class="hint" style="display:block;margin:0.75rem 0 0.35rem">
        ${formatMonthLabel(row.date)} · ${row.age} ans · ${row.phase}
      </label>
      <input type="range" min="0" max="${months.length - 1}" value="${monthN}" id="month-range">
      <div class="scroll" style="margin-top:0.75rem">
        <table>
          <thead><tr><th>Poste</th><th>Central</th><th>Prudent</th></tr></thead>
          <tbody>
            ${body}
            <tr><td>Coût brut</td><td>${formatEur(row.central.cout)}</td><td>${formatEur(row.prudent.cout)}</td></tr>
            <tr><td>Témara net</td><td>${formatEur(row.central.temaraNet)}</td><td>${formatEur(row.prudent.temaraNet)}</td></tr>
            <tr><td>Coût net</td><td>${formatEur(row.central.coutNet)}</td><td>${formatEur(row.prudent.coutNet)}</td></tr>
            <tr><td>Pension</td><td>${formatEur(row.central.pension)}</td><td>${formatEur(row.prudent.pension)}</td></tr>
            <tr><td>Capital</td><td>${formatEur(row.central.capital)}</td><td>${formatEur(row.prudent.capital)}</td></tr>
          </tbody>
        </table>
      </div>`;
  }

  function rowHTML(label, value, muted) {
    return `<div class="row"><span>${label}</span><span class="num${muted ? " muted" : ""}">${value}</span></div>`;
  }

  function renderPont() {
    const p = result.pont;
    document.getElementById("tab-pont").innerHTML = `
      <div class="pont-grid">
        <div>
          <h3 class="sec-title">Capital-pont</h3>
          ${rowHTML("Paiement Argenta n°", formatNum(p.paiementNo))}
          ${rowHTML("Solde restant dû", formatEur(p.solde))}
          ${rowHTML("Prix de vente", formatEur(p.prixVente))}
          ${rowHTML("Frais d'agence", formatEur(p.fraisAgence), true)}
          ${rowHTML("Indemnité de remploi", formatEur(p.indemnite), true)}
          ${rowHTML("Mainlevée", formatEur(p.mainlevee), true)}
          ${rowHTML("Net vente", formatEur(p.netVente))}
          ${rowHTML("Épargne", formatEur(p.epargne))}
          ${rowHTML("Voiture", formatEur(p.voitureEur), true)}
          ${p.equipementCentral > 0
            ? rowHTML("Équipement au départ", formatEur(p.equipementCentral), true)
            : rowHTML("Équipement", "Différé à l'emménagement", true)}
          <div class="row" style="border-top:1px solid var(--line);margin-top:0.4rem;padding-top:0.55rem">
            <span style="font-weight:600;color:var(--ink)">Capital net au départ</span>
            <span class="display" style="font-size:1.1rem;font-weight:600">${formatEur(p.capitalDepartCentral)}</span>
          </div>
        </div>
        <div>
          <h3 class="sec-title">Ethias & pension</h3>
          ${rowHTML("Mois de cotisation", formatNum(p.contribMois))}
          ${rowHTML("Mois de gel (après départ)", formatNum(p.gelMois))}
          ${rowHTML("Ethias brut à la liquidation", formatEur(p.ethiasBrutCentral))}
          ${rowHTML("Ethias net versé", formatEur(p.ethiasNetCentral))}
          ${rowHTML("Pension nette base 2026", formatEur(p.pensionNetteBase, true))}
          ${rowHTML("Pension nominale à la liquidation", formatEur(p.pensionNominale))}
          <p class="hint">Carrière ${Number(p.carriereAnnees).toLocaleString("fr-BE", { maximumFractionDigits: 1 })} ans (${Math.round(p.carriereFraction * 100)} %) → brut retenu ${formatEur(p.pensionBrutRetenu, true)}. Index belge après liquidation. Ethias versé en une fois.</p>
        </div>
      </div>`;
  }

  function drawChart() {
    const canvas = document.getElementById("chart");
    const months = result.months;
    if (!canvas || !months.length) return;
    const wrap = canvas.parentElement;
    const cssW = wrap.clientWidth || 600;
    const cssH = canvas.clientHeight || 280;
    const dpr = window.devicePixelRatio || 1;
    canvas.width = Math.round(cssW * dpr);
    canvas.height = Math.round(cssH * dpr);
    canvas.style.width = cssW + "px";
    const ctx = canvas.getContext("2d");
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, cssW, cssH);
    const pad = { l: 56, r: 10, t: 18, b: 26 };
    const vals = months.flatMap((m) => [m.central.capital, m.prudent.capital]);
    let min = Math.min(0, ...vals);
    let max = Math.max(0, ...vals);
    const span = max - min || 1;
    min -= span * 0.08;
    max += span * 0.08;
    const x = (i) => pad.l + (i / Math.max(1, months.length - 1)) * (cssW - pad.l - pad.r);
    const y = (v) => pad.t + (1 - (v - min) / (max - min)) * (cssH - pad.t - pad.b);

    ctx.strokeStyle = "#ddd4c6";
    ctx.lineWidth = 1;
    ctx.setLineDash([3, 4]);
    const ticks = 4;
    ctx.font = "11px Figtree, system-ui, sans-serif";
    ctx.fillStyle = "#6b6458";
    ctx.textAlign = "right";
    ctx.textBaseline = "middle";
    for (let i = 0; i <= ticks; i++) {
      const v = min + ((max - min) * i) / ticks;
      const yy = y(v);
      ctx.beginPath();
      ctx.moveTo(pad.l, yy);
      ctx.lineTo(cssW - pad.r, yy);
      ctx.stroke();
      ctx.fillText(compactEur(v), pad.l - 6, yy);
    }
    ctx.setLineDash([]);
    ctx.strokeStyle = "#1a1814";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(pad.l, y(0));
    ctx.lineTo(cssW - pad.r, y(0));
    ctx.stroke();

    const liq = months.findIndex((m) => m.apresLiq);
    if (liq > 0) {
      ctx.setLineDash([4, 4]);
      ctx.strokeStyle = "#8a8276";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(x(liq), pad.t);
      ctx.lineTo(x(liq), cssH - pad.b);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = "#6b6458";
      ctx.textAlign = "left";
      ctx.textBaseline = "top";
      ctx.fillText("Liquidation", x(liq) + 4, pad.t);
    }

    function stroke(key, color) {
      ctx.beginPath();
      months.forEach((m, i) => {
        const xx = x(i);
        const yy = y(m[key].capital);
        if (i === 0) ctx.moveTo(xx, yy);
        else ctx.lineTo(xx, yy);
      });
      ctx.strokeStyle = color;
      ctx.lineWidth = 2.25;
      ctx.lineJoin = "round";
      ctx.stroke();
    }
    stroke("central", "#2f5d50");
    stroke("prudent", "#4a6670");

    ctx.fillStyle = "#6b6458";
    ctx.textAlign = "center";
    ctx.textBaseline = "top";
    for (let i = 0; i < months.length; i += 24) {
      ctx.fillText(months[i].date.slice(0, 4), x(i), cssH - pad.b + 6);
    }

    canvas._map = { x, y, pad, cssW, cssH, min, max };
  }

  function bindChart() {
    const canvas = document.getElementById("chart");
    const tip = document.getElementById("tip");
    const move = (ev) => {
      const months = result.months;
      if (!months.length || !canvas._map) return;
      const rect = canvas.getBoundingClientRect();
      const px = ev.clientX - rect.left;
      const { pad, cssW } = canvas._map;
      const t = (px - pad.l) / (cssW - pad.l - pad.r);
      const i = Math.max(0, Math.min(months.length - 1, Math.round(t * (months.length - 1))));
      const m = months[i];
      tip.style.display = "block";
      tip.style.left = Math.min(rect.width - 160, Math.max(8, px + 12)) + "px";
      tip.style.top = "12px";
      tip.innerHTML = `<strong>${formatMonthLabel(m.date)}</strong><br>
        <span style="color:#2f5d50">Central · ${formatEur(m.central.capital)}</span><br>
        <span style="color:#4a6670">Prudent · ${formatEur(m.prudent.capital)}</span>`;
    };
    canvas.addEventListener("pointermove", move);
    canvas.addEventListener("pointerleave", () => { tip.style.display = "none"; });
  }

  function showTab() {
    document.getElementById("tab-budget").hidden = tab !== "budget";
    document.getElementById("tab-pont").hidden = tab !== "pont";
    document.querySelectorAll("[data-tab]").forEach((b) => b.classList.toggle("on", b.dataset.tab === tab));
  }

  function run() {
    result = PontSim.simulate(params);
    renderKpis();
    renderBudget();
    renderPont();
    drawChart();
    showTab();
  }

  document.querySelectorAll(".params-root").forEach((el) => {
    el.innerHTML = formHTML();
    bindForm(el);
  });

  document.getElementById("tab-budget").addEventListener("input", (e) => {
    if (e.target.id === "month-range") {
      monthN = Number(e.target.value);
      renderBudget();
    }
  });
  document.getElementById("tab-budget").addEventListener("click", (e) => {
    const chip = e.target.closest("[data-n]");
    if (!chip) return;
    monthN = Number(chip.dataset.n);
    renderBudget();
  });
  document.querySelectorAll("[data-tab]").forEach((b) => {
    b.addEventListener("click", () => { tab = b.dataset.tab; showTab(); });
  });

  const sheet = document.getElementById("sheet");
  document.getElementById("open-params").addEventListener("click", () => sheet.classList.add("on"));
  document.getElementById("close-params").addEventListener("click", () => sheet.classList.remove("on"));
  sheet.addEventListener("click", (e) => { if (e.target === sheet) sheet.classList.remove("on"); });

  bindChart();
  window.addEventListener("resize", drawChart);
  run();

  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("./sw.js").catch(() => {});
  }

  let deferred;
  window.addEventListener("beforeinstallprompt", (e) => {
    e.preventDefault();
    deferred = e;
    document.getElementById("install-bar").classList.add("on");
  });
  document.getElementById("install-btn").addEventListener("click", async () => {
    if (!deferred) return;
    deferred.prompt();
    await deferred.userChoice;
    deferred = null;
    document.getElementById("install-bar").classList.remove("on");
  });
})();

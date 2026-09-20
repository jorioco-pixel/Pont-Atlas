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
      { path: "epargne", label: "\u00c9pargne disponible", kind: "num", suffix: "\u20ac", 

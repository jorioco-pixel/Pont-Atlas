d: "date" },
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
      <button type="button" class="btn btn-

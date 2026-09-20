cedar" data-export style="width:100%">Exporter JSON</button>
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
    badge.textContent = bothOk ? "Viable" : k.viableCentral ? "Prudent à risque" : 

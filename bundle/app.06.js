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
      ctx.textAlign = "le

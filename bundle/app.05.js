"À risque";
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
      

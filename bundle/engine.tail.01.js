
  // src/lib/simulation/balance.ts
  function remainingBalance(paiementNo, tauxAnnuel = CREDIT_RATE) {
    const n = Math.round(paiementNo);
    if (n < 1) return ORIGINAL_PRINCIPAL;
    if (n >= 1 && n <= AMORTIZATION_BALANCES.length) {
      return AMORTIZATION_BALANCES[n - 1] ?? ORIGINAL_PRINCIPAL;
    }
    let bal = AMORTIZATION_BALANCES[AMORTIZATION_BALANCES.length - 1] ?? ORIGINAL_PRINCIPAL;
    let pay = LAST_PAYMENT_AMOUNT;
    for (let i = AMORTIZATION_BALANCES.length + 1; i <= n; i++) {
      const interest = bal * tauxAnnuel / 12;
      const capital = Math.min(Math.max(pay - interest, 0), bal);
      bal -= capital;
      pay += 0.32;
      if (bal <= 0) return 0;
    }
    return bal;
  }

  // src/lib/simulation/dates.ts
  function parseISO(s) {
    const [y, m, d] = s.split("-").map((x) => Number(x));
    return { y: y || 1970, m: m || 1, d: d || 1 };
  }
  function ym(d) {
    return d.y * 12 + d.m;
  }
  function addMonths(d, n) {
    const t = d.m - 1 + n;
    const y = d.y + Math.floor(t / 12);
    const m = (t % 12 + 12) % 12 + 1;
    return { y, m, d: 1 };
  }
  function datedifYears(start, end) {
    let y = end.y - start.y;
    if (end.m < start.m || end.m === start.m && end.d < start.d) y -= 1;
    return y;
  }
  function geq(a, b) {
    if (a.y !== b.y) return a.y > b.y;
    if (a.m !== b.m) return a.m > b.m;
    return a.d >= b.d;
  }
  function sameMonth(a, b) {
    return a.y === b.y && a.m === b.m;
  }
  function monthsSinceJan2026(d) {
    return (d.y - 2026) * 12 + (d.m - 1);
  }

  // src/lib/simulation/engine.ts
  function santeMult(p, age) {
    if (age >= p.seuilAge3) return p.multAge3;
    if (age >= p.seuilAge2) return p.multAge2;
    if (age >= p.seuilAge1) return p.multAge1;
    return 1;
  }
  function futureValueAnnuity(reserve, primeAnnuelle, mois, rend) {
    const r = rend / 12;
    if (Math.abs(r) < 1e-12) return reserve + primeAnnuelle / 12 * mois;
    return reserve * (1 + r) ** mois + primeAnnuelle / 12 * (((1 + r) ** mois - 1) / r);
  }
  function emptyLines() {
    return {
      alimentation: 0,
      sorties: 0,
      voiture: 0,
      escapades: 0,
      sante: 0,
      vetements: 0,
      belgique: 0,
      cadeaux: 0,
      loyer: 0,
      charges: 0,
      temaraLoyer: 0,
      temaraSyndic: 0,
      temaraTaxe: 0
    };
  }
  function inPhase(p, phase, rule) {
    if (rule === "always") return true;
    if (rule === "phase1") return phase === p.nomPhase1;
    return phase === p.nomPhase2;
  }
  function monthCost(p, macro, phase, moisBase, sm, fs) {
    const infF = (1 + macro.inflation) ** (moisBase / 12);
    const loyF = (1 + macro.indexationLoyers) ** (moisBase / 12);
    const lines = emptyLines();
    lines.alimentation = p.alim * infF;
    lines.sorties = p.sorties * infF * fs;
    lines.voiture = p.voitureUsage * infF;
    lines.escapades = p.escapades * infF * fs;
    lines.sante = p.santeBase * infF * sm;
    lines.vetements = p.vetements * infF;
    lines.belgique = p.belgique * infF;
    lines.cadeaux = p.cadeaux * infF;
    if (phase === p.nomPhase2) {
      lines.loyer = p.loyerPhase2 * loyF;
      lines.charges = p.chargesPhase2 * infF;
    }
    const extras = [];
    let extraSum = 0;
    for (const line of p.customLines ?? []) {
      if (!inPhase(p, phase, line.phase)) {
        extras.push({ id: line.id, label: line.label, amount: 0 });
        continue;
      }
      const f = line.indexation === "loyers" ? loyF : infF;
      const amount = line.base * f * 


      const phase = n < p.dureeParents ? p.nomPhase1 : p.nomPhase2;
      const sm = santeMult(p, age);
      const fs = age >= p.ageSocial ? p.facteurSocial : 1;
      const apres = geq(d, liq);
      const { cout, temaraNet, lines, extras } = monthCost(p, macro, phase, moisBase, sm, fs);
      const coutNet = cout - temaraNet;
      const pension = apres ? pont.pensionNominale * (1 + p.indexationBelge) ** ((moisBase - pont.moisLiq) / 12) : 0;
      const infF = (1 + macro.inflation) ** (moisBase / 12);
      const equipement = n === p.dureeParents && p.equipementDiffere ? p.equipementDh * infF / p.eurMad : 0;
      const ethias = sameMonth(d, liq) ? ethiasNet : 0;
      cap = cap * (1 + macro.rendement / 12) - coutNet + pension - equipement + ethias;
      out.push({ cout, temaraNet, coutNet, pension, capital: cap, equipement, ethias, lines, extras });
    }
    return out;
  }
  function simulate(p) {
    const depart = parseISO(p.dateDepart);
    const birth = parseISO(p.dateNaissance);
    const liq = parseISO(p.dateLiquidation);
    const pont = buildPont(p);
    const age0 = datedifYears(birth, depart);
    const nMonths = Math.max(12, (p.ageFinal - age0 + 1) * 12);
    const central = runScenario(
      p,
      p.central,
      pont,
      pont.capitalDepartCentral,
      pont.ethiasNetCentral,
      nMonths,
      depart,
      birth,
      liq
    );
    const prudent = runScenario(
      p,
      p.prudent,
      pont,
      pont.capitalDepartPrudent,
      pont.ethiasNetPrudent,
      nMonths,
      depart,
      birth,
      liq
    );
    const months = [];
    let minC = Infinity;
    let minP = Infinity;
    let troughNCentral = 0;
    let troughNPrudent = 0;
    let troughBeforeEthiasCentral = pont.capitalDepartCentral;
    let troughBeforeEthiasPrudent = pont.capitalDepartPrudent;
    let afterEthiasCentral = null;
    let afterEthiasPrudent = null;
    for (let n = 0; n < nMonths; n++) {
      const d = addMonths(depart, n);
      const c = central[n];
      const q = prudent[n];
      if (c.capital < minC) {
        minC = c.capital;
        troughNCentral = n;
      }
      if (q.capital < minP) {
        minP = q.capital;
        troughNPrudent = n;
      }
      if (c.ethias === 0 && c.capital < troughBeforeEthiasCentral) {
        troughBeforeEthiasCentral = c.capital;
      }
      if (q.ethias === 0 && q.capital < troughBeforeEthiasPrudent) {
        troughBeforeEthiasPrudent = q.capital;
      }
      if (c.ethias !== 0) {
        troughBeforeEthiasCentral = Math.min(troughBeforeEthiasCentral, c.capital - c.ethias);
        afterEthiasCentral = c.capital;
      }
      if (q.ethias !== 0) {
        troughBeforeEthiasPrudent = Math.min(troughBeforeEthiasPrudent, q.capital - q.ethias);
        afterEthiasPrudent = q.capital;
      }
      months.push({
        n,
        date: `${d.y}-${String(d.m).padStart(2, "0")}`,
        moisBase26: monthsSinceJan2026(d),
        age: datedifYears(birth, d),
        phase: n < p.dureeParents ? p.nomPhase1 : p.nomPhase2,
        santeMult: santeMult(p, datedifYears(birth, d)),
        factSocial: datedifYears(birth, d) >= p.ageSocial ? p.facteurSocial : 1,
        apresLiq: geq(d, liq),
        central: c,
        prudent: q
      });
    }
    const lastC = central[nMonths - 1]?.capital ?? pont.capitalDepartCentral;
    const lastP = prudent[nMonths - 1]?.capital ?? pont.capitalDepartPrudent;
    const kpis = {
      capitalDepartCentral: pont.capitalDepartCentral,
      
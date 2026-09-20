"use strict";
var PontSim = (() => {
  var __defProp = Object.defineProperty;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from)) 
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

  // src/lib/simulation/browser-export.ts
  var browser_export_exports = {};
  __export(browser_export_exports, {
    DEFAULT_PARAMS: () => DEFAULT_PARAMS,
    STORAGE_KEY: () => STORAGE_KEY,
    simulate: () => simulate
  });

  // src/lib/simulation/amortization.ts
  var ORIGINAL_PRINCIPAL = 224e3;
  var CREDIT_RATE = 0.0344;
  var LAST_PAYMENT_AMOUNT = 1159.64;
var AMORTIZATION_BALANCES = [223646.52, 223290.41, 222931.66, 222570.29, 222206.29, 221839.66, 221470.4, 221098.51, 220723.98, 220346.83, 219967.05, 219584.64, 219199.6, 218811.93, 218421.62, 218028.69, 217633.13, 217234.94, 216834.12, 216430.67, 216024.58, 215615.87, 215204.53, 214790.56, 214373.96, 213954.73, 213532.86, 213108.37, 212681.25, 212251.5, 211819.12, 211384.11, 210946.46, 210506.19, 210063.29, 209617.76, 209169.6, 208718.81, 208265.38, 207809.33, 207350.65, 206889.34, 206425.4, 205958.83, 205489.62, 205017.79, 204543.33, 204066.24, 203586.52, 203104.17, 202619.18, 202131.57, 201641.33, 201148.46, 200652.96, 200154.83, 199654.06, 199150.67, 198644.65, 198136, 197624.72, 197110.81, 196594.26, 196075.09, 195553.29, 195028.86, 194501.8, 193972.11, 193439.78, 192904.83, 192367.25, 191827.04, 191284.2, 190738.73, 190190.62, 189639.89, 189086.53, 188530.54, 187971.92, 187410.67, 186846.78, 186280.27, 185711.13, 185139.36, 184564.96, 183987.93, 183408.26, 182825.97, 182241.05, 181653.5, 181063.32, 180470.51, 179875.06, 179276.99, 178676.29, 178072.96, 177467, 176858.41, 176247.18, 175633.33, 175016.85, 174397.74, 173776, 173151.63, 172524.62, 171894.99, 171262.73, 170627.84, 169990.32, 169350.17, 168707.38, 168061.97, 167413.93, 166763.26, 166109.96, 165454.03, 164795.46, 164134.27, 163470.45, 162804, 162134.92, 161463.21, 160788.86, 160111.89, 159432.29, 158750.06, 158065.2, 157377.71, 156687.58, 155994.83, 155299.45, 154601.44, 153900.8, 153197.53, 152491.62, 151783.09, 151071.93, 150358.14, 149641.72, 148922.67, 148200.98, 147476.67, 146749.73, 146020.16, 145287.96, 144553.13, 143815.66, 143075.57, 142332.85, 141587.5, 140839.52, 140088.91, 139335.66, 138579.79, 137821.29, 137060.16, 136296.4, 135530.01, 134760.98, 133989.33, 133215.05, 132438.14, 131658.6, 130876.43, 130091.62, 129304.19, 128514.13, 127721.44, 126926.12, 126128.17, 125327.58, 124524.37, 123718.53, 122910.06, 122098.96, 121285.23, 120468.86, 119649.87, 118828.25, 118004];

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
(line.social ? fs : 1);
      extras.push({ id: line.id, label: line.label, amount });
      extraSum += amount;
    }
    const cout = lines.alimentation + lines.sorties + lines.voiture + lines.escapades + lines.sante + lines.vetements + lines.belgique + lines.cadeaux + lines.loyer + lines.charges + extraSum;
    const revenuDh = phase === p.nomPhase2 ? p.temaraLoyerDh * loyF * p.fractionAnnee : 0;
    lines.temaraLoyer = revenuDh / p.eurMad;
    lines.temaraSyndic = p.syndicDh * infF / p.eurMad;
    lines.temaraTaxe = p.taxeDh / 12 * infF / p.eurMad;
    const temaraNet = lines.temaraLoyer - lines.temaraSyndic - lines.temaraTaxe;
    return { cout, temaraNet, lines, extras };
  }
  function buildPont(p) {
    const depart = parseISO(p.dateDepart);
    const liq = parseISO(p.dateLiquidation);
    const ethiasStart = parseISO(p.ethiasDebut);
    const paiementNo = ym(depart) + p.offsetPaiement;
    const solde = remainingBalance(paiementNo, p.tauxCredit);
    const fraisAgence = p.prixVente * p.fraisAgence;
    const indemnite = solde * p.tauxCredit / 12 * p.indemniteMois;
    const netVente = p.prixVente - solde - fraisAgence - indemnite - p.mainlevee;
    const voitureEur = p.voitureDh / p.eurMad;
    const moisBaseDepart = monthsSinceJan2026(depart);
    const equip = (inf) => p.equipementDiffere ? 0 : p.equipementDh * (1 + inf) ** (moisBaseDepart / 12) / p.eurMad;
    const contribMois = ym(depart) - ym(ethiasStart);
    const gelMois = ym(liq) - ym(depart);
    const ethiasBrut = (rend) => futureValueAnnuity(p.ethiasReserve, p.ethiasPrime, contribMois, rend) * (1 + rend / 12) ** gelMois;
    const taxFactor = (1 - p.ethiasImpot) * (1 - p.ethiasSocial);
    const carriereDebut = parseISO(p.carriereDebut);
    const carriereAnnees = Math.max(0, (ym(depart) - ym(carriereDebut)) / 12);
    const plein = p.carriereAnsPlein > 0 ? p.carriereAnsPlein : 45;
    const carriereFraction = p.prorataCarriere ? Math.min(1, carriereAnnees / plein) : 1;
    const pensionBrutRetenu = p.pensionBrut * carriereFraction;
    const pensionNetteBase = pensionBrutRetenu * (1 - p.precompte);
    const moisLiq = monthsSinceJan2026(liq);
    const pensionNominale = pensionNetteBase * (1 + p.indexationBelge) ** (moisLiq / 12);
    const equipC = equip(p.central.inflation);
    const equipP = equip(p.prudent.inflation);
    return {
      paiementNo,
      solde,
      prixVente: p.prixVente,
      fraisAgence,
      indemnite,
      mainlevee: p.mainlevee,
      netVente,
      epargne: p.epargne,
      voitureEur,
      moisBaseDepart,
      equipementCentral: equipC,
      equipementPrudent: equipP,
      capitalDepartCentral: netVente + p.epargne - voitureEur - equipC,
      capitalDepartPrudent: netVente + p.epargne - voitureEur - equipP,
      contribMois,
      gelMois,
      ethiasBrutCentral: ethiasBrut(p.central.rendement),
      ethiasBrutPrudent: ethiasBrut(p.prudent.rendement),
      ethiasNetCentral: ethiasBrut(p.central.rendement) * taxFactor,
      ethiasNetPrudent: ethiasBrut(p.prudent.rendement) * taxFactor,
      pensionNetteBase,
      moisLiq,
      pensionNominale,
      carriereAnnees,
      carriereFraction,
      pensionBrutRetenu
    };
  }
  function runScenario(p, macro, pont, startCap, ethiasNet, nMonths, depart, birth, liq) {
    const out = [];
    let cap = startCap;
    for (let n = 0; n < nMonths; n++) {
      const d = addMonths(depart, n);
      const moisBase = monthsSinceJan2026(d);
      const age = datedifYears(birth, d);

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
      capitalDepartPrudent: pont.capitalDepartPrudent,
      minCentral: minC,
      minPrudent: minP,
      troughBeforeEthiasCentral,
      troughBeforeEthiasPrudent,
      afterEthiasCentral,
      afterEthiasPrudent,
      finalCentral: lastC,
      finalPrudent: lastP,
      viableCentral: minC >= 0,
      viablePrudent: minP >= 0,
      troughNCentral,
      troughNPrudent
    };
    return { pont, months, kpis };
  }

  // src/lib/simulation/defaults.ts
  var DEFAULT_PARAMS = {
    dateDepart: "2033-12-01",
    dateNaissance: "1977-02-04",
    dureeParents: 12,
    prixVente: 345e3,
    fraisAgence: 0.0363,
    indemniteMois: 3,
    mainlevee: 729,
    tauxCredit: 0.0344,
    offsetPaiement: -24278,
    epargne: 109997,
    voitureDh: 2e5,
    equipementDh: 28500,
    equipementDiffere: true,
    eurMad: 10.5,
    central: { rendement: 0.03, inflation: 0.02, indexationLoyers: 0.025 },
    prudent: { rendement: 0.03, inflation: 0.03, indexationLoyers: 0.025 },
    alim: 260,
    sorties: 250,
    voitureUsage: 285,
    escapades: 106,
    vetements: 51,
    belgique: 38,
    cadeaux: 40,
    nomPhase1: "Parents",
    nomPhase2: "Harhoura",
    loyerPhase2: 714,
    chargesPhase2: 143,
    santeBase: 74,
    seuilAge1: 65,
    seuilAge2: 75,
    seuilAge3: 85,
    multAge1: 1.15,
    multAge2: 1.5,
    multAge3: 2,
    ageSocial: 80,
    facteurSocial: 0.5,
    temaraLoyerDh: 3500,
    fractionAnnee: 0.75,
    pensionBrut: 2250,
    precompte: 0.1111,
    indexationBelge: 0.02,
    dateLiquidation: "2044-02-01",
    carriereDebut: "1999-02-01",
    carriereAnsPlein: 45,
    prorataCarriere: true,
    ethiasReserve: 50166.01,
    ethiasPrime: 5146.3,
    ethiasDebut: "2025-01-01",
    ethiasImpot: 0.1,
    ethiasSocial: 0.0555,
    ageFinal: 90,
    syndicDh: 100,
    taxeDh: 2e3,
    customLines: []
  };
  var STORAGE_KEY = "pont-atlas:params:v1";
  return __toCommonJS(browser_export_exports);
})();

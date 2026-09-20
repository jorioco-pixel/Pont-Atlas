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

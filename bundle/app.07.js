ft";
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

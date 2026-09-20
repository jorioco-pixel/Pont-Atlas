  }

  let deferred;
  window.addEventListener("beforeinstallprompt", (e) => {
    e.preventDefault();
    deferred = e;
    document.getElementById("install-bar").classList.add("on");
  });
  document.getElementById("install-btn").addEventListener("click", async () => {
    if (!deferred) return;
    deferred.prompt();
    await deferred.userChoice;
    deferred = null;
    document.getElementById("install-bar").classList.remove("on");
  });
})();

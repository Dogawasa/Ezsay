(function () {
  function pageName() {
    return state.loggedIn ? state.page : "auth";
  }

  function addLoginDetails() {
    const loginPanel = document.querySelector(".login-panel");
    if (!loginPanel || loginPanel.querySelector(".studio-auth-strip")) return;

    const strip = document.createElement("div");
    strip.className = "studio-auth-strip";
    strip.innerHTML = `
      <div>
        <span>Writing studio</span>
        <strong>Prompt, draft, correct, review</strong>
      </div>
      <div class="studio-auth-chips" aria-label="Product strengths">
        <span>Live grammar</span>
        <span>AI examiner</span>
        <span>Progress memory</span>
      </div>
    `;
    loginPanel.appendChild(strip);

    const form = document.querySelector(".login-form");
    if (form && !form.querySelector(".studio-form-note")) {
      const note = document.createElement("div");
      note.className = "studio-form-note";
      note.innerHTML = `<strong>Private local account</strong><span>Your writing space stays tied to this browser for the static GitHub Pages version.</span>`;
      form.insertAdjacentElement("beforeend", note);
    }
  }

  function addAppDetails() {
    const shell = document.querySelector(".app-shell");
    if (!shell) return;

    document.querySelectorAll(".nav-item").forEach((item) => {
      const label = item.textContent.trim().toLowerCase();
      if (label.includes("home")) item.dataset.studioIcon = "H";
      if (label.includes("practice")) item.dataset.studioIcon = "P";
      if (label.includes("history")) item.dataset.studioIcon = "R";
    });

    const welcome = document.querySelector(".welcome");
    if (welcome && !welcome.querySelector(".studio-kicker")) {
      const kicker = document.createElement("div");
      kicker.className = "studio-kicker";
      kicker.textContent = pageName() === "practice" ? "Focused essay lab" : "EssayWise Academy";
      welcome.insertAdjacentElement("afterbegin", kicker);
    }

    const topbar = document.querySelector(".topbar");
    if (topbar && !topbar.querySelector(".studio-screen-badge")) {
      const badge = document.createElement("div");
      badge.className = "studio-screen-badge";
      badge.innerHTML = `<span>${pageName()}</span><strong>${wordCount(state.essay || "")} words active</strong>`;
      topbar.insertBefore(badge, document.querySelector(".top-actions"));
    }

    const practiceMain = document.querySelector(".practice-main");
    if (practiceMain && !practiceMain.querySelector(".studio-editor-label")) {
      const label = document.createElement("div");
      label.className = "studio-editor-label";
      label.innerHTML = `<span>Draft canvas</span><strong>Write naturally. The mentor watches precision, structure, and test readiness.</strong>`;
      const writingLayout = practiceMain.querySelector(".writing-layout");
      writingLayout?.insertAdjacentElement("beforebegin", label);
    }

    const rail = document.querySelector(".right-rail");
    if (rail && !rail.querySelector(".studio-mentor-card")) {
      const mentor = document.createElement("div");
      mentor.className = "rail-block studio-mentor-card";
      mentor.innerHTML = `
        <span>AI mentor state</span>
        <strong>${state.mode === "easy" ? "Live coaching active" : "Exam mode quiet"}</strong>
        <p>${state.mode === "easy" ? "Spelling, grammar, punctuation, and evidence checks update while you type." : "No hints until submission, so the review feels closer to a real exam."}</p>
      `;
      const firstBlock = rail.querySelector(".rail-block");
      firstBlock?.insertAdjacentElement("afterend", mentor);
    }

    document.querySelectorAll(".empty-state").forEach((empty) => {
      if (empty.querySelector(".studio-empty-kicker")) return;
      const kicker = document.createElement("span");
      kicker.className = "studio-empty-kicker";
      kicker.textContent = "Ready when you are";
      empty.insertAdjacentElement("afterbegin", kicker);
    });
  }

  function enhance() {
    document.body.classList.add("studio-redesign");
    document.body.dataset.studioPage = pageName();
    document.body.dataset.studioMode = state.mode || "easy";
    addLoginDetails();
    addAppDetails();
  }

  const previousRender = render;
  render = function () {
    previousRender();
    enhance();
  };

  const previousRenderAtTop = renderAtTop;
  renderAtTop = function () {
    previousRenderAtTop();
    enhance();
  };

  enhance();
})();

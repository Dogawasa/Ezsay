(function () {
  function enhanceLogin() {
    const mentorCard = document.querySelector(".mentor-card");
    if (!mentorCard || document.querySelector(".ai-lens-panel")) return;

    const panel = document.createElement("div");
    panel.className = "ai-lens-panel";
    panel.innerHTML = `
      <span class="ai-lens-kicker">AI review protocol</span>
      <ul>
        <li>Thesis and structure <span aria-hidden="true"></span></li>
        <li>Grammar under pressure <span aria-hidden="true"></span></li>
        <li>Examiner appeal <span aria-hidden="true"></span></li>
      </ul>
    `;
    mentorCard.insertAdjacentElement("afterend", panel);
  }

  function enhanceSidebar() {
    const sidebarNote = document.querySelector(".sidebar-note");
    if (!sidebarNote || document.querySelector(".mentor-status")) return;

    const status = document.createElement("div");
    status.className = "mentor-status";
    status.innerHTML = `
      <span>AI mentor</span>
      <strong>Examiner mode ready</strong>
      <p>Checks argument, grammar, clarity, and reader appeal after every practice session.</p>
    `;
    sidebarNote.insertAdjacentElement("afterend", status);
  }

  function enhancePractice() {
    const practiceMain = document.querySelector(".practice-main");
    const sectionHead = practiceMain?.querySelector(".section-head");
    if (!practiceMain || !sectionHead || document.querySelector(".ai-review-strip")) return;

    const strip = document.createElement("div");
    strip.className = "ai-review-strip";
    strip.innerHTML = `
      <div>
        <span>AI design upgrade</span>
        <strong>Write first, then get a sharper examiner read.</strong>
      </div>
      <p>Live help stays calm in Easy mode. Hard mode protects test focus until review.</p>
      <div class="ai-meter" aria-hidden="true"><i></i></div>
    `;
    sectionHead.insertAdjacentElement("afterend", strip);
  }

  function enhance() {
    document.body.classList.add("design-upgrade-ready");
    enhanceLogin();
    enhanceSidebar();
    enhancePractice();
  }

  const originalRender = render;
  render = function () {
    originalRender();
    enhance();
  };

  const originalRenderAtTop = renderAtTop;
  renderAtTop = function () {
    originalRenderAtTop();
    enhance();
  };

  enhance();
})();

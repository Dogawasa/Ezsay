(function () {
  function parseTargetRange() {
    const range = selectedTopic()?.range || "";
    const matches = range.match(/\d+/g)?.map(Number) || [];
    return {
      min: matches[0] || 250,
      max: matches[1] || matches[0] || 320,
      label: range || "250-320 words",
    };
  }

  function essaySignals() {
    const text = state.essay || "";
    const lower = text.toLowerCase();
    const paragraphs = text
      .split(/\n+/)
      .map((item) => item.trim())
      .filter(Boolean);

    return {
      thesis: /\b(i believe|in my opinion|this essay|should|must|needs to|is important|is harmful|is useful)\b/.test(lower) || wordCount(text) >= 45,
      evidence: /\b(for example|for instance|such as|because|a study|in school|in society|one reason)\b/.test(lower),
      structure: paragraphs.length >= 2 || wordCount(text) >= 150,
      closing: /\b(in conclusion|to conclude|overall|therefore|finally|in summary)\b/.test(lower),
    };
  }

  function ensureReadinessStrip(practiceMain, sectionHead) {
    let strip = document.querySelector(".ai-review-strip");
    if (!strip) {
      strip = document.createElement("div");
      strip.className = "ai-review-strip";
      sectionHead.insertAdjacentElement("afterend", strip);
    }

    if (!strip.classList.contains("practice-readiness-strip")) {
      strip.classList.add("practice-readiness-strip");
      strip.innerHTML = `
        <div>
          <span>Review readiness</span>
          <strong data-readiness-title>Build enough evidence before review.</strong>
        </div>
        <p data-readiness-copy>Live help stays calm in Easy mode. Hard mode protects test focus until review.</p>
        <div class="ai-meter" aria-hidden="true"><i></i></div>
      `;
    }

    return strip;
  }

  function ensureFocusBoard(practiceMain) {
    const editorToolbar = practiceMain.querySelector(".editor-toolbar");
    if (!editorToolbar || document.querySelector(".practice-focus-board")) return;

    const board = document.createElement("div");
    board.className = "practice-focus-board";
    board.innerHTML = `
      <div class="focus-summary">
        <span>Writing target</span>
        <strong data-focus-word-count>0 words</strong>
        <p data-focus-target>Choose a topic, then build your essay toward the recommended range.</p>
      </div>
      <div class="focus-checks" aria-label="Essay readiness checklist">
        <div class="focus-check" data-check="thesis"><span></span><strong>Thesis</strong><em>Answer the prompt clearly</em></div>
        <div class="focus-check" data-check="evidence"><span></span><strong>Evidence</strong><em>Add a concrete example</em></div>
        <div class="focus-check" data-check="structure"><span></span><strong>Structure</strong><em>Use paragraph flow</em></div>
        <div class="focus-check" data-check="closing"><span></span><strong>Closing</strong><em>End with a firm final line</em></div>
      </div>
    `;
    editorToolbar.insertAdjacentElement("afterend", board);
  }

  function updatePracticeReadiness() {
    if (!document.querySelector(".practice-main")) return;

    const count = wordCount(state.essay || "");
    const target = parseTargetRange();
    const progress = Math.max(0, Math.min(100, Math.round((count / target.min) * 100)));
    const signals = essaySignals();
    const complete = Object.values(signals).filter(Boolean).length;

    const wordCountNode = document.querySelector("[data-focus-word-count]");
    const targetNode = document.querySelector("[data-focus-target]");
    const titleNode = document.querySelector("[data-readiness-title]");
    const copyNode = document.querySelector("[data-readiness-copy]");
    const meter = document.querySelector(".practice-readiness-strip .ai-meter i");

    if (wordCountNode) wordCountNode.textContent = `${count} words`;
    if (targetNode) targetNode.textContent = `Recommended range: ${target.label}. Aim for at least ${target.min} before submitting.`;
    if (meter) meter.style.width = `${progress}%`;

    if (titleNode) {
      titleNode.textContent =
        count >= target.min && complete >= 3
          ? "Your draft is ready for a serious AI review."
          : "Build enough evidence before review.";
    }

    if (copyNode) {
      copyNode.textContent =
        count < target.min
          ? `${complete}/4 checks complete. Keep writing toward the recommended word range.`
          : complete >= 3
          ? "The essay has enough shape for examiner-style feedback."
          : `${complete}/4 readiness checks complete. Strengthen the missing parts before submitting.`;
    }

    Object.entries(signals).forEach(([key, ready]) => {
      const item = document.querySelector(`[data-check="${key}"]`);
      if (item) item.classList.toggle("ready", ready);
    });
  }

  function enhancePracticeRoom() {
    const practiceMain = document.querySelector(".practice-main");
    const sectionHead = practiceMain?.querySelector(".section-head");
    if (!practiceMain || !sectionHead) return;

    ensureReadinessStrip(practiceMain, sectionHead);
    ensureFocusBoard(practiceMain);

    const essayText = document.querySelector("#essayText");
    if (essayText && !essayText.dataset.practiceUpgradeBound) {
      essayText.dataset.practiceUpgradeBound = "true";
      essayText.addEventListener("input", () => updatePracticeReadiness());
    }

    updatePracticeReadiness();
  }

  const previousRender = render;
  render = function () {
    previousRender();
    enhancePracticeRoom();
  };

  const previousRenderAtTop = renderAtTop;
  renderAtTop = function () {
    previousRenderAtTop();
    enhancePracticeRoom();
  };

  enhancePracticeRoom();
})();

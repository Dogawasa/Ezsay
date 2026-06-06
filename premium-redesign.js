(function () {
  function pageCopy() {
    if (!state.loggedIn) {
      return {
        eyebrow: "EssayWise Academy",
        title: "Train essays like a serious writing studio.",
        copy: "Live correction, prompt focus, score review, and revision guidance in one private workspace.",
      };
    }

    const map = {
      home: {
        eyebrow: "Workspace",
        title: "Build a stronger essay habit.",
        copy: "Jump into practice, review your progress, and keep every draft tied to real improvement.",
      },
      practice: {
        eyebrow: "Practice Studio",
        title: "Draft with pressure, feedback, and focus.",
        copy: "Choose a prompt, write in easy or hard mode, then use the mentor to sharpen your answer.",
      },
      history: {
        eyebrow: "Progress Room",
        title: "See what your writing is becoming.",
        copy: "Every submitted essay turns into a record of scores, modes, word counts, and next steps.",
      },
      review: {
        eyebrow: "Examiner Report",
        title: "Turn one draft into a better version.",
        copy: "Use the score, diagnosis, and revision model to understand what the examiner noticed.",
      },
    };

    return map[state.page] || map.practice;
  }

  function ensureHero() {
    const page = document.querySelector(".page");
    if (!page || page.querySelector(".premium-hero")) return;

    const data = pageCopy();
    const hero = document.createElement("section");
    hero.className = "premium-hero";
    hero.innerHTML = `
      <div>
        <span>${data.eyebrow}</span>
        <h2>${data.title}</h2>
        <p>${data.copy}</p>
      </div>
      <div class="premium-hero-panel" aria-label="Current writing stats">
        <div><strong>${wordCount(state.essay || "")}</strong><span>Words</span></div>
        <div><strong>${state.history.length}</strong><span>Essays</span></div>
        <div><strong>${bestScore()}</strong><span>Best</span></div>
      </div>
    `;
    page.insertAdjacentElement("afterbegin", hero);
  }

  function enrichEmptyStates() {
    document.querySelectorAll(".empty-state").forEach((empty) => {
      if (empty.querySelector(".premium-empty-grid")) return;
      const grid = document.createElement("div");
      grid.className = "premium-empty-grid";
      grid.innerHTML = `
        <div><strong>01</strong><span>Pick an exam-style prompt</span></div>
        <div><strong>02</strong><span>Write with live correction</span></div>
        <div><strong>03</strong><span>Submit for a full review</span></div>
      `;
      empty.appendChild(grid);
    });
  }

  function refineCopy() {
    const loginTitle = document.querySelector(".login-copy h1");
    const loginCopy = document.querySelector(".login-copy p");
    const mentorCard = document.querySelector(".mentor-card");
    if (loginTitle) loginTitle.textContent = "Write essays with examiner feedback.";
    if (loginCopy) {
      loginCopy.textContent =
        "Choose a focused prompt, write in easy or hard mode, then get a rigorous review for grammar, structure, clarity, and task response.";
    }
    if (mentorCard) {
      mentorCard.innerHTML =
        "<strong>Writing mentor</strong>A calm, demanding reviewer for students who want direct corrections and a clearer next draft.";
    }

    const practiceHead = document.querySelector(".practice-main > .section-head");
    if (practiceHead) {
      const title = practiceHead.querySelector("h2");
      const copy = practiceHead.querySelector("p");
      if (title) title.textContent = "Prompt options";
      if (copy) copy.textContent = "Pick one brief, then use the range and checklist to plan your draft.";
    }

    const copyUpdates = [
      [".ai-lens-kicker", "Review protocol"],
      [".mentor-status span", "Writing mentor"],
      [".studio-mentor-card span", "Mentor state"],
      [".ai-review-strip .label, .ai-review-strip span", "Review readiness"],
      [".helper .hard-mode-hint strong", "Focus mode"],
      [".helper .hard-mode-hint span", "No live hints while you draft. Submit when you are ready for review."],
    ];

    copyUpdates.forEach(([selector, text]) => {
      document.querySelectorAll(selector).forEach((element) => {
        element.textContent = text;
      });
    });
  }

  function ensureHardModeStyle() {
    if (document.querySelector("#premium-hard-mode-style")) return;
    const style = document.createElement("style");
    style.id = "premium-hard-mode-style";
    style.textContent = `
      .premium-redesign .helper .hint,
      .premium-redesign .helper .hard-mode-hint {
        display: grid;
        gap: 8px;
        max-width: 100%;
        padding: 14px;
        border-color: rgba(99, 215, 215, 0.28);
        border-radius: 8px;
        background: rgba(255, 255, 255, 0.07);
        color: #f8fafc;
        line-height: 1.45;
        box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.04);
      }

      .premium-redesign .helper h3 {
        font-size: 1rem;
        line-height: 1.25;
      }

      .premium-redesign .helper .hint strong,
      .premium-redesign .helper .hard-mode-hint strong {
        display: block;
        color: #63d7d7;
        font-size: 0.76rem;
        line-height: 1.2;
        text-transform: uppercase;
        letter-spacing: 0;
      }

      .premium-redesign .helper .hint span,
      .premium-redesign .helper .hard-mode-hint span {
        display: block;
        color: #d3dfec;
        font-size: 0.88rem;
        line-height: 1.5;
      }
    `;
    document.head.appendChild(style);
  }

  function enhance() {
    document.body.classList.add("premium-redesign");
    ensureHardModeStyle();
    refineCopy();
    ensureHero();
    enrichEmptyStates();
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

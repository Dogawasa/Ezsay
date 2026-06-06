(function () {
  const navItems = [
    {
      page: "practice",
      label: "Practice",
      key: "practice",
      icon: "home",
    },
    {
      page: "history",
      label: "History",
      key: "history",
      icon: "clock",
    },
    {
      page: "review",
      label: "Review",
      key: "review",
      icon: "star",
    },
    {
      page: "practice",
      label: "Topics",
      key: "topics",
      icon: "book",
    },
    {
      page: "history",
      label: "Leaderboard",
      key: "leaderboard",
      icon: "trophy",
    },
    {
      page: "home",
      label: "Badges",
      key: "badges",
      icon: "medal",
    },
    {
      page: "home",
      label: "Study Hub",
      key: "study",
      icon: "cap",
    },
  ];

  const filterItems = [
    ["All", "all"],
    ["Education", "education"],
    ["Technology", "technology"],
    ["Environment", "environment"],
    ["Society", "society"],
    ["Culture", "culture"],
    ["Health", "health"],
  ];

  function svgIcon(name) {
    const icons = {
      home: '<path d="M4.5 10.2 12 4l7.5 6.2v8.2a1.6 1.6 0 0 1-1.6 1.6h-3.4v-5.5h-5V20H6.1a1.6 1.6 0 0 1-1.6-1.6Z"/><path d="M9.5 20v-5.5h5V20"/>',
      clock: '<circle cx="12" cy="12" r="8.4"/><path d="M12 7.8v4.8l3.2 1.9"/>',
      star: '<path d="m12 4.4 2.3 4.7 5.2.8-3.8 3.7.9 5.2-4.6-2.5-4.6 2.5.9-5.2-3.8-3.7 5.2-.8Z"/>',
      book: '<path d="M6 5.5h8.2a2.3 2.3 0 0 1 2.3 2.3v13H8.2A2.2 2.2 0 0 1 6 18.6Z"/><path d="M8.2 16.8h8.3M9.2 8.4h4.7M9.2 11.4h4.7"/>',
      trophy: '<path d="M8 5h8v4.5a4 4 0 0 1-8 0Z"/><path d="M8 7H5.4a2.4 2.4 0 0 0 2.4 4.2M16 7h2.6a2.4 2.4 0 0 1-2.4 4.2M12 13.5V17M9 20h6M10 17h4"/>',
      medal: '<path d="M8.8 4.5 12 9l3.2-4.5M9 4.5h6"/><circle cx="12" cy="14.6" r="4.2"/><path d="m12 12.6.7 1.3 1.4.2-1 1 .2 1.4-1.3-.7-1.3.7.2-1.4-1-1 1.4-.2Z"/>',
      cap: '<path d="m3.8 9.8 8.2-4 8.2 4-8.2 4Z"/><path d="M7 11.3v4.1c1.5 1.4 3.2 2.1 5 2.1s3.5-.7 5-2.1v-4.1M19.5 10.6v4.5"/>',
    };

    return `
      <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
        stroke-linecap="round" stroke-linejoin="round">${icons[name] || icons.home}</svg>
    `;
  }

  function greeting() {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  }

  function pointTotal() {
    const count = wordCount(state.essay || "");
    return 1820 + state.history.length * 120 + Math.min(420, count * 2);
  }

  function targetRange() {
    const range = selectedTopic()?.range || "300-360 words";
    const numbers = range.match(/\d+/g)?.map(Number) || [];
    return {
      min: numbers[0] || 300,
      label: range,
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
      thesis:
        /\b(i believe|in my opinion|this essay|should|must|needs to|is important|is harmful|is useful)\b/.test(
          lower,
        ) || wordCount(text) >= 45,
      evidence:
        /\b(for example|for instance|such as|because|a study|in school|in society|one reason)\b/.test(lower),
      structure: paragraphs.length >= 2 || wordCount(text) >= 150,
      conclusion: /\b(in conclusion|to conclude|overall|therefore|finally|in summary)\b/.test(lower),
    };
  }

  function setPage(page) {
    state.page = page;
    state.accountOpen = false;
    renderAtTop();
  }

  function navActive(item) {
    if (state.page === "practice") return item.key === "practice";
    if (state.page === "history") return item.key === "history";
    if (state.page === "review") return item.key === "review";
    if (state.page === "home") return item.key === "badges";
    return false;
  }

  function bindConceptNav() {
    document.querySelectorAll(".concept-nav-item").forEach((button) => {
      if (button.dataset.conceptBound) return;
      button.dataset.conceptBound = "true";
      button.addEventListener("click", () => setPage(button.dataset.page || "practice"));
    });
  }

  function enhanceSidebar() {
    const sidebar = document.querySelector(".sidebar");
    const nav = document.querySelector(".nav");
    if (!sidebar || !nav) return;

    const brandLabel = sidebar.querySelector(".brand span:last-child");
    if (brandLabel) brandLabel.textContent = "Ezsay";

    if (!nav.dataset.conceptReady) {
      nav.dataset.conceptReady = "true";
      nav.innerHTML = navItems
        .map(
          (item) => `
            <button class="nav-item concept-nav-item ${navActive(item) ? "active" : ""}"
              data-page="${item.page}" data-nav-key="${item.key}" type="button">
              <span class="nav-icon concept-nav-icon concept-nav-${item.icon}">${svgIcon(item.icon)}</span>
              <span>${item.label}</span>
            </button>
          `,
        )
        .join("");
    } else {
      nav.querySelectorAll(".concept-nav-item").forEach((button) => {
        const item = navItems.find((entry) => entry.key === button.dataset.navKey);
        button.classList.toggle("active", item ? navActive(item) : button.dataset.page === state.page);
      });
    }

    bindConceptNav();

    if (!sidebar.querySelector(".concept-sidebar-stack")) {
      const stack = document.createElement("div");
      stack.className = "concept-sidebar-stack";
      stack.innerHTML = `
        <section class="concept-shelf-card" aria-label="Encouragement">
          <div class="concept-shelf-art" aria-hidden="true">
            <span class="plant"></span>
            <span class="shelf"></span>
            <span class="books"></span>
          </div>
          <strong>You've got this!</strong>
          <p>Every paragraph makes you better.</p>
        </section>
        <section class="concept-weekly-card" aria-label="Weekly goal">
          <div>
            <strong>Weekly goal</strong>
            <span class="spark">Goal</span>
          </div>
          <p><span data-concept-goal-count>4</span> / 6 essays</p>
          <div class="concept-progress" aria-hidden="true"><i></i></div>
        </section>
      `;
      sidebar.appendChild(stack);
    }

    const goal = sidebar.querySelector("[data-concept-goal-count]");
    if (goal) goal.textContent = String(Math.min(6, Math.max(4, state.history.length)));
  }

  function enhanceTopbar() {
    const topbar = document.querySelector(".topbar");
    const topActions = document.querySelector(".top-actions");
    if (!topbar || !topActions) return;

    const name = state.username || "Student";
    const welcome = document.querySelector(".welcome");
    const title = welcome?.querySelector("h1");
    const subtitle = welcome?.querySelector(":scope > span");
    const kicker = welcome?.querySelector(".studio-kicker");
    if (kicker) kicker.remove();
    if (title) title.textContent = `${greeting()}, ${name}!`;
    if (subtitle) subtitle.textContent = "Keep practicing a little every day. Big progress comes from small steps.";

    if (!topActions.querySelector(".concept-stat-row")) {
      const stats = document.createElement("div");
      stats.className = "concept-stat-row";
      stats.innerHTML = `
        <div class="concept-stat-card concept-streak" aria-label="Day streak">
          <span aria-hidden="true">7</span>
          <strong data-concept-streak>7</strong>
          <em>Day streak</em>
        </div>
        <div class="concept-stat-card concept-points" aria-label="Points">
          <span aria-hidden="true">Star</span>
          <strong data-concept-points>1820</strong>
          <em>Points</em>
        </div>
      `;
      topActions.insertAdjacentElement("afterbegin", stats);
    }

    const streak = topActions.querySelector("[data-concept-streak]");
    const points = topActions.querySelector("[data-concept-points]");
    if (streak) streak.textContent = String(Math.max(7, currentStreak()));
    if (points) points.textContent = String(pointTotal());
  }

  function bindFilters() {
    document.querySelectorAll(".concept-filter").forEach((button) => {
      if (button.dataset.conceptBound) return;
      button.dataset.conceptBound = "true";
      button.addEventListener("click", () => {
        document.querySelectorAll(".concept-filter").forEach((item) => item.classList.remove("active"));
        button.classList.add("active");
      });
    });
  }

  function enhancePracticeTopics() {
    const practiceMain = document.querySelector(".practice-main");
    const sectionHead = practiceMain?.querySelector(".section-head");
    const topics = practiceMain?.querySelector(".topics");
    if (!practiceMain || !sectionHead || !topics) return;

    const title = sectionHead.querySelector("h2");
    const copy = sectionHead.querySelector("p");
    const refresh = sectionHead.querySelector("#newTopics");
    if (title) title.textContent = "Choose a topic";
    if (copy) copy.textContent = "The AI picks fresh, meaningful prompts for you to practice.";
    if (refresh) refresh.textContent = "Get new topics";

    if (!practiceMain.querySelector(".concept-topic-filters")) {
      const filters = document.createElement("div");
      filters.className = "concept-topic-filters";
      filters.setAttribute("aria-label", "Topic categories");
      filters.innerHTML = filterItems
        .map(
          ([label, key], index) => `
            <button class="concept-filter ${index === 0 ? "active" : ""}" data-filter="${key}" type="button">
              <span aria-hidden="true"></span>${label}
            </button>
          `,
        )
        .join("");
      sectionHead.insertAdjacentElement("afterend", filters);
    }

    if (!practiceMain.querySelector(".concept-topic-next")) {
      const next = document.createElement("button");
      next.className = "concept-topic-next";
      next.type = "button";
      next.setAttribute("aria-label", "Show another set of topics");
      next.innerHTML = svgIcon("home");
      next.addEventListener("click", () => {
        refreshTopics();
        saveDraft();
        render();
      });
      topics.insertAdjacentElement("afterend", next);
    }

    topics.querySelectorAll(".topic-card").forEach((card, index) => {
      if (!card.querySelector(".concept-topic-star")) {
        const star = document.createElement("span");
        star.className = "concept-topic-star";
        star.setAttribute("aria-hidden", "true");
        card.appendChild(star);
      }
      if (index === 0 && !card.querySelector(".concept-recommended")) {
        const badge = document.createElement("span");
        badge.className = "concept-recommended";
        badge.textContent = "Recommended";
        card.insertAdjacentElement("afterbegin", badge);
      }
    });

    bindFilters();
  }

  function enhanceEditor() {
    const practiceMain = document.querySelector(".practice-main");
    if (!practiceMain) return;

    const label = practiceMain.querySelector(".studio-editor-label");
    if (label) {
      label.innerHTML = `
        <div>
          <span>Your essay</span>
          <strong>Write your essay below. Aim for the recommended word range.</strong>
        </div>
      `;
    }
  }

  function mentorRailHtml() {
    const signals = essaySignals();
    const complete = Object.values(signals).filter(Boolean).length;
    const mode = state.mode === "hard" ? "Exam focus locked" : "Writing coach active";
    const modeCopy =
      state.mode === "hard"
        ? "Write as if this is a real test. The mentor will review your draft after you submit."
        : "Live checks help with spelling, grammar, structure, and evidence while you draft.";

    const checks = [
      ["thesis", "Thesis / Position", "Write your main idea clearly", "green"],
      ["evidence", "Evidence", "Add examples and support", "blue"],
      ["structure", "Structure", "Use clear paragraph flow", "orange"],
      ["conclusion", "Conclusion", "End with a strong closing", "purple"],
    ];

    return `
      <section class="concept-mentor-header">
        <span class="concept-bot" aria-hidden="true"></span>
        <div><strong>AI Mentor</strong><em>Beta</em></div>
      </section>
      <section class="concept-focus-card">
        <div>
          <strong>${mode}</strong>
          <p>${modeCopy}</p>
        </div>
        <span class="concept-lamp-art" aria-hidden="true"></span>
      </section>
      <section class="concept-checklist">
        <div class="concept-card-head"><strong>Writing checklist</strong><span>${complete} / 4 complete</span></div>
        ${checks
          .map(
            ([key, title, copy, color]) => `
              <div class="concept-check-row ${signals[key] ? "ready" : ""}" data-tone="${color}">
                <span aria-hidden="true"></span>
                <div><strong>${title}</strong><p>${copy}</p></div>
                <i aria-hidden="true"></i>
              </div>
            `,
          )
          .join("")}
      </section>
      <section class="concept-tip-card">
        <strong>Tips of the day</strong>
        <p>A strong essay has a clear idea, supporting reasons, and a confident conclusion.</p>
        <span class="concept-note-art" aria-hidden="true"></span>
      </section>
      <section class="concept-keep-card">
        <div>
          <strong>Keep it up!</strong>
          <p>You're building a powerful writing habit.</p>
        </div>
        <span class="concept-pencil-art" aria-hidden="true"></span>
      </section>
    `;
  }

  function enhanceMentorRail() {
    const rail = document.querySelector(".right-rail");
    if (!rail || state.page !== "practice") return;

    rail.classList.add("concept-right-rail");
    rail.innerHTML = mentorRailHtml();
  }

  function updateReadinessTone() {
    const count = wordCount(state.essay || "");
    const target = targetRange();
    const readiness = document.querySelector(".ai-review-strip");
    if (!readiness) return;

    readiness.dataset.conceptState = count >= target.min ? "ready" : "drafting";
  }

  function enhance() {
    document.body.classList.add("ezsay-concept-live");
    enhanceSidebar();
    enhanceTopbar();
    enhancePracticeTopics();
    enhanceEditor();
    enhanceMentorRail();
    updateReadinessTone();
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

(function () {
  state.email = state.email || "";
  state.authMode = state.authMode || "login";
  state.authError = state.authError || "";

  const authStyle = document.createElement("style");
  authStyle.textContent = `
    .auth-tabs {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 6px;
      padding: 4px;
      margin-bottom: 16px;
      border: 1px solid var(--line);
      border-radius: var(--radius);
      background: #f7f3ec;
    }

    .auth-tabs button {
      min-height: 36px;
      border: 0;
      border-radius: var(--radius);
      background: transparent;
      color: var(--muted);
      font-weight: 800;
    }

    .auth-tabs button.active {
      background: var(--navy);
      color: #f8f6f1;
    }

    .auth-error {
      margin-bottom: 14px;
      padding: 11px 12px;
      border: 1px solid rgba(200, 61, 77, 0.3);
      border-radius: var(--radius);
      background: #fff1f3;
      color: var(--burgundy);
      font-size: 13px;
      font-weight: 700;
      line-height: 1.45;
    }

    .auth-note {
      margin: -4px 0 18px;
      color: var(--muted);
      font-size: 12px;
      line-height: 1.45;
    }

    body[data-theme="dark"] .auth-tabs {
      background: #101827;
    }

    body[data-theme="dark"] .auth-error {
      background: #321b28;
    }
  `;
  document.head.appendChild(authStyle);

  function loadAccounts() {
    try {
      return JSON.parse(localStorage.getItem("essaywise-accounts") || "[]");
    } catch {
      return [];
    }
  }

  function saveAccounts(accounts) {
    localStorage.setItem("essaywise-accounts", JSON.stringify(accounts));
  }

  function normalizeEmail(email) {
    return email.trim().toLowerCase();
  }

  function normalizeUsername(username) {
    return username.trim().replace(/\s+/g, " ");
  }

  function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  function findAccount(identifier) {
    const normalized = normalizeEmail(identifier);
    return loadAccounts().find(
      (account) => account.email === normalized || account.username.toLowerCase() === normalized,
    );
  }

  function setActiveAccount(account) {
    state.username = account.username;
    state.email = account.email;
    localStorage.setItem("essaywise-active-account", account.email);
    loadUserData();
    state.loggedIn = true;
    state.accountOpen = false;
    state.reviewed = false;
    state.authError = "";
  }

  function createAccount(username, email, password) {
    const accounts = loadAccounts();
    const cleanUsername = normalizeUsername(username);
    const normalizedEmail = normalizeEmail(email);

    if (cleanUsername.length < 3) {
      return { error: "Username must be at least 3 characters." };
    }

    if (accounts.some((account) => account.email === normalizedEmail)) {
      return { error: "This email already has an account." };
    }

    if (accounts.some((account) => account.username.toLowerCase() === cleanUsername.toLowerCase())) {
      return { error: "This username is already taken." };
    }

    const account = {
      username: cleanUsername,
      email: normalizedEmail,
      password,
      createdAt: new Date().toISOString(),
    };

    saveAccounts([...accounts, account]);
    return { account };
  }

  renderLogin = function () {
    const isSignup = state.authMode === "signup";

    return `
      <section class="login-shell">
        <div class="login-panel">
          <div>
            <div class="brand"><span class="mark">E</span><span>EssayWise Academy</span></div>
            <div class="login-copy">
              <h1>Practice essays with a director's eye.</h1>
              <p>Choose an AI-generated topic, write under easy or hard mode, then receive a rigorous review from a mentor trained like an IELTS examiner and elite writing professor.</p>
            </div>
            <div class="mentor-card">
              <strong>AI personality</strong>
              Oxford writing tutor, Harvard essay coach, and IELTS director in one calm, demanding reviewer.
            </div>
          </div>
        </div>
        <div class="login-form-wrap">
          <form class="login-form" id="loginForm">
            <h2>${isSignup ? "Create account" : "Student login"}</h2>
            <p>${isSignup ? "Create one writing account with a unique username, email, and password." : "Log in with your username or email to open your own writing space."}</p>
            <div class="auth-tabs" aria-label="Account mode">
              <button class="${!isSignup ? "active" : ""}" data-auth-mode="login" type="button">Log in</button>
              <button class="${isSignup ? "active" : ""}" data-auth-mode="signup" type="button">Sign up</button>
            </div>
            ${state.authError ? `<div class="auth-error">${state.authError}</div>` : ""}
            <div class="field">
              <label for="username">${isSignup ? "Username" : "Username or email"}</label>
              <input id="username" value="${state.username}" autocomplete="username" placeholder="${isSignup ? "Choose username" : "Enter username or email"}" />
            </div>
            ${
              isSignup
                ? `<div class="field">
                    <label for="email">Email</label>
                    <input id="email" type="email" value="${state.email}" autocomplete="email" placeholder="name@example.com" />
                  </div>`
                : ""
            }
            <div class="field">
              <label for="password">Password</label>
              <input id="password" type="password" autocomplete="${isSignup ? "new-password" : "current-password"}" placeholder="Enter password" />
            </div>
            ${
              isSignup
                ? `<div class="field">
                    <label for="confirmPassword">Confirm password</label>
                    <input id="confirmPassword" type="password" autocomplete="new-password" placeholder="Confirm password" />
                  </div>`
                : ""
            }
            ${isSignup ? `<p class="auth-note">Each username and email can only be used for one local account on this browser.</p>` : ""}
            <button class="primary-btn" type="submit">${isSignup ? "Create account" : "Enter writing room"}</button>
          </form>
        </div>
      </section>
    `;
  };

  bindEvents = function () {
    const loginForm = document.querySelector("#loginForm");
    if (loginForm) {
      loginForm.addEventListener("submit", (event) => {
        event.preventDefault();
        const name = normalizeUsername(document.querySelector("#username").value);
        const password = document.querySelector("#password").value;

        if (state.authMode === "signup") {
          const email = document.querySelector("#email").value.trim();
          const confirmPassword = document.querySelector("#confirmPassword").value;

          if (!name || !email || !password) {
            state.authError = "Please enter username, email, and password.";
            renderAtTop();
            return;
          }

          if (!isValidEmail(email)) {
            state.authError = "Please enter a valid email address.";
            renderAtTop();
            return;
          }

          if (password.length < 4) {
            state.authError = "Password must be at least 4 characters.";
            renderAtTop();
            return;
          }

          if (password !== confirmPassword) {
            state.authError = "Passwords do not match.";
            renderAtTop();
            return;
          }

          const result = createAccount(name, email, password);
          if (result.error) {
            state.authError = result.error;
            renderAtTop();
            return;
          }

          setActiveAccount(result.account);
        } else {
          const account = findAccount(name);

          if (!account || account.password !== password) {
            state.authError = "Account not found or password is incorrect.";
            renderAtTop();
            return;
          }

          setActiveAccount(account);
        }

        renderAtTop();
      });
    }

    document.querySelectorAll("[data-auth-mode]").forEach((button) => {
      button.addEventListener("click", () => {
        state.authMode = button.dataset.authMode;
        state.authError = "";
        render();
      });
    });

    document.querySelectorAll("[data-page]").forEach((button) => {
      button.addEventListener("click", () => {
        state.page = button.dataset.page;
        state.accountOpen = false;
        renderAtTop();
      });
    });

    const profileButton = document.querySelector("#profileButton");
    if (profileButton) {
      profileButton.addEventListener("click", () => {
        state.accountOpen = !state.accountOpen;
        render();
      });
    }

    const darkModeToggle = document.querySelector("#darkModeToggle");
    if (darkModeToggle) {
      darkModeToggle.addEventListener("click", () => {
        state.settings.darkMode = !state.settings.darkMode;
        saveSettings();
        render();
      });
    }

    const timeFormat = document.querySelector("#timeFormat");
    if (timeFormat) {
      timeFormat.addEventListener("change", (event) => {
        state.settings.timeFormat = event.target.value;
        saveSettings();
        render();
      });
    }

    const fontChoice = document.querySelector("#fontChoice");
    if (fontChoice) {
      fontChoice.addEventListener("change", (event) => {
        state.settings.font = event.target.value;
        saveSettings();
        render();
      });
    }

    const signOut = document.querySelector("#signOut");
    if (signOut) {
      signOut.addEventListener("click", () => {
        saveDraft();
        state.loggedIn = false;
        state.accountOpen = false;
        state.authMode = "login";
        state.authError = "";
        state.page = "practice";
        state.username = "";
        state.email = "";
        state.essay = "";
        state.history = [];
        state.settings = defaultSettings();
        localStorage.removeItem("essaywise-active-account");
        applySettings();
        renderAtTop();
      });
    }

    const deleteAccount = document.querySelector("#deleteAccount");
    if (deleteAccount) {
      deleteAccount.addEventListener("click", () => {
        const confirmed = window.confirm("Delete this local account, essay history, and settings?");
        if (!confirmed) return;
        clearCurrentUserData();
        const accounts = loadAccounts().filter((account) => account.email !== state.email);
        saveAccounts(accounts);
        localStorage.removeItem("essaywise-active-account");
        state.loggedIn = false;
        state.accountOpen = false;
        state.authMode = "login";
        state.authError = "";
        state.username = "";
        state.email = "";
        state.essay = "";
        state.history = [];
        state.settings = defaultSettings();
        applySettings();
        renderAtTop();
      });
    }

    document.querySelectorAll("[data-topic]").forEach((button) => {
      button.addEventListener("click", () => {
        state.topicId = button.dataset.topic;
        saveDraft();
        render();
      });
    });

    document.querySelectorAll("[data-mode]").forEach((button) => {
      button.addEventListener("click", () => {
        state.mode = button.dataset.mode;
        saveDraft();
        render();
      });
    });

    const essayText = document.querySelector("#essayText");
    if (essayText) {
      essayText.addEventListener("input", (event) => {
        state.essay = event.target.value;
        saveDraft();
        document.querySelector(".word-pill").textContent = `${wordCount(state.essay)} words`;
        updateEditorHighlights();
        const helper = document.querySelector(".helper");
        if (helper && state.mode === "easy") {
          helper.innerHTML = renderEasyHints();
          bindFixButtons();
        }
      });
      essayText.addEventListener("scroll", () => updateEditorHighlights());
    }

    bindFixButtons();

    const submit = document.querySelector("#submitEssay");
    if (submit) {
      submit.addEventListener("click", () => {
        addHistoryEntry();
        saveDraft();
        state.page = "review";
        state.reviewed = true;
        renderAtTop();
      });
    }

    const back = document.querySelector("#backToPractice");
    if (back) {
      back.addEventListener("click", () => {
        state.page = "practice";
        renderAtTop();
      });
    }

    const refresh = document.querySelector("#newTopics");
    if (refresh) {
      refresh.addEventListener("click", () => {
        refreshTopics();
        saveDraft();
        render();
      });
    }
  };

  const activeEmail = localStorage.getItem("essaywise-active-account");
  const activeAccount = activeEmail ? findAccount(activeEmail) : null;
  if (activeAccount) {
    setActiveAccount(activeAccount);
  }

  render();
})();

(function () {
  const extraSpellingFixes = {
    acadamic: "academic",
    adress: "address",
    arguement: "argument",
    beleive: "believe",
    benifit: "benefit",
    bussiness: "business",
    calender: "calendar",
    challange: "challenge",
    chang: "change",
    citys: "cities",
    cleary: "clearly",
    collage: "college",
    comming: "coming",
    comunication: "communication",
    concusion: "conclusion",
    conculsion: "conclusion",
    confidance: "confidence",
    creativty: "creativity",
    disscuss: "discuss",
    eduction: "education",
    efect: "effect",
    everyones: "everyone's",
    exampel: "example",
    expain: "explain",
    futher: "further",
    goign: "going",
    goingf: "going",
    goverment: "government",
    improove: "improve",
    intresting: "interesting",
    knowlege: "knowledge",
    lanuage: "language",
    mallw: "mall",
    necesary: "necessary",
    opinon: "opinion",
    persent: "present",
    proffesional: "professional",
    profressional: "professional",
    recieve: "receive",
    relevent: "relevant",
    sentense: "sentence",
    stong: "strong",
    sucess: "success",
    tecnology: "technology",
    todays: "today's",
    understnad: "understand",
    usefull: "useful",
    writen: "written",
  };

  Object.assign(spellingFixes, extraSpellingFixes);

  const knownWords = new Set(
    `
    a about ability able academic access activity actually advantage advice after again against ai all already also although always am an
    analyze and answer any argument around as ask attention audience author avoid balance be because become before beginning believe better
    between body book both build but by calendar can capital car care change city cities choice clear clearly college coming communication
    conclusion confidence connected control correct correction country create creativity daily deep describe detail develop digital direct
    discuss draft each earth easy education effect essay evidence example examiner explain exploration feedback final finally focus for
    freedom from future generation grammar grade government good hard has have health help helpful how i idea if improve improvement in
    individual information instruction interesting introduction is issue it its itself judgment knowledge language learner life limit line
    live mall major may media mentor mode modern money more must necessary not note now of on one opinion overall paragraph paragraphs
    personal physical platform position practice preserve printed private professional prompt public punctuation question range reader
    reading receive relevant responsibility responsible review rule school sentence should space spelling sport student students structure
    strong study such technology teacher test text their thesis think thinking this to today tool topic tradition transport use useful
    voice week wellbeing when whether why with word words work writing written young
  `
      .split(/\s+/)
      .filter(Boolean),
  );

  Object.values(spellingFixes).forEach((correction) => {
    correction
      .toLowerCase()
      .split(/[^a-z]+/)
      .filter(Boolean)
      .forEach((word) => knownWords.add(word));
  });

  function escapeRegExp(value) {
    return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  }

  function normalizeWord(word) {
    return word.toLowerCase().replace(/^'+|'+$/g, "");
  }

  function isKnownWord(word) {
    const lower = normalizeWord(word);
    if (!lower || lower.length <= 2) return true;
    if (knownWords.has(lower) || spellingFixes[lower]) return true;
    if (lower.endsWith("'s") && knownWords.has(lower.slice(0, -2))) return true;
    if (lower.endsWith("s") && knownWords.has(lower.slice(0, -1))) return true;
    if (lower.endsWith("ies") && knownWords.has(`${lower.slice(0, -3)}y`)) return true;
    if (lower.endsWith("ed") && (knownWords.has(lower.slice(0, -2)) || knownWords.has(`${lower.slice(0, -1)}`))) return true;
    if (lower.endsWith("ing") && (knownWords.has(lower.slice(0, -3)) || knownWords.has(`${lower.slice(0, -3)}e`))) return true;
    return false;
  }

  function editDistance(a, b, maxDistance = 2) {
    if (Math.abs(a.length - b.length) > maxDistance) return maxDistance + 1;
    const previous = Array.from({ length: b.length + 1 }, (_, index) => index);
    for (let i = 1; i <= a.length; i += 1) {
      let diagonal = previous[0];
      previous[0] = i;
      let rowMin = previous[0];
      for (let j = 1; j <= b.length; j += 1) {
        const temp = previous[j];
        const cost = a[i - 1] === b[j - 1] ? 0 : 1;
        previous[j] = Math.min(previous[j] + 1, previous[j - 1] + 1, diagonal + cost);
        diagonal = temp;
        rowMin = Math.min(rowMin, previous[j]);
      }
      if (rowMin > maxDistance) return maxDistance + 1;
    }
    return previous[b.length];
  }

  function caseMatch(original, replacement) {
    if (original === original.toUpperCase()) return replacement.toUpperCase();
    if (original[0] === original[0]?.toUpperCase()) {
      return replacement.charAt(0).toUpperCase() + replacement.slice(1);
    }
    return replacement;
  }

  function getSpellingSuggestion(word) {
    const lower = normalizeWord(word);
    if (!lower || lower.length <= 2) return "";
    if (spellingFixes[lower]) return caseMatch(word, spellingFixes[lower]);
    if (isKnownWord(lower)) return "";

    for (let index = 0; index < lower.length; index += 1) {
      const removed = lower.slice(0, index) + lower.slice(index + 1);
      if (knownWords.has(removed)) return caseMatch(word, removed);
    }

    for (let index = 0; index < lower.length - 1; index += 1) {
      const swapped = `${lower.slice(0, index)}${lower[index + 1]}${lower[index]}${lower.slice(index + 2)}`;
      if (knownWords.has(swapped)) return caseMatch(word, swapped);
    }

    let best = "";
    let bestDistance = 3;
    knownWords.forEach((candidate) => {
      if (Math.abs(candidate.length - lower.length) > 1) return;
      const distance = editDistance(lower, candidate, 2);
      if (distance < bestDistance || (distance === bestDistance && candidate.length > best.length)) {
        best = candidate;
        bestDistance = distance;
      }
    });

    return best && bestDistance <= 1 ? caseMatch(word, best) : "";
  }

  function spellingIssueObjects(text) {
    const seen = new Set();
    const issues = [];
    text.replace(/\b[A-Za-z][A-Za-z']*\b/g, (word) => {
      const lower = normalizeWord(word);
      const suggestion = getSpellingSuggestion(word);
      if (!suggestion || seen.has(lower)) return word;
      seen.add(lower);
      issues.push({
        type: "Spelling",
        title: `Check spelling: "${word}"`,
        message: `Suggested correction: "${suggestion}".`,
        action: "replace-word",
        find: word,
        replace: suggestion,
      });
      return word;
    });
    return issues;
  }

  function grammarIssueObjects(text) {
    const issues = [];
    const addReplace = (match, replacement, title, message) => {
      if (!match) return;
      issues.push({
        type: "Grammar",
        title,
        message,
        action: "replace-phrase",
        find: match[0],
        replace: replacement,
      });
    };

    const repeated = text.match(/\b([A-Za-z]+)\s+\1\b/i);
    if (repeated) {
      addReplace(
        repeated,
        repeated[1],
        "Remove repeated word",
        `The word "${repeated[1]}" appears twice in a row.`,
      );
    }

    const subjectVerbRules = [
      [/\b(I|you|we|they)\s+is\b/i, "$1 are"],
      [/\b(he|she|it)\s+are\b/i, "$1 is"],
      [/\b(I|you|we|they)\s+has\b/i, "$1 have"],
      [/\b(he|she|it)\s+have\b/i, "$1 has"],
    ];
    subjectVerbRules.some(([pattern, replacement]) => {
      const match = text.match(pattern);
      if (!match) return false;
      addReplace(
        match,
        match[0].replace(pattern, replacement),
        "Check subject-verb agreement",
        "The subject and verb do not agree in this phrase.",
      );
      return true;
    });

    const contractionRules = {
      cant: "can't",
      couldnt: "couldn't",
      didnt: "didn't",
      doesnt: "doesn't",
      dont: "don't",
      isnt: "isn't",
      wasnt: "wasn't",
      wont: "won't",
      youre: "you're",
    };
    const contraction = text.match(/\b(cant|couldnt|didnt|doesnt|dont|isnt|wasnt|wont|youre)\b/i);
    if (contraction) {
      addReplace(
        contraction,
        caseMatch(contraction[0], contractionRules[contraction[0].toLowerCase()]),
        "Use the standard contraction",
        "Add the apostrophe so the word reads professionally.",
      );
    }

    const article = text.match(/\b(a)\s+([aeiou][A-Za-z]*)\b/i) || text.match(/\b(an)\s+([bcdfghjklmnpqrstvwxyz][A-Za-z]*)\b/i);
    if (article) {
      const replacement = article[1].toLowerCase() === "a" ? `an ${article[2]}` : `a ${article[2]}`;
      addReplace(article, caseMatch(article[0], replacement), "Check a/an usage", "Use the article that matches the next word's sound.");
    }

    const trimmed = text.trim();
    if (wordCount(trimmed) >= 4 && !/[.!?]$/.test(trimmed)) {
      issues.push({
        type: "Punctuation",
        title: "Add ending punctuation",
        message: "Finish the sentence with a period, question mark, or exclamation point.",
        action: "add-period",
      });
    }

    return issues;
  }

  spellingIssues = function (text) {
    return spellingIssueObjects(text).map((issue) => issue.find);
  };

  analyzeEssay = function (text) {
    const issues = [];
    const trimmed = text.trim();

    if (!trimmed) {
      return [
        {
          type: "Coaching",
          title: "Start with a thesis",
          message: "Write one sentence that clearly answers the prompt before adding examples.",
        },
      ];
    }

    const firstLetter = text.match(/[A-Za-z]/);
    if (firstLetter && firstLetter[0] !== firstLetter[0].toUpperCase()) {
      issues.push({
        type: "Grammar",
        title: "Capitalize the opening word",
        message: "Academic essays should begin with a capital letter.",
        action: "capitalize-start",
      });
    }

    issues.push(...spellingIssueObjects(text).slice(0, 3));

    if (/\bi\b/.test(text)) {
      issues.push({
        type: "Grammar",
        title: "Capitalize the pronoun I",
        message: "Use uppercase I when referring to yourself.",
        action: "capitalize-i",
      });
    }

    issues.push(...grammarIssueObjects(text));

    if (/\s{2,}/.test(text)) {
      issues.push({
        type: "Formatting",
        title: "Remove extra spacing",
        message: "Extra spaces make the writing look less polished.",
        action: "fix-spacing",
      });
    }

    if (wordCount(text) >= 60 && !/\n\s*\n/.test(text)) {
      issues.push({
        type: "Structure",
        title: "Break into paragraphs",
        message: "Separate the introduction, body idea, and conclusion instead of writing one long block.",
      });
    }

    if (wordCount(text) >= 35 && !/\bfor example\b|\bfor instance\b|\bsuch as\b/i.test(text)) {
      issues.push({
        type: "Evidence",
        title: "Add a specific example",
        message: "A concrete example makes the essay more persuasive and memorable.",
      });
    }

    return issues.slice(0, 7);
  };

  applyIssue = function (issue) {
    if (!issue?.action) return;
    if (issue.action === "capitalize-start") {
      state.essay = state.essay.replace(/[A-Za-z]/, (letter) => letter.toUpperCase());
    }
    if (issue.action === "replace-word") {
      state.essay = state.essay.replace(new RegExp(`\\b${escapeRegExp(issue.find)}\\b`, "i"), issue.replace);
    }
    if (issue.action === "replace-phrase") {
      state.essay = state.essay.replace(new RegExp(escapeRegExp(issue.find), "i"), issue.replace);
    }
    if (issue.action === "capitalize-i") {
      state.essay = state.essay.replace(/\bi\b/g, "I");
    }
    if (issue.action === "fix-spacing") {
      state.essay = state.essay.replace(/[ \t]{2,}/g, " ");
    }
    if (issue.action === "add-period") {
      state.essay = `${state.essay.trim()}.`;
    }
  };

  renderEditorHighlights = function (text) {
    if (state.mode !== "easy") return escapeHtml(text);
    return escapeHtml(text).replace(/\b[A-Za-z][A-Za-z']*\b/g, (word) => {
      return getSpellingSuggestion(word) ? `<span class="misspell">${word}</span>` : word;
    });
  };

  renderEasyHints = function () {
    const issues = analyzeEssay(state.essay);
    return `
    <div class="helper-head">
      <h3>Live correction mentor</h3>
      <span>${issues.length} alerts</span>
    </div>
    ${
      issues.length
        ? issues
            .map(
              (issue, index) => `
                <div class="issue-card">
                  <div>
                    <strong>${escapeHtml(issue.type)}</strong>
                    <h4>${escapeHtml(issue.title)}</h4>
                    <p>${escapeHtml(issue.message)}</p>
                  </div>
                  ${issue.action ? `<button class="fix-btn" data-fix="${index}" type="button">Apply fix</button>` : ""}
                </div>
              `,
            )
            .join("")
        : `<div class="issue-card clear"><strong>Clean draft</strong><p>No obvious grammar or spelling issue detected. Keep developing your argument.</p></div>`
    }
  `;
  };

  updateEditorHighlights();
  const helper = document.querySelector(".helper");
  if (helper && state.mode === "easy") {
    helper.innerHTML = renderEasyHints();
    bindFixButtons();
  }
})();

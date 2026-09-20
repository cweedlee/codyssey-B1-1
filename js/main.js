const GITHUB_USERNAME = "cweedlee";
const SCROLL_TOP_THRESHOLD = 300;
const HEADER_SCROLL_THRESHOLD = 60;
const OBSERVER_THRESHOLD = 0.2;

let state = {
  theme: localStorage.getItem("theme") || "light",
  repositories: [],
  projectStatus: "idle",
  projectError: "",
  activeLanguage: "All",
  formErrors: {},
  formSuccess: "",
};

const header = document.querySelector("[data-header]");
const menuToggle = document.querySelector("[data-menu-toggle]");
const navLinks = document.querySelector("[data-nav-links]");
const themeToggle = document.querySelector("[data-theme-toggle]");
const scrollTopButton = document.querySelector("[data-scroll-top]");
const projectStatus = document.querySelector("[data-project-status]");
const projectList = document.querySelector("[data-project-list]");
const filterBar = document.querySelector("[data-filter-bar]");
const retryButton = document.querySelector("[data-retry]");
const contactForm = document.querySelector("[data-contact-form]");
const formSuccess = document.querySelector("[data-form-success]");
const typingText = document.querySelector("[data-typing-text]");

const applyTheme = () => {
  document.documentElement.dataset.theme = state.theme;
  themeToggle.textContent = state.theme === "dark" ? "라이트모드" : "다크모드";
};

const setTheme = (theme) => {
  setState({ theme });
};

const toggleMenu = () => {
  navLinks.classList.toggle("active");
  const isOpen = navLinks.classList.contains("active");
  menuToggle.setAttribute("aria-expanded", String(isOpen));
  menuToggle.setAttribute("aria-label", isOpen ? "메뉴 닫기" : "메뉴 열기");
};

const closeMenu = () => {
  navLinks.classList.remove("active");
  menuToggle.setAttribute("aria-expanded", "false");
  menuToggle.setAttribute("aria-label", "메뉴 열기");
};

const handleScroll = () => {
  const shouldShowTop = window.scrollY >= SCROLL_TOP_THRESHOLD;
  const shouldChangeHeader = window.scrollY >= HEADER_SCROLL_THRESHOLD;

  scrollTopButton.classList.toggle("visible", shouldShowTop);
  header.classList.toggle("scrolled", shouldChangeHeader);
};

const smoothMoveTo = (targetId) => {
  const target = document.querySelector(targetId);

  if (!target) {
    return;
  }

  target.scrollIntoView({ behavior: "smooth", block: "start" });
};

const getLanguages = () => {
  const languages = state.repositories
    .map(({ language }) => language)
    .filter(Boolean);

  return ["All", ...new Set(languages)];
};

const getVisibleRepositories = () => {
  if (state.activeLanguage === "All") {
    return state.repositories;
  }

  return state.repositories.filter(({ language }) => language === state.activeLanguage);
};

const escapeHtml = (value) =>
  String(value).replace(
    /[&<>'"]/g,
    (character) =>
      ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        "'": "&#39;",
        '"': "&quot;",
      })[character]
  );

const renderFilters = () => {
  const languages = getLanguages();

  filterBar.innerHTML = languages
    .map(
      (language) => `
        <button
          class="filter-button ${language === state.activeLanguage ? "active" : ""}"
          type="button"
          data-language="${escapeHtml(language)}"
        >
          ${escapeHtml(language)}
        </button>
      `
    )
    .join("");
};

const renderProjectCards = () => {
  const repositories = getVisibleRepositories();

  if (repositories.length === 0) {
    projectList.innerHTML = "";
    projectStatus.textContent = "표시할 프로젝트가 없습니다.";
    return;
  }

  projectStatus.textContent = "";
  projectList.innerHTML = repositories
    .map(({ name, description, html_url: htmlUrl, language, stargazers_count: stars }) => {
      const summary = description || "설명이 등록되지 않은 저장소입니다.";
      const languageLabel = language || "No language";

      return `
        <article class="project-card">
          <h3>${escapeHtml(name)}</h3>
          <p>${escapeHtml(summary)}</p>
          <div class="project-meta">
            <span>${escapeHtml(languageLabel)}</span>
            <span>Stars: ${escapeHtml(stars)}</span>
          </div>
          <a class="project-link" href="${escapeHtml(htmlUrl)}" target="_blank" rel="noreferrer">
            GitHub에서 보기
          </a>
        </article>
      `;
    })
    .join("");
};

const renderProjects = () => {
  if (state.projectStatus === "loading") {
    filterBar.innerHTML = "";
    projectList.innerHTML = "";
    projectStatus.innerHTML = '<span class="spinner" aria-hidden="true"></span>로딩 중...';
    return;
  }

  if (state.projectStatus === "error") {
    filterBar.innerHTML = "";
    projectList.innerHTML = "";
    projectStatus.innerHTML = `
      프로젝트를 불러올 수 없습니다.
      ${state.projectError ? `<span class="project-error-detail">${escapeHtml(state.projectError)}</span>` : ""}
      <button class="filter-button" type="button" data-inline-retry>다시 시도</button>
    `;
    return;
  }

  if (state.projectStatus === "empty") {
    filterBar.innerHTML = "";
    projectList.innerHTML = "";
    projectStatus.textContent = "표시할 프로젝트가 없습니다.";
    return;
  }

  renderFilters();
  renderProjectCards();
};

const fetchRepositories = async () => {
  setState({ projectStatus: "loading", projectError: "" });

  try {
    const response = await fetch(
      `https://api.github.com/users/${GITHUB_USERNAME}/repos?sort=updated&per_page=100`,
      {
        cache: "no-store",
        headers: {
          Accept: "application/vnd.github+json",
        },
      }
    );

    if (!response.ok) {
      const message =
        response.status === 403
          ? "GitHub API 요청 한도를 초과했습니다. 잠시 후 다시 시도해주세요."
          : `GitHub API 오류가 발생했습니다. (${response.status})`;

      throw new Error(message);
    }

    const repositories = await response.json();
    const visibleRepositories = repositories
      .filter(({ fork }) => !fork)
      .sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at))
      .slice(0, 9);

    setState({
      repositories: visibleRepositories,
      projectStatus: visibleRepositories.length === 0 ? "empty" : "success",
      activeLanguage: "All",
    });
  } catch (error) {
    setState({
      repositories: [],
      projectStatus: "error",
      projectError:
        error instanceof TypeError
          ? "네트워크 연결을 확인한 후 다시 시도해주세요."
          : error instanceof Error
            ? error.message
            : "알 수 없는 오류가 발생했습니다.",
    });
  }
};

const validateForm = (formData) => {
  const errors = {};
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const { name, email, message } = Object.fromEntries(formData.entries());

  if (!name.trim()) {
    errors.name = "이름을 입력해주세요.";
  }

  if (!email.trim()) {
    errors.email = "이메일을 입력해주세요.";
  } else if (!emailPattern.test(email.trim())) {
    errors.email = "올바른 이메일 형식으로 입력해주세요.";
  }

  if (!message.trim()) {
    errors.message = "메시지를 입력해주세요.";
  }

  return errors;
};

const renderFormErrors = () => {
  ["name", "email", "message"].forEach((fieldName) => {
    const error = document.querySelector(`[data-error-for="${fieldName}"]`);
    const input = document.querySelector(`#${fieldName}`);
    const message = state.formErrors[fieldName] || "";

    error.textContent = message;
    input.setAttribute("aria-invalid", String(Boolean(message)));
  });

  formSuccess.textContent = state.formSuccess;
};

const renderStateChanges = (previousState) => {
  if (previousState.theme !== state.theme) {
    localStorage.setItem("theme", state.theme);
    applyTheme();
  }

  if (
    previousState.projectStatus !== state.projectStatus ||
    previousState.repositories !== state.repositories ||
    previousState.activeLanguage !== state.activeLanguage
  ) {
    renderProjects();
  }

  if (
    previousState.formErrors !== state.formErrors ||
    previousState.formSuccess !== state.formSuccess
  ) {
    renderFormErrors();
  }
};

const setState = (updates) => {
  const previousState = state;
  state = { ...state, ...updates };
  renderStateChanges(previousState);
};

const handleFormSubmit = (event) => {
  event.preventDefault();

  const formData = new FormData(contactForm);
  const formErrors = validateForm(formData);

  if (Object.keys(formErrors).length === 0) {
    contactForm.reset();
    setState({
      formErrors: {},
      formSuccess: "메시지가 성공적으로 준비되었습니다.",
    });
    return;
  }

  setState({ formErrors, formSuccess: "" });
};

const handleFormInput = (event) => {
  const fieldName = event.target.name;

  if (!fieldName || !state.formErrors[fieldName]) {
    return;
  }

  const formData = new FormData(contactForm);
  setState({ formErrors: validateForm(formData), formSuccess: "" });
};

const startTypingEffect = () => {
  if (!typingText) {
    return;
  }

  const originalText = typingText.textContent;
  let index = 0;

  typingText.textContent = "";

  const typeNext = () => {
    typingText.textContent = originalText.slice(0, index);
    index += 1;

    if (index <= originalText.length) {
      window.setTimeout(typeNext, 70);
    }
  };

  typeNext();
};

const observeSections = () => {
  const revealElements = document.querySelectorAll(".reveal");
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: OBSERVER_THRESHOLD }
  );

  revealElements.forEach((element) => observer.observe(element));
};

menuToggle.addEventListener("click", toggleMenu);

themeToggle.addEventListener("click", () => {
  setTheme(state.theme === "dark" ? "light" : "dark");
});

navLinks.addEventListener("click", (event) => {
  const link = event.target.closest("a");

  if (!link) {
    return;
  }

  event.preventDefault();
  smoothMoveTo(link.getAttribute("href"));
  closeMenu();
});

scrollTopButton.addEventListener("click", () => {
  window.scrollTo({ top: 0, behavior: "smooth" });
});

window.addEventListener("scroll", handleScroll);
retryButton.addEventListener("click", fetchRepositories);

projectStatus.addEventListener("click", (event) => {
  if (event.target.matches("[data-inline-retry]")) {
    fetchRepositories();
  }
});

filterBar.addEventListener("click", (event) => {
  const button = event.target.closest("[data-language]");

  if (!button) {
    return;
  }

  setState({ activeLanguage: button.dataset.language });
});

contactForm.addEventListener("submit", handleFormSubmit);
contactForm.addEventListener("input", handleFormInput);

renderStateChanges({});
handleScroll();
observeSections();
startTypingEffect();
fetchRepositories();

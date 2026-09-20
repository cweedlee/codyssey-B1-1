const GITHUB_USERNAME = "haecho";
const SCROLL_TOP_THRESHOLD = 300;
const HEADER_SCROLL_THRESHOLD = 60;
const OBSERVER_THRESHOLD = 0.2;

const state = {
  theme: localStorage.getItem("theme") || "light",
  repositories: [],
  projectStatus: "idle",
  activeLanguage: "All",
  formErrors: {},
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
  state.theme = theme;
  localStorage.setItem("theme", theme);
  applyTheme();
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

const renderFilters = () => {
  const languages = getLanguages();

  filterBar.innerHTML = languages
    .map(
      (language) => `
        <button
          class="filter-button ${language === state.activeLanguage ? "active" : ""}"
          type="button"
          data-language="${language}"
        >
          ${language}
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
          <h3>${name}</h3>
          <p>${summary}</p>
          <div class="project-meta">
            <span>${languageLabel}</span>
            <span>Stars: ${stars}</span>
          </div>
          <a class="project-link" href="${htmlUrl}" target="_blank" rel="noreferrer">
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
    projectStatus.innerHTML =
      '프로젝트를 불러올 수 없습니다. <button class="filter-button" type="button" data-inline-retry>다시 시도</button>';
    return;
  }

  renderFilters();
  renderProjectCards();
};

const fetchRepositories = async () => {
  state.projectStatus = "loading";
  renderProjects();

  try {
    const response = await fetch(`https://api.github.com/users/${GITHUB_USERNAME}/repos?sort=updated`);

    if (!response.ok) {
      throw new Error(`GitHub API error: ${response.status}`);
    }

    const repositories = await response.json();
    state.repositories = repositories
      .filter(({ fork }) => !fork)
      .sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at))
      .slice(0, 9);
    state.projectStatus = "success";
    state.activeLanguage = "All";
  } catch (error) {
    state.projectStatus = "error";
  }

  renderProjects();
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
};

const handleFormSubmit = (event) => {
  event.preventDefault();

  const formData = new FormData(contactForm);
  state.formErrors = validateForm(formData);
  formSuccess.textContent = "";
  renderFormErrors();

  if (Object.keys(state.formErrors).length === 0) {
    contactForm.reset();
    formSuccess.textContent = "메시지가 성공적으로 준비되었습니다.";
  }
};

const handleFormInput = (event) => {
  const fieldName = event.target.name;

  if (!fieldName || !state.formErrors[fieldName]) {
    return;
  }

  const formData = new FormData(contactForm);
  state.formErrors = validateForm(formData);
  renderFormErrors();
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

  state.activeLanguage = button.dataset.language;
  renderProjects();
});

contactForm.addEventListener("submit", handleFormSubmit);
contactForm.addEventListener("input", handleFormInput);

applyTheme();
handleScroll();
observeSections();
startTypingEffect();
fetchRepositories();

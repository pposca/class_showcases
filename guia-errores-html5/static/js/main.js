const initScrollspy = () => {
  const navLinks = Array.from(document.querySelectorAll('.toc-nav a[href^="#"]'));
  const targets = navLinks
    .map((link) => document.querySelector(link.getAttribute('href')))
    .filter(Boolean);

  if (CSS.supports('scroll-target-group: auto')) {
    const syncAriaCurrent = () => {
      const currentLink = document.querySelector('.toc-nav a:target-current');
      navLinks.forEach((link) => {
        link.setAttribute('aria-current', link === currentLink ? 'true' : 'false');
      });
    };

    syncAriaCurrent();
    document.addEventListener('scrollend', syncAriaCurrent);
  } else {
    const setActiveLink = (activeId) => {
      navLinks.forEach((link) => {
        const isActive = link.getAttribute('href') === `#${activeId}`;
        link.classList.toggle('target-current', isActive);
        link.setAttribute('aria-current', isActive ? 'true' : 'false');
      });
    };

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((entry) => entry.isIntersecting);
        if (visible.length > 0) {
          visible.sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
          setActiveLink(visible[0].target.id);
        }
      },
      { rootMargin: '-15% 0px -70% 0px', threshold: 0 }
    );

    targets.forEach((el) => observer.observe(el));
  }
};

const initThemeSwitcher = () => {
  const buttons = Array.from(document.querySelectorAll('[data-theme-choice]'));
  const storageKey = 'diw-html5-guide-theme';

  const applyTheme = (choice) => {
    if (choice === 'light' || choice === 'dark') {
      document.documentElement.setAttribute('data-theme', choice);
    } else {
      document.documentElement.removeAttribute('data-theme');
      choice = 'system';
    }

    buttons.forEach((btn) => {
      btn.setAttribute('aria-pressed', btn.dataset.themeChoice === choice ? 'true' : 'false');
    });
  };

  let savedTheme = 'system';
  try {
    savedTheme = localStorage.getItem(storageKey) || 'system';
  } catch {
    savedTheme = 'system';
  }
  applyTheme(savedTheme);

  buttons.forEach((btn) => {
    btn.addEventListener('click', () => {
      const choice = btn.dataset.themeChoice;
      applyTheme(choice);
      try {
        localStorage.setItem(storageKey, choice);
      } catch {
        // Ignore storage restrictions in private contexts
      }
    });
  });
};

const initCopyButtons = () => {
  document.querySelectorAll('.code-box').forEach((box) => {
    const button = box.querySelector('.copy-btn');
    const code = box.querySelector('pre code');
    if (!button || !code) return;

    button.addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(code.textContent);
        const original = button.textContent;
        button.textContent = '¡Copiado!';
        setTimeout(() => {
          button.textContent = original;
        }, 1600);
      } catch {
        button.textContent = 'Error al copiar';
      }
    });
  });
};

const initSearchAndFilters = () => {
  const searchInput = document.getElementById('search-input');
  const filterPills = Array.from(document.querySelectorAll('.filter-pill'));
  const sections = Array.from(document.querySelectorAll('.guide-section'));
  const emptyState = document.getElementById('empty-search-state');
  let activeFilter = 'all';

  const applyFilter = () => {
    const query = (searchInput?.value || '').trim().toLowerCase();
    let visibleSectionsCount = 0;

    sections.forEach((section) => {
      const sectionCategory = section.dataset.category || 'all';
      const cards = Array.from(section.querySelectorAll('.case-card, .obs-card, .strength-card'));

      if (cards.length === 0) {
        const matchesCategory = activeFilter === 'all' || sectionCategory === activeFilter;
        const matchesQuery = !query || section.textContent.toLowerCase().includes(query);
        const show = matchesCategory && matchesQuery;
        section.hidden = !show;
        if (show) visibleSectionsCount++;
        return;
      }

      let visibleCardsInSection = 0;
      cards.forEach((card) => {
        const cardCategory = card.dataset.category || sectionCategory;
        const keywords = (card.dataset.keywords || '').toLowerCase();
        const text = card.textContent.toLowerCase();

        const matchesCategory = activeFilter === 'all' || cardCategory === activeFilter;
        const matchesQuery = !query || text.includes(query) || keywords.includes(query);
        const showCard = matchesCategory && matchesQuery;

        card.hidden = !showCard;
        if (showCard) visibleCardsInSection++;
      });

      const showSection = visibleCardsInSection > 0;
      section.hidden = !showSection;
      if (showSection) visibleSectionsCount++;
    });

    if (emptyState) {
      emptyState.hidden = visibleSectionsCount > 0;
    }
  };

  searchInput?.addEventListener('input', applyFilter);

  filterPills.forEach((pill) => {
    pill.addEventListener('click', () => {
      activeFilter = pill.dataset.filter || 'all';
      filterPills.forEach((p) => p.classList.toggle('is-active', p === pill));
      applyFilter();
    });
  });
};

const initMobileToc = () => {
  const btn = document.getElementById('mobile-toc-btn');
  const sidebar = document.getElementById('indice-lateral');
  if (!btn || !sidebar) return;

  btn.addEventListener('click', () => {
    const isOpen = sidebar.classList.toggle('is-open');
    btn.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
  });

  sidebar.querySelectorAll('.toc-nav a').forEach((link) => {
    link.addEventListener('click', () => {
      if (window.innerWidth <= 980) {
        sidebar.classList.remove('is-open');
        btn.setAttribute('aria-expanded', 'false');
      }
    });
  });
};

const initAll = () => {
  initThemeSwitcher();
  initScrollspy();
  initCopyButtons();
  initSearchAndFilters();
  initMobileToc();
};

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initAll);
} else {
  initAll();
}

const initThemeSwitcher = () => {
  const buttons = Array.from(document.querySelectorAll('[data-theme-choice]'));
  const storageKey = 'diw-concreciones-theme';

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
        // Storage can be restricted in local/private contexts
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
        button.textContent = 'No disponible';
      }
    });
  });
};

const initMobileToc = () => {
  const btn = document.getElementById('mobile-toc-btn');
  const sidebar = document.getElementById('indice-lateral');
  if (!btn || !sidebar) return;

  btn.addEventListener('click', () => {
    const expanded = btn.getAttribute('aria-expanded') === 'true';
    btn.setAttribute('aria-expanded', String(!expanded));
    sidebar.classList.toggle('is-open', !expanded);
  });

  sidebar.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener('click', () => {
      if (window.innerWidth < 960) {
        btn.setAttribute('aria-expanded', 'false');
        sidebar.classList.remove('is-open');
      }
    });
  });
};

const initScrollSpy = () => {
  const links = Array.from(document.querySelectorAll('.toc-nav a[href^="#"]'));
  const targets = links
    .map((link) => document.querySelector(link.getAttribute('href')))
    .filter(Boolean);

  if (targets.length === 0) return;

  const setActive = (id) => {
    links.forEach((link) => {
      const match = link.getAttribute('href') === `#${id}`;
      link.classList.toggle('is-active', match);
      link.setAttribute('aria-current', match ? 'true' : 'false');
    });
  };

  setActive(targets[0].id);

  const observer = new IntersectionObserver(
    (entries) => {
      const visible = entries.filter((entry) => entry.isIntersecting);
      if (visible.length > 0) {
        visible.sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        setActive(visible[0].target.id);
      }
    },
    { rootMargin: '-12% 0px -65% 0px', threshold: 0 }
  );

  targets.forEach((el) => observer.observe(el));
};

document.addEventListener('DOMContentLoaded', () => {
  initThemeSwitcher();
  initCopyButtons();
  initMobileToc();
  initScrollSpy();
});

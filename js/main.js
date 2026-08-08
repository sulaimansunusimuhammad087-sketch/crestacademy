// UI logic for Crest Academy (Theme, Modals, Menus)

document.addEventListener("DOMContentLoaded", () => {
  
  // 1. Mobile Menu Logic
  const menuBtn = document.getElementById('menuBtn');
  const mobileMenu = document.getElementById('mobileMenu');
  const iconOpen = document.getElementById('menuIconOpen');
  const iconClose = document.getElementById('menuIconClose');

  if (menuBtn && mobileMenu) {
    menuBtn.addEventListener('click', () => {
      const isOpen = mobileMenu.classList.toggle('open');
      menuBtn.setAttribute('aria-expanded', isOpen);
      iconOpen.style.display = isOpen ? 'none' : 'block';
      iconClose.style.display = isOpen ? 'block' : 'none';
    });

    mobileMenu.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        mobileMenu.classList.remove('open');
        menuBtn.setAttribute('aria-expanded', 'false');
        iconOpen.style.display = 'block';
        iconClose.style.display = 'none';
      });
    });
  }

  // 2. Theme Logic (Light/Dark Mode)
  const htmlEl = document.documentElement;
  const themeToggleDesk = document.getElementById('themeToggleDesk');
  const themeToggleMob = document.getElementById('themeToggleMob');
  
  function updateThemeIcons(isDark) {
    document.querySelectorAll('.sun-icon').forEach(icon => icon.style.display = isDark ? 'block' : 'none');
    document.querySelectorAll('.moon-icon').forEach(icon => icon.style.display = isDark ? 'none' : 'block');
  }

  function setTheme(isDark) {
    if (isDark) {
      htmlEl.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      htmlEl.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
    updateThemeIcons(isDark);
  }

  const savedTheme = localStorage.getItem('theme');
  const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  
  if (savedTheme === 'dark' || (!savedTheme && systemPrefersDark)) {
    setTheme(true);
  } else {
    setTheme(false); 
  }

  function toggleTheme() {
    setTheme(!htmlEl.classList.contains('dark'));
  }
  
  if (themeToggleDesk) themeToggleDesk.addEventListener('click', toggleTheme);
  if (themeToggleMob) themeToggleMob.addEventListener('click', toggleTheme);

  // 3. Footer Year
  const yearEl = document.getElementById('year');
  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
  }

  // 4. Modal Logic (Attached globally so HTML onclick works)
  const overlay = document.getElementById('authOverlay');
  
  window.openModal = function(panelId) {
    if (!overlay) return;
    
    // Reset any visible error/success messages
    document.querySelectorAll('.stage-msg').forEach(msg => {
      msg.style.display = 'none';
      msg.textContent = '';
      msg.style.color = 'var(--text-main)';
    });
    
    // Hide all panels, show requested
    document.querySelectorAll('.modal-box').forEach(p => p.classList.remove('active'));
    const targetPanel = document.getElementById(`panel-${panelId}`);
    if (targetPanel) {
      targetPanel.classList.add('active');
      overlay.classList.add('active');
      document.body.style.overflow = 'hidden'; // Prevent background scrolling
    }
  };

  window.switchPanel = function(panelId) {
    document.querySelectorAll('.stage-msg').forEach(msg => msg.style.display = 'none');
    document.querySelectorAll('.modal-box').forEach(p => p.classList.remove('active'));
    const targetPanel = document.getElementById(`panel-${panelId}`);
    if (targetPanel) targetPanel.classList.add('active');
  };

  window.closeModal = function() {
    if (overlay) {
      overlay.classList.remove('active');
      document.body.style.overflow = '';
    }
  };

  if (overlay) {
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) window.closeModal();
    });
  }

  window.togglePassword = function(inputId) {
    const input = document.getElementById(inputId);
    if (input) {
      input.type = input.type === 'password' ? 'text' : 'password';
    }
  };
});

// Mobile nav toggle
const burger = document.querySelector('.burger');
const header = document.querySelector('.site-header');
const nav = document.querySelector('header nav');

if (burger) {
  burger.addEventListener('click', () => {
    const open = nav.style.display === 'block';
    nav.style.display = open ? 'none' : 'block';
    burger.setAttribute('aria-expanded', String(!open));
  });
}

// Current year in footer
document.getElementById('year').textContent = new Date().getFullYear();

// Smooth scroll for anchor links
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const target = document.querySelector(a.getAttribute('href'));
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      if (window.innerWidth < 900 && nav) nav.style.display = 'none';
    }
  });
});

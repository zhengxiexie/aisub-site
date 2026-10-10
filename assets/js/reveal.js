/* ==========================================================================
   Reveal Animations — 滚动渐入动画
   ========================================================================== */

(function() {
  'use strict';
  
  // Intersection Observer 用于渐入动画
  const observerOptions = {
    root: null,
    rootMargin: '0px 0px -100px 0px',
    threshold: 0.1
  };
  
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in');
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);
  
  // 观察所有带 data-reveal 属性的元素
  function initReveal() {
    const elements = document.querySelectorAll('[data-reveal]');
    elements.forEach(el => observer.observe(el));
  }
  
  // 页面加载完成后初始化
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initReveal);
  } else {
    initReveal();
  }
})();

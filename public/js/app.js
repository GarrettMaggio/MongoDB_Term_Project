console.log('PulseBoard UI ready');

document.querySelectorAll('form').forEach((form) => {
  form.addEventListener('submit', () => {
    const button = form.querySelector('button[type="submit"], button:not([type])');
    if (button) {
      button.disabled = true;
      setTimeout(() => { button.disabled = false; }, 1200);
    }
  });
});

'use strict';

class Header {
  constructor(args) {
    (this.opts = {
      body: 'body',
      btnTheme: '.btn-theme',
      ...args,
    }),
      (this.container = document.querySelector(this.opts.container));
  }
  init() {
    this.setElements();
    this.bindEvents();
  }
  setElements() {
    this.body = document.querySelector(this.opts.body);
    this.btnTheme = document.querySelector(this.opts.btnTheme);
  }

  bindEvents() {
    this.btnTheme.addEventListener('click', this.handleClickTheme.bind(this));
  }

  handleClickTheme(e) {
    const html = document.documentElement;
    const target = e.currentTarget;
    const isDarkMode = target.dataset.theme === 'dark';

    html.dataset.dark = isDarkMode;
    target.dataset.theme = isDarkMode ? 'light' : 'dark';
    target.textContent = isDarkMode ? '라이트모드' : '다크모드';
  }
}

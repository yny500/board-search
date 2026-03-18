'use strict';

class Main {
  constructor(args) {
    (this.opts = {
      body: 'body',
      container: '.container',
      form: '.input__box form',
      inputText: '.input__box input',
      contentsList: '.contents__list',
      btnMoreEl: '.contents__btn',
      btnSelect: '.select__name',
      selectList: '.select__list',
      selectOption: '.select__item .option',
      classess: {
        isHide: 'is-hide',
        isOpen: 'is-open',
      },
      ...args,
    }),
      (this.container = document.querySelector(this.opts.container));
    this.currentPage = 1;
    this.sortDefault = 'accuracy';
    this.url = 'https://dapi.kakao.com/v2/search/blog';
    this.REST_API_KEY = '3151a000e7486b68f18d9c0cced4d3e2';
  }
  init() {
    this.setElements();
    this.initOpts();
    this.bindEvents();
  }
  setElements() {
    this.body = document.querySelector(this.opts.body);
    this.container = document.querySelector(this.opts.container);
    this.form = document.querySelector(this.opts.form);
    this.inputText = document.querySelector(this.opts.inputText);
    this.contentsList = document.querySelector(this.opts.contentsList);
    this.btnMoreEl = document.querySelector(this.opts.btnMoreEl);
    this.btnMore = this.btnMoreEl.children[0];
    this.btnSelect = document.querySelector(this.opts.btnSelect);
    this.selectList = document.querySelector(this.opts.selectList);
    this.selectOption = document.querySelectorAll(this.opts.selectOption);
  }

  initOpts() {
    this.showNoResult();
    this.btnMoreEl.classList.add(this.opts.classess.isHide);
    this.data = {
      params: {
        query: '',
        size: 9,
        page: this.currentPage,
        sort: this.sortDefault,
      },
      headers: {
        Authorization: `KakaoAK ${this.REST_API_KEY}`,
      },
    };
  }

  bindEvents() {
    this.form.addEventListener('submit', this.handleClickSearch.bind(this));
    this.btnMore.addEventListener('click', this.handleClickMore.bind(this));
    this.btnSelect.addEventListener('click', this.handleClickSelect.bind(this));
    this.selectOption.forEach((el) => {
      el.addEventListener('click', this.handleClickSelectOption.bind(this));
    });
  }

  handleClickSearch(e) {
    e.preventDefault();
    this.currentPage = 1;
    this.data.params.page = this.currentPage;
    this.initSearch();
    this.initFetch();
  }

  initSearch() {
    this.btnMoreEl.classList.remove(this.opts.classess.isHide);
    this.contentsList.innerHTML = '';
  }

  initFetch() {
    this.data.params.query = this.inputText.value;
    this.fetchData(this.afterFetchData.bind(this));
  }
  fetchData(successFunc, failFunc) {
    if (!this.data.params.query) {
      this.showNoResult();
      this.btnMoreEl.classList.add(this.opts.classess.isHide);
      return;
    }

    axios
      .get(this.url, this.data)
      .then((response) => successFunc(response.data.documents))
      .catch((error) => {
        if (failFunc) {
          failFunc(error);
        } else {
          console.error('Error: ', error);
        }
      });
  }

  afterFetchData(data) {
    if (data.length) {
      this.showList(data);
    } else {
      this.showNoResult();
      this.btnMoreEl.classList.add(this.opts.classess.isHide);
    }
  }

  showList(data) {
    const html = data.map(this.createItemHTML).join('');
    this.contentsList.insertAdjacentHTML('beforeend', html);
  }

  createItemHTML(item) {
    const date = item.datetime.slice(0, 10);
    const defaultImg = '/img/thumbnail.jpg';
    const thumbnail = item.thumbnail ? item.thumbnail : defaultImg;

    return `<li class="contents__item">
                <a class="contents__link" href="${item.url}" target="_blank">
                  <div class="contents__img" style="background-image: url('${thumbnail}');">image</div>
                  <div class="contents__txt">
                    <span class="txt-wrap">
                      <span class="category">${item.blogname}</span>
                      <span class="title">${item.title}</span>
                    </span>
                    <span class="date">${date}</span>
                  </div>
                </a>
              </li>`;
  }

  showNoResult() {
    const text = '검색 결과가 없습니다.';
    const html = `<li class="contents__no-result">${text}</li>`;
    this.contentsList.innerHTML = html;
  }

  handleClickMore() {
    this.currentPage++;
    this.data.params.page = this.currentPage;
    this.fetchData(this.afterFetchData.bind(this));
  }

  handleClickSelect() {
    this.selectList.classList.add(this.opts.classess.isOpen);
    this.boundClickOutside = this.handleClickOutside.bind(this);
    // ** 바인딩된 함수를 변수로 저장하여 사용하는 이유 **
    // 1. 함수를 한번만 생성하고 재사용 하기 위해
    // 2. 이벤트 리스너를 여러 번 추가하는 문제를 방지하기 위해
    // 3. 이벤트 리스너 제거시 동일한 함수를 제거하기 위해

    this.body.addEventListener('click', this.boundClickOutside);
  }

  handleClickOutside(e) {
    if (
      !this.selectList.contains(e.target) &&
      !this.btnSelect.contains(e.target)
    ) {
      this.selectList.classList.remove(this.opts.classess.isOpen);
      this.body.removeEventListener('click', this.boundClickOutside);
    }
  }

  handleClickSelectOption(e) {
    // select
    this.btnSelect.innerText = e.currentTarget.innerText;
    this.selectList.classList.remove(this.opts.classess.isOpen);
    this.body.removeEventListener('click', this.boundClickOutside);

    // contents api
    this.initSearch();
    const itemOption = e.currentTarget.parentElement.dataset.option;
    this.data.params.sort = itemOption;
    this.currentPage = 1;
    this.data.params.page = this.currentPage;
    this.fetchData(this.afterFetchData.bind(this));
  }
}

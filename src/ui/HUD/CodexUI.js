import codexData from '/src/ui/data/codexData.js';

export default class CodexUI {
  constructor() {
  this.codexData = codexData;

  this.codexItemsContainer = document.getElementById('codex-items');
  this.readerContent = document.getElementById('codex-reader-content');
  this.entryIcon = document.getElementById('codex-entry-icon');
this.entryText = document.getElementById('codex-entry-text');

  this.pageControls = document.getElementById('codex-pages');
  this.pageNum = document.getElementById('page-number');

  this.currentBook = null;
  this.currentPage = 0;

  this.loadCodexList('stories');
  this.attachEvents();
  this.setupCategorySwitching();  // ⬅ Add this
}


  loadCodexList(category = 'stories') {
    this.codexItemsContainer.innerHTML = '';
    const entries = this.codexData[category];
    if (!entries) return;
    Object.keys(entries).forEach(title => {
      const li = document.createElement('li');
      li.textContent = title;
      li.addEventListener('click', () => this.openCodexEntry(category, title));
      this.codexItemsContainer.appendChild(li);
    });
  }

  openCodexEntry(category, title) {
  this.currentBook = this.codexData[category][title];
  this.currentPage = 0;
  this.renderPage();
}


  renderPage() {
    if (!this.currentBook) return;
    this.readerContent.textContent = this.currentBook[this.currentPage];
    this.pageNum.textContent = `Page ${this.currentPage + 1}`;
    this.pageControls.classList.remove('hidden');
    if (this.currentBook.icon) {
    this.entryIcon.querySelector('img').src = this.currentBook.icon;
    this.entryIcon.classList.remove('hidden');
  } else {
    this.entryIcon.classList.add('hidden');
  }
  }

  attachEvents() {
    document.getElementById('page-prev')?.addEventListener('click', () => {
      if (this.currentPage > 0) {
        this.currentPage--;
        this.renderPage();
      }
    });
    document.getElementById('page-next')?.addEventListener('click', () => {
      if (this.currentPage < this.currentBook.length - 1) {
        this.currentPage++;
        this.renderPage();
      }
    });
  }

  setupCategorySwitching() {
  const categories = document.querySelectorAll(".codex-category-list .cat");
  const titleEl = document.querySelector(".codex-list-title");

  categories.forEach(cat => {
    cat.addEventListener("click", () => {
      const category = cat.dataset.cat;

      // 🔥 Update active sidebar selection
      document.querySelector(".cat.active")?.classList.remove("active");
      cat.classList.add("active");

      // 🔥 Update list panel title text
      titleEl.textContent = cat.textContent.replace(/^[^\s]+\s/, '');  
      // Removes emojis from label

      // 🔥 Load items for that category
      this.loadCodexList(category);

      // 🔥 Clear reader panel
      this.readerContent.innerHTML = `<p>Select an entry to read.</p>`;

      // 🔥 Hide page controls again
      this.pageControls.classList.add("hidden");

      // Reset book/page
      this.currentBook = null;
      this.currentPage = 0;
    });
  });
}

}

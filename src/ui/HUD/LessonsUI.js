// src/ui/LessonsUI.js

import lessonsData from "../data/lessonsData";

export default class LessonsUI {
  constructor() {
    this.currentCategory = null;
    this.currentLesson = null;
    this.currentPage = 0;

    this.cacheElements();
    this.attachEvents();
  }

  cacheElements() {
    this.listBox = document.getElementById("lessons-list");
    this.contentBox = document.getElementById("lessons-content");
    this.prevBtn = document.getElementById("lesson-prev");
    this.nextBtn = document.getElementById("lesson-next");
    this.titleBox = document.getElementById("lessons-title");
  }

  attachEvents() {
    if (this.prevBtn) {
      this.prevBtn.addEventListener("click", () => {
        if (this.currentPage > 0) {
          this.currentPage--;
          this.renderPage();
        }
      });
    }

    if (this.nextBtn) {
      this.nextBtn.addEventListener("click", () => {
        const pages = lessonsData[this.currentCategory][this.currentLesson];
        if (this.currentPage < pages.length - 1) {
          this.currentPage++;
          this.renderPage();
        }
      });
    }
  }

  // --------------------------
  // LOAD CATEGORIES
  // --------------------------
  loadCategories() {
    this.listBox.innerHTML = "";

    Object.keys(lessonsData).forEach(category => {
      const btn = document.createElement("button");
      btn.classList.add("lessons-category-btn");
      btn.textContent = category.toUpperCase();

      btn.addEventListener("click", () => this.loadLessons(category));

      this.listBox.appendChild(btn);
    });

    this.titleBox.textContent = "Lessons";
    this.contentBox.textContent = "Choose a category to begin.";
    this.prevBtn.style.display = "none";
    this.nextBtn.style.display = "none";
  }

  // --------------------------
  // LOAD LESSON TITLES
  // --------------------------
  loadLessons(category) {
    this.currentCategory = category;
    this.listBox.innerHTML = "";

    Object.keys(lessonsData[category]).forEach(lessonName => {
      const btn = document.createElement("button");
      btn.classList.add("lessons-lesson-btn");
      btn.textContent = lessonName;

      btn.addEventListener("click", () =>
        this.loadLessonContent(category, lessonName)
      );

      this.listBox.appendChild(btn);
    });

    this.titleBox.textContent = category.toUpperCase();
    this.contentBox.textContent = "Select a lesson to read.";

    this.prevBtn.style.display = "none";
    this.nextBtn.style.display = "none";
  }

  // --------------------------
  // LOAD SPECIFIC LESSON
  // --------------------------
  loadLessonContent(category, lessonName) {
    this.currentCategory = category;
    this.currentLesson = lessonName;
    this.currentPage = 0;

    this.titleBox.textContent = lessonName;
    this.renderPage();
  }

  // --------------------------
  // RENDER PAGE
  // --------------------------
  renderPage() {
    const pages =
      lessonsData[this.currentCategory][this.currentLesson];

    this.contentBox.textContent = pages[this.currentPage];

    this.prevBtn.style.display = this.currentPage > 0 ? "block" : "none";
    this.nextBtn.style.display =
      this.currentPage < pages.length - 1 ? "block" : "none";
  }

  // --------------------------
  // RESET (closing app)
  // --------------------------
  resetLessonsUI() {
    this.currentCategory = null;
    this.currentLesson = null;
    this.currentPage = 0;

    this.listBox.innerHTML = "";
    this.titleBox.textContent = "Lessons";
    this.contentBox.textContent = "All unlocked lessons will appear here.";

    this.prevBtn.style.display = "none";
    this.nextBtn.style.display = "none";
  }
}

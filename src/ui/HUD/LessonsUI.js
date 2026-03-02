// src/ui/HUD/LessonsUI.js

import { LESSON_DATA } from "../data/lessonData.js";
import GameState from "../../GameState.js";

export default class LessonsUI {
  constructor() {
    this.currentCategory = null;
    this.currentLesson = null;
    this.currentPage = 0;

    this.cacheElements();
    this.attachEvents();
  }

  cacheElements() {
    this.contentBox = document.getElementById("lessons-content");
    this.prevBtn = document.getElementById("lesson-prev");
    this.nextBtn = document.getElementById("lesson-next");
    this.titleBox = document.getElementById("lessons-title");
    this.treeContainer = document.getElementById("lessons-tree");

    if (!this.treeContainer)
      console.warn("lessons-tree not found in DOM");
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
        const book = this.getCurrentBook();
        if (!book) return;

        const pages = Array.isArray(book.text)
          ? book.text
          : [book.text];

        if (this.currentPage < pages.length - 1) {
          this.currentPage++;
          this.renderPage();
        }
      });
    }
  }

  // =====================================================
  // CATEGORY UNLOCK CHECK
  // =====================================================

  isCategoryUnlocked(categoryId, index, categoryKeys) {

  const progress =
    GameState.player?.lessonProgress?.[categoryId];

  // ✅ If category already completed, it's unlocked
  if (progress?.quizPassed) return true;

  // ✅ If books are fully collected → unlock
  const lesson = LESSON_DATA[categoryId];
  const books = lesson?.books || [];

  const allRead = books.every(
    b => progress?.booksRead?.[b.key]
  );

  return allRead;
}

    // =====================================================
  // TREE BUILDER
  // =====================================================

  loadCategories() {
    if (!this.treeContainer) return;

    this.treeContainer.innerHTML = "";

    const categoryKeys = Object.keys(LESSON_DATA);

    categoryKeys.forEach((lessonId, index) => {
      const lesson = LESSON_DATA[lessonId];
      const progress =
        GameState.player?.lessonProgress?.[lessonId];

      const books = lesson.books || [];

      const allRead = books.every(
        b => progress?.booksRead?.[b.key]
      );

      const isUnlocked = this.isCategoryUnlocked(
        lessonId,
        index,
        categoryKeys
      );

      /* ---------------- GROUP ---------------- */

      const group = document.createElement("div");
      group.classList.add("lesson-group");

      /* ---------------- HEADER ---------------- */

      const header = document.createElement("div");
      header.classList.add("lesson-group-header");

      header.innerHTML = `
        <span>▼</span>
        ${lesson.displayName}
        ${allRead ? " ✅" : ""}
        ${!isUnlocked ? " 🔒" : ""}
      `;

      // 🔒 Locked styling
      if (!isUnlocked) {
        header.style.opacity = "0.5";
      }

      // ✅ Single clean click handler
      header.addEventListener("click", () => {
        if (!isUnlocked) {
          alert("🔒 This lesson is locked. Collect required books to unlock it.");
          return;
        }

        group.classList.toggle("open");
      });

      // ✅ Completed styling
      if (allRead && isUnlocked) {
        header.style.background = "#1b3f1b";
        header.style.color = "#4caf50";
      }

      group.appendChild(header);

      /* ---------------- SUBLESSONS ---------------- */

      const subList = document.createElement("div");
      subList.classList.add("lesson-sublist");

      // 🔥 Always render books — but disable if locked
      books.forEach(book => {
        const btn = document.createElement("div");
        btn.classList.add("lesson-subitem");

        const isRead = progress?.booksRead?.[book.key];

        const displayName =
          book.title || this.formatKey(book.key);

        btn.innerHTML = `
          ${displayName}
          ${isRead ? " ✅" : ""}
        `;

        // ✅ Style if read
        if (isRead) {
          btn.style.color = "#4caf50";
        }

        // 🔒 If category locked — disable interaction
        if (!isUnlocked) {
          btn.style.opacity = "0.4";
          btn.style.pointerEvents = "none";
        } else {
          btn.addEventListener("click", (e) => {
            e.stopPropagation();
            this.loadLessonContent(lessonId, book.key);
          });
        }

        subList.appendChild(btn);
      });

      group.appendChild(subList);
      this.treeContainer.appendChild(group);
    });
  }

  // =====================================================
  // LOAD LESSON CONTENT
  // =====================================================

  loadLessonContent(category, lessonKey) {
    this.currentCategory = category;
    this.currentLesson = lessonKey;
    this.currentPage = 0;

    const lesson = LESSON_DATA[category];
    if (!lesson) return;

    const book = lesson.books.find(
      b => b.key === lessonKey
    );

    if (!book) return;

    this.titleBox.textContent =
      book.title || this.formatKey(lessonKey);

    this.renderPage();
  }

  // =====================================================
  // RENDER PAGE
  // =====================================================

  getCurrentBook() {
    if (!this.currentCategory ||
        !this.currentLesson) return null;

    const lesson =
      LESSON_DATA[this.currentCategory];

    return lesson?.books.find(
      b => b.key === this.currentLesson
    );
  }

  renderPage() {
    const book = this.getCurrentBook();
    if (!book) return;

    const pages = Array.isArray(book.text)
      ? book.text
      : [book.text];

    this.contentBox.textContent =
      pages[this.currentPage];

    this.prevBtn.style.display =
      this.currentPage > 0 ? "block" : "none";

    this.nextBtn.style.display =
      this.currentPage < pages.length - 1
        ? "block"
        : "none";
  }

  // =====================================================
  // RESET
  // =====================================================

  resetLessonsUI() {
    this.currentCategory = null;
    this.currentLesson = null;
    this.currentPage = 0;

    if (this.treeContainer)
      this.treeContainer.innerHTML = "";

    this.titleBox.textContent = "Lessons";
    this.contentBox.textContent =
      "All unlocked lessons will appear here.";

    this.prevBtn.style.display = "none";
    this.nextBtn.style.display = "none";
  }

  formatKey(key) {
    return key
      .replace(/([A-Z])/g, " $1")
      .replace(/^./, str => str.toUpperCase());
  }
}
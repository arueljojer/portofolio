const menuButton = document.querySelector(".menu-toggle");
    const navLinks = document.querySelector(".nav-links");

    menuButton.addEventListener("click", () => {
      const isOpen = menuButton.getAttribute("aria-expanded") === "true";
      menuButton.setAttribute("aria-expanded", String(!isOpen));
      menuButton.setAttribute("aria-label", isOpen ? "Buka navigasi" : "Tutup navigasi");
      navLinks.classList.toggle("is-open", !isOpen);
    });

    navLinks.addEventListener("click", (event) => {
      if (event.target.closest("a")) {
        menuButton.setAttribute("aria-expanded", "false");
        menuButton.setAttribute("aria-label", "Buka navigasi");
        navLinks.classList.remove("is-open");
      }
    });

    const galleryButtons = document.querySelectorAll("[data-gallery-tab]");
    const galleryPanels = document.querySelectorAll("[data-gallery-panel]");
    const galleryDialog = document.querySelector("#gallery-dialog");
    const galleryDialogBack = document.querySelector(".gallery-dialog-back");
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const carouselTracks = document.querySelectorAll(".carousel-track");
    const carouselObservers = [];
    const pageSlides = document.querySelectorAll("#beranda, #tentang, #pengalaman, #galeri, #kontak");

    if (prefersReducedMotion || !("IntersectionObserver" in window)) {
      pageSlides.forEach((section) => section.classList.add("is-visible"));
    } else {
      const pageSlideObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          entry.target.classList.toggle("is-visible", entry.isIntersecting);
        });
      }, { threshold: 0.12 });

      pageSlides.forEach((section) => {
        section.classList.add("page-slide");
        pageSlideObserver.observe(section);
      });
    }

    if (prefersReducedMotion || !("IntersectionObserver" in window)) {
      document.querySelectorAll(".portfolio-item").forEach((item) => item.classList.add("is-visible"));
    } else {
      carouselTracks.forEach((track) => {
        const observer = new IntersectionObserver((entries) => {
          entries.forEach((entry) => {
            entry.target.classList.toggle("is-visible", entry.isIntersecting);
          });
        }, { root: track, threshold: 0.2 });

        track.querySelectorAll(".portfolio-item").forEach((item) => observer.observe(item));
        carouselObservers.push(observer);
      });
    }

    galleryButtons.forEach((button) => {
      button.addEventListener("click", () => {
        const selectedCategory = button.getAttribute("data-gallery-tab");
        const categories = Array.from(galleryPanels, (panel) => panel.getAttribute("data-gallery-panel"));
        const activePanel = document.querySelector(`[data-gallery-panel="${selectedCategory}"]`);

        if (button.classList.contains("gallery-shortcut") && !galleryDialog.open) {
          galleryDialog.showModal();
        }

        galleryButtons.forEach((item) => {
          const isSelected = item.getAttribute("data-gallery-tab") === selectedCategory;
          if (item.getAttribute("role") === "tab") {
            item.setAttribute("aria-selected", String(isSelected));
          } else {
            item.setAttribute("aria-pressed", String(isSelected));
          }
        });

        const currentPanel = document.querySelector("[data-gallery-panel]:not([hidden])");
        const currentCategory = currentPanel.getAttribute("data-gallery-panel");
        if (selectedCategory !== currentCategory) {
          const direction = categories.indexOf(selectedCategory) > categories.indexOf(currentCategory)
            ? "gallery-panel-enter-forward"
            : "gallery-panel-enter-backward";

          galleryPanels.forEach((panel) => {
            panel.hidden = panel !== activePanel;
            panel.classList.remove("gallery-panel-enter-forward", "gallery-panel-enter-backward");
          });

          if (!prefersReducedMotion) {
            void activePanel.offsetWidth;
            activePanel.classList.add(direction);
          }
        }

        activePanel.querySelector(".carousel-track").scrollTo({ left: 0, behavior: "auto" });
      });
    });

    galleryDialogBack.addEventListener("click", () => galleryDialog.close());

    document.querySelectorAll(".carousel-arrow").forEach((button) => {
      button.addEventListener("click", () => {
        const track = document.getElementById(button.getAttribute("data-carousel-target"));
        const firstItem = track.querySelector(".portfolio-item");
        const gap = parseFloat(getComputedStyle(track).columnGap);
        const distance = firstItem.getBoundingClientRect().width + gap;
        const direction = Number(button.getAttribute("data-carousel-direction"));
        track.scrollBy({ left: distance * direction, behavior: prefersReducedMotion ? "auto" : "smooth" });
      });
    });

    const contactForm = document.querySelector("#contact-form");
    const contactStatus = document.querySelector("#contact-status");
    contactForm.addEventListener("submit", (event) => {
      event.preventDefault();
      const name = document.querySelector("#contact-name").value.trim();
      const email = document.querySelector("#contact-email").value.trim();
      const message = document.querySelector("#contact-message").value.trim();
      const recipient = contactForm.dataset.recipient;
      if (!name || !email || !message) {
        contactStatus.textContent = "Nama, email, dan pesan harus diisi.";
        return;
      }

      const subject = encodeURIComponent(`Pesan portofolio dari ${name}`);
      const body = encodeURIComponent(`Nama: ${name}\nEmail: ${email}\n\nPesan:\n${message}`);

      contactStatus.textContent = "Membuka aplikasi email untuk mengirim pesan.";
      window.location.href = `mailto:${recipient}?subject=${subject}&body=${body}`;
    });

    const commentForm = document.querySelector("#comment-form");
    const commentName = document.querySelector("#comment-name");
    const commentMessage = document.querySelector("#comment-message");
    const commentStatus = document.querySelector("#comment-status");
    const commentList = document.querySelector("#comment-list");
    const commentCount = document.querySelector("#comment-count");
    const commentsStorageKey = "arul-pramuka-comments";
    let comments = [];
    let commentsStorageAvailable = true;

    const isStoredComment = (comment) =>
      comment &&
      typeof comment.name === "string" &&
      typeof comment.message === "string" &&
      typeof comment.createdAt === "string" &&
      Number.isFinite(Date.parse(comment.createdAt));

    const renderComments = () => {
      commentList.replaceChildren();
      commentCount.textContent = String(comments.length);

      if (comments.length === 0) {
        const emptyMessage = document.createElement("p");
        emptyMessage.className = "empty-comments";
        emptyMessage.textContent = commentsStorageAvailable
          ? "Belum ada komentar. Jadilah yang pertama menyapa!"
          : "Komentar yang tersimpan tidak dapat dimuat.";
        commentList.append(emptyMessage);
        return;
      }

      comments.slice().reverse().forEach((comment) => {
        const entry = document.createElement("article");
        entry.className = "comment-entry";

        const header = document.createElement("div");
        header.className = "comment-entry-head";

        const avatar = document.createElement("span");
        avatar.className = "comment-avatar";
        avatar.setAttribute("aria-hidden", "true");
        avatar.textContent = comment.name.trim().charAt(0).toUpperCase() || "?";

        const name = document.createElement("strong");
        name.textContent = comment.name;

        const date = document.createElement("time");
        date.dateTime = comment.createdAt;
        date.textContent = new Date(comment.createdAt).toLocaleDateString("id-ID", {
          day: "numeric",
          month: "short",
          year: "numeric",
        });

        const message = document.createElement("p");
        message.textContent = comment.message;

        header.append(avatar, name, date);
        entry.append(header, message);
        commentList.append(entry);
      });
    };

    try {
      const storedComments = localStorage.getItem(commentsStorageKey);
      if (storedComments !== null) {
        const parsedComments = JSON.parse(storedComments);
        if (!Array.isArray(parsedComments) || parsedComments.some((comment) => !isStoredComment(comment))) {
          throw new TypeError("Data komentar tersimpan memiliki format yang tidak valid.");
        }
        comments = parsedComments;
      }
    } catch (error) {
      commentsStorageAvailable = false;
      commentStatus.textContent = "Komentar lokal tidak dapat dimuat. Penyimpanan browser tidak tersedia.";
      commentForm.querySelector('button[type="submit"]').disabled = true;
      console.error("Gagal memuat komentar lokal:", error);
    }

    renderComments();
    commentForm.addEventListener("submit", (event) => {
      event.preventDefault();
      if (!commentsStorageAvailable) return;

      const name = commentName.value.trim();
      const message = commentMessage.value.trim();
      if (!name || !message) {
        commentStatus.textContent = "Nama dan komentar harus diisi.";
        return;
      }

      const newComment = { name, message, createdAt: new Date().toISOString() };
      const updatedComments = [...comments, newComment];
      try {
        localStorage.setItem(commentsStorageKey, JSON.stringify(updatedComments));
      } catch (error) {
        commentStatus.textContent = "Komentar gagal disimpan. Periksa ruang penyimpanan browser.";
        console.error("Gagal menyimpan komentar lokal:", error);
        return;
      }

      comments = updatedComments;
      renderComments();
      commentForm.reset();
      commentStatus.textContent = "Komentar tersimpan di browser ini.";
    });

    document.querySelector("#year").textContent = new Date().getFullYear();

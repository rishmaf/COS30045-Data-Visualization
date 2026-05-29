/** Highlight active link in site header from data-page on <body> */
(function () {
  const page = document.body.dataset.page;
  if (!page) return;
  document.querySelectorAll(".site-nav-link").forEach((link) => {
    link.classList.toggle("is-active", link.dataset.page === page);
  });
})();

"use strict";
(() => {
  const target = document.querySelector("a[href]");
  if (target) window.location.replace(target.href + window.location.search + window.location.hash);
})();

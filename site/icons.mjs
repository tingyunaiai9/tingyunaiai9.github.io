const paths = {
  mail: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 6 9 7 9-7"/>',
  file: '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6M8 13h8M8 17h5"/>',
  github:
    '<path d="M9 19c-4.3 1.3-4.3-2.2-6-2.7m12 5.7v-3.9a3.4 3.4 0 0 0-.9-2.7c3-.4 6.2-1.5 6.2-7A5.5 5.5 0 0 0 18.8 4a5 5 0 0 0-.1-3S17.5.6 15 2.5a13.4 13.4 0 0 0-6 0C6.5.6 5.3 1 5.3 1a5 5 0 0 0-.1 3 5.5 5.5 0 0 0-1.5 3.8c0 5.4 3.2 6.6 6.2 7a3.4 3.4 0 0 0-.9 2.7V22"/>',
  arrow: '<path d="M5 12h14m-6-6 6 6-6 6"/>',
  sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M2 12h2m16 0h2M5 5l1.5 1.5m11 11L19 19M5 19l1.5-1.5m11-11L19 5"/>',
  moon: '<path d="M21 12.8A9 9 0 1 1 11.2 3 7 7 0 0 0 21 12.8"/>',
  menu: '<path d="M4 6h16M4 12h16M4 18h16"/>',
  pin: '<path d="M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 1 1 16 0Z"/><circle cx="12" cy="10" r="2.5"/>',
};

export function icon(name) {
  return `<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths[name] || paths.arrow}</svg>`;
}

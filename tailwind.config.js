// Tailwind config for the root page (tristan.pro). Replaces the inline
// `tailwind.config = {…}` that the Play CDN used to read at runtime — same
// theme, but compiled once by the CLI into assets/tailwind.css (see
// .github/workflows/build-frontend.yml) instead of a 400 KB JIT compiler
// shipped to every visitor.
//
// `content` is what the CLI scans for class names. Both files are scanned,
// so a class used only in app.jsx is still emitted.

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html', './app.jsx'],
  theme: {
    extend: {
      fontFamily: {
        heading: ["'Instrument Serif'", 'serif'],
        body: ["'Barlow'", 'sans-serif'],
      },
      colors: {
        foreground: 'hsl(0 0% 100%)',
      },
    },
  },
};

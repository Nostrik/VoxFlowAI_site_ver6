/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./*.html", "./assets/js/**/*.js"],
  theme: {
    container: {
      screens: {
        "2xl": "1290px",
      },
    },
    fontFamily: {
      sans: ["Kumbh Sans", "sans-serif"],
    },
    extend: {
      fontSize: {
        "3xl": "32px",
        "4xl": "40px",
        "6xl": "64px",
      },
      colors: {
        body: "#090A0B",
        "b-900": "#090A0B",
        "b-800": "#121417",
        "b-700": "#1B1E22",
        "b-600": "#24282E",
        "b-500": "#090A0B",
        "b-400": "#2D3239",
        "b-300": "#363C45",
        "b-200": "#48505B",
        "b-150": "#47A9FF",
        "b-100": "#515A67",
        "b-50": "#5A6472",
        "w-900": "#F4F5F6",
        "w-800": "#E8EAED",
        "w-700": "#DDE0E4",
        "w-600": "#D1D5DB",
        "w-500": "#C6CBD2",
        "w-400": "#BAC0C9",
        "w-300": "#AFB6C0",
        "w-200": "#A3ABB7",
        "w-100": "#98A1AE",
        "w-50": "#8D97A5",
        "chat-primary": "#132947",
        "chat-secondary": "#1C232B",
        "input-brdr": "#232930",
        "btn-bg": "rgba(20, 114, 255, 1)",
        "guide-border": "rgba(152, 161, 174, 0.08)",
      },
      backgroundImage: () => ({
        "btn-bg":
          "linear-gradient(103.44deg, rgb(20, 114, 255) -4%, rgb(71, 169, 255) 69.05%, rgb(173, 195, 255) 142.11%, rgb(255, 173, 201) 215.17%, rgb(255, 71, 107) 288.22%)",
        hero: "url('/assets/img/hero-bg.jpg')",
        "primary-hero": "url('/assets/img/primary-hero-bg.jpg')",
        "secondary-hero": "url('/assets/img/secondary-hero-bg.jpg')",
        "guide-bg": "url('/assets/img/guide-bg.png')",
        "trusted-bg": "url('/assets/img/trust-bg.jpg')",
        "counter-bg": "url('/assets/img/counter-bg.jpg')",
        "blog-bg":
          "linear-gradient(180deg, rgba(152, 161, 174, 0) -2.2%, rgba(20, 114, 255, 0.04) 102.2%);",
        "footer-bg": "url('/assets/img/footer-bg.jpg')",
        "sign-in": "url('/assets/img/sign-in-bg.jpg')",
        "home-card":
          "linear-gradient(359.85deg, rgba(152, 161, 174, 0) 4.78%, rgba(20, 114, 255, 0.08) 104.52%)",
        "home-card-bg": " linear-gradient(180deg, #161E28 0%, #0C1117 100%);",
        "feature-card":
          "linear-gradient(180deg, rgba(20, 114, 255, 0.04) -2.2%, rgba(152, 161, 174, 0) 102.2%)",
        "api-card":
          "linear-gradient(359.79deg, rgba(152, 161, 174, 0) 6.49%, rgba(20, 114, 255, 0.08) 104.86%)",
        "guide-card":
          "linear-gradient(180deg, rgba(152, 161, 174, 0) -2.2%, rgba(20, 114, 255, 0.04) 102.2%)",
        "trust-card":
          "linear-gradient(359.83deg, rgba(152, 161, 174, 0) 8.02%, rgba(20, 114, 255, 0.08) 129.53%)",
        "price-active-card":
          "radial-gradient(ellipse at center, rgba(152, 161, 174, 0) 8.02%, rgba(20, 114, 255, 0.08) 129.53%)",
        "blog-card":
          "linear-gradient(359.81deg, rgba(152, 161, 174, 0) -2.5%, rgba(20, 114, 255, 0.08) 106.62%)",
        "blog-card-tag":
          "linear-gradient(180deg, rgba(152, 161, 174, 0.08) 0%, rgba(152, 161, 174, 0.08) 0.01%, rgba(20, 114, 255, 0) 100%)",
        "faq-card-item":
          "linear-gradient(359.81deg, rgba(152, 161, 174, 0) -2.5%, rgba(20, 114, 255, 0.08) 106.62%)",
        video:
          "linear-gradient(180deg, rgba(20, 114, 255, 0.04) -2.2%, rgba(152, 161, 174, 0) 102.2%)",
        knowledge:
          "linear-gradient(180deg, rgba(20, 114, 255, 0.04) -2.2%, rgba(152, 161, 174, 0) 102.2%)",
        effect:
          "linear-gradient(180deg, rgba(152, 161, 174, 0) -2.2%, rgba(20, 114, 255, 0.04) 102.2%);",
        "blog-tag":
          "linear-gradient(180deg, rgba(152, 161, 174, 0.08) 0%, rgba(152, 161, 174, 0.08) 0.01%, rgba(20, 114, 255, 0) 100%)",
      }),
    },
  },
};

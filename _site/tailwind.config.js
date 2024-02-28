module.exports = {
    content: ["./_layouts/*.{html,md}", "./_posts/*.{html,md}", "./_includes/*.{html,md}", "./_site/*.{html,md}"],
    theme: {
      extend: {
        colors: {
            purple: {
                DEFAULT: "#6E3AF5",
                light: "#7D4EF6",
                },
                gray: {
                DEFAULT: "#999999",
                },
        },
        fontFamily: {
          body: ["-apple-system", "BlinkMacSystemFont", "Inter", "Segoe UI", "Roboto"],
          sans: ["-apple-system", "BlinkMacSystemFont", "Inter", "Segoe UI", "Roboto"],
        },
      },
    },
    plugins: [],
  };

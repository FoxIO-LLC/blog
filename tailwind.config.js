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
              DEFAULT: "#F7F7F7",
            },
            black: {
              DEFAULT: "#242424",
              light: "#8C8C8C",
            },
        },
        fontFamily: {
          body: ["-apple-system", "BlinkMacSystemFont", "Inter", "Segoe UI", "Roboto", "sans-serif"],
          sans: ["-apple-system", "BlinkMacSystemFont", "Inter", "Segoe UI", "Roboto", "sans-serif"],
        },
        typography: {
          DEFAULT: {
            css: {
              color: "#242424",
              a: {
                color: "#6E3AF5",
                "&:hover": {
                  color: "#7D4EF6",
                },
                textDecoration: false,
              },
            },
          },
        }

      },
    },
    plugins: [require("@tailwindcss/typography")],
  };

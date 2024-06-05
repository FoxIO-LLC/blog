module.exports = {
    content: [
      "./_layouts/*.{html,md}",
      "./_posts/*.{html,md}",
      "./_includes/*.{html,md}",
      "./_site/*.{html,md}"
    ],
    theme: {
      extend: {
        colors: {
            purple: {
              DEFAULT: "#6E3AF5",
              light: "#7D4EF6",
            },
            gray: {
              DEFAULT: "#4B5563",
              light: "#F5F5F7",
            },
            black: {
              DEFAULT: "#000000",
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
              color: "#FFFFFF",
              h1: {
                color: "#FFFFFF",
              },
              h2: {
                color: "#FFFFFF",
              },
              a: {
                color: "#6E3AF5",
                "&:hover": {
                  color: "#7D4EF6",
                },
                textDecoration: false,
              },
              strong: {
                color: "#FFFFFF",
              },
              em: {
                color: "#FFFFFF",
              },
              figcaption: {
                color: "#F5F5F7",
              },
              pre: {
                backgroundColor: "#FFFFFF",
                color: "#000000",
              },
              code: {
                color: "#30B700",
              },
            },
          },
        }

      },
    },
    daisyui: {
      themes: [
        {
          ["FoxIO Blog"]: {
            primary: "#6E3AF5",
            secondary: "#7D4EF6",
            accent: "#000000",
            neutral: "#4B5563",
            "base-100": "#FFFFFF",
            success: "#22C55E",
            warning: "#EAB308",
            error: "#EF4444",
          },
        },
      ],
    },
    plugins: [
      require("@tailwindcss/typography"),
      require("daisyui"),
    ],
  };

import "@content/assets/css/mixins/color-theme.css";
import "@content/assets/css/mixins/font-size.css";

const FONT_NAME: string = "HarmonyOS_SansSC";

const FontStyle: { [key: string]: { type: string, weight: number } } = {
  THIN: { type: "Thin", weight: 100 },
  LIGHT: { type: "Light", weight: 300 },
  REGULAR: { type: "Regular", weight: 400 },
  MEDIUM: { type: "Medium", weight: 500 },
  BOLD: { type: "Bold", weight: 700 },
  BLACK: { type: "Black", weight: 900 },
} as const;

const fontPath: string = window.utils.PathUtil.getPublicDir("font", FONT_NAME, FONT_NAME).replaceAll("\\", "/");
const fontFaceStyle: HTMLStyleElement = document.createElement("style");
Object.values(FontStyle).forEach(({ type, weight }): void => {
  fontFaceStyle.textContent += `@font-face {
    font-family: "${FONT_NAME}";
    src: url(${fontPath}_${type}.ttf) format("truetype");
    font-weight: ${weight};
    font-style: normal;
  }`;
});
document.head.appendChild(fontFaceStyle);

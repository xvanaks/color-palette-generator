const PaletteEngine = (function () {
  const recentHistory = [];
  const PHI_ANGLE = 137.508;

  function hexToRgb(hex) {
    hex = (hex || "").replace("#", "").trim();
    if (hex.length === 3) {
      hex = hex.split("").map((c) => c + c).join("");
    }
    if (hex.length !== 6) return { r: 0, g: 0, b: 0 };
    const num = parseInt(hex, 16);
    return {
      r: (num >> 16) & 255,
      g: (num >> 8) & 255,
      b: num & 255
    };
  }

  function rgbToHex(r, g, b) {
    const toHex = (n) => Math.max(0, Math.min(255, Math.round(n))).toString(16).padStart(2, "0").toUpperCase();
    return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
  }

  function rgbToHsl(r, g, b) {
    r /= 255;
    g /= 255;
    b /= 255;
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h = 0;
    let s = 0;
    const l = (max + min) / 2;

    if (max !== min) {
      const delta = max - min;
      s = l > 0.5 ? delta / (2 - max - min) : delta / (max + min);
      switch (max) {
        case r: h = (g - b) / delta + (g < b ? 6 : 0); break;
        case g: h = (b - r) / delta + 2; break;
        case b: h = (r - g) / delta + 4; break;
      }
      h /= 6;
    }

    return {
      h: Math.round(h * 3600) / 10,
      s: Math.round(s * 1000) / 10,
      l: Math.round(l * 1000) / 10
    };
  }

  function hslToRgb(h, s, l) {
    h = (((h % 360) + 360) % 360) / 360;
    s = Math.max(0, Math.min(100, s)) / 100;
    l = Math.max(0, Math.min(100, l)) / 100;

    if (s === 0) {
      const gray = Math.round(l * 255);
      return { r: gray, g: gray, b: gray };
    }

    const calcChannel = (p, q, t) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1 / 6) return p + (q - p) * 6 * t;
      if (t < 1 / 2) return q;
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
      return p;
    };

    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;

    return {
      r: Math.round(calcChannel(p, q, h + 1 / 3) * 255),
      g: Math.round(calcChannel(p, q, h) * 255),
      b: Math.round(calcChannel(p, q, h - 1 / 3) * 255)
    };
  }

  function hslToHex(h, s, l) {
    const { r, g, b } = hslToRgb(h, s, l);
    return rgbToHex(r, g, b);
  }

  function getLuminance(hex) {
    const { r, g, b } = hexToRgb(hex);
    const [normR, normG, normB] = [r, g, b].map((channel) => {
      channel /= 255;
      return channel <= 0.03928 ? channel / 12.92 : Math.pow((channel + 0.055) / 1.055, 2.4);
    });
    return normR * 0.2126 + normG * 0.7152 + normB * 0.0722;
  }

  function isLightColor(hex) {
    return getLuminance(hex) > 0.44;
  }

  function getContrastRatio(hex1, hex2) {
    const lum1 = getLuminance(hex1);
    const lum2 = getLuminance(hex2);
    const lightest = Math.max(lum1, lum2);
    const darkest = Math.min(lum1, lum2);
    return ((lightest + 0.05) / (darkest + 0.05)).toFixed(1);
  }

  function colorDistance(hex1, hex2) {
    const c1 = hexToRgb(hex1);
    const c2 = hexToRgb(hex2);
    const deltaR = c1.r - c2.r;
    const deltaG = c1.g - c2.g;
    const deltaB = c1.b - c2.b;
    const meanR = (c1.r + c2.r) / 2;
    return Math.sqrt(
      (2 + meanR / 256) * deltaR * deltaR +
      4 * deltaG * deltaG +
      (2 + (255 - meanR) / 256) * deltaB * deltaB
    );
  }

  function generateShades(hex, count = 10) {
    const rgb = hexToRgb(hex);
    const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
    const shades = [];
    const minLightness = 12;
    const maxLightness = 94;
    const step = (maxLightness - minLightness) / (count - 1);

    for (let i = 0; i < count; i++) {
      const lightness = Math.round(minLightness + step * i);
      shades.push(hslToHex(hsl.h, hsl.s, lightness));
    }
    return shades;
  }

  function createSinglePalette(columnList, harmonyMode) {
    const count = columnList.length;
    const result = new Array(count);

    const lockedColors = columnList
      .map((item, index) => ({ item, index }))
      .filter(({ item }) => item.locked);

    lockedColors.forEach(({ item, index }) => {
      result[index] = item.hex;
    });

    let baseHue;
    let baseSaturation;

    if (lockedColors.length > 0) {
      const firstRgb = hexToRgb(lockedColors[0].item.hex);
      const firstHsl = rgbToHsl(firstRgb.r, firstRgb.g, firstRgb.b);
      baseHue = firstHsl.h;
      baseSaturation = firstHsl.s;
    } else {
      baseHue = Math.random() * 360;
      baseSaturation = 45 + Math.random() * 40;
    }

    let activeStyle = harmonyMode;
    if (harmonyMode === "smart") {
      const styles = ["golden", "analogous", "contrast", "triad", "pastel", "vibrant", "editorial", "warm", "cool"];
      activeStyle = styles[Math.floor(Math.random() * styles.length)];
    }

    for (let i = 0; i < count; i++) {
      if (result[i]) continue;

      let currentHue = baseHue;
      let currentSaturation = baseSaturation;
      let currentLightness = 22 + (65 / (count - 1 || 1)) * i + (Math.random() * 10 - 5);

      switch (activeStyle) {
        case "golden":
          currentHue = (baseHue + (i + 1) * PHI_ANGLE + (Math.random() * 8 - 4)) % 360;
          currentSaturation = Math.max(35, Math.min(92, baseSaturation + (Math.random() * 24 - 12)));
          break;
        case "analogous":
          currentHue = (baseHue + i * (28 + Math.random() * 12)) % 360;
          currentSaturation = 45 + Math.random() * 40;
          break;
        case "contrast":
        case "complementary":
          currentHue = i % 2 === 0 ? (baseHue + Math.random() * 20 - 10) % 360 : (baseHue + 180 + Math.random() * 30 - 15) % 360;
          currentSaturation = 50 + Math.random() * 42;
          break;
        case "triad":
        case "triadic":
          currentHue = (baseHue + (i % 3) * 120 + (Math.random() * 16 - 8)) % 360;
          currentSaturation = 48 + Math.random() * 40;
          break;
        case "monochrome":
          currentHue = baseHue;
          currentSaturation = Math.max(20, Math.min(90, baseSaturation + (Math.random() * 16 - 8)));
          currentLightness = 16 + (72 / (count - 1 || 1)) * i;
          break;
        case "pastel":
          currentHue = (baseHue + i * 55 + Math.random() * 15) % 360;
          currentSaturation = 30 + Math.random() * 25;
          currentLightness = 78 + Math.random() * 14;
          break;
        case "vibrant":
          currentHue = (baseHue + (i + 1) * 98) % 360;
          currentSaturation = 82 + Math.random() * 18;
          currentLightness = 48 + Math.random() * 16;
          break;
        case "dark":
          currentHue = (baseHue + i * 45) % 360;
          currentSaturation = 32 + Math.random() * 45;
          currentLightness = i === count - 1 ? 72 + Math.random() * 15 : 15 + Math.random() * 18;
          break;
        case "warm":
          currentHue = (345 + i * 24 + Math.random() * 12) % 360;
          currentSaturation = 52 + Math.random() * 38;
          currentLightness = 30 + Math.random() * 50;
          break;
        case "cool":
          currentHue = (175 + i * 26 + Math.random() * 14) % 360;
          currentSaturation = 46 + Math.random() * 40;
          currentLightness = 25 + Math.random() * 55;
          break;
        case "editorial":
        default:
          currentHue = (baseHue + i * 75 + Math.random() * 15) % 360;
          currentSaturation = 42 + Math.random() * 46;
          currentLightness = i === 0 ? 18 + Math.random() * 8 : (i === count - 1 ? 88 + Math.random() * 6 : 35 + Math.random() * 40);
          break;
      }

      currentHue = (currentHue + 360) % 360;
      currentSaturation = Math.max(12, Math.min(100, currentSaturation));
      currentLightness = Math.max(12, Math.min(94, currentLightness));

      result[i] = hslToHex(currentHue, currentSaturation, currentLightness);
    }

    for (let i = 0; i < count; i++) {
      if (columnList[i]?.locked) continue;
      for (let j = 0; j < i; j++) {
        if (colorDistance(result[i], result[j]) < 44) {
          const rgb = hexToRgb(result[i]);
          const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
          const newHue = (hsl.h + 75 + Math.random() * 45) % 360;
          const newLightness = hsl.l > 50 ? Math.max(16, hsl.l - 32) : Math.min(88, hsl.l + 32);
          result[i] = hslToHex(newHue, hsl.s, newLightness);
        }
      }
    }

    return result;
  }

  function generatePalette(columnList, harmonyMode = "smart") {
    let candidate;
    for (let attempt = 0; attempt < 12; attempt++) {
      candidate = createSinglePalette(columnList, harmonyMode);
      const signature = candidate.join("-");
      if (!recentHistory.includes(signature)) {
        recentHistory.push(signature);
        if (recentHistory.length > 80) recentHistory.shift();
        return candidate;
      }
    }
    return candidate;
  }

  return {
    hexToRgb,
    rgbToHex,
    rgbToHsl,
    hslToHex,
    getLuminance,
    isLightColor,
    getContrastRatio,
    generateShades,
    generatePalette
  };
})();

if (typeof module !== "undefined" && module.exports) {
  module.exports = PaletteEngine;
}

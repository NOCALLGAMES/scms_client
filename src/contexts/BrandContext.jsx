import React, { createContext, useContext, useEffect, useMemo } from "react";
import { useAuth } from "../features/auth/hooks/useAuth";

const BrandContext = createContext({
  brandColor: "#006a61",
  getBrandBg: () => ({ backgroundColor: "#006a61" }),
  getBrandText: () => ({ color: "#006a61" }),
  getBrandBorder: () => ({ borderColor: "#006a61" }),
  getBrandBgLight: () => ({ backgroundColor: "rgba(0,106,97,0.1)" }),
  getBrandTextColor: () => "#006a61",
});

export const useBrand = () => useContext(BrandContext);

function hexToRgb(hex) {
  const cleaned = hex.replace("#", "");
  const bigint = parseInt(cleaned, 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;
  return `${r}, ${g}, ${b}`;
}

export const BrandProvider = ({ children }) => {
  const { user } = useAuth();
  const brandColor = user?.institution?.settings?.brandColor || "#006a61";

  useEffect(() => {
    const root = document.documentElement;
    const rgb = hexToRgb(brandColor);
    const [r, g, b] = rgb.split(",").map(Number);

    // Set core variables
    root.style.setProperty("--brand-color", brandColor);
    root.style.setProperty("--brand-rgb", rgb);

    // Helper for adjusting brightness
    const adjust = (p) => {
      const nr = Math.round(r + (255 - r) * p);
      const ng = Math.round(g + (255 - g) * p);
      const nb = Math.round(b + (255 - b) * p);
      return `rgb(${nr}, ${ng}, ${nb})`;
    };

    const darken = (p) => {
      const nr = Math.round(r * (1 - p));
      const ng = Math.round(g * (1 - p));
      const nb = Math.round(b * (1 - p));
      return `rgb(${nr}, ${ng}, ${nb})`;
    };

    // Set shades for Tailwind mapping
    root.style.setProperty("--brand-50", adjust(0.95));
    root.style.setProperty("--brand-100", adjust(0.85));
    root.style.setProperty("--brand-200", adjust(0.7));
    root.style.setProperty("--brand-300", adjust(0.5));
    root.style.setProperty("--brand-400", adjust(0.3));
    root.style.setProperty("--brand-500", brandColor);
    root.style.setProperty("--brand-600", darken(0.1));
    root.style.setProperty("--brand-700", darken(0.2));
    root.style.setProperty("--brand-800", darken(0.35));
    root.style.setProperty("--brand-900", darken(0.5));
    root.style.setProperty("--brand-950", darken(0.7));

    root.style.setProperty("--brand-bg-deep", darken(0.85));
    root.style.setProperty("--brand-bg-hover", darken(0.75));
  }, [brandColor]);

  const value = useMemo(
    () => ({
      brandColor,
      getBrandBg: (opacity = 1) => {
        if (opacity === 1) return { backgroundColor: brandColor };
        const rgb = hexToRgb(brandColor);
        return { backgroundColor: `rgba(${rgb}, ${opacity})` };
      },
      getBrandText: () => ({ color: brandColor }),
      getBrandBorder: () => ({ borderColor: brandColor }),
      getBrandBgLight: () => {
        const rgb = hexToRgb(brandColor);
        return { backgroundColor: `rgba(${rgb}, 0.12)` };
      },
      getBrandBgDark: () => {
        const rgb = hexToRgb(brandColor);
        const [r, g, b] = rgb.split(",").map((v) => Math.round(v * 0.15));
        return { backgroundColor: `rgb(${r}, ${g}, ${b})` };
      },
      getBrandBgHover: () => {
        const rgb = hexToRgb(brandColor);
        const [r, g, b] = rgb.split(",").map((v) => Math.round(v * 0.25));
        return { backgroundColor: `rgb(${r}, ${g}, ${b})` };
      },
      getBrandTextColor: () => brandColor,
    }),
    [brandColor],
  );

  return (
    <BrandContext.Provider value={value}>{children}</BrandContext.Provider>
  );
};

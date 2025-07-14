import { create } from "zustand";
import { siteConfig } from "@/config/site";
import { persist, createJSONStorage } from "zustand/middleware";

// Liste des thèmes valides
const validThemes = [
  'zinc', 'slate', 'stone', 'gray', 'neutral', 'red', 'rose', 
  'orange', 'green', 'blue', 'yellow', 'violet'
];

// Fonction pour valider le thème
const validateTheme = (theme) => {
  return validThemes.includes(theme) ? theme : siteConfig.theme;
};

export const useThemeStore = create(
  persist(
    (set, get) => ({
      theme: siteConfig.theme,
      setTheme: (theme) => set({ theme: validateTheme(theme) }),
      radius: siteConfig.radius,
      setRadius: (value) => set({ radius: value }),
      layout: siteConfig.layout,
      setLayout: (value) => {
        set({ layout: value });

        // If the new layout is "semibox," also set the sidebarType to "popover"
        if (value === "semibox") {
          useSidebar.setState({ sidebarType: "popover" });
        }
        if (value === "horizontal") {
          useSidebar.setState({ sidebarType: "classic" });
        }
        //
        if (value === "horizontal") {
          // update  setNavbarType
          useThemeStore.setState({ navbarType: "sticky" });
        }
      },
      navbarType: siteConfig.navbarType,
      setNavbarType: (value) => set({ navbarType: value }),
      footerType: siteConfig.footerType,
      setFooterType: (value) => set({ footerType: value }),
      isRtl: false,
      setRtl: (value) => set({ isRtl: value }),
    }),
    {
      name: "theme-store",
      storage: createJSONStorage(() => {
        // Vérifier si localStorage est disponible
        if (typeof window !== 'undefined') {
          return localStorage;
        }
        return {
          getItem: () => null,
          setItem: () => {},
          removeItem: () => {},
        };
      }),
      // Initialiser avec les valeurs par défaut si aucune donnée n'est trouvée
      onRehydrateStorage: () => (state) => {
        if (state) {
          // S'assurer que le thème est toujours défini et valide
          if (!state.theme || !validThemes.includes(state.theme)) {
            state.theme = siteConfig.theme;
          }
          if (!state.radius) {
            state.radius = siteConfig.radius;
          }
        }
      },
    }
  )
);

export const useSidebar = create(
  persist(
    (set) => ({
      collapsed: false,
      setCollapsed: (value) => set({ collapsed: value }),
      sidebarType:
        siteConfig.layout === "semibox" ? "popover" : siteConfig.sidebarType,
      setSidebarType: (value) => {
        set({ sidebarType: value });
      },
      subMenu: false,
      setSubmenu: (value) => set({ subMenu: value }),
      // background image
      sidebarBg: siteConfig.sidebarBg,
      setSidebarBg: (value) => set({ sidebarBg: value }),
      mobileMenu: false,
      setMobileMenu: (value) => set({ mobileMenu: value }),
    }),
    {
      name: "sidebar-store",
      storage: createJSONStorage(() => {
        // Vérifier si localStorage est disponible
        if (typeof window !== 'undefined') {
          return localStorage;
        }
        return {
          getItem: () => null,
          setItem: () => {},
          removeItem: () => {},
        };
      }),
    }
  )
);

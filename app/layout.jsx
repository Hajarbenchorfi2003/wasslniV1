import "./assets/scss/globals.scss";
import "./assets/scss/theme.scss";
import "./assets/scss/globals.scss";
import { Inter } from "next/font/google";
import { siteConfig } from "@/config/site";
import Providers from "@/provider/providers";
import "simplebar-react/dist/simplebar.min.css";
import TanstackProvider from "@/provider/providers.client";
import AuthProvider from "@/provider/auth.provider";
import "flatpickr/dist/themes/light.css";
import DirectionProvider from "@/provider/direction.provider";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: {
    default: siteConfig.name,
    template: `%s - ${siteConfig.name}`,
  },
  description: siteConfig.description,
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  // Récupérer le thème depuis localStorage
                  const themeStore = localStorage.getItem('theme-store');
                  let theme = '${siteConfig.theme}';
                  
                  if (themeStore) {
                    const parsed = JSON.parse(themeStore);
                    if (parsed.state && parsed.state.theme) {
                      theme = parsed.state.theme;
                    }
                  }
                  
                  // Appliquer le thème immédiatement
                  document.documentElement.classList.add('theme-' + theme);
                  document.body.classList.add('wasslni');
                  
                  // Appliquer le radius par défaut
                  document.documentElement.style.setProperty('--radius', '0.5rem');
                } catch (e) {
                  // En cas d'erreur, appliquer le thème par défaut
                  document.documentElement.classList.add('theme-${siteConfig.theme}');
                  document.body.classList.add('wasslni');
                }
              })();
            `,
          }}
        />
      </head>
      <body className={inter.className}>
        <AuthProvider>
          <TanstackProvider>
            <Providers>
              <DirectionProvider lang="en">{children}</DirectionProvider>
            </Providers>
          </TanstackProvider>
        </AuthProvider>
      </body>
    </html>
  );
}

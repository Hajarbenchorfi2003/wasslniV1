import "./assets/scss/globals.scss";
import "./assets/scss/theme.scss";
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
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
  },
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon-16x16.png',
    apple: '/apple-touch-icon.png',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script 
          id="theme-init"
          dangerouslySetInnerHTML={{
            __html: `
              try {
                // Get theme from localStorage
                const themeStore = localStorage.getItem('theme-store');
                let theme = '${siteConfig.theme}';
                
                if (themeStore) {
                  const parsed = JSON.parse(themeStore);
                  if (parsed?.state?.theme) {
                    theme = parsed.state.theme;
                  }
                }
                
                // Apply theme immediately
                document.documentElement.classList.add('theme-' + theme);
                document.body.classList.add('wasslni');
                
                // Apply default radius
                document.documentElement.style.setProperty('--radius', '0.5rem');
              } catch (e) {
                console.error('Theme initialization error:', e);
                // Fallback to default theme
                document.documentElement.classList.add('theme-${siteConfig.theme}');
                document.body.classList.add('wasslni');
              }
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
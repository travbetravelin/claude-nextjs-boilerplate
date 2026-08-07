import type { Metadata, Viewport } from "next";
import { StagingBanner } from "@/components/StagingBanner";
import "./globals.css";

export const metadata: Metadata = {
  title: "New Project",
  description: "Built with the claude-nextjs-boilerplate",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#1e4468",
};

// Sets data-theme on <html> before first paint so there's no flash of the
// wrong theme -- must run synchronously in <head>, ahead of hydration.
// Mirrors src/lib/theme.ts's resolveTheme()/applyTheme(); the storage key
// ('app-theme') must stay identical to THEME_STORAGE_KEY there, and the
// hex must stay identical to THEME_COLOR_DARK (the dark-theme resolved
// value of --primary-dark in globals.css).
const THEME_INIT_SCRIPT = `(function(){try{var m=localStorage.getItem('app-theme');var d=m==='dark'||(m!=='light'&&window.matchMedia('(prefers-color-scheme: dark)').matches);if(d){document.documentElement.setAttribute('data-theme','dark');var t=document.querySelector('meta[name="theme-color"]');if(t)t.setAttribute('content','#132c45');}}catch(e){}})();`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
      </head>
      <body>
        <StagingBanner />
        {children}
      </body>
    </html>
  );
}

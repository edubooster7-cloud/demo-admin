import { AxiosInterceptor } from "@/components/global/AxiosInterceptor";
import { ThemeProvider } from "@/components/theme/theme-provider";
import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "../globals.css";
import { AuthProvider } from "@/context/auth-context";
import { Toaster } from "sonner";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
  variable: "--font-poppins",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "EduBooster Admin",
    template: "%s | EduBooster Admin",
  },
  description:
    "Tableau de bord d’administration EduBooster pour la gestion des apprenants, formateurs, contenus éducatifs et performances académiques.",
  keywords: [
    "EduBooster",
    "administration éducative",
    "plateforme e-learning",
    "gestion des étudiants",
    "gestion des cours",
    "éducation numérique",
    "learning management system",
    "LMS",
  ],
  authors: [{ name: "EduBooster Team" }],
  creator: "EduBooster",
  publisher: "EduBooster",
  metadataBase: new URL("https://admin.edubooster.org"),
  openGraph: {
    title: "EduBooster Admin",
    description:
      "Interface d’administration d’EduBooster pour superviser les utilisateurs, les cours et les performances.",
    url: "https://admin.edubooster.org",
    siteName: "EduBooster",
    locale: "fr_FR",
    type: "website",
  },
  robots: {
    index: false,
    follow: false,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <body className={`${poppins.variable} font-sans antialiased`}>
        <>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <AxiosInterceptor>
              <AuthProvider>{children}</AuthProvider>
            </AxiosInterceptor>
          </ThemeProvider>

          <Toaster />
        </>
      </body>
    </html>
  );
}

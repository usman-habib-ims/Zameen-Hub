// import type { Metadata } from "next";
// import { Geist, Geist_Mono } from "next/font/google";
// import "./globals.css";
// import Navbar from "@/components/Navbar";
// import Footer from "@/components/Footer";

// const geistSans = Geist({
//   variable: "--font-geist-sans",
//   subsets: ["latin"],
// });

// const geistMono = Geist_Mono({
//   variable: "--font-geist-mono",
//   subsets: ["latin"],
// });

// export const metadata: Metadata = {
//   title: "ZameenHub.pk - Find Your Dream Property",
//   description:
//     "Pakistan's premier real estate platform connecting property dealers with buyers and renters",
//   // icons: [
//   //   {
//   //     rel: 'icon',
//   //     url: '/z-logo-1.jpg',
//   //   },
//   //   {
//   //     rel: 'shortcut icon',
//   //     url: '/z-logo-1.jpg',
//   //   },
//   //   {
//   //     rel: 'apple-touch-icon',
//   //     url: '/z-logo-1.jpg',
//   //   },
//   // ],
//   icons: {
//     icon: "/z-logo-1.jpg",
//     shortcut: "/z-logo-1.jpg",
//     apple: "/z-logo-1.jpg",
//   },
// };

// export const viewport = {
//   width: "device-width",
//   initialScale: 1,
//   maximumScale: 5,
// };

// export default function RootLayout({
//   children,
// }: Readonly<{
//   children: React.ReactNode;
// }>) {
//   return (
//     <html lang="en">
//       <head>
//         <link rel="icon" href="/z-logo-1.jpg" type="image/jpeg" />
//         <link rel="shortcut icon" href="/z-logo-1.jpg" type="image/jpeg" />
//         <link rel="preconnect" href="https://fonts.googleapis.com" />
//         <link
//           rel="preconnect"
//           href="https://fonts.gstatic.com"
//           crossOrigin="anonymous"
//         />
//         <link
//           href="https://fonts.googleapis.com/css2?family=Lato:wght@300;400;700;900&display=swap"
//           rel="stylesheet"
//         />
//       </head>
//       <body
//         className={`${geistSans.variable} ${geistMono.variable} antialiased overflow-x-hidden`}
//       >
//         <Navbar />
//         <main className="min-h-screen bg-[#f5f5f5] overflow-x-hidden">
//           {children}
//         </main>
//         <Footer />
//       </body>
//     </html>
//   );
// }

import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ZameenHub.pk - Find Your Dream Property",
  description:
    "Pakistan's premier real estate platform connecting property dealers with buyers and renters",

  icons: {
    icon: "/z-logo-1.jpg",
    shortcut: "/z-logo-1.jpg",
    apple: "/z-logo-1.jpg",
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        {/* Browser fallback */}
        <link rel="icon" href="/z-logo-1.jpg" />
        <link rel="shortcut icon" href="/z-logo-1.jpg" />

        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Lato:wght@300;400;700;900&display=swap"
          rel="stylesheet"
        />
      </head>

      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased overflow-x-hidden`}
      >
        <Navbar />
        <main className="min-h-screen bg-[#f5f5f5] overflow-x-hidden">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}

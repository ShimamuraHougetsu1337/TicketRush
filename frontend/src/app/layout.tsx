import React, { Suspense } from 'react';
import type { Metadata } from 'next';
import MuiThemeProvider from '@/components/MuiThemeProvider';
import NextAuthProvider from '@/providers/NextAuthProvider';
import TopNav from '@/components/TopNav';

export const metadata: Metadata = {
  title: 'TicketRush — High-Concurrency Ticket Booking',
  description: 'Real-time seat booking platform with live seat maps and instant confirmation.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Outfit:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body style={{ margin: 0 }}>
        <NextAuthProvider>
          <MuiThemeProvider>
            <Suspense>
              <TopNav />
            </Suspense>
            {children}
          </MuiThemeProvider>
        </NextAuthProvider>
      </body>
    </html>
  );
}

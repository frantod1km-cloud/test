import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'BZAPP — Control de Accesos',
  description: 'Plataforma SaaS de control de accesos para barrios, countries, edificios y más.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className="dark">
      <body className="min-h-screen antialiased">{children}</body>
    </html>
  );
}

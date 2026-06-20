import type { Metadata } from 'next';
import { Inter, Oswald, IBM_Plex_Mono } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';

const display = Oswald({ subsets: ['latin'], weight: ['500', '600', '700'], variable: '--font-display' });
const body = Inter({ subsets: ['latin'], variable: '--font-body' });
const mono = IBM_Plex_Mono({ subsets: ['latin'], weight: ['400', '500'], variable: '--font-mono' });

export const metadata: Metadata = {
  title: 'Hookcast — know why a video went viral before you post the next one',
  description:
    'Paste a YouTube Short, TikTok, or Reel and get a structural breakdown of its hook, script, and pacing, an honest viral/ordinary verdict, and a Claude-rewritten hook and script to fix what is weak.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${display.variable} ${body.variable} ${mono.variable}`}>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}

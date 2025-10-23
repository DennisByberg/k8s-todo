import '@mantine/core/styles.css';
import '@mantine/notifications/styles.css';
import { ColorSchemeScript, MantineProvider } from '@mantine/core';
import { Notifications } from '@mantine/notifications';
import { Providers } from './providers';
import { HeaderMegaMenu } from '@/components/HeaderMegaMenu/HeaderMegaMenu';
import { Footer } from '@/components/Footer/Footer';
import classes from './layout.module.css';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Todo App',
  description:
    'Cloud-native todo application built with Next.js, FastAPI, and Kubernetes',
  authors: [{ name: 'Dennis Byberg' }],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang={'en'} suppressHydrationWarning>
      <head>
        <ColorSchemeScript defaultColorScheme={'dark'} />
      </head>
      <body className={classes.body}>
        <Providers>
          <MantineProvider defaultColorScheme={'dark'}>
            <Notifications autoClose={2000} position={'top-center'} zIndex={1000} />
            <HeaderMegaMenu />
            <main className={classes.main}>{children}</main>
            <Footer />
          </MantineProvider>
        </Providers>
      </body>
    </html>
  );
}

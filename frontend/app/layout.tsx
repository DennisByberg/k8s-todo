import '@mantine/core/styles.css';
import { ColorSchemeScript, MantineProvider } from '@mantine/core';
import { Notifications } from '@mantine/notifications';
import { Providers } from './providers';
import { HeaderMegaMenu } from '@/components/HeaderMegaMenu/HeaderMegaMenu';
import { Footer } from '@/components/Footer/Footer';

export const metadata = {
  title: 'Todo App',
  description: 'Cloud-native todo application',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang={'en'} suppressHydrationWarning>
      <head>
        <ColorSchemeScript defaultColorScheme={'dark'} />
      </head>
      <body
        style={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          width: '100%',
        }}
      >
        <Providers>
          <MantineProvider defaultColorScheme={'dark'}>
            <Notifications />
            <HeaderMegaMenu />
            <div style={{ flex: 1, width: '100%' }}>{children}</div>
            <Footer />
          </MantineProvider>
        </Providers>
      </body>
    </html>
  );
}

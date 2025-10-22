import '@mantine/core/styles.css';
import { ColorSchemeScript, MantineProvider } from '@mantine/core';
import { Notifications } from '@mantine/notifications';
import { Providers } from './providers';
import { HeaderMegaMenu } from '@/components/HeaderMegaMenu/HeaderMegaMenu';

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
      <body>
        <Providers>
          <MantineProvider defaultColorScheme={'dark'}>
            <Notifications />
            <HeaderMegaMenu />
            {children}
          </MantineProvider>
        </Providers>
      </body>
    </html>
  );
}

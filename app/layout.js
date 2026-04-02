import './globals.css';
import { RoleProvider } from './components/RoleProvider';
import { ContentEngineProvider } from './context/ContentEngineContext';
import GlobalSidebar from './components/GlobalSidebar';

export const metadata = {
  title: 'Canvas 2.0 | AI Demo',
  description: 'AI-Integrated Learning Management System',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body suppressHydrationWarning style={{ display: 'flex', flexDirection: 'row', minHeight: '100vh', margin: 0, padding: 0 }}>
        <RoleProvider>
          <ContentEngineProvider>
            <GlobalSidebar />
            <div className="main-content-wrapper" style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden', background: 'var(--background)' }}>
              <main style={{ flex: 1, overflowY: 'auto' }}>
                {children}
              </main>
            </div>
          </ContentEngineProvider>
        </RoleProvider>
      </body>
    </html>
  );
}

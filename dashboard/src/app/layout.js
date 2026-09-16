import '../styles/globals.css';
import SpaceBackground from '../components/SpaceBackground';

export const metadata = {
  title: 'Productivity Analytics Dashboard',
  description: 'Enterprise employee productivity monitoring and analytics platform',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <SpaceBackground />
        {children}
      </body>
    </html>
  );
}

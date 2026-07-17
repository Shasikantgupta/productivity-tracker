import '../styles/globals.css';

export const metadata = {
  title: 'Productivity Analytics Dashboard',
  description: 'Enterprise employee productivity monitoring and analytics platform',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

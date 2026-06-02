import './globals.css';

export const metadata = {
  title: 'Tripile CRM',
  description: 'Internal travel customer relationship management system',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

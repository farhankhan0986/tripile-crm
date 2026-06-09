import './globals.css';
import { Analytics } from "@vercel/analytics/next"

export const metadata = {
  title: 'Tripile CRM',
  description: 'Internal travel customer relationship management system',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">  
      <body>
        {children}
      <Analytics />
      </body> 
    </html>
  );
}

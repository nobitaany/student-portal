export const metadata = { title: 'Elective Allocation Matrix', description: 'CVS Subject Registration System' };

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, padding: 0, backgroundColor: '#f1f5f9', fontFamily: 'system-ui, sans-serif' }}>
        {children}
      </body>
    </html>
  );
}
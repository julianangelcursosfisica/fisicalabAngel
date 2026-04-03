import './globals.css'
export const metadata = { title: 'FisicaLab', description: 'Plataforma de Laboratorios de Física' }
export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  )
}

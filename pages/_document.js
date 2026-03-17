import { Html, Head, Main, NextScript } from 'next/document'

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@300;400;500;600&display=swap" rel="stylesheet" />
        <meta name="description" content="Strizball — 2026 NCAA March Madness Bracket Challenge" />
        <meta name="theme-color" content="#FF6B35" />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  )
}

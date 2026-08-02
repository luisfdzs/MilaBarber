import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,

  /**
   * NO se activa `cacheComponents`, al revés que en el proyecto de referencia.
   *
   * Allí toda la web es estática y el CMS es la única fuente, así que la directiva
   * `use cache` sale gratis. Aquí conviven dos mitades muy distintas: una portada
   * pública que sí se puede prerrenderizar y un área privada —perfil, reservas— que
   * depende de la sesión en cada petición. Con `cacheComponents` cada lectura de
   * cookies obliga a envolver el árbol en `<Suspense>` o el build falla, y eso es
   * mucha ceremonia por un ahorro que aquí no existe: esas páginas no se cachean.
   *
   * La invalidación del contenido de Sanity se resuelve igual de bien con etiquetas
   * de `fetch` y `revalidateTag` (ver sanity/client.ts y app/api/revalidate).
   */

  images: {
    // Las transformaciones las hace la CDN de Sanity, que ya tiene el original: ver
    // sanity/imageLoader.ts. Así no se consume cuota de optimización de Vercel y las
    // fotos que suba la barbería desde el panel se optimizan igual que las demás.
    loader: 'custom',
    loaderFile: './sanity/imageLoader.ts',
    deviceSizes: [420, 640, 828, 1200, 1600, 2048, 2560],
    // Next 16 restringe las calidades permitidas a una lista blanca (por defecto sólo
    // 75). Declaramos las dos que usamos: 82 para el hero y las fotos grandes de la
    // galería, 75 para el resto. Una calidad no declarada se redondea en silencio.
    qualities: [75, 82],
  },

  async redirects() {
    return [
      // La web anterior vivía entera detrás de /login y ésa es la URL que la gente
      // tiene en el historial y en los mensajes de WhatsApp. Se conserva, igual que
      // las rutas del área privada de la aplicación de Angular a la que sustituye.
      { source: '/login', destination: '/entrar', permanent: true },
      { source: '/user/home', destination: '/cuenta', permanent: true },
      { source: '/user/services', destination: '/servicios', permanent: true },
      { source: '/user/profile', destination: '/cuenta/perfil', permanent: true },
    ]
  },

  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
        ],
      },
    ]
  },
}

export default nextConfig

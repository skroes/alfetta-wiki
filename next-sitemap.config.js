/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: process.env.SITE_URL || 'https://alfetta-wiki.vercel.app',
  generateRobotsTxt: false, // we beheren public/robots.txt handmatig
  generateIndexSitemap: true,
  autoLastmod: true,
  outDir: './public',
  // /docs/ bevat alleen PDFs — niet relevant voor html-sitemap
  exclude: ['/docs/*'],
  // Default changefreq + priority per pad-groep.
  // Content is historisch (1977 workshop manuals) — yearly is realistisch.
  // Index-pagina's kunnen uitbreiden met nieuwe items → monthly.
  transform: async (config, path) => {
    const priority =
      path === '/' ? 1.0 :
      path.startsWith('/eigenaar') ? 0.9 :
      path.startsWith('/motor') || path.startsWith('/transmissie') || path.startsWith('/specificaties') ? 0.8 :
      path.startsWith('/bronnen') ? 0.7 :
      path.startsWith('/figuren') ? 0.6 :
      path.startsWith('/governance') ? 0.3 :
      0.5

    const changefreq =
      path === '/' || path === '/bronnen' || path === '/figuren' ? 'monthly' :
      'yearly'

    return {
      loc: path,
      changefreq,
      priority,
      lastmod: new Date().toISOString(),
      alternateRefs: [],
    }
  },
}

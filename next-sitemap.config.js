/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: process.env.SITE_URL || 'https://alfetta-wiki.vercel.app',
  generateRobotsTxt: false, // we beheren public/robots.txt handmatig
  generateIndexSitemap: true,
  outDir: './public',
  // /docs/ bevat alleen PDFs — niet relevant voor html-sitemap
  exclude: ['/docs/*'],
  // Default changefreq + priority per pad-groep.
  transform: async (config, path) => {
    const priority =
      path === '/' ? 1.0 :
      path.startsWith('/eigenaar') ? 0.9 :
      path.startsWith('/motor') || path.startsWith('/transmissie') || path.startsWith('/specificaties') ? 0.8 :
      path.startsWith('/bronnen') ? 0.7 :
      path.startsWith('/figuren') ? 0.6 :
      path.startsWith('/governance') ? 0.3 :
      0.5

    return {
      loc: path,
      changefreq: 'weekly',
      priority,
      lastmod: new Date().toISOString(),
      alternateRefs: [],
    }
  },
}

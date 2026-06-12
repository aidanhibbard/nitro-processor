import { defineConfig } from 'vitepress'

export default defineConfig({
  base: '/nitro-processor/',
  title: 'Nitro Processor',
  description: 'Dedicated processing for Nitro apps',
  themeConfig: {
    nav: [
      { text: 'Home', link: '/' },
      { text: 'Getting Started', link: '/getting-started' },
      { text: 'Configuration', link: '/configuration' },
      { text: 'API', link: '/api' },
      { text: 'Redis', link: '/redis' },
      { text: 'Upgrading', link: '/upgrading' },
    ],

    sidebar: [
      {
        text: 'Guide',
        items: [
          { text: 'Getting Started', link: '/getting-started' },
          { text: 'Configuration', link: '/configuration' },
          { text: 'Upgrading from 0.x / 1.x', link: '/upgrading' },
          { text: 'Redis configuration', link: '/redis' },
          { text: 'Define Queue', link: '/define-queue' },
          { text: 'Define Worker', link: '/define-worker' },
          { text: 'Durabull', link: '/durabull' },
        ],
      },
      {
        text: 'Reference',
        items: [
          { text: 'API', link: '/api' },
        ],
      },
    ],

    socialLinks: [
      { icon: 'github', link: 'https://github.com/aidanhibbard/nitro-processor' },
    ],
  },
})

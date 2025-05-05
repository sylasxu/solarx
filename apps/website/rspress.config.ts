import * as path from 'node:path';
import { defineConfig } from 'rspress/config';
import { pluginFontOpenSans } from 'rspress-plugin-font-open-sans';
import { pluginPreview } from '@rspress/plugin-preview';
import { pluginApiDocgen } from '@rspress/plugin-api-docgen';
import { pluginPlayground } from '@rspress/plugin-playground';
export default defineConfig({
  root: path.join(__dirname, 'docs'),
  // base: '/sylasxu/',
  globalStyles: path.join(__dirname, 'styles/index.css'),
  title: 'Solarx',
  icon: '/rspress-icon.png',
  plugins: [
    pluginFontOpenSans(),
    pluginApiDocgen({
      entries: {
        button: './src/index.tsx',
      },
      apiParseTool: 'react-docgen-typescript',
    }),
    pluginPreview({
      iframeOptions:{
        // position:'fixed',

        // framework:'react',
      }
    }),
    // pluginPlayground(),
  ],
  logo: {
    light: '/rspress-light-logo.png',
    dark: '/rspress-dark-logo.png',
  },

  builderConfig: {
    output: {
      distPath: {
        root: 'doc_build',
      },
    },
  },
  themeConfig: {
    socialLinks: [
      {
        icon: 'github',
        mode: 'link',
        content: 'https://github.com/sylasxu/solarx',
      },
    ],
    searchPlaceholderText: '搜索',
    enableScrollToTop: true,
    // 开启 View Transition 过渡
    // enableContentAnimation: true,
    enableAppearanceAnimation: true,
    prevPageText: '上一页',
    nextPageText: '下一页',
    outlineTitle: '目录',
  },
  markdown: {

  }
});

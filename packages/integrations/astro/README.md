# @gbmd-mdoc/astro
An astro plugin to convert synced [Gitbook's](https://gitbook.com) markdown syntax to [Markdoc's](https://markdoc.dev)

## Usage
```ts
//astro.config.mjs
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
import markdoc from '@astrojs/markdoc';
import gbmdMdoc from 'gbmd-mdoc/astro';
import { starlightIntegration } from 'gbmd-mdoc/astro';

// Manually download space content from Gitbook API
import spaceData from './product-docs.space.json';

// OR ideally get the space pages from gitbook api
import { GitBookAPI } from '@gitbook/api';
const gitbook = new GitBookAPI({
    authToken: 'API_TOKEN',
    endpoint: 'https://api.gitbook.com',
});
const spacePages = gitbook.spaces.listPages('spaceId', { metadata: true })

// https://astro.build/config
export default defineConfig({
    integrations: [
        gbmdMdoc({ 
            spaces: { 
                './src/content/docs/product-docs/': { 
                    data: spaceData.pages, 
                    // Is used to remove sync dir path from content dir after conversion
                    syncDir: './gitbook/product-docs/', 
                    // slug to append to the content slugs
                    slug: 'product-docs',
                }, 
            },
        }),
        markdoc(),
        // Supports starlight integration for generating sidebar based on Gitbook space data
		starlight({
			title: 'My Docs',
			social: {
				github: 'https://github.com/withastro/starlight',
			},
			sidebar: [
				{
					label: 'Guides',
					items: [
						// Each item here is one entry in the navigation menu.
						{ label: 'Example Guide', slug: 'guides/example' },
					],
				},
				{
					label: 'Reference',
					autogenerate: { directory: 'reference' },
				},
				{
					label: 'Product Docs',
					items: starlightIntegration.sidebar({ pages: spaceData.pages, slug: 'product-docs'})
				}
			],
		}),
    ],
});

```

## Contribution
Feel free to contribute some improvements by creating a PR.

## [License (MIT)](LICENSE)

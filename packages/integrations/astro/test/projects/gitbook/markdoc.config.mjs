import { defineMarkdocConfig } from '@astrojs/markdoc/config';
import starlightMarkdoc from '@astrojs/starlight-markdoc';
import gbmd_mdoc from 'gbmd-mdoc';

// https://docs.astro.build/en/guides/integrations-guide/markdoc/
export default defineMarkdocConfig({
	extends: [starlightMarkdoc()],
	tags: { 
		...gbmd_mdoc.defaultConfig.tags 
	},
});

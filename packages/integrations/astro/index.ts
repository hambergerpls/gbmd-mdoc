import type { RevisionPage } from "@gitbook/api";
import type { Config, ValidateError } from "@markdoc/markdoc";
import type { AstroIntegration } from "astro";
import gbmd_mdoc from "gbmd-mdoc";
const { defaultConfig, extractTitleToFrontmatter, resolveClosingTag, resolveSelfEnclosingTag, appendToFrontmatter } = gbmd_mdoc;
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";


type SidebarItem = { label: string; items: SidebarItem[]; } | { label: string; slug: string }

export const starlightIntegration = { 
  sidebar: function sidebar({ pages, slug: spaceSlug = '' }: { pages: RevisionPage[]; slug?: string }): SidebarItem[] {
  return pages.map((page) => {
    spaceSlug = spaceSlug ? spaceSlug.endsWith('/') ? spaceSlug : `${spaceSlug}/` : spaceSlug;
    const label = `${page.emoji ? String.fromCodePoint(Number.parseInt(page.emoji, 16)) : ''} ` + `${page.title}`;

    const slug = page.type === 'document' && page.pages && page.pages.length === 0 ? `${spaceSlug}${ page.path }` : undefined;

    const items = ( page.type === 'document' || page.type === 'group' ) && page.pages && page.pages.length > 0 ? sidebar({ pages: [ ...(page.type === 'document' && page.git?.path.includes('README.md') ? [{ ...page, pages: [] }] : []), ...page.pages ], slug: spaceSlug }) : [];

    return { 
      label,
      ...(slug ? { slug } : {}),
      items,
    }
  })
} 
}

interface gbmdMdocOptions {
  /**
   *  @description Maps content dir to spaces
   */
  spaces: { 
    [contentDir: string]: { 
      /**
       * @description List of pages retrieved from the space
       */
      data: RevisionPage[],
      /**
       * @description Is used to remove sync dir from content dir
       */
      syncDir?: string, 
      /**
       * @description the slug to append at the beginning of the content slug
       */
      slug?: string 
    } 
  };
      /**
       * @description custom markdoc config to pass
       */
  markdocConfig?: Config
}

function convertFile({ filePath, frontmatterData = {}, config = {} }: { filePath: string, frontmatterData: Record<string, any>, config?: Config }) {
    config = { ...defaultConfig, ...config }
    let file = readFileSync(filePath, { encoding: 'utf8', flag: 'r' });

    let errors: ValidateError[] = [];
    ( { result: file, errors } = resolveClosingTag(file, config) );
    ( { result: file, errors } = resolveSelfEnclosingTag(file, config) );
    ( { result: file, errors } = extractTitleToFrontmatter(file, config) );
    ( { result: file, errors } = appendToFrontmatter(file, frontmatterData, config) );

    return { file, errors }
}

function execute({ contentDir, data, syncDir = '', config, slug = '' }:{ contentDir: string, data: Array<RevisionPage>, syncDir?: string, config?: Config, slug?: string }) {
  contentDir = contentDir.replace('./', '');
  syncDir = syncDir.replace('./', '');
  slug = slug ? slug.endsWith('/') ? slug : `${slug}/` : slug;
  for (const [index, page] of data.entries()) {
    if (page.type === 'document' && page.git?.path ) {
      const {file, errors} = convertFile({ filePath: page.git.path, config, frontmatterData: { slug: `${slug}${page.path}`, sidebar: { order: index} } });
      if (errors.length !== 0) {
        process.stderr.write(page.git.path)
        process.stderr.write(file)
        process.stderr.write(JSON.stringify(errors, undefined, 2))
      }
      else {
        const dataOutput = new Uint8Array(Buffer.from(file))
        mkdirSync(`${contentDir}/${dirname(page.git.path.replace(syncDir, ''))}`, {recursive: true});
        writeFileSync(`${contentDir}/${page.git.path.replace(syncDir, '').replace(/\.md$/, '.mdoc')}`, dataOutput)
      }
    }
    if ('pages' in page && page.pages && page.pages.length > 0) execute({ contentDir, data: page.pages, syncDir, config, slug });
  }

}

function gbmdMdocIntegration(options: gbmdMdocOptions): AstroIntegration {
  return {
    name: "gbmd_mdoc/astro",
    hooks: {
      "astro:config:setup": async (params) => {

        for (const [contentDir, data] of Object.entries(options.spaces)) { 
          execute({ contentDir, data: data.data, config: options.markdocConfig, syncDir: data.syncDir, slug: data.slug })
        };

      },
      "astro:server:setup": async ({ server }) => {
        server.watcher.on("all", (event, entry) => {
          if (['.md'].some((f) => entry.endsWith(f))) {
            server.restart();
          }
        });
      }
    }
  };
}
export {
  gbmdMdocIntegration as default
};


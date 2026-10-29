# Dev Tools Client

Canonical home of `@splitin/dev-tools-client`, an isolated browser export facade for the [Verification SDK](https://github.com/splitintech/verification-adapter-sdk). It contains re-exports, not copied implementations. Eleven bundled SDK packages preserve isolation for host applications that use a different SDK major under the same package names.

## Develop and validate

```sh
git clone https://github.com/splitintech/dev-tools-client.git
cd dev-tools-client
npm ci
npm test
python3 scripts/check-migration.py --snapshot
npm pack
```

React and React DOM 18 or 19 are host peer dependencies. Install them in the consuming application.

The public entrypoints remain TypeScript source intended for a TypeScript-aware browser bundler. There is no root export. Use `/web`, `/sdk`, `/launcher`, `/status`, `/retry`, `/operations`, and `/styles.css`.

```ts
import * as verification from '@splitin/dev-tools-client/web';
import '@splitin/dev-tools-client/styles.css';
```

`npm test` packs the actual package, checks all eleven bundled dependencies, installs it offline into a fresh consumer with locked host React fixtures, and bundles every public entrypoint for the browser while rejecting server-package leakage.

## Dependency provenance

The checked-in `vendor/*.tgz` archives and their original bytes are retained from the hub snapshot. Their hashes are recorded in [source-files.json](docs/migration/source-files.json). The SDK now develops in its own repository; regenerate these artifacts only as a deliberate, tested SDK upgrade. Preserve bundled dependency isolation and package names. The migration does not publish npm or replace SplitIn's existing vendor artifact.

See [migration provenance](docs/migration.md), [contributing](CONTRIBUTING.md), and the [MIT license](LICENSE).

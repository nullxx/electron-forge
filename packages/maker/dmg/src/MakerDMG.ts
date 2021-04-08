import MakerBase, { MakerOptions } from '@electron-forge/maker-base';
import { ForgePlatform } from '@electron-forge/shared-types';

import fs from 'fs-extra';
import path from 'path';
import { MakerDMGConfig } from './Config';

export default class MakerDMG extends MakerBase<MakerDMGConfig> {
  name = 'dmg';

  defaultPlatforms: ForgePlatform[] = ['darwin', 'mas'];

  isSupportedOnCurrentPlatform() {
    return process.platform === 'darwin';
  }

  async make({
    dir,
    makeDir,
    appName,
    packageJSON,
  }: MakerOptions) {
    // eslint-disable-next-line global-require
    const electronDMG = require('electron-installer-dmg');

    const outPath = path.resolve(makeDir, `${this.config.name || appName}-${process.arch}.dmg`);
    const forgeDefaultOutPath = path.resolve(makeDir, `${appName}-${process.arch}-${packageJSON.version}.dmg`);

    await this.ensureFile(outPath);
    const dmgConfig = {
      overwrite: true,
      name: appName,
      ...this.config,
      appPath: path.resolve(dir, `${appName}.app`),
      out: path.dirname(outPath),
    };
    const opts = await electronDMG(dmgConfig);
    if (!this.config.name) {
      await this.ensureFile(forgeDefaultOutPath);
      await fs.rename(outPath, forgeDefaultOutPath);
      return [forgeDefaultOutPath];
    }

    return [opts.dmgPath];
  }
}

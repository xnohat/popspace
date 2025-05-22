import * as fs from 'fs';
import path from 'path';
import { MetadataFile } from './FileManager';
import { Storage } from './Storage';

export class DiskStorage implements Storage {
  constructor(
    private readonly directory: string,
    private readonly baseUrl: string,
  ) {}

  initialize = async () => {
    // create the target directory
    await fs.promises.mkdir(this.directory, { recursive: true });
  };

  storeFileBuffer = async (key: string, data: Buffer, mimetype: string) => {
    const pathFragments = key.split('/');
    if (pathFragments.length > 1) {
      const subdir = pathFragments.slice(0, pathFragments.length - 1).join('/');
      if (
        !(await fs.promises
          .stat(this.directory + '/' + subdir)
          .catch(() => false))
      ) {
        await fs.promises.mkdir(`${this.directory}/${subdir}`);
      }
    }
    const filePath = `${this.directory}/${key}`;
    await fs.promises.writeFile(filePath, data);
    return `${this.baseUrl}/${key}`;
  };

  deleteFile = async (fileUrl: string) => {
    const parsed = new URL(fileUrl);
    const pathname = parsed.pathname;
    const baseUrlAsUrl = new URL(this.baseUrl);
    const pathWithoutBase =
      baseUrlAsUrl.pathname && pathname.startsWith(baseUrlAsUrl.pathname)
        ? pathname.slice(baseUrlAsUrl.pathname.length)
        : pathname;
    const dirContainer = pathWithoutBase.split('/').slice(0, -1).join('/');
    const dirPath = `${this.directory}${dirContainer}`;
    //const filePath = `${this.directory}/${pathWithoutBase}`;
    const filePath = `${this.directory}${decodeURIComponent(pathWithoutBase)}`;
    await fs.promises.unlink(filePath);
    await fs.promises.rmdir(dirPath);
  };
}

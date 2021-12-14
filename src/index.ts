import { Module } from '@nuxt/types';
import path from 'path';
import { formatMessage } from './lib/utils';

interface Options {
  datoReadOnlyToken: string,
  previewSecret: string,
}

const datoCmsModule: Module<Options> = function () {
  const options = this.options.nuxtDatoCms || {};

  if (!options.datoReadOnlyToken) {
    throw new Error(formatMessage('datoReadOnlyToken must be defined'));
  }

  if (!options.previewSecret) {
    throw new Error(formatMessage('previewSecret must be defined'));
  }

  this.addPlugin({
    src: path.resolve(__dirname, 'plugins/preview.client.ts'),
    options: {
      previewSecret: options.previewSecret,
    },
  });

  this.addPlugin({
    src: path.resolve(__dirname, 'plugins/dato.ts'),
    options: {
      datoReadOnlyToken: options.datoReadOnlyToken,
    },
  });
};

export default datoCmsModule;

export const meta = require('../package.json');

import path from 'path';
import { formatMessage } from './lib/utils';

export default function (moduleOptions) {
  const { nuxt } = moduleOptions;
  const options = this.options.nuxtDatoCms || {};

  if (!options.datoReadOnlyToken) {
    throw new Error(formatMessage('datoReadOnlyToken must be defined'));
  }

  if (!options.previewSecret) {
    throw new Error(formatMessage('previewSecret must be defined'));
  }

  this.addPlugin({
    src: path.resolve(__dirname, 'plugins/preview.client.js'),
    options: {
      previewSecret: options.previewSecret
    },
  });
}

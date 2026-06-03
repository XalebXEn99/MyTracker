/** @type {import('metro-config').MetroConfig} */
module.exports = {
  transformer: {
    getTransformOptions: async () => ({
      transform: {
        experimentalImportSupport: false,
        inlineRequires: false,
      },
    }),
  },
  resolver: {
    sourceExts: ['tsx', 'ts', 'js', 'jsx', 'json'],
  },
};

/** @type {import('metro-config').MetroConfig} */
module.exports = {
  transformer: {
    babelTransformerPath: require.resolve('react-native-svg-transformer'),
  },
  resolver: {
    sourceExts: ['tsx', 'ts', 'js', 'jsx', 'json'],
  },
};

module.exports = {
  presets: [
    [
      '@babel/preset-env',
      {
        modules: process.env.ES ? false : 'commonjs',
        targets: {node: true},
      },
    ],
    '@babel/preset-react',
  ],
};

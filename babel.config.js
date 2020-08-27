module.exports = {
  presets: [
    [
      '@babel/env',
      {
        targets: {
          node: 'current',
        },
        useBuiltIns: "usage"
      }
    ],
    '@babel/preset-typescript'
  ]
};
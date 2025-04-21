module.exports = {
    presets: ['module:metro-react-native-babel-preset'],
    plugins: [
      [
        'module-resolver',
        {
          alias: {
            'react-native-reanimated': 'react-native-reanimated/lib/commonjs/Animated'
          }
        }
      ]
    ]
  };
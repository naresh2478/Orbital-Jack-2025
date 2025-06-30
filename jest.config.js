// export default {
//   transform: {},
// };

module.exports = {
  preset: 'react-native',
  transform: {
    '^.+\\.(js|jsx|ts|tsx)$': 'babel-jest',
  },
  transformIgnorePatterns: [
    "node_modules/(?!(@react-native|react-native|react-clone-referenced-element|react-navigation|@react-native-community|@react-navigation)/)"
  ],
  // REMOVE setupFiles entirely if you have no other entries
  testEnvironment: 'jsdom',
};

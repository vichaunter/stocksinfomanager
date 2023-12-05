export default {
  log: (...args) => process.env.DEV && console.log(...args),
};

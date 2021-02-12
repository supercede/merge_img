// module.exports = {
const not = (fn) => (...args) => !fn(...args);

const and = (...fns) => (...args) =>
  fns.reduce((y, fn) => fn(...args) && y, true);

const pluck = (values, key) => values.map((v) => v[key]);

module.exports = {
  not,
  and,
  pluck,
};

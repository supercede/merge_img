// module.exports = {
const not = fn => (...args) => !fn(...args);

const and = (...fns) => (...args) => fns.reduce((y, fn) => fn(...args) && y, true);

const pluck = (values, key) => values.map(v => v[key]);

const mode = myArray => myArray.reduce(
  (a, b, i, arr) => (arr.filter(v => v === a).length >= arr.filter(v => v === b).length ? a : b),
  null,
);

const random = items => items[Math.floor(Math.random() * items.length)];

module.exports = {
  not,
  and,
  random,
  pluck,
  mode,
};

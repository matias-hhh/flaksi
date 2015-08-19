/**
  A simple mixin function, copies properties from given source-objects to the
  target
**/
export default function(target, ...sources) {
  sources.forEach(source => {
    if (source) {
      Object.keys(source).forEach(key => {
        target[key] = source[key];
      });
    }
  });
  return target;
}

type TemplateFunc<T, R> = ((v: T) => R) | R;
type GetTemplateReturn<F extends TemplateFunc<any, any>, T = any> = F extends TemplateFunc<T, infer R> ? R : unknown;

declare global {
  interface String {
    repeatReplace(f: (str: string) => string): string;
    replaceTemplate<T>(
      searchTemplate: TemplateFunc<T, RegExp | string>,
      replaceTemplate: TemplateFunc<T, string>,
      arr: T[]
    ): string;
  }
}

/** repeatedly apply a replacement until the string stops changing */
String.prototype.repeatReplace = function (f) {
  let lastStr = String(this), str = f(lastStr);
  while (lastStr != str) {
    lastStr = str;
    str = f(str);
  }
  return str;
};

/**
 * helper func that creates multiple replacements
 * by iterating over the array provided
 */
String.prototype.replaceTemplate = function (searchTemplate, replaceTemplate, arr) {
  let searchFunc = searchTemplate, replaceFunc = replaceTemplate;
  if (typeof searchFunc !== "function") searchFunc = () => searchTemplate as GetTemplateReturn<typeof searchFunc>;
  if (typeof replaceFunc !== "function") replaceFunc = () => replaceTemplate as GetTemplateReturn<typeof replaceFunc>;

  let str = String(this);
  for (let v of arr) str = str.replace(searchFunc(v), replaceFunc(v));
  return str;
}

/**
 * string literal tag for making templates for `.replaceTemplate`
 * makes a lambda from the literal string an lambdas provided
 */
export const template = <T>(
  strings: TemplateStringsArray,
  ...lambdas: TemplateFunc<T, string>[]
): ((v: T) => string) => (v) => {
  let str = strings.raw[0];

  for (let i in lambdas) {
    const rawLambda = lambdas[i];
    const lambda = typeof rawLambda === "function" ? rawLambda : () => rawLambda;
    str += lambda(v);
    str += strings.raw[parseInt(i) + 1];
  }

  return str;
};

/** like the `template` tag, but makes a regex */
export const templateRegExp = <T>(
  string: TemplateStringsArray,
  ...lambdas: TemplateFunc<T, string>[]
): ((v: T) => RegExp) => function (v) {
  const regexStr = template(string, ...lambdas)(v);
  const regexResult = /^\/(.*)\/(\w*)$/.exec(regexStr);
  if (regexResult === null) throw new Error(`bad regex string: ${regexStr}`);
  const [_, pattern, flags] = regexResult;
  return new RegExp(pattern, flags);
};

/** range (inclusive) */
export const range = (a: number, b: number, delta = 1) => {
  return Array.from({ length: Math.abs(b - a) / Math.abs(delta) + 1 }).map((_, i) => a + i * delta * Math.sign(b - a));
};

import { RuntimeValue } from "./runtime.ts";

export interface Environment_t {
  parent: Environment_t | null;
  symbols: Map<string, RuntimeValue>;
}

export function Environment(parent: Environment_t | null): Environment_t {
  return {
    parent,
    symbols: new Map<string, RuntimeValue>(),
  };
}

export function initVar(
  env: Environment_t,
  symbol: string,
  value: RuntimeValue,
): RuntimeValue {
  if (env.symbols.has(symbol)) {
    throw new Error(`error: cannot redeclare variable '${symbol}'`);
  }
  env.symbols.set(symbol, value);
  return value;
}

export function lookupVar(
  env_start: Environment_t,
  symbol: string,
): RuntimeValue {
  const env = resolve(env_start, symbol);
  return env.symbols.get(symbol)!;
}

export function assignVar(
  env_start: Environment_t,
  symbol: string,
  value: RuntimeValue,
): RuntimeValue {
  const env = resolve(env_start, symbol);
  env.symbols.set(symbol, value);
  return value;
}

function resolve(env: Environment_t, symbol: string): Environment_t {
  if (env.symbols.has(symbol)) {
    return env;
  }
  if (env.parent === null) {
    throw new Error(`unable to resolve symbol '${symbol}'`);
  }
  return resolve(env.parent, symbol);
}

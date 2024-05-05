import { RuntimeValue } from "./runtime.ts";

export interface Scope_t {
  parent: Scope_t | null;
  symbols: Map<string, RuntimeValue>;
}

export function Scope(parent: Scope_t | null): Scope_t {
  return {
    parent,
    symbols: new Map<string, RuntimeValue>(),
  };
}

export function initVar(
  scope: Scope_t,
  symbol: string,
  value: RuntimeValue,
): RuntimeValue {
  if (scope.symbols.has(symbol)) {
    throw new Error(`error: cannot redeclare variable '${symbol}'`);
  }
  scope.symbols.set(symbol, value);
  return value;
}

export function lookupVar(
  scope: Scope_t,
  symbol: string,
): RuntimeValue {
  const varScope = resolve(scope, symbol);
  return varScope.symbols.get(symbol)!;
}

export function assignVar(
  scope: Scope_t,
  symbol: string,
  value: RuntimeValue,
): RuntimeValue {
  const varScope = resolve(scope, symbol);
  varScope.symbols.set(symbol, value);
  return value;
}

function resolve(scope: Scope_t, symbol: string): Scope_t {
  if (scope.symbols.has(symbol)) {
    return scope;
  }
  if (scope.parent === null) {
    throw new Error(`error: unable to resolve symbol '${symbol}'`);
  }
  return resolve(scope.parent, symbol);
}

import { FunctionLiteralExpr_t } from "./ast.ts";

export enum ValueType {
  NULL,
  FLOAT,
  INTEGER,
  BOOLEAN,
  OBJECT,
  FUNCTION,
  JS_FN,
}

export type RuntimeValue =
  | NullValue_t
  | FloatValue_t
  | IntegerValue_t
  | BooleanValue_t
  | ObjectValue_t
  | JsFnValue_t
  | FunctionValue_t;

interface NullValue_t {
  tag: ValueType.NULL;
  value: null;
}

export function NullValue(): NullValue_t {
  return {
    tag: ValueType.NULL,
    value: null,
  };
}

interface FloatValue_t {
  tag: ValueType.FLOAT;
  value: number;
}

export function FloatValue(value: number): FloatValue_t {
  return {
    tag: ValueType.FLOAT,
    value,
  };
}

interface IntegerValue_t {
  tag: ValueType.INTEGER;
  value: bigint;
}

export function IntegerValue(value: bigint): IntegerValue_t {
  return {
    tag: ValueType.INTEGER,
    value,
  };
}

interface BooleanValue_t {
  tag: ValueType.BOOLEAN;
  value: boolean;
}

export function BooleanValue(value: boolean): BooleanValue_t {
  return {
    tag: ValueType.BOOLEAN,
    value,
  };
}

export interface ObjectValue_t {
  tag: ValueType.OBJECT;
  value: { [key: string]: RuntimeValue };
}

export function ObjectValue(
  value: { [key: string]: RuntimeValue },
): ObjectValue_t {
  return {
    tag: ValueType.OBJECT,
    value,
  };
}

interface JsFnValue_t {
  tag: ValueType.JS_FN;
  value: (args: RuntimeValue[]) => RuntimeValue;
}

export function JsFnValue(
  value: (args: RuntimeValue[]) => RuntimeValue,
): JsFnValue_t {
  return {
    tag: ValueType.JS_FN,
    value,
  };
}

interface FunctionValue_t {
  tag: ValueType.FUNCTION;
  value: FunctionLiteralExpr_t;
}

export function FunctionValue(value: FunctionLiteralExpr_t): FunctionValue_t {
  return {
    tag: ValueType.FUNCTION,
    value,
  };
}

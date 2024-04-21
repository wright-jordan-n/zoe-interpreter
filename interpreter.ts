import { BinaryExpr_t, Expr, ExprType, IdentifierExpr_t, Stmt } from "./ast.ts";
import { Environment_t, lookupVar } from "./environment.ts";
import {
  BooleanValue,
  FloatValue,
  IntegerValue,
  NullValue,
  RuntimeValue,
  ValueType,
} from "./runtime.ts";

function evaluate(node: Stmt | Expr, env: Environment_t): RuntimeValue {
  switch (node.tag) {
    case ExprType.INTEGER:
      return IntegerValue(node.value);
    case ExprType.FLOAT:
      return FloatValue(node.value);
    case ExprType.NULL:
      return NullValue();
    case ExprType.BOOLEAN:
      if (node.value) {
        return BooleanValue(true);
      }
      return BooleanValue(false);
    case ExprType.BINARY:
      return evalBinaryExpr(node, env);
    case ExprType.IDENTIFIER:
      return evalIdentifierExpr(node, env);
    default:
      return NullValue();
  }
}

export function interpret(stmts: Stmt[], env: Environment_t): RuntimeValue {
  let lastEval: RuntimeValue = NullValue();
  for (const stmt of stmts) {
    lastEval = evaluate(stmt, env);
  }
  return lastEval;
}

function evalBinaryExpr(expr: BinaryExpr_t, env: Environment_t): RuntimeValue {
  const lhs = evaluate(expr.left, env);
  const rhs = evaluate(expr.right, env);
  if (lhs.tag !== rhs.tag) {
    throw new Error(`error: operands of different types`);
  }
  switch (expr.operator) {
    case "+":
      if (lhs.tag === ValueType.INTEGER) {
        return IntegerValue(lhs.value + (rhs.value as bigint));
      }
      if (lhs.tag === ValueType.FLOAT) {
        return FloatValue(lhs.value + (rhs.value as number));
      }
      throw new Error("error: operands for `+` must be of type int or float");
    case "-":
      if (lhs.tag === ValueType.INTEGER) {
        return IntegerValue(lhs.value - (rhs.value as bigint));
      }
      if (lhs.tag === ValueType.FLOAT) {
        return FloatValue(lhs.value - (rhs.value as number));
      }
      throw new Error("error: operands for `-` must be of type int or float");
    case "*":
      if (lhs.tag === ValueType.INTEGER) {
        return IntegerValue(lhs.value * (rhs.value as bigint));
      }
      if (lhs.tag === ValueType.FLOAT) {
        return FloatValue(lhs.value * (rhs.value as number));
      }
      throw new Error("error: operands for `*` must be of type int or float");
    case "/":
      if (lhs.tag === ValueType.INTEGER) {
        if (rhs.value === 0n) {
          throw new Error("error: division by zero not allowed");
        }
        return IntegerValue(lhs.value / (rhs.value as bigint));
      }
      if (lhs.tag === ValueType.FLOAT) {
        if (rhs.value === 0) {
          throw new Error("error: division by zero not allowed");
        }
        return FloatValue(lhs.value / (rhs.value as number));
      }
      throw new Error("error: operands for `/` must be of type int or float");
    case "%":
      if (lhs.tag === ValueType.INTEGER) {
        return IntegerValue(lhs.value % (rhs.value as bigint));
      }
      if (lhs.tag === ValueType.FLOAT) {
        return FloatValue(lhs.value % (rhs.value as number));
      }
      throw new Error("error: operands for `%` must be of type int or float");
    default:
      throw new Error(`unable to evaluate binary operator '${expr.operator}'`);
  }
}

function evalIdentifierExpr(
  expr: IdentifierExpr_t,
  env: Environment_t,
): RuntimeValue {
  return lookupVar(env, expr.symbol);
}

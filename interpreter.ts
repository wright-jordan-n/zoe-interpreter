import {
  BinaryExpr_t,
  Expr,
  ExprStmt_t,
  IdentifierExpr_t,
  NodeType,
  Stmt,
  VarStmt_t,
} from "./ast.ts";
import { Environment_t, initVar, lookupVar } from "./environment.ts";
import {
  BooleanValue,
  FloatValue,
  IntegerValue,
  NullValue,
  RuntimeValue,
  ValueType,
} from "./runtime.ts";

export function interpret(stmts: Stmt[], env: Environment_t): RuntimeValue {
  let lastEval: RuntimeValue = NullValue();
  for (const stmt of stmts) {
    lastEval = evaluate(stmt, env);
  }
  return lastEval;
}

function evaluate(node: Stmt | Expr, env: Environment_t): RuntimeValue {
  console.log(node);
  switch (node.tag) {
    case NodeType.VAR_STMT:
      return evalVarStmt(node, env);
    case NodeType.EXPRESSION_STMT:
      return evalExprStmt(node, env);
    case NodeType.INTEGER_EXPR:
      return IntegerValue(node.value);
    case NodeType.FLOAT_EXPR:
      return FloatValue(node.value);
    case NodeType.NULL_EXPR:
      return NullValue();
    case NodeType.BOOLEAN_EXPR:
      if (node.value) {
        return BooleanValue(true);
      }
      return BooleanValue(false);
    case NodeType.BINARY_EXPR:
      return evalBinaryExpr(node, env);
    case NodeType.IDENTIFIER_EXPR:
      return evalIdentifierExpr(node, env);
    default:
      return NullValue();
  }
}

// EXPRESSIONS

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
      throw new Error("error: operands for '+' must be of type int or float");
    case "-":
      if (lhs.tag === ValueType.INTEGER) {
        return IntegerValue(lhs.value - (rhs.value as bigint));
      }
      if (lhs.tag === ValueType.FLOAT) {
        return FloatValue(lhs.value - (rhs.value as number));
      }
      throw new Error("error: operands for '-' must be of type int or float");
    case "*":
      if (lhs.tag === ValueType.INTEGER) {
        return IntegerValue(lhs.value * (rhs.value as bigint));
      }
      if (lhs.tag === ValueType.FLOAT) {
        return FloatValue(lhs.value * (rhs.value as number));
      }
      throw new Error("error: operands for '*' must be of type int or float");
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
      throw new Error("error: operands for '/' must be of type int or float");
    case "%":
      if (lhs.tag === ValueType.INTEGER) {
        return IntegerValue(lhs.value % (rhs.value as bigint));
      }
      if (lhs.tag === ValueType.FLOAT) {
        return FloatValue(lhs.value % (rhs.value as number));
      }
      throw new Error("error: operands for '%' must be of type int or float");
    default:
      throw new Error(
        `error: unable to evaluate '${expr.operator}' as binary operator expression`,
      );
  }
}

function evalIdentifierExpr(
  expr: IdentifierExpr_t,
  env: Environment_t,
): RuntimeValue {
  return lookupVar(env, expr.symbol);
}

// STATEMENTS

function evalVarStmt(stmt: VarStmt_t, env: Environment_t): RuntimeValue {
  return initVar(env, stmt.symbol, evaluate(stmt.expr, env));
}

function evalExprStmt(stmt: ExprStmt_t, env: Environment_t): RuntimeValue {
  return evaluate(stmt.expr, env);
}

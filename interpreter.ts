import {
  AssignmentExpr_t,
  BinaryExpr_t,
  Expr,
  ExprStmt_t,
  IdentifierExpr_t,
  NodeType,
  Stmt,
  VarStmt_t,
} from "./ast.ts";
import { assignVar, initVar, lookupVar, Scope_t } from "./scope.ts";
import {
  BooleanValue,
  FloatValue,
  IntegerValue,
  NullValue,
  RuntimeValue,
  ValueType,
} from "./runtime.ts";

export function interpret(stmts: Stmt[], scope: Scope_t): RuntimeValue {
  let lastEval: RuntimeValue = NullValue();
  for (const stmt of stmts) {
    lastEval = evaluate(stmt, scope);
  }
  return lastEval;
}

function evaluate(node: Stmt | Expr, scope: Scope_t): RuntimeValue {
  switch (node.tag) {
    case NodeType.VAR_STMT:
      return evalVarStmt(node, scope);
    case NodeType.EXPRESSION_STMT:
      return evalExprStmt(node, scope);
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
      return evalBinaryExpr(node, scope);
    case NodeType.IDENTIFIER_EXPR:
      return evalIdentifierExpr(node, scope);
    case NodeType.ASSIGNMENT_EXPR:
      return evalAssignmentExpr(node, scope);
    default:
      return NullValue();
  }
}

// EXPRESSIONS

function evalBinaryExpr(expr: BinaryExpr_t, scope: Scope_t): RuntimeValue {
  const lhs = evaluate(expr.left, scope);
  const rhs = evaluate(expr.right, scope);
  switch (expr.operator) {
    case "+":
      if (lhs.tag !== rhs.tag) {
        throw new Error(`error: operands for '+' must be of the same time`);
      }
      if (lhs.tag === ValueType.INTEGER) {
        return IntegerValue(lhs.value + (rhs.value as bigint));
      }
      if (lhs.tag === ValueType.FLOAT) {
        return FloatValue(lhs.value + (rhs.value as number));
      }
      throw new Error("error: operands for '+' must be of type int or float");
    case "-":
      if (lhs.tag !== rhs.tag) {
        throw new Error(`error: operands for '-' must be of the same time`);
      }
      if (lhs.tag === ValueType.INTEGER) {
        return IntegerValue(lhs.value - (rhs.value as bigint));
      }
      if (lhs.tag === ValueType.FLOAT) {
        return FloatValue(lhs.value - (rhs.value as number));
      }
      throw new Error("error: operands for '-' must be of type int or float");
    case "*":
      if (lhs.tag !== rhs.tag) {
        throw new Error(`error: operands for '*' must be of the same time`);
      }
      if (lhs.tag === ValueType.INTEGER) {
        return IntegerValue(lhs.value * (rhs.value as bigint));
      }
      if (lhs.tag === ValueType.FLOAT) {
        return FloatValue(lhs.value * (rhs.value as number));
      }
      throw new Error("error: operands for '*' must be of type int or float");
    case "/":
      if (lhs.tag !== rhs.tag) {
        throw new Error(`error: operands for '/' must be of the same time`);
      }
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
      if (lhs.tag !== rhs.tag) {
        throw new Error(`error: operands for '%' must be of the same time`);
      }
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
  scope: Scope_t,
): RuntimeValue {
  return lookupVar(scope, expr.symbol);
}

// I might want to swap these switches.
function evalAssignmentExpr(
  expr: AssignmentExpr_t,
  scope: Scope_t,
): RuntimeValue {
  switch (expr.operator) {
    case "=":
      switch (expr.assignee.tag) {
        case NodeType.IDENTIFIER_EXPR: {
          const value = evaluate(expr.value, scope);
          assignVar(scope, expr.assignee.symbol, value);
          return value;
        }
        default:
          throw new Error("error: assignee must be an identifier");
      }
    default:
      throw new Error(
        `error: unable to evaluate '${expr.operator}' as assignment expression`,
      );
  }
}

// STATEMENTS

function evalVarStmt(stmt: VarStmt_t, scope: Scope_t): RuntimeValue {
  return initVar(scope, stmt.symbol, evaluate(stmt.expr, scope));
}

function evalExprStmt(stmt: ExprStmt_t, scope: Scope_t): RuntimeValue {
  return evaluate(stmt.expr, scope);
}

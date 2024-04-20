export enum StmtType {
  LET,
  RETURN,
  EXPRESSION,
}

export type Stmt = LetStmt_t | ReturnStmt_t | ExprStmt_t;

interface LetStmt_t {
  tag: StmtType.LET;
}

interface ReturnStmt_t {
  tag: StmtType.RETURN;
}

interface ExprStmt_t {
  tag: StmtType.EXPRESSION;
  expr: Expr;
}

export function ExprStmt(expr: Expr): ExprStmt_t {
  return {
    tag: StmtType.EXPRESSION,
    expr,
  };
}

export enum ExprType {
  BINARY,
  IDENTIFIER,
  INTEGER,
  FLOAT,
  NULL,
}

export type Expr =
  | BinaryExpr_t
  | IdentifierExpr_t
  | IntegerExpr_t
  | FloatExpr_t
  | NullExpr_t;

interface BinaryExpr_t {
  tag: ExprType.BINARY;
  left: Expr;
  operator: string;
  right: Expr;
}

interface IdentifierExpr_t {
  tag: ExprType.IDENTIFIER;
  symbol: string;
}

interface IntegerExpr_t {
  tag: ExprType.INTEGER;
  value: bigint;
}

interface FloatExpr_t {
  tag: ExprType.FLOAT;
  value: number;
}

interface NullExpr_t {
  tag: ExprType.NULL;
  value: null;
}

export function BinaryExpr(
  left: Expr,
  operator: string,
  right: Expr,
): BinaryExpr_t {
  return {
    tag: ExprType.BINARY,
    left,
    operator,
    right,
  };
}

export function IdentifierExpr(symbol: string): IdentifierExpr_t {
  return {
    tag: ExprType.IDENTIFIER,
    symbol,
  };
}

export function IntegerExpr(value: bigint): IntegerExpr_t {
  return {
    tag: ExprType.INTEGER,
    value,
  };
}

export function FloatExpr(value: number): FloatExpr_t {
  return {
    tag: ExprType.FLOAT,
    value,
  };
}

export function NullExpr(): NullExpr_t {
  return {
    tag: ExprType.NULL,
    value: null,
  };
}

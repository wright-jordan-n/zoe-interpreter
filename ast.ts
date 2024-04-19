enum StmtType {
  LET,
  RETURN,
  EXPR,
}

export interface Stmt {
  stmtType: StmtType;
}

enum ExprType {
  BINARY,
  IDENTIFIER,
  INTEGER,
  FLOAT,
}

export type Expr =
  | BinaryExpr_t
  | IdentifierExpr_t
  | IntegerExpr_t
  | FloatExpr_t;

interface BinaryExpr_t {
  tag: ExprType.BINARY;
  left: Expr;
  right: Expr;
  operator: string;
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

function BinaryExpr(left: Expr, right: Expr, operator: string): BinaryExpr_t {
  return {
    tag: ExprType.BINARY,
    left,
    right,
    operator,
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

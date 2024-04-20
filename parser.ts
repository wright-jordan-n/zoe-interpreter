import {
  BinaryExpr,
  Expr,
  FloatExpr,
  IdentifierExpr,
  IntegerExpr,
  Stmt,
} from "./ast.ts";
import { Token_t, TokenType } from "./token.ts";

function advance(toks: Token_t[], ptr: { i: number }): void {
  if (ptr.i === toks.length - 1) {
    return;
  }
  ptr.i += 1;
}

function _peek(toks: Token_t[], ptr: { i: number }): Token_t | null {
  if (ptr.i === toks.length - 1) {
    return null;
  }
  return toks[ptr.i + 1];
}

export function parse(toks: Token_t[]): { stmts: Stmt[]; errs: string[] } {
  const stmts: Stmt[] = [];
  const errs: string[] = [];
  const ptr: { i: number } = { i: 0 };
  while (toks[ptr.i].type !== TokenType.EOF) {
    const rslt = parseExpr(toks, ptr);
    if (typeof rslt === "string") {
      errs.push(rslt);
    } else {
      stmts.push(rslt as unknown as Stmt);
    }
  }
  return { stmts, errs };
}

// Order or Precendence
// PrimaryExpr
// FuncCall ArraySubscript StructAccess
// UnaryExpr
// * / %
// + -
// < <= > >= == !=
// &&
// ||
// AssignmentExpr

function parseExpr(toks: Token_t[], ptr_i: { i: number }): Expr | string {
  return parseAdditiveExpr(toks, ptr_i);
}

function parsePrimaryExpr(
  toks: Token_t[],
  ptr: { i: number },
): Expr | string {
  const tok = toks[ptr.i];
  switch (tok.type) {
    case TokenType.IDENTIFIER:
      advance(toks, ptr);
      return IdentifierExpr(tok.literal);
    case TokenType.INT:
    case TokenType.HEX:
    case TokenType.OCTAL:
    case TokenType.BINARY:
      advance(toks, ptr);
      return IntegerExpr(BigInt(tok.literal));
    case TokenType.FLOAT:
      advance(toks, ptr);
      return FloatExpr(Number(tok.literal));
    case TokenType.LPAREN: {
      advance(toks, ptr);
      const rslt = parseExpr(toks, ptr);
      if (typeof rslt === "string") {
        return rslt;
      }
      if (toks[ptr.i].type !== TokenType.RPAREN) {
        advance(toks, ptr);
        return `error: unexpected token '${toks[ptr.i].literal}', expected ')'`;
      }
      advance(toks, ptr);
      return rslt;
    }
    default:
      advance(toks, ptr);
      return `error: unexpected token '${tok.literal}', expected expresssion`;
  }
}

function parseMultiplicativeExpr(
  toks: Token_t[],
  ptr: { i: number },
): Expr | string {
  let left = parsePrimaryExpr(toks, ptr);
  if (typeof left === "string") {
    return left;
  }
  for (
    let tok = toks[ptr.i];
    tok.type === TokenType.MULTIPLY || tok.type === TokenType.DIVIDE ||
    tok.type === TokenType.MODULO;
    tok = toks[ptr.i]
  ) {
    const operator = tok.literal;
    advance(toks, ptr);
    const right = parsePrimaryExpr(toks, ptr);
    if (typeof right === "string") {
      return right;
    }
    left = BinaryExpr(left, operator, right);
  }
  return left;
}

function parseAdditiveExpr(
  toks: Token_t[],
  ptr: { i: number },
): Expr | string {
  let left = parseMultiplicativeExpr(toks, ptr);
  if (typeof left === "string") {
    return left;
  }
  for (
    let tok = toks[ptr.i];
    tok.type === TokenType.ADD || tok.type === TokenType.SUBTRACT;
    tok = toks[ptr.i]
  ) {
    const operator = tok.literal;
    advance(toks, ptr);
    const right = parseMultiplicativeExpr(toks, ptr);
    if (typeof right === "string") {
      return right;
    }
    left = BinaryExpr(left, operator, right);
  }
  return left;
}

import { Expr, FloatExpr, IdentifierExpr, IntegerExpr, Stmt } from "./ast.ts";
import { Token_t, TokenType } from "./token.ts";

export function parse(toks: Token_t[]): { ast: Stmt[]; errs: string[] } {
  const ast: Stmt[] = [];
  const errs: string[] = [];
  for (const ptr_i = { i: 0 }; ptr_i.i < toks.length; ptr_i.i += 1) {
    const rslt = parseExpr(toks, ptr_i);
    if (typeof rslt === "string") {
      errs.push(rslt);
    } else {
      ast.push(rslt as unknown as Stmt);
    }
  }
  return { ast, errs };
}

function parseExpr(toks: Token_t[], ptr_i: { i: number }): Expr | string {
  return parsePrimaryExpr(toks, ptr_i);
}

function parsePrimaryExpr(
  toks: Token_t[],
  ptr_i: { i: number },
): Expr | string {
  const tok = toks[ptr_i.i];
  console.log(tok);
  switch (tok.type) {
    case TokenType.IDENTIFIER:
      return IdentifierExpr(tok.literal);
    case TokenType.INT:
    case TokenType.HEX:
    case TokenType.OCTAL:
    case TokenType.BINARY:
      return IntegerExpr(BigInt(tok.literal));
    case TokenType.FLOAT:
      return FloatExpr(Number(tok.literal));
    default:
      return `unable to parse token '${tok.literal}' as primary expression`;
  }
}

// function peek(src: string, i: number): string {
//   if (i >= src.length) {
//     return "\0";
//   }
//   return src[i];
// }

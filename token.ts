export enum TokenType {
  ASSIGN,
  ADD,
  SUBTRACT,
  MULTIPLY,
  DIVIDE,
  MODULO,
  LPAREN,
  RPAREN,
  SEMICOLON,

  BINARY,
  OCTAL,
  HEXADECIMAL,
  INTEGER,
  FLOAT,

  NULL,
  VAR,
  IDENTIFIER,

  EOF,
}

const keywords = new Map<string, TokenType>();
keywords.set("var", TokenType.VAR);
keywords.set("null", TokenType.NULL);

export { keywords };

export interface Token_t {
  type: TokenType;
  literal: string;
}

export function Token(type: TokenType, literal: string): Token_t {
  return { type, literal };
}

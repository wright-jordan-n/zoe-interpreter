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
  HEX,
  INT,
  FLOAT,

  VAR,
  IDENTIFIER,

  EOF,
}

const keywords = new Map<string, TokenType>();
keywords.set("var", TokenType.VAR);

export { keywords };

export interface Token_t {
  type: TokenType;
  literal: string;
}

export function Token(type: TokenType, literal: string): Token_t {
  return { type, literal };
}

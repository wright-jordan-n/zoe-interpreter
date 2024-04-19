import { Stmt } from "./ast.ts";
import { lex } from "./lexer.ts";
import { parse } from "./parser.ts";
import { Token_t } from "./token.ts";

if (Deno.args.length === 0) {
  for (let input = prompt(">"); input !== null; input = prompt(">")) {
    console.log(lex(input));
  }
} else if (Deno.args.length === 1) {
  const bytes = Deno.readFileSync(Deno.args[0]);
  const src = new TextDecoder().decode(bytes);
  let toks: Token_t[], ast: Stmt[], errs: string[];
  ({ toks, errs } = lex(src));
  console.log({ toks, errs });
  ({ ast, errs } = parse(toks));
  console.log({ ast, errs });
}

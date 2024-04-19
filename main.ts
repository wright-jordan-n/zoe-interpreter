import { lex } from "./lexer.ts";

if (Deno.args.length === 0) {
  for (let input = prompt(">"); input !== null; input = prompt(">")) {
    console.log(lex(input));
  }
} else if (Deno.args.length === 1) {
  const bytes = Deno.readFileSync(Deno.args[0]);
  const src = new TextDecoder().decode(bytes);
  console.log(lex(src));
}

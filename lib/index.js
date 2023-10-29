import { RiScript } from "./riscript.js";
import { RiGrammar } from "./grammar.js";
import { RiScriptVisitor } from "./visitor.js";
RiScript.Grammar = RiGrammar;
RiScript.Visitor = RiScriptVisitor;
var src_default = RiScript;
export {
  src_default as default
};

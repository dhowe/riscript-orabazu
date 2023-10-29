"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);
var grammar_exports = {};
__export(grammar_exports, {
  RiGrammar: () => RiGrammar
});
module.exports = __toCommonJS(grammar_exports);
var import_riscript = require("./riscript.js");
class RiGrammar {
  constructor(rules = {}, context = {}) {
    if (typeof rules !== "object") {
      throw Error("RiGrammar: expecting object, found " + typeof rules);
    }
    this.scripting = new import_riscript.RiScript();
    this.context = context;
    this.setRules(rules);
  }
  static expand(rules, context, opts) {
    return new RiGrammar(rules, context).expand(opts);
  }
  addTransform() {
    return import_riscript.RiScript.addTransform(...arguments);
  }
  removeTransform() {
    return import_riscript.RiScript.removeTransform(...arguments);
  }
  getTransforms() {
    return import_riscript.RiScript.transforms;
  }
  equals(rg) {
    return rg.toJSON() === this.toJSON();
  }
  expand(opts = {}) {
    if ("context" in opts) {
      throw Error("pass context to RiScript.grammar() or new RiGrammar() instead");
    }
    opts.visitor = opts.visitor || new import_riscript.RiScript.Visitor(this.scripting);
    opts.visitor.context = this.context || {};
    opts.input = this._toScript(opts);
    return this.scripting._evaluate(opts);
  }
  addRule(name, def) {
    this._validateRule(name, def);
    this.rules[name] = def;
  }
  setRules(rules) {
    if (typeof rules === "undefined")
      throw Error("undefined rules");
    this.rules = {};
    let incoming = typeof rules === "string" ? parseJSON(rules) : rules;
    let self = this;
    Object.entries(incoming).forEach((e) => self.addRule(...e));
  }
  removeRule(name) {
    if (name in this.rules) {
      delete this.rules[name];
    }
  }
  toJSON() {
    return JSON.stringify(this.rules, ...arguments);
  }
  toString(opts = {}) {
    let replacer = opts.replacer || 0;
    let space = opts.space || 2;
    let lb = opts?.linebreak;
    let res = this.toJSON(replacer, space);
    if (lb)
      res = res.replace(/\n/g, lb);
    return res;
  }
  static fromJSON(str, opts) {
    return new RiGrammar(JSON.parse(str), opts);
  }
  /* 
    Convert grammar to inline rules;
    rules are dynamic, unless otherwise specified with leading #
  */
  _toScript(opts) {
    let script = "", start = opts.start || "start";
    let { Symbols } = this.scripting;
    if (start.startsWith(Symbols.DYNAMIC)) {
      start = start.substring(Symbols.DYNAMIC.length);
    }
    if (start.startsWith(Symbols.STATIC)) {
      start = start.substring(Symbols.STATIC.length);
    }
    if (!(start in this.rules || Symbols.STATIC + start in this.rules)) {
      throw Error('Rule: "' + start + '" not found in grammar');
    }
    Object.entries(this.rules).forEach(([name, rule], i) => {
      while (name.startsWith(Symbols.DYNAMIC)) {
        name = name.substring(1);
      }
      if (!name.startsWith(Symbols.STATIC)) {
        name = Symbols.DYNAMIC + name;
      }
      if (!this.scripting.ChoiceWrapRE.test(rule)) {
        rule = Symbols.OPEN_CHOICE + rule + Symbols.CLOSE_CHOICE;
      }
      script += `${name}=${rule}
`;
    });
    if (opts.trace)
      console.log("Grammar:\n" + script.replace(/^\$/gm, "  $"));
    script += `${Symbols.DYNAMIC}${start}`;
    return script;
  }
  _validateRule(name, def) {
    if (typeof name !== "string" || name.length === 0) {
      throw Error("expected [string] name");
    }
    if (typeof def === "undefined") {
      throw Error("undefined rule def: " + name);
    }
    let { Symbols } = this.scripting;
    if (name.startsWith(Symbols.DYNAMIC)) {
      name = name.substring(Symbols.DYNAMIC.length);
      throw Error(
        "Grammar rules are dynamic by default; if you need a static rule, use '" + Symbols.STATIC + name + "', otherwise just use '" + name + "'."
      );
    }
  }
}
function parseJSON(json) {
  if (typeof json === "string") {
    try {
      return JSON.parse(json);
    } catch (e) {
      throw Error(
        "RiGrammar appears to be invalid JSON, please check it at http://jsonlint.com/\n" + json
      );
    }
  }
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  RiGrammar
});

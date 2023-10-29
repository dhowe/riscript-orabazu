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
var tokens_exports = {};
__export(tokens_exports, {
  getTokens: () => getTokens
});
module.exports = __toCommonJS(tokens_exports);
var import_chevrotain = require("chevrotain");
function getTokens(v2Compatible) {
  let Symbols = {
    OR: "|",
    ELSE: "||",
    DYNAMIC: "$",
    STATIC: "#",
    ENTITY: "&",
    OPEN_GATE: "@",
    CLOSE_GATE: "@",
    PENDING_GATE: "@@",
    OPEN_SILENT: "{",
    CLOSE_SILENT: "}"
  };
  let v2Symbols = {
    OPEN_CHOICE: "(",
    CLOSE_CHOICE: ")",
    OPEN_WEIGHT: "[",
    CLOSE_WEIGHT: "]",
    CONTINUATION: "\\"
  };
  let v3Symbols = {
    OPEN_CHOICE: "[",
    CLOSE_CHOICE: "]",
    OPEN_WEIGHT: "^",
    // also allows (int), eg. (3)
    CLOSE_WEIGHT: "^",
    CONTINUATION: "~"
  };
  Object.assign(Symbols, v2Compatible ? v2Symbols : v3Symbols);
  const Escaped = {};
  Object.entries(Symbols).forEach(([k, v]) => {
    Escaped[k] = escapeRegex(v);
  });
  const PENDING_GATE_PATTERN = new RegExp(`${Escaped.PENDING_GATE}([0-9]{9,11})`);
  Escaped.SPECIAL = Object.values(Escaped).join("").replace(/[<>]/g, "");
  Symbols.PENDING_GATE_RE = new RegExp(PENDING_GATE_PATTERN.source, "g");
  const ExitGate = (0, import_chevrotain.createToken)({
    name: "ExitGate",
    pattern: new RegExp(`\\s*${Escaped.CLOSE_GATE}`),
    pop_mode: true
  });
  const Gate = (0, import_chevrotain.createToken)({
    name: "Gate",
    pattern: new RegExp(`[^${Escaped.CLOSE_GATE}]+`)
  });
  const PendingGate = (0, import_chevrotain.createToken)({
    name: "PendingGate",
    pattern: PENDING_GATE_PATTERN
  });
  const EnterGate = (0, import_chevrotain.createToken)({
    name: "EnterGate",
    pattern: new RegExp(`${Escaped.OPEN_GATE}\\s*`),
    push_mode: "gate_mode"
  });
  const OC = (0, import_chevrotain.createToken)({ name: "OC", pattern: new RegExp(Escaped.OPEN_CHOICE + "\\s*") });
  const CC = (0, import_chevrotain.createToken)({ name: "CC", pattern: new RegExp(`\\s*${Escaped.CLOSE_CHOICE}`) });
  const OR = (0, import_chevrotain.createToken)({ name: "OR", pattern: /\s*\|\s*/ });
  const ELSE = (0, import_chevrotain.createToken)({ name: "ELSE", pattern: /\s*\|\|\s*/ });
  const EQ = (0, import_chevrotain.createToken)({ name: "EQ", pattern: /\s*=\s*/ });
  const TF = (0, import_chevrotain.createToken)({ name: "TF", pattern: /\.[A-Za-z_0-9][A-Za-z_0-9]*(\(\))?/ });
  const OS = (0, import_chevrotain.createToken)({ name: "OS", pattern: new RegExp(`${Escaped.OPEN_SILENT}\\s*`) });
  const CS = (0, import_chevrotain.createToken)({ name: "CS", pattern: new RegExp(`\\s*${Escaped.CLOSE_SILENT}`) });
  const SYM = (0, import_chevrotain.createToken)({ name: "SYM", pattern: new RegExp(`[${Escaped.DYNAMIC}${Escaped.STATIC}][A-Za-z_0-9]*`) });
  const Entity = (0, import_chevrotain.createToken)({ name: "Entity", pattern: /&([a-z0-9]+|#[0-9]{1,6}|#x[0-9a-fA-F]{1,6});/i });
  const Weight = (0, import_chevrotain.createToken)({ name: "Weight", pattern: new RegExp(`\\s*${Escaped.OPEN_WEIGHT}.+${Escaped.CLOSE_WEIGHT}\\s*`) });
  const Raw = (0, import_chevrotain.createToken)({ name: "Raw", pattern: new RegExp(`[^${Escaped.SPECIAL}]+`) });
  const normalMode = [Entity, Weight, ELSE, OC, CC, OR, EQ, SYM, TF, OS, CS, PendingGate, Raw, EnterGate];
  const gateMode = [Gate, ExitGate];
  const multiMode = {
    modes: {
      normal: normalMode,
      gate_mode: gateMode
    },
    defaultMode: "normal"
  };
  return { tokens: multiMode, Constants: { Symbols, Escaped } };
}
function escapeRegex(s) {
  return s.replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&");
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  getTokens
});

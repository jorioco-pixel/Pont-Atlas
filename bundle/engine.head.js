"use strict";
var PontSim = (() => {
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

  // src/lib/simulation/browser-export.ts
  var browser_export_exports = {};
  __export(browser_export_exports, {
    DEFAULT_PARAMS: () => DEFAULT_PARAMS,
    STORAGE_KEY: () => STORAGE_KEY,
    simulate: () => simulate
  });

  // src/lib/simulation/amortization.ts
  var ORIGINAL_PRINCIPAL = 224e3;
  var CREDIT_RATE = 0.0344;
  var LAST_PAYMENT_AMOUNT = 1159.64;

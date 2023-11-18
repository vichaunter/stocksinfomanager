const eToroInstruments = require("./etoroInstruments.json");

function getEtoroInstruments() {
  return eToroInstruments["InstrumentDisplayDatas"];
}

function getEtoroInstrument(symbol: string) {
  return getEtoroInstruments().find(
    (instrument) => instrument.SymbolFull === symbol
  );
}

function removeDuplesByKey(arr: Record<any, any>[], key: string) {
  const map = new Map();
  arr.map((item) => map.set(item[key], item));

  return [...map.values()];
}

module.exports = {
  getEtoroInstruments,
  getEtoroInstrument,
  removeDuplesByKey,
};

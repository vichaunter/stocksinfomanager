import dayjs from "dayjs";
import "dayjs/locale/es";
import { ChangeEvent, useState } from "react";
import * as XLSX from "xlsx";
import { cleanNumber, formatDate } from "@packages/utils";
import {
  BrokerExtractBuyLine,
  BrokerExtractDividendLine,
  PortfolioData,
} from "./useBrokersExtract";
dayjs.locale("es");
// export type EtoroData = {
//   "Cambio de capital realizado": 0;
//   "Capital realizado": 2000;
//   Detalles: "MO/USD";
//   Fecha: "05/09/2023 14:42:21";
//   "ID de posición": "2513021725";
//   Importe: 2000;
//   "Importe no retirable": 0;
//   Saldo: 0;
//   Tipo: "Posición abierta";
//   "Tipo de activo": "Acciones";
//   Unidades: "45.248869";
// };

type HeadsMapItem = {
  [key: string]:
    | "capitalChanged"
    | "realizedCapital"
    | "details"
    | "date"
    | "positionId"
    | "amount"
    | "nonWithdrawableAmount"
    | "balance"
    | "type"
    | "assetType"
    | "units";
};

type MappedItem = {
  capitalChanged: string;
  realizedCapital: string;
  details: string;
  date: string;
  positionId: string;
  amount: string;
  nonWithdrawableAmount: string;
  balance: string;
  type: string;
  assetType: string;
  units: string;
};

const headsMap: HeadsMapItem[] = [
  {
    "Cambio de capital realizado": "capitalChanged",
    "Capital realizado": "realizedCapital",
    Detalles: "details",
    Fecha: "date",
    "ID de posición": "positionId",
    Importe: "amount",
    "Importe no retirable": "nonWithdrawableAmount",
    Saldo: "balance",
    Tipo: "type",
    "Tipo de activo": "assetType",
    Unidades: "units",
  },
];

const TYPES = {
  "Posición abierta": "buy",
  Dividendo: "dividend",
} as const;

const VALID_OPERATIONS = Object.keys(TYPES);

const useEtoro = (): [PortfolioData, (event: any) => any] => {
  const [raw, setRaw] = useState<any[]>([]);
  const [data, setData] = useState<PortfolioData>({});

  const parseData = (raw: any[]): PortfolioData => {
    const headers = raw.shift();
    if (!headers) return {};
    const keyTranslation = headsMap.find((hm) => hm?.[headers[0]]);

    if (!keyTranslation) return {};

    let buys: BrokerExtractBuyLine[] = [];
    let dividends: BrokerExtractDividendLine[] = [];

    raw.forEach((row: any[]) => {
      const item: MappedItem = {} as MappedItem;

      Object.entries(row).forEach(([i, v]) => {
        item[keyTranslation[headers[i]]] = v;
      });

      if (!VALID_OPERATIONS.includes(item.type)) {
        return;
      }

      const [ticker, currency] = item.details.split("/");
      if (item.type === "Dividendo") {
        dividends.push({
          ticker,
          currency,
          amount: cleanNumber(item.amount),
          date: formatDate(item.date),
          broker: "etoro",
        });
      } else if (item.type === "Posición abierta") {
        buys.push({
          ticker,
          currency,
          amount: cleanNumber(item.amount),
          units: cleanNumber(item.units),
          date: formatDate(item.date),
          broker: "etoro",
        });
      }
    });

    return { buys, dividends };
  };

  const onFileChange = (e: ChangeEvent<HTMLInputElement>): any => {
    const file = e?.target?.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e: any) => {
      const ab = e.target.result;
      const wb = XLSX.read(ab, { type: "array" });

      const wsname = wb.SheetNames[2];
      const ws = wb.Sheets[wsname];

      const data = XLSX.utils.sheet_to_json(ws, { header: 1 });
      setRaw(data);

      const parsed = parseData(data);
      parsed && setData(parsed);
    };
    reader.readAsArrayBuffer(file);
  };

  return [data, onFileChange];
};

export default useEtoro;

import tickerController from "../controllers/tickerController";

import { Router, Request, Response } from "express";

export const errorWrapper = (res: Response, cb: () => {}) => {
  try {
    cb();
  } catch (e) {
    console.error(e);
    return res.status(404).send({
      status: "error",
      message: "not found",
    });
  }
};

export const notExistingRoute = (req: Request, res: Response): any => {
  return res.status(404).send({ message: "invalid endpoint" });
};
const router = Router();

router.use("/tickers", tickerController.getTickers);
router.use("/ticker/:ticker/:key?", tickerController.getTicker);
router.use("/ticker/update/:ticker", tickerController.updateTicker);

router.put("/ticker", tickerController.addTicker);

const mapRoutes = (app) => {
  app.use("/", router);

  app.use(notExistingRoute);

  return app;
};

export { mapRoutes };

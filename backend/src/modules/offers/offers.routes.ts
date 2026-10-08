import { Router } from "express";
import { OffersController } from "./offers.controller";

const router = Router();
const offersController = new OffersController();

router.get("/", offersController.getActiveOffers.bind(offersController));

export default router;

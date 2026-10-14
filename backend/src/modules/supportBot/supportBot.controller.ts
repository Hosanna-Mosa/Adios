import { NextFunction, Request, Response } from "express";
import { AuthRequest } from "../../middleware/auth.middleware";
import SupportIntent from "../../database/models/SupportIntent";
import { AppError, NotFoundError } from "../../utils/errors";
import { RESOLVER_DESCRIPTIONS } from "./resolvers";
import * as service from "./supportBot.service";

const uid = (req: Request) => {
  const userId = (req as AuthRequest).user?.userId;
  if (!userId) throw new AppError(401, "Unauthorized");
  return String(userId);
};

type Handler = (req: Request, res: Response) => Promise<unknown>;
const wrap = (fn: Handler) => async (req: Request, res: Response, next: NextFunction) => {
  try {
    await fn(req, res);
  } catch (err) {
    next(err);
  }
};

export const listIntents = wrap(async (req, res) => res.json(await service.listIntents(uid(req), req.query.lang)));

export const listOrders = wrap(async (req, res) =>
  res.json(await service.listOrders(uid(req), req.query.category as string | undefined))
);

export const ask = wrap(async (req, res) => {
  try {
    return res.status(201).json(await service.askBot(uid(req), req.body));
  } catch (err) {
    if (err instanceof AppError && err.message === "BOT_LIMIT_REACHED") {
      return res.status(409).json({ code: "BOT_LIMIT_REACHED", message: "Please talk to an agent" });
    }
    throw err;
  }
});

export const getQuery = wrap(async (req, res) => res.json(await service.getQuery(uid(req), req.params.id as string)));

export const feedback = wrap(async (req, res) =>
  res.json(await service.giveFeedback(uid(req), req.params.id as string, req.body.helpful))
);

export const escalate = wrap(async (req, res) =>
  res.status(201).json(await service.escalate(uid(req), (req as AuthRequest).user?.role, req.params.id as string))
);

// ---- admin -------------------------------------------------------------------------------

export const adminListIntents = wrap(async (_req, res) =>
  res.json(await SupportIntent.find().sort({ sortOrder: 1, createdAt: 1 }).lean())
);

export const adminListResolvers = wrap(async (_req, res) =>
  res.json(Object.entries(RESOLVER_DESCRIPTIONS).map(([key, description]) => ({ key, description })))
);

export const adminCreateIntent = wrap(async (req, res) => {
  const { key } = req.body;
  if (await SupportIntent.exists({ key })) throw new AppError(409, "A question with this key already exists");
  const intent = await SupportIntent.create({ needsOrder: true, enabled: true, sortOrder: 0, ...req.body });
  return res.status(201).json(intent);
});

export const adminUpdateIntent = wrap(async (req, res) => {
  const intent = await SupportIntent.findByIdAndUpdate(req.params.id, { $set: req.body }, { new: true, runValidators: true });
  if (!intent) throw new NotFoundError("Question not found");
  return res.json(intent);
});

export const adminDeleteIntent = wrap(async (req, res) => {
  const intent = await SupportIntent.findByIdAndDelete(req.params.id);
  if (!intent) throw new NotFoundError("Question not found");
  return res.json({ success: true });
});

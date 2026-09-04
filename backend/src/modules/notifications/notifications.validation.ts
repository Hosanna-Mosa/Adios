import { z } from "zod";

export const listNotificationsSchema = z.object({
  query: z.object({
    limit: z.string().optional(),
    skip: z.string().optional(),
  }),
});

export const notificationIdParamSchema = z.object({
  params: z.object({
    id: z.string().min(1, "Notification ID is required"),
  }),
});

export const webPushSubscribeSchema = z.object({
  body: z.object({
    subscription: z.object({
      endpoint: z.string().min(1, "A valid push subscription is required"),
      keys: z.object({
        p256dh: z.string().min(1, "A valid push subscription is required"),
        auth: z.string().min(1, "A valid push subscription is required"),
      }),
    }).catchall(z.any()),
  }),
});

export const webPushUnsubscribeSchema = z.object({
  body: z.object({
    endpoint: z.string().min(1, "endpoint is required"),
  }),
});

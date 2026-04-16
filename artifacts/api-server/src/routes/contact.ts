import { Router, type IRouter } from "express";
import { randomUUID } from "node:crypto";
import { SubmitContactBody, SubmitContactResponse } from "@workspace/api-zod";
import { logger } from "../lib/logger";

const router: IRouter = Router();

router.post("/contact", (req, res) => {
  const parsed = SubmitContactBody.safeParse(req.body);

  if (!parsed.success) {
    res.status(400).json({
      title: "Invalid contact submission",
      detail: parsed.error.issues.map((i) => i.message).join("; "),
    });
    return;
  }

  const id = randomUUID();

  logger.info(
    {
      contactId: id,
      name: parsed.data.name,
      company: parsed.data.company,
      contact: parsed.data.contact,
      messageLength: parsed.data.message.length,
    },
    "Contact form submission received",
  );

  const response = SubmitContactResponse.parse({ ok: true, id });
  res.json(response);
});

export default router;

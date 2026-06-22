/**
 * ContactForm — primary lead-capture surface.
 *
 * Field set follows the marketing brief: name + company + position (opt) +
 * email and/or phone (at least one) + request type + free-form message +
 * 152-ФЗ consent + invisible honeypot.
 *
 * Hidden context fields (pageUrl / referrer / UTM / source) are collected
 * at submit time, not via form state — they don't need re-rendering on
 * every keystroke and React Hook Form's `useEffect`+`setValue` dance for
 * static values is overkill.
 *
 * On success we fire a Yandex.Metrica `lead_submit` goal so sales can
 * tie conversions back to traffic source in the Metrica funnel.
 */
import { useCallback, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { m as motion, AnimatePresence } from "framer-motion";
import { ArrowUpRight, Check, Loader2 } from "lucide-react";
import { z } from "zod";
import { useSubmitContact } from "@workspace/api-client-react";
import { easeOutExpo } from "@/lib/motion";

const REQUEST_TYPES = [
  { value: "diagnostics", label: "Диагностика процессов" },
  { value: "pilot", label: "Пилот ИИ-решения" },
  { value: "consultation", label: "Консультация" },
  { value: "other", label: "Другое" },
] as const;

type RequestType = (typeof REQUEST_TYPES)[number]["value"];

// Phone normaliser: keep digits + a leading +. Anything else (spaces,
// parens, dashes) is for human readability, not for matching.
const PHONE_PATTERN = /^[+\d][\d\s()-]{6,}$/;

const contactSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(2, "Укажите имя (минимум 2 символа)")
      .max(200, "Слишком длинное имя"),
    company: z
      .string()
      .trim()
      .min(1, "Укажите название организации")
      .max(200, "Слишком длинное название"),
    position: z
      .string()
      .trim()
      .max(200, "Слишком длинная должность")
      .optional()
      .or(z.literal("")),
    email: z
      .string()
      .trim()
      .max(320, "Слишком длинный email")
      .optional()
      .or(z.literal(""))
      .refine(
        (v) => !v || z.string().email().safeParse(v).success,
        "Введите корректный email",
      ),
    phone: z
      .string()
      .trim()
      .max(40, "Слишком длинный номер")
      .optional()
      .or(z.literal(""))
      .refine(
        (v) => !v || PHONE_PATTERN.test(v),
        "Введите корректный телефон",
      ),
    message: z
      .string()
      .trim()
      .max(5000, "Сообщение слишком длинное")
      .optional()
      .or(z.literal("")),
    requestType: z.enum(["diagnostics", "pilot", "consultation", "other"], {
      errorMap: () => ({ message: "Выберите тип запроса" }),
    }),
    consent: z.boolean().refine((v) => v === true, {
      message: "Необходимо согласие на обработку персональных данных",
    }),
    // Honeypot — must stay empty
    website: z.string().max(200).optional(),
  })
  .refine((data) => Boolean(data.email) || Boolean(data.phone), {
    message: "Укажите email или телефон — хотя бы одно поле",
    path: ["email"],
  });

type ContactFormValues = z.infer<typeof contactSchema>;

const fieldBase =
  "w-full bg-transparent border-b border-black/20 focus:border-black outline-none py-3 text-base md:text-lg font-medium text-black placeholder:text-black/35 transition-colors";

function collectContextFields(): {
  pageUrl: string;
  referrer: string;
  utm: Record<string, string>;
} {
  if (typeof window === "undefined") {
    return { pageUrl: "", referrer: "", utm: {} };
  }
  const url = new URL(window.location.href);
  const utm: Record<string, string> = {};
  for (const key of [
    "utm_source",
    "utm_medium",
    "utm_campaign",
    "utm_content",
    "utm_term",
  ]) {
    const v = url.searchParams.get(key);
    if (v) utm[key] = v;
  }
  return {
    pageUrl: window.location.href,
    referrer: document.referrer || "",
    utm,
  };
}

declare global {
  interface Window {
    // Yandex.Metrica counter, injected by the snippet in index.html.
    ym?: (counterId: number, action: string, ...rest: unknown[]) => void;
  }
}

function fireMetricaGoal(source?: string): void {
  if (typeof window === "undefined" || typeof window.ym !== "function") return;
  try {
    window.ym(108772201, "reachGoal", "lead_submit", source ? { source } : {});
  } catch {
    /* Metrica goals are best-effort */
  }
}

export function ContactForm({ source }: { source?: string } = {}) {
  const [submitted, setSubmitted] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ContactFormValues>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      name: "",
      company: "",
      position: "",
      email: "",
      phone: "",
      message: "",
      requestType: "diagnostics",
      consent: false,
      website: "",
    },
  });

  const submitContact = useSubmitContact();

  const onSubmit = useCallback(
    async (values: ContactFormValues) => {
      setServerError(null);
      const ctx = collectContextFields();
      const fullSource = source ? `itityl-landing:${source}` : "itityl-landing";
      try {
        await submitContact.mutateAsync({
          data: {
            name: values.name,
            company: values.company,
            position: values.position || undefined,
            email: values.email || undefined,
            phone: values.phone || undefined,
            message: values.message || undefined,
            requestType: values.requestType,
            consent: values.consent,
            source: fullSource,
            pageUrl: ctx.pageUrl || undefined,
            referrer: ctx.referrer || undefined,
            utmSource: ctx.utm.utm_source,
            utmMedium: ctx.utm.utm_medium,
            utmCampaign: ctx.utm.utm_campaign,
            utmContent: ctx.utm.utm_content,
            utmTerm: ctx.utm.utm_term,
            website: values.website ?? "",
          },
        });
        fireMetricaGoal(fullSource);
        setSubmitted(true);
        reset();
      } catch (err) {
        const status = (err as { status?: number } | null)?.status;
        if (status === 429) {
          setServerError(
            "Слишком много заявок с вашего адреса. Попробуйте позже.",
          );
        } else if (status === 400) {
          const apiMessage = (
            err as { data?: { error?: string; message?: string } } | null
          )?.data;
          setServerError(
            apiMessage?.message ?? "Проверьте корректность заполнения полей.",
          );
        } else {
          setServerError(
            err instanceof Error
              ? err.message
              : "Не удалось отправить заявку. Попробуйте позже.",
          );
        }
      }
    },
    [reset, source, submitContact],
  );

  return (
    <div className="relative">
      <AnimatePresence mode="wait">
        {submitted ? (
          <motion.div
            key="success"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.6, ease: easeOutExpo }}
            className="flex flex-col items-start gap-6 py-10"
            data-testid="contact-success"
          >
            <motion.div
              initial={{ scale: 0, rotate: -45 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.15, duration: 0.6, ease: easeOutExpo }}
              className="w-14 h-14 rounded-full bg-amber-400 text-black flex items-center justify-center"
            >
              <Check className="w-7 h-7" strokeWidth={3} />
            </motion.div>
            <h3 className="text-3xl md:text-4xl font-heading font-extrabold uppercase tracking-tight leading-tight">
              Спасибо! Свяжемся в течение рабочего дня.
            </h3>
            <p className="text-black/60 text-base max-w-md">
              Заявка получена. С вами свяжется менеджер по указанным контактам.
            </p>
            <button
              type="button"
              onClick={() => setSubmitted(false)}
              data-cursor="link"
              className="text-xs uppercase tracking-[0.3em] text-black/60 hover:text-black font-bold border-b border-black/30 hover:border-black pb-1 transition-colors"
            >
              Отправить ещё одну заявку
            </button>
          </motion.div>
        ) : (
          <motion.form
            key="form"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.6, ease: easeOutExpo }}
            onSubmit={handleSubmit(onSubmit)}
            noValidate
            className="flex flex-col gap-8"
            data-testid="contact-form"
          >
            {/* Honeypot — hidden from users, visible to bots */}
            <div
              aria-hidden="true"
              style={{
                position: "absolute",
                left: "-10000px",
                top: "auto",
                width: "1px",
                height: "1px",
                overflow: "hidden",
              }}
            >
              <label>
                Сайт
                <input
                  type="text"
                  tabIndex={-1}
                  autoComplete="off"
                  {...register("website")}
                />
              </label>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-8">
              <Field
                label="Имя"
                error={errors.name?.message}
                htmlFor="contact-name"
              >
                <input
                  id="contact-name"
                  type="text"
                  autoComplete="name"
                  placeholder="Как к вам обращаться"
                  className={fieldBase}
                  data-testid="input-contact-name"
                  {...register("name")}
                />
              </Field>

              <Field
                label="Организация"
                error={errors.company?.message}
                htmlFor="contact-company"
              >
                <input
                  id="contact-company"
                  type="text"
                  autoComplete="organization"
                  placeholder="Название компании"
                  className={fieldBase}
                  data-testid="input-contact-company"
                  {...register("company")}
                />
              </Field>

              <Field
                label="Должность"
                error={errors.position?.message}
                htmlFor="contact-position"
                optional
              >
                <input
                  id="contact-position"
                  type="text"
                  autoComplete="organization-title"
                  placeholder="Ваша роль в компании"
                  className={fieldBase}
                  data-testid="input-contact-position"
                  {...register("position")}
                />
              </Field>

              <Field
                label="Тип запроса"
                error={errors.requestType?.message}
                htmlFor="contact-request-type"
              >
                <select
                  id="contact-request-type"
                  className={`${fieldBase} appearance-none cursor-pointer`}
                  data-testid="input-contact-request-type"
                  {...register("requestType")}
                >
                  {REQUEST_TYPES.map((t) => (
                    <option key={t.value} value={t.value}>
                      {t.label}
                    </option>
                  ))}
                </select>
              </Field>

              <Field
                label="Email"
                error={errors.email?.message}
                htmlFor="contact-email"
                hint="Email или телефон — хотя бы одно"
              >
                <input
                  id="contact-email"
                  type="email"
                  autoComplete="email"
                  placeholder="you@company.ru"
                  className={fieldBase}
                  data-testid="input-contact-email"
                  {...register("email")}
                />
              </Field>

              <Field
                label="Телефон"
                error={errors.phone?.message}
                htmlFor="contact-phone"
              >
                <input
                  id="contact-phone"
                  type="tel"
                  autoComplete="tel"
                  placeholder="+7 999 123-45-67"
                  className={fieldBase}
                  data-testid="input-contact-phone"
                  {...register("phone")}
                />
              </Field>

              <Field
                label="Опишите задачу"
                error={errors.message?.message}
                htmlFor="contact-message"
                className="md:col-span-2"
                optional
              >
                <textarea
                  id="contact-message"
                  rows={4}
                  placeholder="Текущие процессы, ожидаемый эффект, ограничения"
                  className={`${fieldBase} resize-none`}
                  data-testid="input-contact-message"
                  {...register("message")}
                />
              </Field>
            </div>

            {/* Consent checkbox — 152-ФЗ requires explicit opt-in */}
            <label
              className="flex items-start gap-3 text-xs text-black/65 leading-relaxed cursor-pointer select-none"
              htmlFor="contact-consent"
            >
              <input
                id="contact-consent"
                type="checkbox"
                className="mt-0.5 w-4 h-4 accent-black flex-shrink-0 cursor-pointer"
                data-testid="input-contact-consent"
                {...register("consent")}
              />
              <span>
                Я даю согласие на обработку персональных данных в соответствии с{" "}
                <a
                  href="/privacy"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline hover:text-black transition-colors"
                >
                  Политикой конфиденциальности
                </a>{" "}
                и Федеральным законом 152-ФЗ.
              </span>
            </label>
            {errors.consent && (
              <p
                className="text-xs text-red-600 font-medium -mt-4"
                role="alert"
              >
                {errors.consent.message}
              </p>
            )}

            {serverError && (
              <motion.p
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-sm text-red-600 font-medium"
                data-testid="contact-server-error"
              >
                {serverError}
              </motion.p>
            )}

            <div className="flex flex-wrap items-center gap-6 pt-2">
              <motion.button
                type="submit"
                disabled={isSubmitting}
                whileHover={{ scale: isSubmitting ? 1 : 1.02 }}
                whileTap={{ scale: isSubmitting ? 1 : 0.98 }}
                data-cursor="view"
                data-cursor-label="Отправить"
                data-testid="button-contact-submit"
                className="inline-flex items-center gap-3 bg-black text-white px-8 py-4 text-xs font-extrabold uppercase tracking-widest hover:bg-amber-400 hover:text-black transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    Отправляем
                    <Loader2 className="w-4 h-4 animate-spin" />
                  </>
                ) : (
                  <>
                    Отправить заявку
                    <ArrowUpRight className="w-4 h-4" />
                  </>
                )}
              </motion.button>
              <p className="text-xs text-black/45 max-w-xs leading-relaxed">
                Ответим в течение одного рабочего дня.
              </p>
            </div>
          </motion.form>
        )}
      </AnimatePresence>
    </div>
  );
}

function Field({
  label,
  error,
  htmlFor,
  optional,
  hint,
  className,
  children,
}: {
  label: string;
  error?: string;
  htmlFor: string;
  optional?: boolean;
  hint?: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={`flex flex-col gap-2 ${className ?? ""}`}>
      <label
        htmlFor={htmlFor}
        className="flex items-center gap-2 text-[10px] uppercase tracking-[0.3em] text-black/55 font-bold"
      >
        {label}
        {optional && (
          <span className="text-black/30 normal-case tracking-normal text-[10px] font-medium">
            необязательно
          </span>
        )}
        {hint && (
          <span className="text-black/35 normal-case tracking-normal text-[10px] font-medium">
            {hint}
          </span>
        )}
      </label>
      {children}
      <AnimatePresence>
        {error && (
          <motion.span
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            className="text-xs text-red-600 font-medium"
            role="alert"
          >
            {error}
          </motion.span>
        )}
      </AnimatePresence>
    </div>
  );
}

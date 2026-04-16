import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowUpRight, Check, Loader2 } from "lucide-react";
import { z } from "zod";
import { useSubmitContact } from "@workspace/api-client-react";
import { easeOutExpo } from "@/lib/motion";

const contactSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Укажите имя (минимум 2 символа)")
    .max(100, "Слишком длинное имя"),
  company: z
    .string()
    .trim()
    .max(200, "Слишком длинное название")
    .optional()
    .or(z.literal("")),
  contact: z
    .string()
    .trim()
    .min(3, "Укажите email или телефон")
    .max(200, "Слишком длинный контакт")
    .refine(
      (v) => /\S+@\S+\.\S+/.test(v) || /[\d+()\-\s]{6,}/.test(v),
      "Введите корректный email или телефон",
    ),
  message: z
    .string()
    .trim()
    .min(10, "Опишите задачу подробнее (минимум 10 символов)")
    .max(4000, "Сообщение слишком длинное"),
});

type ContactFormValues = z.infer<typeof contactSchema>;

const fieldBase =
  "w-full bg-transparent border-b border-black/20 focus:border-black outline-none py-3 text-base md:text-lg font-medium text-black placeholder:text-black/35 transition-colors";

export function ContactForm() {
  const [submitted, setSubmitted] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ContactFormValues>({
    resolver: zodResolver(contactSchema),
    defaultValues: { name: "", company: "", contact: "", message: "" },
  });

  const submitContact = useSubmitContact();

  const onSubmit = async (values: ContactFormValues) => {
    setServerError(null);
    try {
      await submitContact.mutateAsync({
        data: {
          name: values.name,
          company: values.company ? values.company : undefined,
          contact: values.contact,
          message: values.message,
        },
      });
      setSubmitted(true);
      reset();
    } catch (err) {
      setServerError(
        err instanceof Error
          ? err.message
          : "Не удалось отправить заявку. Попробуйте позже.",
      );
    }
  };

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
              Спасибо! Мы свяжемся с вами в ближайшее время.
            </h3>
            <p className="text-black/60 text-base max-w-md">
              Заявка получена. Обычно мы отвечаем в течение одного рабочего дня.
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
                label="Компания"
                error={errors.company?.message}
                htmlFor="contact-company"
                optional
              >
                <input
                  id="contact-company"
                  type="text"
                  autoComplete="organization"
                  placeholder="Название организации"
                  className={fieldBase}
                  data-testid="input-contact-company"
                  {...register("company")}
                />
              </Field>

              <Field
                label="Email или телефон"
                error={errors.contact?.message}
                htmlFor="contact-contact"
                className="md:col-span-2"
              >
                <input
                  id="contact-contact"
                  type="text"
                  autoComplete="email"
                  placeholder="you@company.ru или +7 (___) ___-__-__"
                  className={fieldBase}
                  data-testid="input-contact-contact"
                  {...register("contact")}
                />
              </Field>

              <Field
                label="Сообщение"
                error={errors.message?.message}
                htmlFor="contact-message"
                className="md:col-span-2"
              >
                <textarea
                  id="contact-message"
                  rows={4}
                  placeholder="Расскажите о задаче, текущих процессах, ожидаемом эффекте"
                  className={`${fieldBase} resize-none`}
                  data-testid="input-contact-message"
                  {...register("message")}
                />
              </Field>
            </div>

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
                Нажимая «Отправить», вы соглашаетесь на обработку персональных
                данных.
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
  className,
  children,
}: {
  label: string;
  error?: string;
  htmlFor: string;
  optional?: boolean;
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

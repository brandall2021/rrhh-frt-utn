"use client";

import React, { useState } from "react";
import { motion } from "motion/react";
import {
  Gift,
  Cake,
  Mail,
  CheckCircle,
  XCircle,
  RefreshCw,
  Send,
} from "lucide-react";
import type { UpcomingBirthday } from "@/lib/birthdays";

interface BirthdayViewProps {
  birthdays: UpcomingBirthday[];
  onSendMail: (employeeId: string) => Promise<void>;
  onRefresh: () => void;
}

export default function BirthdayView({
  birthdays,
  onSendMail,
  onRefresh,
}: BirthdayViewProps) {
  const [sendingId, setSendingId] = useState<string | null>(null);
  const [message, setMessage] = useState<{ id: string; type: "success" | "error"; text: string } | null>(null);

  const handleSendMail = async (employeeId: string) => {
    setSendingId(employeeId);
    setMessage(null);
    try {
      await onSendMail(employeeId);
      setMessage({ id: employeeId, type: "success", text: "Mail enviado" });
    } catch {
      setMessage({ id: employeeId, type: "error", text: "Error al enviar" });
    } finally {
      setSendingId(null);
    }
  };

  const today = birthdays.filter((b) => b.daysUntil === 0);
  const upcoming = birthdays.filter((b) => b.daysUntil > 0);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <Gift className="w-5 h-5 text-brand-light" />
            Cumpleaños
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Próximos cumpleaños del personal
          </p>
        </div>
        <button
          onClick={onRefresh}
          className="flex items-center gap-2 px-3 py-2 bg-slate-800/50 hover:bg-slate-700/50 text-slate-300 rounded-xl text-xs font-medium transition-all cursor-pointer border border-slate-700/50"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Actualizar
        </button>
      </div>

      {birthdays.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-slate-500">
          <Cake className="w-12 h-12 mb-3 opacity-30" />
          <p className="text-sm font-medium">No hay cumpleaños próximos</p>
          <p className="text-xs mt-1">No se encontraron cumpleaños en los próximos 30 días</p>
        </div>
      ) : (
        <>
          {today.length > 0 && (
            <section>
              <h2 className="text-sm font-semibold text-brand-light flex items-center gap-2 mb-3">
                <Cake className="w-4 h-4" />
                Cumplen hoy
              </h2>
              <div className="grid gap-3">
                {today.map((b) => (
                  <BirthdayCard
                    key={b.id}
                    birthday={b}
                    isToday
                    sendingId={sendingId}
                    message={message}
                    onSendMail={handleSendMail}
                  />
                ))}
              </div>
            </section>
          )}

          {upcoming.length > 0 && (
            <section>
              <h2 className="text-sm font-semibold text-slate-300 flex items-center gap-2 mb-3">
                Próximos cumpleaños
              </h2>
              <div className="grid gap-3">
                {upcoming.map((b) => (
                  <BirthdayCard
                    key={b.id}
                    birthday={b}
                    isToday={false}
                    sendingId={sendingId}
                    message={message}
                    onSendMail={handleSendMail}
                  />
                ))}
              </div>
            </section>
          )}
        </>
      )}
    </motion.div>
  );
}

function BirthdayCard({
  birthday,
  isToday,
  sendingId,
  message,
  onSendMail,
}: {
  birthday: UpcomingBirthday;
  isToday: boolean;
  sendingId: string | null;
  message: { id: string; type: "success" | "error"; text: string } | null;
  onSendMail: (employeeId: string) => void;
}) {
  const msg = message?.id === birthday.id ? message : null;
  const isSending = sendingId === birthday.id;
  const formattedDate = new Date(birthday.birthDate).toLocaleDateString("es-AR", {
    day: "numeric",
    month: "long",
  });

  return (
    <div
      className={`rounded-xl border p-4 ${
        isToday
          ? "bg-brand/10 border-brand/30"
          : "bg-slate-900/50 border-slate-800"
      }`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div
            className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold ${
              isToday
                ? "bg-brand/20 text-brand-light border border-brand/30"
                : "bg-slate-800 text-slate-300 border border-slate-700"
            }`}
          >
            {birthday.firstName.charAt(0)}{birthday.lastName.charAt(0)}
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-100">
              {birthday.firstName} {birthday.lastName}
            </p>
            <p className="text-xs text-slate-400">
              {formattedDate} · Cumple {birthday.age} años · {birthday.department}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {isToday && (
            <span className="text-brand-light text-xs font-bold flex items-center gap-1">
              <Cake className="w-3.5 h-3.5" />
              HOY
            </span>
          )}
          {!isToday && (
            <span className="text-slate-400 text-xs font-medium">
              {birthday.daysUntil === 1 ? "Mañana" : `En ${birthday.daysUntil} días`}
            </span>
          )}

          <button
            onClick={() => onSendMail(birthday.id)}
            disabled={isSending || !!msg}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer border ${
              msg?.type === "success"
                ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                : msg?.type === "error"
                ? "bg-rose-500/10 text-rose-400 border-rose-500/30"
                : isSending
                ? "bg-slate-800 text-slate-500 border-slate-700 cursor-not-allowed"
                : "bg-slate-800 text-slate-300 border-slate-700 hover:bg-brand hover:text-white hover:border-brand/30"
            }`}
          >
            {msg?.type === "success" ? (
              <><CheckCircle className="w-3.5 h-3.5" /> {msg.text}</>
            ) : msg?.type === "error" ? (
              <><XCircle className="w-3.5 h-3.5" /> {msg.text}</>
            ) : isSending ? (
              <><Send className="w-3.5 h-3.5 animate-pulse" /> Enviando...</>
            ) : (
              <><Mail className="w-3.5 h-3.5" /> Enviar Mail</>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

"use client";

import { useState, useEffect, useCallback } from "react";
import BirthdayView from "@/components/BirthdayView";
import type { UpcomingBirthday } from "@/lib/birthdays";

export default function BirthdaysPage() {
  const [birthdays, setBirthdays] = useState<UpcomingBirthday[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchBirthdays = useCallback(async () => {
    try {
      const res = await fetch("/api/birthdays");
      const { data } = await res.json();
      setBirthdays(data ?? []);
    } catch (err) {
      console.error("Error fetching birthdays:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchBirthdays(); }, [fetchBirthdays]);

  const handleSendMail = async (employeeId: string) => {
    const res = await fetch("/api/birthdays/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ employeeId }),
    });
    if (!res.ok) {
      const { error } = await res.json();
      throw new Error(error);
    }
    await fetchBirthdays();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 text-slate-400">
        Cargando...
      </div>
    );
  }

  return (
    <BirthdayView
      birthdays={birthdays}
      onSendMail={handleSendMail}
      onRefresh={fetchBirthdays}
    />
  );
}

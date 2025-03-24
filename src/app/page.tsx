"use client";

import { useState } from "react";

type Evento = {
  type: string;
  timestamp: string;
  latitude: number | null;
  longitude: number | null;
};

export default function Home() {
  const [events, setEvents] = useState<Evento[]>([]);

  const handleEvent = async (type: string) => {
    const timestamp = new Date().toLocaleString("pt-BR", {
      timeZone: "America/Sao_Paulo",
      hour12: false,
    });
    let latitude: number | null = null;
    let longitude: number | null = null;

    try {
      const position = await new Promise<GeolocationPosition>(
        (resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            enableHighAccuracy: true,
            timeout: 5000,
          });
        }
      );

      latitude = position.coords.latitude;
      longitude = position.coords.longitude;
    } catch (err) {
      console.warn("Localização não obtida:", err);
    }

    const newEvent: Evento = { type, timestamp, latitude, longitude };
    setEvents((prev) => {
      const updated = [...prev, newEvent];
      console.log("Novo evento registrado:", newEvent);
      return updated;
    });
  };

  const downloadFile = () => {
    if (events.length === 0) {
      alert("Nenhum evento registrado ainda.");
      return;
    }

    const blob = new Blob([JSON.stringify(events, null, 2)], {
      type: "application/json",
    });

    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "eventos.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  const buttons = [
    { label: "🛑 Freada Brusca", type: "freada_brusca" },
    { label: "🏎️ Aceleração Forte", type: "aceleracao_forte" },
    { label: "↪️ Curva Abrupta", type: "curva_abrupta" },
    { label: "📱 Mexeu no Celular", type: "mexeu_no_celular" },
    { label: "⚠️ Outro", type: "outro" },
  ];

  return (
    <main className="min-h-screen p-4 bg-black text-white flex flex-col items-center justify-center gap-4">
      <h1 className="text-xl font-bold">Registro Manual de Eventos</h1>
      {buttons.map((btn) => (
        <button
          key={btn.type}
          onClick={() => handleEvent(btn.type)}
          className="w-full text-lg py-6 rounded-2xl bg-red-600 active:bg-red-800 transition-all duration-100"
        >
          {btn.label}
        </button>
      ))}
      <button
        onClick={downloadFile}
        className="w-full text-lg py-4 mt-4 rounded-2xl bg-green-600 hover:bg-green-700"
      >
        📥 Exportar Relatório
      </button>
    </main>
  );
}

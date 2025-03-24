"use client";

import { useState } from "react";

type Evento = {
  type: string;
  timestamp: string;
  latitude: number | null;
  longitude: number | null;
};

type Viagem = {
  viagem: number;
  eventos: Evento[];
};

export default function Home() {
  const [viagens, setViagens] = useState<Viagem[]>([]);
  const [viagemAtual, setViagemAtual] = useState<number | null>(null);

  const iniciarNovaViagem = () => {
    const novaViagem = {
      viagem: viagens.length + 1,
      eventos: [],
    };
    setViagens((prev) => [...prev, novaViagem]);
    setViagemAtual(novaViagem.viagem);
  };

  const handleEvent = async (type: string) => {
    if (viagemAtual === null) {
      alert("Clique em 'Iniciar Nova Viagem' antes de registrar eventos.");
      return;
    }

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

    const novoEvento: Evento = { type, timestamp, latitude, longitude };

    setViagens((prev) =>
      prev.map((v) =>
        v.viagem === viagemAtual
          ? { ...v, eventos: [...v.eventos, novoEvento] }
          : v
      )
    );
  };

  const downloadFile = () => {
    if (viagens.length === 0) {
      alert("Nenhuma viagem registrada.");
      return;
    }

    const blob = new Blob([JSON.stringify(viagens, null, 2)], {
      type: "application/json",
    });

    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "relatorio_viagens.json";
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
      <h1 className="text-xl font-bold text-center">
        Registro Manual de Eventos
      </h1>

      <button
        onClick={iniciarNovaViagem}
        className="w-full text-lg py-4 rounded-2xl bg-blue-600 active:bg-blue-800 transition-all"
      >
        ➕ Iniciar Nova Viagem
      </button>

      {viagemAtual && <p>Registrando: Viagem {viagemAtual}</p>}

      {buttons.map((btn) => (
        <button
          key={btn.type}
          onClick={() => handleEvent(btn.type)}
          className="w-full text-lg py-6 rounded-2xl bg-red-600 active:bg-red-800 transition-all"
        >
          {btn.label}
        </button>
      ))}

      <button
        onClick={downloadFile}
        className="w-full text-lg py-4 mt-4 rounded-2xl bg-green-600 active:bg-green-800 transition-all"
      >
        📥 Exportar Relatório
      </button>
    </main>
  );
}

export default function OnboardingView({ onFinish }) {
  return (
    <div className="text-white space-y-6">
      <h1 className="text-2xl font-bold">Bem-vindo 👋</h1>

      <p>
        Seu salão agora tem uma secretária automática no WhatsApp.
      </p>

      <ul className="list-disc pl-4 space-y-2 text-white/80">
        <li>Agenda automática</li>
        <li>Confirmação de horários</li>
        <li>Atendimento 24h</li>
      </ul>

      <button
        onClick={onFinish}
        className="bg-pink-600 px-6 py-3 rounded-xl"
      >
        Começar 🚀
      </button>
    </div>
  );
}

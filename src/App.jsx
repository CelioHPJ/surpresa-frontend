import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Lock, Unlock, Heart, Sparkles, X, Camera, Music, Volume2, VolumeX } from 'lucide-react';

export default function App() {
  // Estados de Navegação e Dados
  const [telaAtual, setTelaAtual] = useState('ESPERA'); 
  const [mostrarGaleria, setMostrarGaleria] = useState(false);
  const [tempoRestante, setTempoRestante] = useState({ dias: 0, horas: 0, minutos: 0, segundos: 0 });
  
  // Estados da Música
  const [tocando, setTocando] = useState(false);
  const audioRef = useRef(null);

  // Estados do Formulário
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState('');
  const [surpresa, setSurpresa] = useState(null);

  // 1. Lógica do Cronômetro
  useEffect(() => {
    const dataAlvo = new Date('2026-03-02T00:00:00').getTime();
    const intervalo = setInterval(() => {
      const agora = new Date().getTime();
      const diferenca = dataAlvo - agora;

      if (diferenca <= 0) {
        clearInterval(intervalo);
        setTelaAtual('SENHA');
      } else {
        setTempoRestante({
          dias: Math.floor(diferenca / (1000 * 60 * 60 * 24)),
          horas: Math.floor((diferenca % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutos: Math.floor((diferenca % (1000 * 60 * 60)) / (1000 * 60)),
          segundos: Math.floor((diferenca % (1000 * 60)) / 1000)
        });
      }
    }, 1000);
    return () => clearInterval(intervalo);
  }, []);

  // 2. Função Play/Pause
  const alternarMusica = () => {
    if (tocando) {
      audioRef.current.pause();
    } else {
      audioRef.current.play().catch(() => {
        console.log("O navegador bloqueou o autoplay, precisa de um clique!");
      });
    }
    setTocando(!tocando);
  };

  // 3. Desbloquear e Iniciar Música automaticamente
  const tentarDesbloquear = async (e) => {
    e.preventDefault();
    setErro('');
    
    try {
      const resposta = await axios.post('https://surpresa-backend-production.up.railway.app/api/cofre/desbloquear', { senha: senha });
      setSurpresa(resposta.data);
      setTelaAtual('CARTA');
      
      // Tenta dar o play quando ela desbloqueia (garante que o som comece no momento ápice)
      if (!tocando) {
        audioRef.current.play();
        setTocando(true);
      }
    } catch (err) {
      setErro(err.response?.data?.erro || "Ih, o servidor do Célio tá offline! 🔌");
    }
  };

  return (
    <div className="min-h-screen bg-red-50 flex flex-col items-center justify-center p-4 font-sans selection:bg-red-200 overflow-x-hidden">
      
      {/* ================= PLAYER DE ÁUDIO INVISÍVEL ================= */}
      <audio ref={audioRef} src="/musica.mp3" loop />

      {/* ================= BOTÃO FLUTUANTE DE MÚSICA ================= */}
      <button 
        onClick={alternarMusica}
        className={`fixed bottom-6 right-6 z-[100] p-4 rounded-full shadow-2xl transition-all duration-500 flex items-center justify-center
          ${tocando ? 'bg-red-500 text-white animate-spin-slow' : 'bg-white text-red-500 border-2 border-red-100'}`}
      >
        {tocando ? <Volume2 className="w-6 h-6" /> : <VolumeX className="w-6 h-6" />}
        {/* Tooltip fofinho */}
        <span className="absolute right-16 bg-white text-red-500 px-3 py-1 rounded-lg text-xs font-bold shadow-sm border border-red-50 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
          Nossa trilha sonora 🎵
        </span>
      </button>

      {/* ================= TELA 1: O CRONÔMETRO ================= */}
      {telaAtual === 'ESPERA' && (
        <div className="flex flex-col items-center bg-white p-10 rounded-[2.5rem] shadow-[0_20px_50px_rgba(220,38,38,0.15)] border-2 border-red-100 max-w-md w-full relative">
          <Sparkles className="absolute top-6 right-6 text-red-300 w-6 h-6 animate-pulse" />
          <div className="bg-red-100 p-5 rounded-full mb-6">
            <Lock className="w-10 h-10 text-red-500" />
          </div>
          <h1 className="text-3xl font-black text-red-600 mb-2 text-center">Nosso Cofre ❤️</h1>
          <p className="text-red-900/50 mb-8 text-center text-sm font-semibold tracking-wide">FALTA POUCO PARA A SURPRESA:</p>
          <div className="grid grid-cols-4 gap-3 w-full">
            {Object.entries(tempoRestante).map(([label, valor]) => (
              <div key={label} className="bg-red-50 p-3 rounded-2xl border border-red-100 shadow-sm flex flex-col items-center">
                <span className="text-2xl font-black text-red-600">{valor}</span>
                <p className="text-[9px] text-red-400 font-bold uppercase mt-1">{label.substring(0,3)}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ================= TELA 2: A SENHA ================= */}
      {telaAtual === 'SENHA' && (
        <div className="flex flex-col items-center w-full max-w-md bg-white p-10 rounded-[2.5rem] shadow-[0_20px_50px_rgba(220,38,38,0.15)] border-2 border-red-100">
          <div className="bg-red-100 p-5 rounded-full mb-6 animate-bounce">
            <Unlock className="w-10 h-10 text-red-500" />
          </div>
          <h2 className="text-3xl font-black text-red-600 mb-2 text-center">O Tempo Acabou!</h2>
          <form onSubmit={tentarDesbloquear} className="w-full flex flex-col gap-5">
            <div className="flex flex-col gap-3">
              <label className="text-red-500 font-bold text-center text-lg italic">
                {surpresa?.pergunta || "Quem disse 'Eu te amo' primeiro?"}
              </label>
              <input 
                type="text" 
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                className="p-4 rounded-2xl bg-red-50 border-2 border-red-100 text-red-900 text-center text-xl font-bold focus:outline-none focus:border-red-400"
                placeholder="Sua resposta..."
              />
            </div>
            {erro && <p className="text-red-600 text-sm text-center font-bold bg-red-50 p-3 rounded-xl">{erro}</p>}
            <button type="submit" className="bg-red-500 hover:bg-red-600 text-white font-black py-4 px-4 rounded-2xl transition-all shadow-lg active:scale-95">
              ABRIR MEU CORAÇÃO 🥰
            </button>
          </form>
        </div>
      )}

      {/* ================= TELA 3: A CARTA E GALERIA ================= */}
      {telaAtual === 'CARTA' && surpresa && (
        <div className="flex flex-col items-center w-full max-w-2xl bg-white p-8 md:p-12 rounded-[3rem] shadow-[0_25px_60px_rgba(220,38,38,0.2)] border-2 border-red-100 animate-in fade-in zoom-in duration-500">
          <Heart className="w-16 h-16 text-red-500 mb-6 animate-pulse" fill="currentColor" />
          <h2 className="text-3xl md:text-4xl font-black text-red-600 mb-8 text-center uppercase tracking-tighter">6 Meses com Você ❤️</h2>
          <div className="bg-red-50/50 p-6 md:p-10 rounded-[2rem] border-2 border-dashed border-red-200 w-full mb-10 whitespace-pre-line text-red-900 text-lg md:text-xl leading-relaxed text-center font-medium italic">
            "{surpresa.mensagem}"
          </div>
          <button onClick={() => setMostrarGaleria(true)} className="group bg-red-500 hover:bg-red-600 text-white font-black py-5 px-10 rounded-full transition-all flex items-center gap-4 shadow-xl hover:-translate-y-1">
            <Camera className="w-6 h-6 group-hover:rotate-12 transition-transform" /> VER NOSSA GALERIA
          </button>
        </div>
      )}

      {/* ================= MODAL DA GALERIA ================= */}
      {mostrarGaleria && (
        <div className="fixed inset-0 bg-red-900/95 z-50 flex flex-col items-center justify-start p-6 overflow-y-auto backdrop-blur-sm">
          <button onClick={() => setMostrarGaleria(false)} className="fixed top-8 right-8 bg-white text-red-600 p-3 rounded-full shadow-2xl hover:scale-110 transition-transform z-[110]">
            <X className="w-8 h-8" strokeWidth={3} />
          </button>
          <div className="mt-12 mb-10 text-center">
            <h3 className="text-white text-4xl font-black uppercase tracking-widest">Nossos Momentos</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10 max-w-6xl pb-20">
             {/* Aqui você repete os blocos de fotos de 1 a 6 como no código anterior */}
             {[1,2,3,4,5,6].map((num) => (
                <div key={num} className={`bg-white p-4 pt-4 pb-12 rounded-sm shadow-2xl transition-all duration-300 ${num % 2 === 0 ? 'rotate-2' : '-rotate-2'} hover:rotate-0`}>
                  <img src={`/fotos/foto${num}.jpeg`} alt={`Foto ${num}`} className="w-full h-64 object-cover grayscale-[20%] hover:grayscale-0 transition-all" />
                  <p className="text-gray-700 font-serif text-xl mt-6 text-center italic">Momentos inesquecíveis...</p>
                </div>
             ))}
          </div>
        </div>
      )}
    </div>
  );
}
import { useState, useEffect } from 'react';
import './App.css';

// --- Componente de UI: Notificação ---
// Um pop-up que aparece e some sozinho.
function Notification({ message, onDismiss }) {
  useEffect(() => {
    const timer = setTimeout(() => onDismiss(), 2500); // A notificação some após 2.5 segundos
    return () => clearTimeout(timer);
  }, [onDismiss]);

  return <div className="notification">{message}</div>;
}

// --- Componente de UI: Botão de Copiar ---
// Um botão reutilizável que copia um texto e ativa a notificação.
function CopyButton({ textToCopy, onCopy }) {
  const handleCopy = () => {
    navigator.clipboard.writeText(textToCopy).then(() => {
      onCopy('Copiado!'); // Avisa o componente pai que a cópia foi um sucesso
    }).catch(err => {
      console.error('Erro ao copiar:', err);
      onCopy('Erro ao copiar.'); // Avisa que deu erro
    });
  };

  return <button onClick={handleCopy} className="copy-button">Copiar</button>;
}


// --- Ferramenta 1: Gerador de Roteiro ---
function RoteiroTool({ onRoteiroGenerated }) {
  const [tema, setTema] = useState('');
  const [gerandoRoteiro, setGerandoRoteiro] = useState(false);
  const [erro, setErro] = useState(null);

  const handleGenerateRoteiro = async () => {
    setGerandoRoteiro(true);
    setErro(null);
    try {
      const response = await fetch('https://meu-site-ia-api.onrender.com/api/generate-roteiro', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tema }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erro na API de roteiro');
      }
      const data = await response.json();
      onRoteiroGenerated(data.roteiro);
    } catch (error) {
      console.error('Erro ao gerar roteiro:', error);
      setErro('Desculpe, houve um erro ao gerar seu roteiro. Tente novamente ou aguarde alguns minutos.');
    } finally {
      setGerandoRoteiro(false);
    }
  };

  return (
    <div className="tool-container">
      <h2>1. Gerar Roteiro</h2>
      <div className="form-container">
        <label htmlFor="tema">Descreva o tema do seu vídeo:</label>
        <textarea
          id="tema"
          rows="4"
          placeholder="Ex: A história bizarra do garfo..."
          value={tema}
          onChange={(e) => setTema(e.target.value)}
        />
        <button 
          className="generate-button principal" 
          onClick={handleGenerateRoteiro} 
          disabled={gerandoRoteiro}
        >
          {gerandoRoteiro ? 'Gerando...' : 'Gerar Roteiro'}
        </button>
      </div>
      {erro && <div className="error-message">{erro}</div>}
    </div>
  );
}

// --- Ferramenta 2: Gerador de Prompts de Imagem ---
function ImagePromptTool({ roteiro, setNotification }) {
  const [prompts, setPrompts] = useState('');
  const [gerandoPrompts, setGerandoPrompts] = useState(false);
  const [erro, setErro] = useState(null);

  const styleSuffix = "Masterpiece, melhor qualidade, ultra-detalhado, ilustração profissional, arte de linha (line art) limpa e intrincada, estilo de anime maduro e cinematográfico, sombreamento cel-shaded com gradientes suaves, iluminação dramática de chiaroscuro, paleta de cores quentes com tons dourados e sépia, estética vintage dos anos 1940, textura visível nos tecidos e superfícies, composição de ângulo dinâmico.";

  const handleGeneratePrompts = async () => {
    setGerandoPrompts(true);
    setErro(null);
    try {
      const response = await fetch('https://meu-site-ia-api.onrender.com/api/generate-image-prompts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ roteiro }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erro na API de prompts');
      }
      const data = await response.json();
      setPrompts(data.prompts);
    } catch (error) {
      console.error('Erro ao gerar prompts:', error);
      setErro('Desculpe, houve um erro ao gerar os prompts.');
    } finally {
      setGerandoPrompts(false);
    }
  };

  const renderPrompts = () => {
    if (!prompts) return null;
    const takes = prompts.split('Take ').slice(1);
    return takes.map((takeBlock, index) => {
      const lines = takeBlock.trim().split('\n');
      const takeTitle = `Take ${lines[0]}`;
      const promptLines = lines.slice(1);
      return (
        <div key={index} className="take-container">
          <h4>{takeTitle}</h4>
          {promptLines.map((promptLine, pIndex) => {
            const promptText = promptLine.replace(/— Prompt \d: /, '').trim();
            const fullPromptToCopy = `${promptText}, ${styleSuffix}`;
            return (
              <div key={pIndex} className="prompt-item">
                <p>{promptLine}</p>
                <CopyButton textToCopy={fullPromptToCopy} onCopy={setNotification} />
              </div>
            );
          })}
        </div>
      );
    });
  };

  return (
    <div className="tool-container">
      <h2>2. Gerar Prompts de Imagem</h2>
      <button onClick={handleGeneratePrompts} disabled={gerandoPrompts} className="principal">
        {gerandoPrompts ? 'Criando Arte...' : 'Gerar Prompts para este Roteiro'}
      </button>
      {erro && <div className="error-message">{erro}</div>}
      {gerandoPrompts && <p className="loading-message">Consultando os mestres da arte...</p>}
      
      {prompts && (
        <div className="prompts-result">
          <h3>Prompts Gerados:</h3>
          {renderPrompts()}
          <div className="actions-container">
             <button onClick={() => window.open('https://labs.google/fx/pt/tools/whisk', '_blank')} className="secondary-button">
                Testar no Whisk ↗️
             </button>
          </div>
        </div>
      )}
    </div>
  );
}

// --- Componente Principal do App ---
function App() {
  const [roteiro, setRoteiro] = useState('');
  const [notification, setNotification] = useState('');

  const handleAudioRedirect = () => {
    if (!roteiro) return;
    const styleInstruction = "Narre o texto abaixo com voz jovem, envolvente e expressiva. Use tom de surpresa e curiosidade nos takes, variando a intensidade para destacar o absurdo das situações. Comece com energia e entusiasmo no hook da introdução e termine de forma descontraída, incentivando a participação do público no encerramento.";
    const textToCopy = `[COLE ISTO NO CAMPO "STYLE INSTRUCTIONS"]\n${styleInstruction}\n\n[COLE ISTO NO CAMPO PRINCIPAL DE TEXTO]\n${roteiro}`;
    
    navigator.clipboard.writeText(textToCopy).then(() => {
      setNotification('Roteiro e instruções copiados!');
    }).catch(err => {
      console.error('Erro ao copiar:', err);
      setNotification('Erro ao copiar.');
    });

    const aiStudioUrl = `https://aistudio.google.com/generate/speech`;
    window.open(aiStudioUrl, '_blank');
  };

  return (
    <>
      {notification && <Notification message={notification} onDismiss={() => setNotification('')} />}
      <header>
        <h1>Criador de Conteúdo IA</h1>
      </header>
      <main>
        <RoteiroTool onRoteiroGenerated={setRoteiro} />
        
        {roteiro && (
          <div className="roteiro-display">
            <h3>Roteiro Gerado:</h3>
            <textarea readOnly value={roteiro} rows="10" />
            <div className="result-actions">
              <button onClick={handleAudioRedirect} className="secondary-button">
                Gerar Áudio no AI Studio ↗️
              </button>
            </div>
            <hr />
            <ImagePromptTool roteiro={roteiro} setNotification={setNotification} />
          </div>
        )}
      </main>
      <footer>
        <p>Uma ferramenta para dar vida às suas ideias.</p>
      </footer>
    </>
  );
}

export default App;

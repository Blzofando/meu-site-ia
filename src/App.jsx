import { useState, useEffect } from 'react';
import './App.css';

// --- Componentes de UI Auxiliares ---

function Notification({ message, onDismiss }) {
  useEffect(() => {
    const timer = setTimeout(() => onDismiss(), 3000);
    return () => clearTimeout(timer);
  }, [onDismiss]);
  return <div className="notification">{message}</div>;
}

function CopyButton({ textToCopy, onCopy, children }) {
  const handleCopy = () => {
    navigator.clipboard.writeText(textToCopy).then(() => {
      onCopy('Copiado!');
    }).catch(err => {
      console.error('Erro ao copiar:', err);
      onCopy('Erro ao copiar.');
    });
  };
  return <button onClick={handleCopy} className="copy-button">{children || 'Copiar'}</button>;
}

// --- Ferramentas Principais ---

function RoteiroTool({ onRoteiroGenerated }) {
  const [tema, setTema] = useState('');
  const [gerando, setGerando] = useState(false);
  const [erro, setErro] = useState(null);

  const handleGenerate = async () => {
    setGerando(true);
    setErro(null);
    try {
      const response = await fetch('https://meu-site-ia-api.onrender.com/api/generate-roteiro', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tema }),
      });
      if (!response.ok) throw new Error('Erro na API de roteiro');
      const data = await response.json();
      onRoteiroGenerated(data.roteiro);
    } catch (error) {
      console.error(error);
      setErro('Desculpe, houve um erro ao gerar seu roteiro.');
    } finally {
      setGerando(false);
    }
  };

  return (
    <div className="tool-container">
      <h2>1. Gerar Roteiro</h2>
      <div className="form-container">
        <label htmlFor="tema">Descreva o tema do seu vídeo:</label>
        <textarea id="tema" rows="4" placeholder="Ex: A história bizarra do garfo..." value={tema} onChange={(e) => setTema(e.target.value)} />
        <button className="generate-button principal" onClick={handleGenerate} disabled={gerando}>
          {gerando ? 'Gerando...' : 'Gerar Roteiro'}
        </button>
      </div>
      {erro && <div className="error-message">{erro}</div>}
    </div>
  );
}

function ImagePromptTool({ roteiro, onPromptsGenerated }) {
  const [gerando, setGerando] = useState(false);
  const [erro, setErro] = useState(null);

  const handleGenerate = async () => {
    setGerando(true);
    setErro(null);
    try {
      const response = await fetch('https://meu-site-ia-api.onrender.com/api/generate-image-prompts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ roteiro }),
      });
      if (!response.ok) throw new Error('Erro na API de prompts de imagem');
      const data = await response.json();
      onPromptsGenerated(data.prompts);
    } catch (error) {
      console.error(error);
      setErro('Desculpe, houve um erro ao gerar os prompts de imagem.');
    } finally {
      setGerando(false);
    }
  };

  return (
    <div className="tool-container">
      <h3>Próximo Passo: Imagens</h3>
      <button onClick={handleGenerate} disabled={gerando} className="principal">
        {gerando ? 'Criando Arte...' : 'Gerar Prompts de Imagem'}
      </button>
      {gerando && <p className="loading-message">Consultando os mestres da arte...</p>}
      {erro && <div className="error-message">{erro}</div>}
    </div>
  );
}

function MotionPromptTool({ imagePrompts, setNotification }) {
  const [motionPrompts, setMotionPrompts] = useState('');
  const [gerando, setGerando] = useState(false);
  const [erro, setErro] = useState(null);

  const handleGenerate = async () => {
    setGerando(true);
    setErro(null);
    try {
      const response = await fetch('https://meu-site-ia-api.onrender.com/api/generate-motion-prompts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imagePrompts }),
      });
      if (!response.ok) throw new Error('Erro na API de prompts de movimento');
      const data = await response.json();
      setMotionPrompts(data.motionPrompts);
    } catch (error) {
      console.error(error);
      setErro('Desculpe, houve um erro ao gerar os prompts de movimento.');
    } finally {
      setGerando(false);
    }
  };
  
  const renderMotionPrompts = () => {
    if (!motionPrompts) return null;
    const takes = motionPrompts.split('— Take').slice(1);
    return takes.map((takeBlock, tIndex) => {
        const prompts = takeBlock.split('— Prompt').slice(1);
        const takeNumber = takeBlock.trim().split('\n')[0].trim();
        return (
            <div key={tIndex} className="take-container">
                <h4>Take {takeNumber}</h4>
                {prompts.map((promptBlock, pIndex) => {
                    const lines = promptBlock.trim().split('\n');
                    const promptTitle = `— Prompt ${lines[0]}`;
                    const movementLines = lines.slice(1);
                    const imagePromptDescription = promptTitle.replace(/— Prompt \d: /, '').trim();
                    const fullTextToCopy = `${imagePromptDescription}\n${movementLines.join('\n')}`;
                    return (
                        <div key={pIndex} className="prompt-group">
                            <h5>{promptTitle}</h5>
                            {movementLines.map((moveLine, mIndex) => ( <p key={mIndex}>{moveLine}</p> ))}
                            <CopyButton textToCopy={fullTextToCopy} onCopy={setNotification}>
                                Copiar Bloco de Movimento
                            </CopyButton>
                        </div>
                    )
                })}
            </div>
        )
    });
  };

  return (
    <div className="tool-container">
      <h3>Último Passo: Movimento</h3>
      <button onClick={handleGenerate} disabled={gerando} className="principal">
        {gerando ? 'Animando Cenas...' : 'Gerar Prompts de Movimento'}
      </button>
      {gerando && <p className="loading-message">Coreografando a cena...</p>}
      {erro && <div className="error-message">{erro}</div>}
      {motionPrompts && (
        <div className="prompts-result">
          <h3>Prompts de Movimento Gerados:</h3>
          {renderMotionPrompts()}
        </div>
      )}
    </div>
  );
}

// --- Componente Principal do App ---
function App() {
  const [roteiro, setRoteiro] = useState('');
  const [imagePrompts, setImagePrompts] = useState('');
  const [notification, setNotification] = useState('');

  const handleAudioRedirect = () => {
    if (!roteiro) return;
    const parts = roteiro.split('---');
    const cleanRoteiro = parts.length > 1 ? parts[1].trim() : roteiro.trim();
    const styleInstruction = "Narre o texto abaixo com voz jovem, envolvente e expressiva. Use tom de surpresa e curiosidade nos takes, variando a intensidade para destacar o absurdo das situações. Comece com energia e entusiasmo no hook da introdução e termine de forma descontraída, incentivando a participação do público no encerramento.";
    const textToCopy = `[COLE ISTO NO CAMPO "STYLE INSTRUCTIONS"]\n${styleInstruction}\n\n[COLE ISTO NO CAMPO PRINCIPAL DE TEXTO]\n${cleanRoteiro}`;
    
    navigator.clipboard.writeText(textToCopy).then(() => {
      setNotification('Roteiro e instruções copiados!');
    }).catch(err => {
      console.error('Erro ao copiar:', err);
      setNotification('Erro ao copiar.');
    });

    const aiStudioUrl = `https://aistudio.google.com/generate-speech`;
    window.open(aiStudioUrl, '_blank');
  };
  
  const renderImagePrompts = () => {
    if (!imagePrompts) return null;
    const styleSuffix = "Masterpiece, melhor qualidade, ultra-detalhado, ilustração profissional, arte de linha (line art) limpa e intrincada, estilo de anime maduro e cinematográfico, sombreamento cel-shaded com gradientes suaves, iluminação dramática de chiaroscuro, paleta de cores quentes com tons dourados e sépia, estética vintage dos anos 1940, textura visível nos tecidos e superfícies, composição de ângulo dinâmico.";
    const takes = imagePrompts.split('Take ').slice(1);
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
    <>
      {notification && <Notification message={notification} onDismiss={() => setNotification('')} />}
      <header>
        <h1>historIA</h1>
      </header>
      <main>
        <RoteiroTool onRoteiroGenerated={(r) => { setRoteiro(r); setImagePrompts(''); }} />
        
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
            <ImagePromptTool roteiro={roteiro} onPromptsGenerated={setImagePrompts} />
          </div>
        )}

        {imagePrompts && (
            <div className="image-prompts-display">
                <h3>Prompts de Imagem Gerados:</h3>
                {renderImagePrompts()}
                <div className="actions-container">
                    <button onClick={() => window.open('https://labs.google/fx/pt/tools/whisk', '_blank')} className="secondary-button">
                        Testar no Whisk ↗️
                    </button>
                </div>
                <hr />
                <MotionPromptTool imagePrompts={imagePrompts} setNotification={setNotification} />
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

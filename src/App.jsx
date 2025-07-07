import { useState, useEffect } from 'react';
import './App.css';

// --- Componentes de UI ---

// Notificação de "Copiado!"
function Notification({ message, onDismiss }) {
  useEffect(() => {
    const timer = setTimeout(() => onDismiss(), 3000);
    return () => clearTimeout(timer);
  }, [onDismiss]);
  return <div className="notification">{message}</div>;
}

// Botão de Copiar
function CopyButton({ textToCopy }) {
  const [notification, setNotification] = useState('');
  
  const handleCopy = () => {
    navigator.clipboard.writeText(textToCopy).then(() => {
      setNotification('Copiado!');
    }).catch(err => {
      console.error('Erro ao copiar:', err);
      setNotification('Erro!');
    });
  };

  return (
    <>
      {/* Mostra uma notificação temporária local para este botão */}
      {notification && <Notification message={notification} onDismiss={() => setNotification('')} />}
      <button onClick={handleCopy} className="copy-button">Copiar</button>
    </>
  );
}


// --- Ferramentas Principais ---

// Ferramenta de Geração de Roteiro
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
      onRoteiroGenerated(data.roteiro); // Passa o roteiro gerado para o App principal
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
          placeholder="Ex: A história bizarra do garfo e como a igreja o considerava um objeto do diabo."
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

// Ferramenta de Geração de Prompts de Imagem
function ImagePromptTool({ roteiro }) {
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

  // Função para parsear e renderizar os prompts
  const renderPrompts = () => {
    if (!prompts) return null;
    
    // Divide o texto em blocos de "Take"
    const takes = prompts.split('Take ').slice(1);

    return takes.map((takeBlock, index) => {
      // Divide cada bloco em linhas
      const lines = takeBlock.trim().split('\n');
      const takeTitle = `Take ${lines[0]}`;
      const promptLines = lines.slice(1);

      return (
        <div key={index} className="take-container">
          <h4>{takeTitle}</h4>
          {promptLines.map((promptLine, pIndex) => {
            const promptText = promptLine.replace('— Prompt ' + (pIndex + 1) + ': ', '').trim();
            const fullPromptToCopy = `${promptText}, ${styleSuffix}`;
            return (
              <div key={pIndex} className="prompt-item">
                <p>{promptLine}</p>
                <CopyButton textToCopy={fullPromptToCopy} />
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
      <div className="actions-container">
        <button onClick={handleGeneratePrompts} disabled={gerandoPrompts} className="principal">
          {gerandoPrompts ? 'Criando Arte...' : 'Gerar Prompts para este Roteiro'}
        </button>
        <button onClick={() => window.open('https://labs.google/fx/pt/tools/whisk', '_blank')} className="secondary-button">
          Abrir Whisk ↗️
        </button>
      </div>
      {erro && <div className="error-message">{erro}</div>}
      {gerandoPrompts && <p className="loading-message">Consultando os mestres da arte...</p>}
      {prompts && (
        <div className="prompts-result">
          <h3>Prompts Gerados:</h3>
          {renderPrompts()}
        </div>
      )}
    </div>
  );
}


// --- Componente Principal do App ---
function App() {
  const [roteiro, setRoteiro] = useState('');

  return (
    <>
      <header>
        <h1>Criador de Conteúdo IA</h1>
      </header>
      <main>
        <RoteiroTool onRoteiroGenerated={setRoteiro} />
        {roteiro && (
          <>
            <div className="roteiro-display">
              <h3>Roteiro Gerado:</h3>
              <textarea readOnly value={roteiro} rows="10" />
            </div>
            <hr />
            <ImagePromptTool roteiro={roteiro} />
          </>
        )}
      </main>
      <footer>
        <p>Uma ferramenta para dar vida às suas ideias.</p>
      </footer>
    </>
  );
}

export default App;

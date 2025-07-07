import { useState, useEffect } from 'react';
import './App.css';

// Componente para a notificação "Copiado!"
function Notification({ message, onDismiss }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onDismiss();
    }, 3000); // Notificação some após 3 segundos
    return () => clearTimeout(timer);
  }, [onDismiss]);

  return <div className="notification">{message}</div>;
}

// Componente Principal do App
function App() {
  const [tema, setTema] = useState('');
  const [roteiro, setRoteiro] = useState('');
  const [gerandoRoteiro, setGerandoRoteiro] = useState(false);
  const [erro, setErro] = useState(null);
  const [notification, setNotification] = useState('');

  // Função para gerar o roteiro (continua a mesma)
  const handleGenerateRoteiro = async () => {
    setGerandoRoteiro(true);
    setRoteiro('');
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
      setRoteiro(data.roteiro);
    } catch (error) {
      console.error('Erro ao gerar roteiro:', error);
      setErro('Desculpe, houve um erro ao gerar seu roteiro. Tente novamente ou aguarde alguns minutos.');
    } finally {
      setGerandoRoteiro(false);
    }
  };

  // Função que copia o roteiro E as instruções, e redireciona
  const handleAudioRedirect = () => {
    if (!roteiro) return;

    // Preparamos a instrução e o roteiro para serem copiados
    const styleInstruction = "Narre o texto abaixo com voz jovem, envolvente e expressiva. Use tom de surpresa e curiosidade nos takes, variando a intensidade para destacar o absurdo das situações. Comece com energia e entusiasmo no hook da introdução e termine de forma descontraída, incentivando a participação do público no encerramento.";
    const textToCopy = `[COLE ISTO NO CAMPO "STYLE INSTRUCTIONS"]\n${styleInstruction}\n\n[COLE ISTO NO CAMPO PRINCIPAL DE TEXTO]\n${roteiro}`;
    
    // Copia para a área de transferência
    navigator.clipboard.writeText(textToCopy).then(() => {
      setNotification('Roteiro e instruções copiados!');
    }).catch(err => {
      console.error('Erro ao copiar:', err);
      setNotification('Erro ao copiar.');
    });

    // ========================================================
    // AQUI ESTÁ A CORREÇÃO COM O LINK ATUALIZADO QUE VOCÊ PEDIU
    // ========================================================
    const aiStudioUrl = `https://aistudio.google.com/generate-speech`;
    window.open(aiStudioUrl, '_blank');
  };

  return (
    <>
      {notification && <Notification message={notification} onDismiss={() => setNotification('')} />}

      <h1>Roteiros IA</h1>
      
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
          className="generate-button" 
          onClick={handleGenerateRoteiro} 
          disabled={gerandoRoteiro}
        >
          {gerandoRoteiro ? 'Gerando...' : 'Gerar Roteiro!'}
        </button>
      </div>

      {erro && <div className="error-message">{erro}</div>}

      <div className="result-container">
        {gerandoRoteiro && <p className="loading-message">Analisando os anais da história...</p>}
        
        {roteiro && (
          <div className="roteiro-result">
            <h3>Seu Roteiro:</h3>
            <textarea readOnly value={roteiro} rows="15" />
            <div className="result-actions">
              <button onClick={handleAudioRedirect} className="principal">
                Gerar Áudio no AI Studio ↗️
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

export default App;

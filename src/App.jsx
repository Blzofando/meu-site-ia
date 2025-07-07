import { useState } from 'react'
import './App.css'

function App() {
  const [tema, setTema] = useState('');
  const [roteiro, setRoteiro] = useState('');
  const [audioUrl, setAudioUrl] = useState(''); // NOVO: Para guardar a URL do áudio
  const [gerandoRoteiro, setGerandoRoteiro] = useState(false);
  const [gerandoAudio, setGerandoAudio] = useState(false); // NOVO: Para o loading do áudio

  const handleGenerateRoteiro = async () => {
    setGerandoRoteiro(true);
    setRoteiro('');
    setAudioUrl(''); // Limpa o áudio anterior

    try {
      const response = await fetch('https://meu-site-ia-api.onrender.com/api/generate-roteiro', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tema }),
      });
      if (!response.ok) throw new Error('Erro na API de roteiro');
      const data = await response.json();
      setRoteiro(data.roteiro);
    } catch (error) {
      console.error('Erro ao gerar roteiro:', error);
      alert('Desculpe, houve um erro ao gerar seu roteiro.');
    } finally {
      setGerandoRoteiro(false);
    }
  };

  // NOVA FUNÇÃO PARA O BOTÃO DE ÁUDIO
  const handleGenerateAudio = async () => {
    setGerandoAudio(true);
    setAudioUrl('');

    try {
      const response = await fetch('https://meu-site-ia-api.onrender.com/api/generate-audio', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ texto: roteiro }), // Envia o roteiro gerado
      });
      if (!response.ok) throw new Error('Erro na API de áudio');
      
      // Converte a resposta (que é um arquivo) para um formato que o navegador entende
      const audioBlob = await response.blob();
      const url = URL.createObjectURL(audioBlob);
      setAudioUrl(url);

    } catch (error) {
      console.error('Erro ao gerar áudio:', error);
      alert('Desculpe, houve um erro ao gerar seu áudio.');
    } finally {
      setGerandoAudio(false);
    }
  };


  return (
    <>
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

      <div className="result-container">
        {gerandoRoteiro && <p className="loading-message">Analisando os anais da história...</p>}
        
        {roteiro && (
          <div className="roteiro-result">
            <h3>Seu Roteiro:</h3>
            <textarea readOnly value={roteiro} rows="15" />
            <div className="result-actions">
              <button>Copiar Roteiro</button>
              {/* Botão de áudio agora funciona! */}
              <button 
                className="principal" 
                onClick={handleGenerateAudio}
                disabled={gerandoAudio}
              >
                {gerandoAudio ? 'Narrando...' : 'Próximo Passo: Gerar Áudio'}
              </button>
            </div>

            {/* Player de áudio que só aparece quando o áudio está pronto */}
            {gerandoAudio && <p className="loading-message">Preparando o locutor das trevas...</p>}
            {audioUrl && (
              <div className="audio-player-container">
                <h4>Sua Narração:</h4>
                <audio controls src={audioUrl}>
                  Seu navegador não suporta o elemento de áudio.
                </audio>
              </div>
            )}
          </div>
        )}
      </div>
    </>
  )
}

export default App
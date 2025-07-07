import { useState } from 'react'
import './App.css'

function App() {
  // Estados que vamos manter: tema, roteiro, loading do roteiro e erros.
  const [tema, setTema] = useState('');
  const [roteiro, setRoteiro] = useState('');
  const [gerandoRoteiro, setGerandoRoteiro] = useState(false);
  const [erro, setErro] = useState(null); // Ótima adição sua!

  // A função para gerar o roteiro continua a mesma, funcionando perfeitamente.
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
        // Se a resposta da API não for bem-sucedida, lemos o erro que nosso backend enviou
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erro na API de roteiro');
      }
      const data = await response.json();
      setRoteiro(data.roteiro);
    } catch (error) {
      console.error('Erro ao gerar roteiro:', error);
      setErro('Desculpe, houve um erro ao gerar seu roteiro. Tente novamente.');
    } finally {
      setGerandoRoteiro(false);
    }
  };

  // ========================================================================
  // NOVA FUNÇÃO DE ÁUDIO - Implementando sua ideia de redirecionamento
  // ========================================================================
  const handleRedirectToAIStudio = () => {
    // 1. Definimos as instruções e a voz que queremos pré-preencher
    const styleInstruction = "Narre o texto abaixo com voz jovem, envolvente e expressiva. Use tom de surpresa e curiosidade nos takes das leis, variando a intensidade para destacar o absurdo das situações. Comece com energia e entusiasmo no hook da introdução e termine de forma descontraída, incentivando a participação do público no encerramento.";
    const voice = "Enceladus"; // A voz que você escolheu

    // 2. Criamos o texto completo que será inserido no campo de texto do AI Studio
    const fullText = `${styleInstruction}\n\nO texto para narrar é:\n\n${roteiro}`;

    // 3. Codificamos o texto para que ele possa ser enviado em uma URL sem erros
    const encodedText = encodeURIComponent(fullText);

    // 4. Montamos a URL final com os parâmetros para pré-preencher o formulário
    // (Nota: A URL exata e os parâmetros podem mudar, mas esta é a estrutura lógica)
    const aiStudioUrl = `https://aistudio.google.com/generate/speech?text=${encodedText}&voice=${voice}`;

    // 5. Abrimos o AI Studio em uma nova aba do navegador do usuário
    console.log("Redirecionando para o AI Studio:", aiStudioUrl);
    window.open(aiStudioUrl, '_blank');
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

      {/* Mantive sua ótima ideia de exibir uma mensagem de erro clara */}
      {erro && <div className="error-message">{erro}</div>}

      <div className="result-container">
        {gerandoRoteiro && <p className="loading-message">Analisando os anais da história...</p>}
        
        {roteiro && (
          <div className="roteiro-result">
            <h3>Seu Roteiro:</h3>
            <textarea readOnly value={roteiro} rows="15" />
            <div className="result-actions">
              <button>Copiar Roteiro</button>
              
              {/* Botão de áudio agora redireciona para o AI Studio */}
              <button 
                className="principal" 
                onClick={handleRedirectToAIStudio}
              >
                Gerar Áudio no AI Studio ↗️
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  )
}

export default App;

import { useState } from 'react'
import './App.css'

function App() {
  // Nossos estados: para o tema, para o roteiro final, e para saber se está carregando.
  const [tema, setTema] = useState('');
  const [roteiro, setRoteiro] = useState('');
  const [carregando, setCarregando] = useState(false);

  // A função que agora chama nossa Netlify Function!
  const handleGenerate = async () => {
    // 1. Avisa que estamos carregando
    setCarregando(true);
    setRoteiro(''); // Limpa o roteiro anterior

    try {
      // 2. Chama o "garçom" (nossa função)
      const response = await fetch('https://meu-site-ia-api.onrender.com/api/generate-roteiro', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        // 3. Envia o "pedido" (o tema) para o garçom
        body: JSON.stringify({ tema }),
      });

      // Se o garçom não trouxe um prato bom, avisa o erro.
      if (!response.ok) {
        throw new Error('A resposta da rede não foi boa.');
      }

      // 4. Pega o "prato" (o roteiro) que o garçom trouxe
      const data = await response.json();
      
      // 5. Coloca o roteiro na nossa "memória" para exibir na tela
      setRoteiro(data.roteiro);

    } catch (error) {
      console.error('Erro ao gerar roteiro:', error);
      alert('Desculpe, houve um erro ao gerar seu roteiro. Tente novamente.');
    } finally {
      // 6. Avisa que terminamos de carregar, não importa se deu certo ou errado
      setCarregando(false);
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
          placeholder="Ex: A história bizarra do garfo e como a igreja o considerava um objeto do diabo."
          value={tema}
          onChange={(e) => setTema(e.target.value)}
        />
        <button 
          className="generate-button" 
          onClick={handleGenerate} 
          disabled={carregando} // Desabilita o botão enquanto carrega
        >
          {carregando ? 'Gerando...' : 'Gerar Roteiro!'}
        </button>
      </div>

      {/* Área de Resultado */}
      <div className="result-container">
        {/* Se estiver carregando, mostra a mensagem */}
        {carregando && <p className="loading-message">Gerando seu roteiro, aguarde...</p>}
        
        {/* Se já tiver um roteiro, mostra a caixa de resultado */}
        {roteiro && (
          <div className="roteiro-result">
            <h3>Seu Roteiro:</h3>
            <textarea readOnly value={roteiro} rows="20" />
            <div className="result-actions">
              <button>Copiar Roteiro</button>
              <button className="principal">Próximo Passo: Gerar Áudio</button>
            </div>
          </div>
        )}
      </div>
    </>
  )
}

export default App
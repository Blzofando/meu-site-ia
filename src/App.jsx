import React, { useState } from 'react';
import './App.css';

// =================================================================
// PÁGINA INICIAL (Componente HomePage)
// =================================================================
function HomePage({ setCurrentPage }) {
  return (
    <div className="homepage-container">
      <header className="homepage-header">
        {/* TÍTULO ATUALIZADO */}
        <h1>historIA</h1>
        <p className="subtitle">Desenterre histórias que o tempo tentou apagar. Transforme qualquer tema em vídeos sombrios e impactantes.</p>
      </header>
      
      <main className="homepage-main">
        <button 
          className="cta-button" 
          onClick={() => setCurrentPage('workflow')}
        >
          Inicie seu vídeo por aqui
        </button>
      </main>

      <section className="tools-section">
        <h2>Ferramentas Individuais</h2>
        <div className="tools-grid">
          <button className="tool-card" onClick={() => alert('Página em construção!')}>
            <h3>Gerador de Roteiro</h3>
            <p>Tem uma ideia? Comece com um roteiro completo.</p>
          </button>
          <button className="tool-card" onClick={() => alert('Página em construção!')}>
            <h3>Prompts de Imagem</h3>
            <p>Já tem um roteiro? Crie os visuais para ele.</p>
          </button>
          <button className="tool-card" onClick={() => alert('Página em construção!')}>
            <h3>Prompts de Movimento</h3>
            <p>Já tem as imagens? Dê vida a elas com movimento.</p>
          </button>
        </div>
      </section>
    </div>
  );
}


// =================================================================
// PÁGINA DE FLUXO DE TRABALHO (Placeholder)
// =================================================================
function WorkflowPage({ setCurrentPage }) {
  // TODO: Construir o fluxo passo a passo aqui na próxima fase.
  return (
    <div>
      <h1>Fluxo de Trabalho Guiado</h1>
      <p>Aqui construiremos o passo a passo.</p>
      <button onClick={() => setCurrentPage('home')}>Voltar para o Início</button>
    </div>
  );
}


// =================================================================
// COMPONENTE PRINCIPAL (App)
// =================================================================
function App() {
  // Estado para controlar a página atual ('home' ou 'workflow')
  const [currentPage, setCurrentPage] = useState('home');

  // Função para renderizar a página correta
  const renderPage = () => {
    switch (currentPage) {
      case 'workflow':
        return <WorkflowPage setCurrentPage={setCurrentPage} />;
      case 'home':
      default:
        return <HomePage setCurrentPage={setCurrentPage} />;
    }
  };

  return (
    <div className="app-container">
      {renderPage()}
      <footer>
        <p>Uma ferramenta para dar vida às suas ideias.</p>
      </footer>
    </div>
  );
}

export default App;

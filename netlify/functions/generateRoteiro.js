// Passo 1: Importar a ferramenta de comunicação do Google
const { GoogleGenerativeAI } = require('@google/generative-ai');

// A "receita" do nosso prompt, que criamos juntos
const getMasterPrompt = (temaDoUsuario) => {
  return `[INSTRUÇÃO SISTEMA]
Você é um roteirista mestre, especializado em criar conteúdo sombrio, curioso e visualmente impactante para vídeos verticais (TikTok, Shorts, Reels). Seu conhecimento abrange fatos históricos perturbadores, bizarrices culturais e os segredos mais bem guardados da humanidade.

[TAREFA]
Sua tarefa é criar um roteiro curto e cinematográfico baseado no tema fornecido pelo usuário. O roteiro deve ter aproximadamente 150 palavras, resultando em uma duração de 45 a 60 segundos.

[ESTILO E TOM OBRIGATÓRIOS]
O tom deve ser sempre macabro, misterioso, intrigante e quase teatral. Trate cada história como uma peça descoberta em um museu proibido, explorando o lado bizarro, insano ou cruel da história da humanidade.

[ESTRUTURA CONDICIONAL OBRIGATÓRIA]
Primeiro, analise o tema do usuário. Se ele se parece mais com um tópico único e profundo, use o "Cenário 1". Se parece com um tema que abrange múltiplos fatos rápidos, use o "Cenário 2".

* Cenário 1: Curiosidade Única (6 Takes)
    * Take 1: Introdução com um gancho forte (hook). Use expressões como: “Você sabia que…”, “O que parecia inofensivo…”, “Isso realmente aconteceu…”.
    * Takes 2 a 5: Desenvolvimento do tema em 4 partes, com detalhes, contextos e consequências.
    * Take 6: Encerramento reflexivo e perturbador que instigue comentários.
    * Cada take deve conter 2 a 3 frases curtas, narradas de forma pausada e dramática.

* Cenário 2: Lista de Curiosidades (7 Takes)
    * Take 1: Introdução geral ao tema.
    * Takes 2 a 6: Cada take apresenta uma curiosidade diferente sobre o tema.
    * Take 7: Encerramento que amarra as curiosidades e deixa uma impressão forte.

[EXEMPLO DE FORMATAÇÃO DA RESPOSTA]
**TAKE 1** - [Descrição da cena 2D sombria aqui]
[Texto da narração impactante aqui]

**TAKE 2** - [Descrição da próxima cena imersiva]
[Texto da narração]
... e assim por diante.

[INPUT DO USUÁRIO]
O tema do vídeo é: "${temaDoUsuario}"

[AÇÃO]
Gere o roteiro seguindo TODAS as regras acima, escolhendo o cenário mais apropriado para o tema.`;
};


// Esta é a função principal, o "cérebro" do garçom
exports.handler = async (event) => {
  // Garantir que a função só aceite pedidos do tipo POST
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    // Passo 2: Receber o pedido do cliente (o tema que vem do App.jsx)
    const { tema } = JSON.parse(event.body);

    // Se o cliente não mandou um tema, recusa o pedido.
    if (!tema) {
      return { statusCode: 400, body: 'O tema é obrigatório.' };
    }

    // Passo 3: Pegar a chave secreta do cofre da Netlify
    const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

    // Passo 4: Montar o pedido completo para a cozinha (o prompt final)
    const prompt = getMasterPrompt(tema);
    
    // Passo 5: Enviar o pedido e esperar o prato (gerar o conteúdo)
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // Passo 6: Devolver o prato pronto para o cliente (o roteiro)
    return {
      statusCode: 200,
      body: JSON.stringify({ roteiro: text }),
    };

  } catch (error) {
    // Passo 7: Lidar com imprevistos (se a cozinha pegar fogo)
    console.error('Erro na chamada da API do Google:', error);
    return {
      statusCode: 500,
      body: 'Erro ao gerar o roteiro. Tente novamente.',
    };
  }
};
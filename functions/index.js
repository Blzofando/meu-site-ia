// Importa as ferramentas necessárias do Firebase e do Google AI
const { onRequest } = require("firebase-functions/v2/https");
const { logger } = require("firebase-functions");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const cors = require('cors')({ origin: true });

// Inicializa o cliente da IA do Google com a chave que está no ambiente
// (Vamos configurar essa chave no Firebase daqui a pouco)
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);

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


// Criamos nossa função HTTP chamada "generateRoteiro"
exports.generateRoteiro = onRequest({ cors: true }, async (req, res) => {
  // Apenas aceita requisições do tipo POST
  if (req.method !== 'POST') {
    res.status(405).send('Method Not Allowed');
    return;
  }

  try {
    const { tema } = req.body;

    if (!tema) {
      res.status(400).send('O tema é obrigatório.');
      return;
    }

    const model = genAI.getGenerativeModel({ model: "gemini-2.5-pro" });
    const prompt = getMasterPrompt(tema);

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // Envia o roteiro de volta com sucesso
    res.status(200).json({ roteiro: text });

  } catch (error) {
    logger.error("Erro detalhado na função:", error);
    res.status(500).send("Erro ao gerar o roteiro.");
  }
});
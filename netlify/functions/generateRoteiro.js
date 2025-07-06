import { GoogleGenerativeAI } from '@google/generative-ai';

const getMasterPrompt = (temaDoUsuario) => {
  // O seu prompt gigante vem aqui...
  // Vou abreviar para não poluir, mas cole o seu prompt completo.
  return `[INSTRUÇÃO SISTEMA]
Você é um roteirista mestre...
...
[INPUT DO USUÁRIO]
O tema do vídeo é: "${temaDoUsuario}"

[AÇÃO]
Gere o roteiro seguindo TODAS as regras acima, escolhendo o cenário mais apropriado para o tema.`;
};

export const handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const { tema } = JSON.parse(event.body);

    if (!tema) {
      return { statusCode: 400, body: 'O tema é obrigatório.' };
    }

    // --- LINHA DE DEBUG ---
    // Vamos verificar se a chave está sendo lida do ambiente da Netlify.
    const apiKey = process.env.GOOGLE_API_KEY;
    console.log("Tentando usar a chave de API que termina com:", apiKey ? `...${apiKey.slice(-4)}` : "CHAVE NÃO ENCONTRADA");
    // ----------------------

    if (!apiKey) {
      throw new Error("A variável de ambiente GOOGLE_API_KEY não foi encontrada no servidor.");
    }

    const genAI = new GoogleGenerativeAI(apiKey);
   const model = genAI.getGenerativeModel({ model: 'gemini-2.5-pro' });
    const prompt = getMasterPrompt(tema);
    
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    return {
      statusCode: 200,
      body: JSON.stringify({ roteiro: text }),
    };

  } catch (error) {
    console.error('Erro detalhado na função:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Erro ao gerar o roteiro.', details: error.message }),
    };
  }
};
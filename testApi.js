import { GoogleGenerativeAI } from '@google/generative-ai';

// Função principal de teste
async function runTest() {
  try {
    // Pega a chave diretamente do ambiente do terminal
    const apiKey = process.env.GOOGLE_API_KEY;

    if (!apiKey) {
      console.error("ERRO: A chave de API não foi encontrada. Defina a variável de ambiente GOOGLE_API_KEY.");
      return;
    }

    console.log(`Iniciando teste com a chave que termina em: ...${apiKey.slice(-4)}`);

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-pro' });

    const prompt = "Me diga um fato histórico rápido e interessante.";

    console.log("Enviando pedido para o Google...");

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    console.log("\n--- RESPOSTA DA IA ---");
    console.log(text);
    console.log("----------------------\n");
    console.log("✅ TESTE CONCLUÍDO COM SUCESSO!");

  } catch (error) {
    console.error("\n❌ ERRO DURANTE O TESTE:", error);
  }
}

runTest();
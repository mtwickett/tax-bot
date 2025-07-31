const conversations: Record<string, any[]> = {};

export const handleTranscript = (caller: string, transcript: string) => {
  // Default session ID if none
  const sessionId = caller || 'default';

  // Initialize conversation array if not present
  if (!conversations[sessionId]) {
    conversations[sessionId] = [
      {
        role: 'system',
        content: `
          You are a friendly and knowledgeable U.S. tax assistant. 
          Answer common individual tax questions clearly, briefly, 
          and in a conversational tone, as if you're helping someone 
          at a front desk or over the phone. Use current IRS guidance. 
          Keep responses under 20 seconds when read aloud. Avoid giving 
          legal or personalized financial advice. If the question is unclear, 
          ask the user to rephrase. If the question is outside your scope, 
          politely say you can't answer.Example: Q: Do I get a refund if I work from home? 
          A: Yes, but only if you're self-employed. W-2 employees can't deduct home office 
          expenses since 2018. You must use the space regularly and exclusively for work to qualify.
          `
      }
    ];
  }

  // Append the user message
  conversations[sessionId].push({
    role: 'user',
    content: transcript
  });

  return conversations[sessionId]; // for sending to OpenAI
};
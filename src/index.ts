// This is your Worker file (e.g., src/index.js)
export default {
  async fetch(request, env) {

    // Only allow POST requests for the chat API
    if (request.method !== 'POST') {
      return new Response('Method Not Allowed', { status: 405 });
    }

    try {
      // Parse the JSON body from the incoming request
      const { message } = await request.json();

      // Use the Workers AI binding to run the model
      const aiResponse = await env.AI.run(
        '@cf/meta/llama-3-8b-instruct',
        {
          messages: [{ role: 'user', content: message }]
        }
      );

      // Return the AI's response as a JSON object
      return new Response(JSON.stringify({ response: aiResponse.response }), {
        headers: { 'Content-Type': 'application/json' },
      });

    } catch (error) {
      console.error('Error handling request:', error);
      return new Response(JSON.stringify({ error: 'Failed to process message' }), { status: 500 });
    }
  },
};

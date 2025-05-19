import assert from 'assert';

const API_URL = 'http://localhost:3002/api/grok-hello';

async function testGrokHelloEndpoint() {
  console.log('Starting test for /api/grok-hello...');
  let response;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 seconds timeout, increased slightly

  try {
    response = await fetch(API_URL, { method: 'POST', signal: controller.signal });
  } catch (e: any) {
    console.error(`Fetch failed. Make sure the dev server is running on http://localhost:3002. Error: ${e.message}`);
    if (e.name === 'AbortError') {
      console.error('Fetch aborted due to timeout.');
    }
    throw e; // Re-throw to be caught by the main try-catch
  } finally {
    clearTimeout(timeoutId);
  }

  console.log(`Response status: ${response.status}`);
  assert.strictEqual(response.status, 200, `Expected status 200, but got ${response.status}`);
  console.log('Status 200 OK');
  
  const contentType = response.headers.get('content-type');
  console.log(`Content-Type: ${contentType}`);
  assert.ok(contentType && contentType.includes('text/plain'), `Expected content-type text/plain, but got ${contentType}`);
  console.log('Content-Type text/plain OK');

  const reader = response.body?.getReader();
  if (!reader) {
    throw new Error('Response body reader is not available');
  }
  console.log('Response body reader obtained.');

  let fullText = '';
  let chunkResult;
  try {
    console.log('Starting to read stream...');
    while (!(chunkResult = await reader.read()).done) {
      const decodedChunk = new TextDecoder().decode(chunkResult.value);
      // console.log('Stream chunk received:', decodedChunk); // Optional: very verbose
      fullText += decodedChunk;
    }
    console.log('Stream finished.');
  } catch (streamError: any) {
    console.error(`Error reading stream: ${streamError.message}`);
    if (streamError.name === 'AbortError') {
      console.error('Stream reading aborted due to timeout.');
    }
    throw streamError; // Re-throw
  }

  console.log('Received from /api/grok-hello (length: ' + fullText.length + '):', fullText);
  assert.ok(fullText.length > 0, 'Expected a non-empty string from Groq');
  assert.ok(!fullText.toLowerCase().includes('error'), `Response contained an error: ${fullText}`);
  console.log('Received non-empty response from Groq OK.');

  console.log('Test for /api/grok-hello PASSED!');
}

// Self-invoking async function to run the test
(async () => {
  try {
    await testGrokHelloEndpoint();
    console.log("--- Test script completed successfully ---");
    process.exit(0); // Explicitly exit with success code
  } catch (error: any) {
    console.error(`--- Test FAILED: ${error.message} ---`);
    if (error.stack) {
        console.error(error.stack);
    }
    process.exit(1); // Explicitly exit with failure code
  }
})();

// To run this test: pnpm --prefix Ai-agent exec ts-node app/api/grok-hello/route.test.ts
// Ensure your Next.js dev server is running: pnpm run dev --port 3002 
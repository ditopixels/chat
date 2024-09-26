/**
 * API Route - Run Assistant
 * 
 * This API route facilitates interaction with the OpenAI API for running a session with an AI assistant.
 * The route receives the assistant ID and thread ID, which identify the specific assistant and conversation thread.
 * It invokes the OpenAI API to create a new run within the specified thread and returns the run ID for tracking.
 * 
 * Path: /api/runAssistant
 */

import { NextRequest, NextResponse } from 'next/server';
import OpenAI from "openai";

// Initialize the OpenAI client with the API key. The API key is essential for authenticating
// and authorizing requests to OpenAI's services.
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: NextRequest) {
  try {
    // Extracting the assistant ID and thread ID from the JSON payload of the request.
    const { assistantId, threadId } = await req.json();
    
    // Logging received IDs for debugging purposes.
    console.log(`Inside -runAssistant --> assistantId: ${assistantId}`);
    console.log(`Inside -runAssistant --> threadId: ${threadId}`);

    // Creating a new run using the OpenAI API with the provided assistant and thread IDs.
    // Adjust the endpoint and parameters based on the new OpenAI v2 structure.
    const run = await openai.beta.threads.runs.create(threadId, { assistant_id: assistantId });

    // Logging the details of the created run for debugging.
    console.log(`Run created: ${JSON.stringify(run)}`);

    // Responding with the run ID in JSON format.
    return NextResponse.json({ runId: run.id });
  } catch (error: any) {
    // Handling and logging any errors that occur during the process.
    console.error(`Error in -runAssistant: ${error.message}`);
    return NextResponse.json({ error: 'Failed to run assistant' }, { status: 500 });
  }
}

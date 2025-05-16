import { NextResponse } from "next/server";
import ModelClient, { isUnexpected } from "@azure-rest/ai-inference";
import { AzureKeyCredential } from "@azure/core-auth";
import { Counselor } from "@/lib/db/schema";

const token = process.env.OPENAI_API_KEY;
const endpoint = "https://models.inference.ai.azure.com";
const modelName = "text-embedding-3-small";

export async function POST(req: Request) {
  try {
    const { userCase } = await req.json();
    const client = ModelClient(endpoint, new AzureKeyCredential(token!));
    console.log("userCase", userCase);

    // Get embeddings for the user's case
    const response = await client.path("/embeddings").post({
      body: {
        input: [userCase],
        model: modelName,
      },
    });

    console.log("response", response);
    if (isUnexpected(response)) {
      throw response.body.error;
    }

    const userEmbedding = response.body.data[0].embedding as number[];
    console.log("userEmbedding", userEmbedding);

    // Query MongoDB Atlas using vector search
    const matchedCounselors = await Counselor.aggregate([
      {
        $vectorSearch: {
          index: "vector_index",
          path: "plot_embedding",
          queryVector: userEmbedding,
          numCandidates: 150,
          limit: 10,
        },
      },
      {
        $project: {
          _id: 1,
          userId: 1,
          personalInfo: 1,
          professionalInfo: 1,
          workPreferences: 1,
          imageUrl: 1,
          score: { $meta: "vectorSearchScore" },
        },
      },
    ]);
    console.log("matchedCounselors", matchedCounselors);

    // Calculate match percentage (normalize scores)
    // Vector search scores are similarities between -1 and 1 (cosine similarity)
    // Convert to percentage where 1 = 100% match and -1 = 0% match
    const counselorsWithMatchScore = matchedCounselors.map((counselor) => {
      const score = counselor.score || 0;
      // Convert score from [-1,1] to [0,100]
      const matchScore = Math.round(((score + 1) / 2) * 100);
      return {
        ...counselor,
        matchScore,
        score: matchScore, // Include both for UI compatibility
      };
    });

    console.log("counselorsWithMatchScore", counselorsWithMatchScore);

    return NextResponse.json({ counselors: counselorsWithMatchScore });
  } catch (error) {
    console.error("Error in AI matching:", error);
    return NextResponse.json(
      { error: "Failed to process AI matching" },
      { status: 500 }
    );
  }
}

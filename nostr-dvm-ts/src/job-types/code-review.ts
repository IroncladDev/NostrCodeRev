import { NDKEvent } from "@nostr-dev-kit/ndk";
import { validateJobRequest } from "../validations/index.js";
import { inProgress } from "../jobs/reactions/in-progress.js";
import axios from "axios";
import { getConfig } from "../config/index.js";

export async function codeReviewJob(event: NDKEvent): Promise<string> {
    console.log("New codeReview job");

    await validateJobRequest(event);

    inProgress(event);

    return new Promise((resolve) => {
        setTimeout(async () => {
            console.log("calling openai");

            const maxTokens = 8000;  // Maximum number of tokens for a single request
            let content = event.content;
            let totalTokens = Math.ceil(content.length / 3);  // Estimate tokens as length/3

            let responses = [];
            while (totalTokens > 0) {
                console.log("Running with totalTokens: ", totalTokens);
                let currentContent = content.slice(0, maxTokens * 3);  // Grab the current chunk of content
                content = content.slice(maxTokens * 3);  // Update the remaining content
                totalTokens = Math.ceil(content.length / 3);  // Update the remaining tokens

                await axios
                    .post(
                        "https://api.openai.com/v1/chat/completions",
                        {
                            model: "gpt-4",
                            messages: [
                                {
                                    role: "system",
                                    content: getConfig().prompt,
                                },
                                {
                                    role: "user",
                                    content: currentContent,
                                },
                            ],
                        },
                        {
                            headers: {
                                "Content-Type": "application/json",
                                Authorization: `Bearer ` + process.env["OPENAI_API_KEY"],
                            },
                        },
                    )
                    .then((response) => {
                        console.log(
                            "response from openai: ",
                            response.data.choices[0].message.content,
                        );
                        const responseContent = response.data.choices[0].message.content;
                        console.log("responseContent", responseContent);
                        responses.push(responseContent);
                    });
            }
            resolve(responses.join(' '));  // Combine all responses
        }, 10000);
    });
}

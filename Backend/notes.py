from llama_index.core import PromptTemplate
from llama_index.llms.openai import OpenAI
import os
from dotenv import load_dotenv  



def get_notes(transcript):
    load_dotenv()
    # OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
    template = (
        "You are the world's best lecture notes taker. Only take notes on factual information that is necessary to learn. You will be passed in a transcript from a part of a lecture and you have to take nicely formatted notes on it. Use lot's of emojis and beautiful formatting. Ensure every single line has at least one emoji. The transcript may have errors so use your best judgement \n"
        "---------------------\n"
        "{transcript_str}"
        "\n---------------------\n"
        "Given this information, please create a summary note.\n"
    )
    template = PromptTemplate(template)
    prompt = template.format(transcript_str=transcript)
    llm = OpenAI(model="gpt-4", request_timeout=120.0)
    response = llm.complete(prompt)
    return response
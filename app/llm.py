import os

from dotenv import load_dotenv
from groq import Groq

from .prompts import MEETING_PREP_PROMPT


load_dotenv()

client = Groq(
    api_key=os.getenv("GROQ_API_KEY")
)


def generate_meeting_brief(contact_name, memories):
    """
    Generate a personalized meeting brief
    using memories retrieved from Hindsight.
    """

    memory_text = "\n".join(
        f"- {memory}" for memory in memories
    )

    prompt = MEETING_PREP_PROMPT.format(
        contact_name=contact_name,
        memories=memory_text
    )

    response = client.chat.completions.create(
        model="openai/gpt-oss-20b",
        messages=[
            {
                "role": "system",
                "content": (
                    "You are a professional meeting "
                    "preparation assistant."
                )
            },
            {
                "role": "user",
                "content": prompt
            }
        ],
        temperature=0.3,
        max_completion_tokens=1200,
        include_reasoning=False
    )

    return response.choices[0].message.content
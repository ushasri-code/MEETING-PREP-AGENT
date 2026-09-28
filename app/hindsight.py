import os

from dotenv import load_dotenv
from hindsight_client import Hindsight


load_dotenv()

client = Hindsight(
    base_url="https://api.hindsight.vectorize.io",
    api_key=os.getenv("HINDSIGHT_API_KEY")
)

BANK_ID = "meeting_memory"


def store_memory(content):
    """
    Store meeting information in Hindsight.
    """
    return client.retain(
        bank_id=BANK_ID,
        content=content
    )


def recall_memories(query):
    """
    Retrieve relevant memories from Hindsight.
    """
    result = client.recall(
        bank_id=BANK_ID,
        query=query
    )

    return [memory.text for memory in result.results]


if __name__ == "__main__":
    store_memory(
        "Meeting 1 with Ravi: Ravi wants dashboard API integration. "
        "Ravi prefers email communication. "
        "We promised to send the API documentation."
    )

    memories = recall_memories("What do we remember about Ravi?")

    print("\n===== RECALLED MEMORIES =====")

    for memory in memories:
        print("-", memory)
    
if __name__ == "__main__":
    store_memory(
        "Meeting 1 with Ravi: Ravi wants dashboard API integration. "
        "Ravi prefers email communication. "
        "We promised to send the API documentation."
    )

    memories = recall_memories("What do we remember about Ravi?")

    print("\n===== RECALLED MEMORIES =====")

    for memory in memories:
        print("-", memory)

    client.close()
from app.hindsight import recall_memories, client
from app.llm import generate_meeting_brief


try:
    print("\n===== STEP 1: RECALLING FROM HINDSIGHT =====")

    memories = recall_memories(
    "What did Ravi discuss with us in previous meetings? "
    "What does Ravi want, prefer, and what commitments or follow-ups are pending?"
)

    for memory in memories:
        print("-", memory)

    print("\n===== STEP 2: GENERATING MEETING BRIEF =====")

    brief = generate_meeting_brief(
        "Ravi",
        memories
    )

    print("\n===== FINAL MEETING BRIEF =====")
    print(brief)

finally:
    client.close()
from app.llm import generate_meeting_brief


memories = [
    "Ravi wanted the dashboard to support API integration.",
    "Ravi prefers email communication.",
    "We promised to send the API documentation.",
    "The API documentation was sent to Ravi.",
    "Ravi asked about Microsoft Teams integration.",
    "Ravi is concerned about deployment time.",
    "The final deployment timeline is still pending."
]


result = generate_meeting_brief(
    contact_name="Ravi",
    memories=memories
)

print("\n========== MEETING BRIEF ==========\n")
print(result)
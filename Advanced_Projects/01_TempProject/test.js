title = "cars";
chat = [];
async function response(chat) {
    const response = await fetch('https://openrouter-api-pi.vercel.app/api/proxy', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            "model": "anthropic/claude-3-haiku",
            "temperature": 0.6,
            "messages": [
                {
                    "role": "user",

                    content: chat.length === 0
                        ?
                        `Start a chat about "${title}" using clear, simple English. Say one interesting fact.

                        Respond as JSON:
                        {
                          "Reply": "<bot reply, max 20 words>",
                          "Option1": "<from the user that goes deeper into the same topic., max 10 words>",
                          "Option2": "<from the user that shifts to a exactly different topic, max 10 words>"
                        }`
                        :
                        `Chat title: "${title}"
            
                        Continue this chat using clear and simple English:
                        ${chat.map(m => m.bot ? `Bot: ${m.bot}` : `User: ${m.user}`).join('\n')}
                        
                        Respond as JSON:
                        {
                          "Reply": "<bot reply, max 20 words>",
                          "Option1": "<from the user that goes deeper into the same topic., max 10 words>",
                          "Option2": "<from the user that shifts to a exactly different topic, max 10 words>"
                        }`
                }
            ]
        })
    });

    const data = await response.json();
    const json = JSON.parse(data.choices[0].message.content);
    const reply = json.Reply;
    const option1 = json.Option1;
    const option2 = json.Option2;
    console.log(reply);
    console.log(option1);
    console.log(option2);
    return { reply, option1, option2 };
}



response(chat);
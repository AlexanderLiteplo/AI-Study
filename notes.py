from llama_index.llms.ollama import Ollama
from llama_index.core import PromptTemplate
from llama_index.llms.openai import OpenAI
import os
from dotenv import load_dotenv  

load_dotenv()
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")

template = (
    "You are the world's best lecture notes taker. Only take notes on factual information that is necessary to learn. You will be passed in a transcript from a part of a lecture and you have to take nicely formatted notes on it. Use lot's of emojis and beautiful formatting. Ensure every single line has at least one emoji. The transcript may have errors so use your best judgement \n"
    "---------------------\n"
    "{transcript_str}"
    "\n---------------------\n"
    "Given this information, please create a summary note.\n"
)
transcript = """
Quick trip to New York City. 
Hey everyone. A bunch of you actually got YC interviews.
I'm super psyched for you. If you didn't get an interview, keep working on it.
There are so many people I know who applied, didn't get in, and kept applying until they did, and it worked out.
Getting success with investors is not building a real business, not solving real problems. 
So don't get too focused on these intermediate steps. 
The fundamental is still creating a product, solving a problem, and making a business that matters. 
If you got an interview, congratulations. When I was a partner at Y Combinator, I did thousands of interviews.
Here's the deal. The YC interview is only 10 minutes. It's not like any other conversation that you've had. It's not like any other pitch that you've had. It's so short. So you really have very little time to get across exactly three things that I always look for when I was doing YC interviews. First is problem. What is it? Second is the solution. Is it good and are you the ones to do it? Third is how big can it really be? If you succeed, where does this go? The first task is pure communication. The partners generally will have read your application. They won't know the details and they won't remember the exact nuances. That's okay, but you do need to explain what is it right away. Who's it for? How does it work? You need to get that out of the way in the first few minutes of meeting them. Use plain English. Don't use buzzwords. What problem are you trying to solve and how are you solving it? What are the steps? What's it like to sign up? Try to explain it to your first grade teacher. And if it's a marketplace, what are the sides of that transaction? What are all the working parts? Try to be as brief and simple as possible. The people you're talking to will be incredibly smart, but they might not know your specific industry. And make sure that you explain things that they might not understand. You have so little time and so this is extra important. Part two is actually about the solution. How do you solve that problem and is it good? And are you the ones to actually solve it? This is a good point in the conversation to talk about alternatives, to talk about competition. What are people doing right now? What's extra good here are stories about your customers. About if people are actually using the software, tell them. If people are actually on the platform, tell them. This is a good place to really know your numbers. Know your net and gross revenue. And from that number, you'll actually know your gross margin. These things are important. How much money does your company actually make? And how much do you have to pay to another entity? For instance, for Uber. Uber doesn't get the whole fare, it gets a percentage of the fare. That's the gross margin or take rate. If you're already running, know how fast you're growing week to week or month to month. Know your burn, how much you're spending, and how much revenue you're bringing in. Talk about your price point and how you arrived at it. Are there particular segments in your customers that are willing to pay more or less? This is a good point to really show that you understand the market. What do your competitors do? What are your alternatives? How do they segment the market? Where do you fit inside that spectrum? Finally, as you discuss your solution and how good it is and the metrics around that, talk about your NPS. If you're a consumer product, you should walk in knowing your retention rate. Google this right now. Cohort retention. You should know what that is. 10 weeks out, 20 weeks out, how many people are still using it? This is one of the most important numbers for all consumer behavior. If you know it and it's great, tell people. You want to end on impact. How big can your idea actually be? Sometimes competition is handy. If there's a public competitor that has no software, mention that. That's a very powerful fact. It's okay if your startup idea right now solves a much smaller problem for a more limited set of users. This is what they call the thin edge of the wedge. Everything that could be truly great starts off as something very small. Airbnb is a classic example of this. They started off doing conference travel in San Francisco only using airbeds, not even real beds, and you had to serve breakfast. It's okay if the initial wedge is small. In fact, it wasn't until a lot later that the founders of Airbnb realized that this wasn't just airbeds or just breakfast. It could be all of housing. They were actually the marketplace for space. There are always ways to take an initial wedge and expand into much larger markets. Finally, I know a lot of you are kind of stressed out about how to prep. You're anxious, and I get it. Don't stress out. It's just a conversation, and yes, you can practice. Practice does help you a lot. Reach out to YC alumni who are in adjacent spaces. You don't have to talk to any of your competitors, but it's always helpful to get a sense for people who have been through it recently, what was it like for them, and ask them to give you a quick mock interview. One of the most awesome things about the YC community is how giving founders truly are, even to people who are not within the community yet. You can also practice with your friends and loved ones. Ask them to interrupt you, and as you talk, practice being interrupted. One thing you'll notice as a strategy for coping with being interrupted a lot is that using an inverted pyramid for your answer is ideal. Answer the question immediately and directly, and then go into extra information. If they're done, they'll stop you and ask something else. But that way, you won't get caught. That's a common pitfall. You start going into your answer, and you get cut off, and you might not even be able to return to it. I got to get to my next meeting, so I'm really sorry. I have to cut this short right now. But I promise I'll answer your questions down here in the comments. Make sure you click like if you like this. Send it to your friends who got interviews. And remember, if you didn't get an interview, it's okay. Remember to build your business. Never let investors tell you what you can and cannot do. If you did get an interview, congratulations and good luck.
"""

template = PromptTemplate(template)
prompt = template.format(transcript_str=transcript)


llm = OpenAI(model="gpt-4", request_timeout=120.0)

response = llm.stream_complete(prompt)
for r in response:
    print(r.delta, end="")
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_KEY
});

export async function POST(req: Request) {
  const { prompt } = await req.json()
  const Instructions=`
  You are a beautiful ui generator u generate ui in tsx for the given inputs
  u find mistakes in your code recctify them and then give the final ui code in tsx 
  after checking it 
  your primary task is to return user a ui 
  user mentions the lesson he wants to learn
  u have to make a website which teaches the user that topic in detail through some beautiful website
  u have to design the website which teaches him that 
  the ui should be functional as well 
  ui should be made for user to understand the lesson properly
  you give an output saying this is not a toppic for inputs u find bad or not realted to education
  `
  

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt,
     config: {
      systemInstruction: Instructions,
    },
  })

  const text = response.text
  console.log(text)

  return Response.json({ ans: text })
}

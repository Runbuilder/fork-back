const express = require('express');
const cors = require('cors');
const {
  GoogleGenerativeAI,
  HarmCategory,
  HarmBlockThreshold,
} = require("@google/generative-ai");

const app = express();
app.use(cors());
app.use(express.json());
app.options('/generate/', cors());

app.use((req, res, next) => {
  console.log('Received request:', req.method, req.path);
  next();
});

const port = 3000;
const MODEL_NAME = "gemini-pro";
const API_KEY = "AIzaSyBDNjNOSKyGn55Ke-BTNNzF0WxrFUTttYM";
// const API_KEY = process.env.GOOGLE_API_KEY;

app.post('/generate', async (req, res) => {
  try {
    const genAI = new GoogleGenerativeAI(API_KEY);
    const model = genAI.getGenerativeModel({ model: MODEL_NAME });

    const generationConfig = {
      temperature: 0.9,
      topK: 1,
      topP: 1,
      maxOutputTokens: 4000,
    };

    const safetySettings = [
      {
        category: HarmCategory.HARM_CATEGORY_HARASSMENT,
        threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
      }
    ];

    const parts = [
      { text: req.body.userInput + `\n위 내용으로 웹앱 만드는 HTML 코드 작성해줘.  
      css, js 코드를 index.html 파일 하나에 모두 포함시켜줘.
      sweetalert2, tailwind 라이브러리를 이용해서 깔끔한 디자인으로 작성해줘.
      메인 요소는 화면의 가로, 세로축의 가운데로 정렬해줘.
      배경에 대한 특별한 언급이 없으면 배경색은 파스텔 색으로 해줘.
      다른 설명은 보여주지 말고 실행할 코드만 보여줘. 
      코드를 실행할 때 필요없는 기타 표시나 설명은 모두 생략해줘.\n` },
    ];

    const result = await model.generateContent({
      contents: [{ role: "user", parts }],
      generationConfig,
      safetySettings,
    });

    const response = await result.response.text();
    res.send({ text: response });
  } catch (error) {
    console.error("Error during content generation:", error);
    res.status(500).send({ error: "Internal server error" });
  }
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});

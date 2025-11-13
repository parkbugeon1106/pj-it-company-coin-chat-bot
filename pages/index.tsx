import React, { useState, useEffect } from "react";
import axios from "axios";

export default function Home() {
  const [coin, setCoin] = useState("bitcoin");
  const [language, setLanguage] = useState("ko");
  const [priceData, setPriceData] = useState(null);
  const [newsList, setNewsList] = useState([]);
  const [gptResponse, setGptResponse] = useState("");
  const [loading, setLoading] = useState(false);

  const COINGECKO_API = "https://api.coingecko.com/api/v3";
  const NEWS_API_KEY = "YOUR_NEWS_API_KEY";
  const GPT_API_URL = "https://api-inference.huggingface.co/models/google/flan-t5-base";
  const HUGGINGFACE_API_KEY = "YOUR_HF_API_KEY";

  const fetchData = async () => {
    setLoading(true);
    try {
      const priceRes = await axios.get(`${COINGECKO_API}/simple/price`, {
        params: {
          ids: coin,
          vs_currencies: "krw",
          include_24hr_change: true,
        },
      });

      const newsRes = await axios.get("https://newsapi.org/v2/everything", {
        params: {
          q: coin,
          sortBy: "relevancy",
          language: language === "ko" ? "ko" : "en",
          apiKey: NEWS_API_KEY,
        },
      });

      const prompt =
        language === "ko"
          ? `${coin}의 최근 시세와 뉴스 정보를 바탕으로 현재 투자자 심리를 분석하고 요약해줘.`
          : `Based on the recent price and news of ${coin}, analyze and summarize investor sentiment.`;

      const gptRes = await axios.post(
        GPT_API_URL,
        { inputs: prompt },
        {
          headers: {
            Authorization: `Bearer ${HUGGINGFACE_API_KEY}`,
          },
        }
      );

      setPriceData(priceRes.data[coin]);
      setNewsList(newsRes.data.articles.slice(0, 5));
      setGptResponse(gptRes.data[0].generated_text);
    } catch (error) {
      console.error(error);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, [language]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchData();
  };

  return (
    <div className="min-h-screen bg-white text-gray-800 py-8 px-4 max-w-3xl mx-auto">
      <div className="flex items-center space-x-4 justify-center mb-8">
        <img src="/logo.png" alt="logo" className="w-12 h-12" />
        <h1 className="text-2xl font-bold">PJ IT Crypto GPT</h1>
      </div>

      <div className="flex justify-end mb-4">
        <select
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
          className="border px-3 py-2 rounded"
        >
          <option value="ko">한국어</option>
          <option value="en">English</option>
        </select>
      </div>

      <form onSubmit={handleSubmit} className="flex items-center gap-2 mb-6">
        <input
          className="border border-gray-300 rounded px-4 py-2 flex-1"
          value={coin}
          onChange={(e) => setCoin(e.target.value)}
          placeholder={language === "ko" ? "예: bitcoin, ethereum" : "e.g., bitcoin, ethereum"}
        />
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          {language === "ko" ? "검색" : "Search"}
        </button>
      </form>

      {loading ? (
        <p className="text-center">{language === "ko" ? "분석 중..." : "Loading analysis..."}</p>
      ) : (
        <>
          {priceData && (
            <div className="mb-6">
              <h2 className="text-xl font-semibold">
                {language === "ko" ? "💰 시세 정보" : "💰 Price Information"}
              </h2>
              <p>₩{priceData.krw.toLocaleString()}</p>
              <p>
                {language === "ko" ? "24시간 변동률: " : "24h Change: "}
                {priceData.krw_24h_change.toFixed(2)}%
              </p>
            </div>
          )}

          <div className="mb-6">
            <h2 className="text-xl font-semibold">
              {language === "ko" ? "📰 관련 뉴스" : "📰 Related News"}
            </h2>
            <ul className="list-disc list-inside space-y-2">
              {newsList.map((article, index) => (
                <li key={index}>
                  <a
                    href={article.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    {article.title}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {gptResponse && (
            <div className="mb-6">
              <h2 className="text-xl font-semibold">
                {language === "ko" ? "🤖 GPT 분석" : "🤖 GPT Analysis"}
              </h2>
              <p>{gptResponse}</p>
            </div>
          )}
        </>
      )}
    </div>
  );
}

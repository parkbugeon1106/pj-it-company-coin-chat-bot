// pj-it-crypto-gpt-web (React + Tailwind + GPT + 뉴스 + 가격 예측 포함)

import React, { useState } from "react";
import { useEffect } from "react";
import axios from "axios";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function App() {
  const [coin, setCoin] = useState("bitcoin");
  const [priceData, setPriceData] = useState(null);
  const [newsList, setNewsList] = useState([]);
  const [gptResponse, setGptResponse] = useState("");
  const [loading, setLoading] = useState(false);

  const COINGECKO_API = "https://api.coingecko.com/api/v3";
  const NEWS_API_KEY = process.env.NEXT_PUBLIC_NEWS_API_KEY || "YOUR_NEWS_API_KEY";
  const GPT_API_URL = "https://api-inference.huggingface.co/models/google/flan-t5-base";
  const HUGGINGFACE_API_KEY = process.env.NEXT_PUBLIC_HF_API_KEY || "YOUR_HF_API_KEY";

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
          language: "ko",
          apiKey: NEWS_API_KEY,
        },
      });

      const prompt = `${coin} 코인의 최근 시세와 뉴스 정보를 바탕으로 현재 투자자 심리를 분석하고 가격을 예측해줘.`;
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
      setGptResponse("❌ 데이터를 불러오지 못했습니다.");
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchData();
  };

  return (
    <div className="min-h-screen bg-white text-gray-800 py-8 px-4 max-w-3xl mx-auto">
      <a href="/" className="flex items-center space-x-4 justify-center mb-8">
        <img src="/logo.png" alt="logo" className="w-12 h-12" />
        <h1 className="text-2xl font-bold">PJ IT Crypto GPT</h1>
      </a>

      <form onSubmit={handleSubmit} className="flex items-center gap-2 mb-6">
        <Input
          value={coin}
          onChange={(e) => setCoin(e.target.value)}
          placeholder="예: bitcoin, ethereum"
        />
        <Button type="submit">검색</Button>
      </form>

      {loading ? (
        <p className="text-center">🔄 분석 중...</p>
      ) : (
        <>
          {priceData && (
            <div className="mb-6">
              <h2 className="text-xl font-semibold">💰 시세 정보</h2>
              <p>가격: ₩{priceData.krw.toLocaleString()}</p>
              <p>24시간 변동률: {priceData.krw_24h_change.toFixed(2)}%</p>
            </div>
          )}

          <div className="mb-6">
            <h2 className="text-xl font-semibold">📰 관련 뉴스</h2>
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
              <h2 className="text-xl font-semibold">🤖 GPT 분석</h2>
              <p>{gptResponse}</p>
            </div>
          )}
        </>
      )}
    </div>
  );
}

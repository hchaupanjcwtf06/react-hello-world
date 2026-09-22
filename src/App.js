import React, { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [quote, setQuote] = useState("");
  const [author, setAuthor] = useState("");
  const [loading, setLoading] = useState(false);

  const API_URL = "https://task4-nodejs.vercel.app/";

  const fetchQuote = async () => {
    setLoading(true);
    try {
      const response = await fetch(API_URL);
      const data = await response.json();
      setQuote(data.message);
      setAuthor(data.author);
    } catch (error) {
      setQuote("Lỗi kết nối đến Backend. Vui lòng kiểm tra lại link API!");
      setAuthor("");
    }
    setLoading(false);
  };

  // Tự động lấy dữ liệu khi vừa vào trang
  useEffect(() => {
    fetchQuote();
  }, []);

  return (
    <div className="App">
      <header className="App-header">
        <div className="card">
          <h2>🚀 Trạm Sạc Code</h2>
          {loading ? (
            <p className="loading">Đang kết nối API...</p>
          ) : (
            <>
              <p className="quote">"{quote}"</p>
              <p className="author">- {author} -</p>
            </>
          )}
          <button onClick={fetchQuote} className="btn">
            Nạp năng lượng
          </button>
        </div>
      </header>
    </div>
  );
}

export default App;
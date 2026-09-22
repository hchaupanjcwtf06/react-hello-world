import React, { useState, useEffect, useRef } from 'react';
import './App.css';

function App() {
  const [otp, setOtp] = useState(["", "", "", ""]);
  const [loadedNum, setLoadedNum] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragPos, setDragPos] = useState({ x: 0, y: 0 });
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const [isShooting, setIsShooting] = useState(false);
  
  // State cho bể bóng
  const [balls, setBalls] = useState([]);
  const [mousePos, setMousePos] = useState({ x: -100, y: -100 });
  const pitRef = useRef(null);

  // Khởi tạo 40 quả bóng pastel ngẫu nhiên chồng chéo
  useEffect(() => {
    const newBalls = Array.from({ length: 40 }).map((_, i) => ({
      id: i,
      num: Math.floor(Math.random() * 10),
      // Tạo màu pastel ngẫu nhiên
      color: `hsl(${Math.floor(Math.random() * 360)}, 85%, 75%)`,
      // Vị trí ngẫu nhiên trong bể (tính theo %)
      x: Math.random() * 90 + 5,
      y: Math.random() * 70 + 15,
    }));
    setBalls(newBalls);
  }, []);

  // Hiệu ứng sóng nước khi rê chuột vào bể bóng
  const handleMouseMove = (e) => {
    if (!pitRef.current) return;
    const rect = pitRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setMousePos({ x, y });
  };

  const handleMouseLeave = () => {
    setMousePos({ x: -100, y: -100 });
  };

  const loadNumber = (ball) => {
    if (loadedNum === null && otp.includes("") && !isShooting) {
      setLoadedNum(ball);
      setDragPos({ x: 0, y: 0 });
    }
  };

  // Logic kéo thả súng cao su
  const handlePointerDown = (e) => {
    if (loadedNum === null) return;
    e.target.setPointerCapture(e.pointerId);
    setIsDragging(true);
    setStartPos({ x: e.clientX, y: e.clientY });
  };

  const handlePointerMove = (e) => {
    if (!isDragging) return;
    let dx = e.clientX - startPos.x;
    let dy = e.clientY - startPos.y;
    
    const distance = Math.sqrt(dx * dx + dy * dy);
    const maxPull = 120;
    if (distance > maxPull) {
      dx = (dx / distance) * maxPull;
      dy = (dy / distance) * maxPull;
    }
    if (dy < -20) dy = -20; 
    setDragPos({ x: dx, y: dy });
  };

  const handlePointerUp = (e) => {
    if (!isDragging) return;
    setIsDragging(false);
    e.target.releasePointerCapture(e.pointerId);

    if (dragPos.y > 40) {
      setIsShooting(true);
      setDragPos({ x: -dragPos.x * 0.5, y: -400 }); 
      
      setTimeout(() => {
        const newOtp = [...otp];
        const emptyIdx = newOtp.findIndex(x => x === "");
        if (emptyIdx !== -1) newOtp[emptyIdx] = loadedNum;
        setOtp(newOtp);
        setLoadedNum(null);
        setIsShooting(false);
        setDragPos({ x: 0, y: 0 });
      }, 300);
    } else {
      setDragPos({ x: 0, y: 0 });
    }
  };

  const resetOTP = () => {
    setOtp(["", "", "", ""]);
    setLoadedNum(null);
  };

  return (
    <div className="game-container">
      <h2>🎯 NHẬP OTP ĐỂ MỞ KHÓA</h2>
      
      {/* Khung hiển thị OTP */}
      <div className="otp-display">
        {otp.map((item, idx) => (
          <div key={idx} className={`otp-box ${item !== "" ? "filled" : ""}`} style={{ backgroundColor: item?.color || 'transparent' }}>
            {item !== "" ? item.num : ""}
          </div>
        ))}
      </div>

      {/* Súng cao su */}
      <div className="slingshot-area">
        <div className="slingshot-frame">
          {/* Vẽ súng gỗ đàng hoàng bằng SVG */}
          <svg viewBox="0 0 120 150" className="wooden-slingshot">
            <path d="M50,150 L50,80 C50,70 30,30 20,10 C15,0 30,0 35,10 C50,35 60,60 60,70 C60,60 70,35 85,10 C90,0 105,0 100,10 C90,30 70,70 70,80 L70,150 Z" 
                  fill="#5c3a21" stroke="#3e2311" strokeWidth="2"/>
            <path d="M55,150 L55,80 C55,75 40,40 30,20" stroke="#4a2b15" strokeWidth="1" fill="none"/>
            <path d="M65,150 L65,80 C65,75 80,40 90,20" stroke="#4a2b15" strokeWidth="1" fill="none"/>
          </svg>
          
          {/* Dây thun đàn hồi */}
          {loadedNum !== null && (
            <svg className="rubber-bands">
              <line x1="-30" y1="-50" x2={dragPos.x} y2={dragPos.y} className="band" />
              <line x1="30" y1="-50" x2={dragPos.x} y2={dragPos.y} className="band" />
            </svg>
          )}
        </div>

        {/* Viên đạn */}
        {loadedNum !== null && (
          <div 
            className={`projectile ${isShooting ? 'shooting' : ''}`}
            style={{ 
              transform: `translate(${dragPos.x}px, ${dragPos.y}px)`,
              backgroundColor: loadedNum.color
            }}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
          >
            {loadedNum.num}
          </div>
        )}
      </div>

      {/* Bể bóng ngẫu nhiên với hiệu ứng sóng */}
      <div 
        className="ball-pit" 
        ref={pitRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        {balls.map(ball => {
          // Tính toán khoảng cách từ chuột đến quả bóng để làm hiệu ứng dạt ra
          const dx = ball.x - mousePos.x;
          const dy = ball.y - mousePos.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          
          let offsetX = 0;
          let offsetY = 0;
          // Nếu chuột ở gần (bán kính 15%), bóng sẽ bị đẩy ra xa
          if (distance < 15 && mousePos.x !== -100) {
            const force = (15 - distance) * 1.5;
            offsetX = (dx / distance) * force;
            offsetY = (dy / distance) * force;
          }

          return (
            <div 
              key={ball.id} 
              className="pit-ball"
              onClick={() => loadNumber(ball)}
              style={{
                left: `${ball.x}%`,
                top: `${ball.y}%`,
                backgroundColor: ball.color,
                transform: `translate(${offsetX}vw, ${offsetY}vh) rotate(${ball.num * 30}deg)`,
                zIndex: Math.floor(ball.y)
              }}
            >
              {ball.num}
            </div>
          )
        })}
      </div>

      {otp.every(x => x !== "") && (
        <div className="success-msg">
          <p>Mã OTP của bạn là: {otp.map(o => o.num).join("")}</p>
          <button onClick={resetOTP} className="reset-btn">Bắn lại</button>
        </div>
      )}
    </div>
  );
}

export default App;
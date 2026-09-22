import React, { useState } from 'react';
import './App.css';

function App() {
  const [otp, setOtp] = useState(["", "", "", ""]);
  const [loadedNum, setLoadedNum] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragPos, setDragPos] = useState({ x: 0, y: 0 });
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const [isShooting, setIsShooting] = useState(false);

  const numbers = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];

  // Nạp đạn khi bấm vào số ở dưới
  const loadNumber = (num) => {
    if (loadedNum === null && otp.includes("") && !isShooting) {
      setLoadedNum(num);
      setDragPos({ x: 0, y: 0 });
    }
  };

  // Bắt đầu kéo súng
  const handlePointerDown = (e) => {
    if (loadedNum === null) return;
    e.target.setPointerCapture(e.pointerId);
    setIsDragging(true);
    setStartPos({ x: e.clientX, y: e.clientY });
  };

  // Đang kéo súng (tính độ giãn dây thun)
  const handlePointerMove = (e) => {
    if (!isDragging) return;
    let dx = e.clientX - startPos.x;
    let dy = e.clientY - startPos.y;
    
    // Giới hạn lực kéo (không cho kéo quá xa)
    const distance = Math.sqrt(dx * dx + dy * dy);
    const maxPull = 120;
    if (distance > maxPull) {
      dx = (dx / distance) * maxPull;
      dy = (dy / distance) * maxPull;
    }
    // Chỉ cho phép kéo xuống dưới và sang 2 bên
    if (dy < -20) dy = -20; 
    
    setDragPos({ x: dx, y: dy });
  };

  // Nhả chuột (Bắn!)
  const handlePointerUp = (e) => {
    if (!isDragging) return;
    setIsDragging(false);
    e.target.releasePointerCapture(e.pointerId);

    // Nếu kéo đủ lực xuống dưới thì mới bắn
    if (dragPos.y > 40) {
      setIsShooting(true);
      // Hiệu ứng đạn bay lên khung OTP
      setDragPos({ x: -dragPos.x * 0.5, y: -400 }); 
      
      setTimeout(() => {
        // Sau 300ms đạn bay tới nơi, gán số vào ô trống
        const newOtp = [...otp];
        const emptyIdx = newOtp.findIndex(x => x === "");
        if (emptyIdx !== -1) newOtp[emptyIdx] = loadedNum;
        setOtp(newOtp);
        setLoadedNum(null);
        setIsShooting(false);
        setDragPos({ x: 0, y: 0 });
      }, 300);
    } else {
      // Kéo nhẹ quá -> thu dây về vị trí cũ
      setDragPos({ x: 0, y: 0 });
    }
  };

  // Xóa OTP nhập lại
  const resetOTP = () => {
    setOtp(["", "", "", ""]);
    setLoadedNum(null);
  };

  return (
    <div className="game-container">
      <h2>🎯 NHẬP OTP ĐỂ MỞ KHÓA</h2>
      
      {/* Khung hiển thị OTP */}
      <div className="otp-display">
        {otp.map((digit, idx) => (
          <div key={idx} className={`otp-box ${digit !== "" ? "filled" : ""}`}>
            {digit}
          </div>
        ))}
      </div>

      {/* Súng cao su */}
      <div className="slingshot-area">
        <div className="slingshot-frame">
          <div className="prong left"></div>
          <div className="prong right"></div>
          <div className="handle"></div>
          
          {/* Vẽ dây thun bằng SVG */}
          {loadedNum !== null && (
            <svg className="rubber-bands">
              <line x1="-35" y1="-50" x2={dragPos.x} y2={dragPos.y} className="band" />
              <line x1="35" y1="-50" x2={dragPos.x} y2={dragPos.y} className="band" />
            </svg>
          )}
        </div>

        {/* Viên đạn (Số được nạp) */}
        {loadedNum !== null && (
          <div 
            className={`projectile ${isShooting ? 'shooting' : ''}`}
            style={{ transform: `translate(${dragPos.x}px, ${dragPos.y}px)` }}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
          >
            {loadedNum}
          </div>
        )}
      </div>

      {/* Kho đạn (Các con số lủng lẳng ở dưới) */}
      <div className="ammo-belt">
        {numbers.map(num => (
          <div 
            key={num} 
            className="ammo-item"
            onClick={() => loadNumber(num)}
          >
            {num}
          </div>
        ))}
      </div>

      {otp.every(x => x !== "") && (
        <div className="success-msg">
          <p>Mã OTP của bạn là: {otp.join("")}</p>
          <button onClick={resetOTP} className="reset-btn">Bắn lại</button>
        </div>
      )}
    </div>
  );
}

export default App;
import React, { useState, useRef, useEffect } from 'react';

/**
 * ChatWindow 컴포넌트
 * 
 * Props:
 * @param {Array} messages - 채팅 메시지 배열 [Required]
 * @param {number} selectedMessageId - 선택된 메시지 ID [Optional]
 * @param {function} onMessageSelect - 메시지 선택 핸들러 [Optional]
 * @param {function} onSendMessage - 메시지 전송 핸들러 [Optional]
 * @param {boolean} isProcessing - Agent 응답 처리 중 여부 [Optional]
 * 
 * Example usage:
 * <ChatWindow messages={messages} selectedMessageId={selectedId} onMessageSelect={handleSelect} onSendMessage={handleSend} isProcessing={isProcessing} />
 */
function ChatWindow({ messages = [], selectedMessageId = null, onMessageSelect, onSendMessage, isProcessing = false }) {
  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // 새 메시지가 추가되면 스크롤을 맨 아래로
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (inputText.trim()) {
      onSendMessage && onSendMessage(inputText.trim());
      setInputText('');
      inputRef.current?.focus();
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <div className="h-full flex flex-col bg-white">
      {/* 헤더 */}
      <div className="px-6 py-4 border-b border-gray-200 flex-shrink-0">
        <h2 className="text-lg font-semibold text-gray-900">대화 기록</h2>
      </div>

      {/* 메시지 리스트 */}
      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
        {messages.map((message) => {
          const isCustomer = message.speaker === '고객';
          const isSelected = selectedMessageId === message.id;

          return (
            <div
              key={message.id}
              onClick={() => onMessageSelect && onMessageSelect(message.id)}
              className={`flex ${isCustomer ? 'justify-start' : 'justify-end'} cursor-pointer transition-all ${
                isSelected ? 'opacity-100' : 'opacity-70 hover:opacity-100'
              }`}
            >
              <div
                className={`max-w-[80%] rounded-lg px-4 py-3 ${
                  isCustomer
                    ? 'bg-gray-100 text-gray-900'
                    : ''
                }`}
                style={
                  isCustomer
                    ? (isSelected ? { boxShadow: '0 0 0 2px #F0ECE4' } : {})
                    : {
                        backgroundColor: '#F0ECE4',
                        color: '#5a4a3a',
                        ...(isSelected ? { boxShadow: '0 0 0 2px #F0ECE4, 0 0 0 4px rgba(240, 236, 228, 0.3)' } : {}),
                      }
                }
              >
                <div className="text-xs font-medium mb-1 opacity-70">
                  {message.speaker === 'Agent' ? 'DiVE Agent' : message.speaker}
                </div>
                <div className="text-sm leading-relaxed whitespace-pre-wrap">
                  {message.text}
                </div>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* 입력창 */}
      <div className="border-t border-gray-200 flex-shrink-0 bg-white">
        <form onSubmit={handleSubmit} className="p-4">
          <div className="flex gap-2">
            <input
              ref={inputRef}
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="메시지를 입력하세요..."
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-transparent"
              onFocus={(e) => {
                e.currentTarget.style.boxShadow = '0 0 0 2px #F0ECE4';
              }}
              onBlur={(e) => {
                e.currentTarget.style.boxShadow = '';
              }}
            />
            <button
              type="submit"
              disabled={!inputText.trim() || isProcessing}
              className="px-6 py-2 rounded-lg disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors font-medium"
              style={!inputText.trim() || isProcessing ? {} : { backgroundColor: '#F0ECE4', color: '#5a4a3a' }}
              onMouseEnter={(e) => {
                if (!inputText.trim() || isProcessing) return;
                e.currentTarget.style.backgroundColor = '#e6ddd0';
              }}
              onMouseLeave={(e) => {
                if (!inputText.trim() || isProcessing) return;
                e.currentTarget.style.backgroundColor = '#F0ECE4';
              }}
            >
              {isProcessing ? '처리 중...' : '전송'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ChatWindow;

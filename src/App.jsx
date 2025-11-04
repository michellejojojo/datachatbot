import React, { useState, useEffect, useRef } from 'react';
import ChatWindow from './components/ChatWindow';
import ThinkingPanel from './components/ThinkingPanel';
import chatData from './data/chatData.json';

/**
 * App 컴포넌트
 * 
 * Example usage:
 * <App />
 */
function App() {
  const [messages, setMessages] = useState([]);
  const [selectedMessageId, setSelectedMessageId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const chatDataRef = useRef(chatData);
  const nextMessageIdRef = useRef(1);
  const chatDataIndexRef = useRef(0); // chatData 배열의 현재 인덱스 추적

  useEffect(() => {
    try {
      setLoading(true);
      // 초기 메시지는 비어있음 (사용자가 시작)
      setMessages([]);
      setError(null);
      nextMessageIdRef.current = 1;
      chatDataIndexRef.current = 0;
    } catch (err) {
      console.error('Failed to load chat data:', err);
      setError('데이터를 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  }, []);

  const selectedMessage = messages.find((msg) => msg.id === selectedMessageId);
  const thinking = selectedMessage?.thinking || null;
  const agentText = selectedMessage?.speaker === 'Agent' ? selectedMessage.text : '';

  const handleMessageSelect = (messageId) => {
    const message = messages.find((msg) => msg.id === messageId);
    if (message?.speaker === 'Agent' && message?.thinking) {
      setSelectedMessageId(messageId);
    } else {
      setSelectedMessageId(null);
    }
  };

  // 다음 Agent 응답 찾기 (chatData 배열 순서대로)
  const findNextAgentResponse = () => {
    const data = chatDataRef.current;
    let currentIndex = chatDataIndexRef.current;

    // 현재 인덱스부터 다음 Agent 메시지 찾기
    for (let i = currentIndex; i < data.length; i++) {
      if (data[i].speaker === 'Agent') {
        chatDataIndexRef.current = i + 1; // 다음 인덱스로 업데이트
        return data[i];
      }
    }
    return null;
  };

  const handleSendMessage = (text) => {
    if (!text.trim() || isProcessing) return;

    // 사용자 메시지 즉시 추가
    const userMessageId = nextMessageIdRef.current;
    const newUserMessage = {
      id: userMessageId,
      speaker: '고객',
      text: text.trim(),
    };

    setMessages((prevMessages) => {
      const updatedMessages = [...prevMessages, newUserMessage];
      nextMessageIdRef.current += 1;

      // 2초 후 Agent 응답 추가
      setIsProcessing(true);
      setTimeout(() => {
        const nextAgentResponse = findNextAgentResponse();
        if (nextAgentResponse) {
          setMessages((currentMessages) => {
            const agentMessage = {
              ...nextAgentResponse,
              id: nextMessageIdRef.current,
            };
            nextMessageIdRef.current += 1;

            // Agent 메시지가 thinking을 가지고 있으면 자동 선택
            if (agentMessage.thinking) {
              setTimeout(() => {
                setSelectedMessageId(agentMessage.id);
              }, 100);
            }

            return [...currentMessages, agentMessage];
          });
        }
        setIsProcessing(false);
      }, 2000);

      return updatedMessages;
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">로딩 중...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center text-red-600">
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="h-screen flex">
        {/* 왼쪽: ChatWindow (40%) */}
        <div className="w-2/5 border-r border-gray-200">
          <ChatWindow
            messages={messages}
            selectedMessageId={selectedMessageId}
            onMessageSelect={handleMessageSelect}
            onSendMessage={handleSendMessage}
            isProcessing={isProcessing}
          />
        </div>

        {/* 오른쪽: ThinkingPanel (60%) */}
        <div className="w-3/5">
          <ThinkingPanel thinking={thinking} agentText={agentText} />
        </div>
      </div>
    </div>
  );
}

export default App;

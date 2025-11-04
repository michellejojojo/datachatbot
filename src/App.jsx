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
  // chatData.json 구조: 고객 메시지 → Agent 메시지 순서
  // 사용자가 메시지를 보내면, 그 다음에 나오는 Agent 메시지를 반환
  const findNextAgentResponse = () => {
    const data = chatDataRef.current;
    const currentIndex = chatDataIndexRef.current;

    // 현재 인덱스가 배열 범위를 벗어나면 null 반환
    if (currentIndex >= data.length) {
      return null;
    }

    // 현재 인덱스부터 다음 Agent 메시지 찾기
    // 고객 메시지는 건너뛰고 Agent 메시지만 찾음
    for (let i = currentIndex; i < data.length; i++) {
      if (data[i] && data[i].speaker === 'Agent') {
        // 다음 처리할 인덱스로 업데이트 (Agent 메시지 다음)
        chatDataIndexRef.current = i + 1;
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

    // 사용자 메시지 추가
    setMessages((prevMessages) => {
      return [...prevMessages, newUserMessage];
    });
    nextMessageIdRef.current += 1;

    // Agent 응답 추가 함수 (재귀적으로 연속 Agent 메시지 처리)
    const addAgentResponse = (delay = 2000) => {
      setIsProcessing(true);
      setTimeout(() => {
        try {
          // 현재 인덱스에서 다음 Agent 메시지 찾기
          const nextAgentResponse = findNextAgentResponse();
          if (nextAgentResponse) {
            const agentMessage = {
              ...nextAgentResponse,
              id: nextMessageIdRef.current,
            };
            nextMessageIdRef.current += 1;

            setMessages((currentMessages) => {
              return [...currentMessages, agentMessage];
            });

            // 다음 chatData 항목 확인
            const data = chatDataRef.current;
            const nextIndex = chatDataIndexRef.current;
            const nextItem = nextIndex < data.length ? data[nextIndex] : null;
            const isNextCustomerMessage = nextItem && nextItem.speaker === '고객';
            const isNextAgentMessage = nextItem && nextItem.speaker === 'Agent';

            // 다음 Agent 메시지의 delay 확인 (있으면 사용, 없으면 기본 2000ms)
            const nextAgentDelay = isNextAgentMessage && nextItem.delay ? nextItem.delay : 2000;

            // Agent 메시지가 thinking을 가지고 있으면 자동 선택
            if (agentMessage.thinking) {
              // 다음 항목이 고객 메시지면 thinking 블록 선택을 즉시 처리하고 입력 대기 모드로 전환
              if (isNextCustomerMessage) {
                setSelectedMessageId(agentMessage.id);
                setIsProcessing(false);
              } else if (isNextAgentMessage) {
                // 다음 항목이 Agent 메시지면 thinking 블록 선택 후 연속으로 추가
                setTimeout(() => {
                  setSelectedMessageId(agentMessage.id);
                }, 100);
                // isProcessing은 다음 Agent 메시지 추가 시 true로 설정됨
                addAgentResponse(nextAgentDelay);
              } else {
                // 다음 항목이 없으면 기존대로 처리
                setTimeout(() => {
                  setSelectedMessageId(agentMessage.id);
                }, 100);
                setIsProcessing(false);
              }
            } else {
              // thinking이 없으면 다음 항목 확인
              if (isNextAgentMessage) {
                // 다음 항목이 Agent 메시지면 연속으로 추가 (delay 속성 사용)
                // isProcessing은 addAgentResponse 내부에서 true로 설정됨
                // 현재 isProcessing이 true 상태이므로 유지
                addAgentResponse(nextAgentDelay);
              } else if (isNextCustomerMessage) {
                // 다음 항목이 고객 메시지면 입력 대기 모드로 전환
                setIsProcessing(false);
              } else {
                // 다음 항목이 없으면 입력 대기 모드로 전환
                setIsProcessing(false);
              }
            }
          } else {
            // 더 이상 Agent 응답이 없으면 입력 대기 모드로 전환
            setIsProcessing(false);
          }
        } catch (error) {
          console.error('Error in addAgentResponse:', error);
          setIsProcessing(false);
        }
      }, delay);
    };

    // 첫 번째 Agent 응답 추가 시작
    addAgentResponse(2000);
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

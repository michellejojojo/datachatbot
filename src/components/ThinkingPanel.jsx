import React from 'react';
import FadeInContainer from './FadeInContainer';

/**
 * ThinkingPanel 컴포넌트
 * 
 * Props:
 * @param {object} thinking - Agent의 thinking 객체 [Optional]
 * @param {string} agentText - Agent의 메시지 텍스트 [Optional]
 * 
 * Example usage:
 * <ThinkingPanel thinking={selectedMessage.thinking} agentText={selectedMessage.text} />
 */
function ThinkingPanel({ thinking = null, agentText = '' }) {
  if (!thinking) {
    return (
      <div className="h-full flex items-center justify-center bg-gray-50">
        <div className="text-center text-gray-400">
          <div className="text-4xl mb-4">💭</div>
          <p className="text-sm">메시지를 선택하면 Agent의 사고 과정을 확인할 수 있습니다.</p>
        </div>
      </div>
    );
  }

  // Agent Comment 렌더링
  const renderAgentComment = () => {
    if (!agentText) return null;
    return (
      <FadeInContainer direction="top" offset={30} duration={0.6} delay={0}>
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
          <h3 className="text-base font-bold mb-2 text-gray-900">DiVE Agent Comment</h3>
          <p className="text-sm text-gray-700 leading-relaxed">{agentText}</p>
        </div>
      </FadeInContainer>
    );
  };

  // 아이콘 매핑
  const getInferenceIcon = (heading) => {
    if (
      heading.includes('구매 가능성이 높은 제품') ||
      heading.includes('구매 가능성') ||
      heading.includes('선호제품')
    ) {
      return '💡';
    }
    if (
      heading.includes('서비스 취향') ||
      heading.includes('취향') ||
      heading.includes('서비스이용성향') ||
      heading.includes('서비스 이용')
    ) {
      return '⚙️';
    }
    if (
      heading.includes('라이프스타일') ||
      heading.includes('라이프') ||
      heading.includes('고객성향') ||
      heading.includes('고객 성향')
    ) {
      return '🏡';
    }
    return null;
  };

  // 표 데이터 렌더링 (범용)
  const renderTable = (section) => {
    if (!section.table) return null;

    const { columns, rows } = section.table;
    const maxUsageTime = Math.max(...rows.map((row) => row['평균 사용 시간(분)'] || 0), 1);
    const sortedUsageCount = [...rows]
      .sort((a, b) => (b['총 사용 횟수'] || 0) - (a['총 사용 횟수'] || 0))
      .slice(0, 2);
    const topUsageCounts = new Set(sortedUsageCount.map((row) => row['총 사용 횟수']));

    return (
      <div className="mt-4 overflow-x-auto">
        <table className="w-full text-sm border-collapse max-w-full">
          <thead>
            <tr className="bg-gray-100 border-b border-gray-300">
              {columns.map((col, idx) => (
                <th key={idx} className="text-left py-2 px-4 font-semibold text-gray-900">
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, rowIdx) => {
              const usageTime = row['평균 사용 시간(분)'] || 0;
              const usageCount = row['총 사용 횟수'] || 0;
              const isTopUsage = topUsageCounts.has(usageCount);
              const barWidth = maxUsageTime > 0 ? (usageTime / maxUsageTime) * 100 : 0;

              return (
                <tr key={rowIdx} className="border-b border-gray-200">
                  {columns.map((col, colIdx) => (
                    <td key={colIdx} className="py-2 px-4">
                      {col === '평균 사용 시간(분)' ? (
                        <div className="flex items-center gap-3">
                          <span className="text-gray-700 min-w-[50px] text-xs">
                            {usageTime}분
                          </span>
                          <div className="flex-1 bg-gray-200 rounded-full h-4 max-w-[120px]">
                            <div
                              className="h-full rounded-full transition-all duration-500"
                              style={{ width: `${barWidth}%`, backgroundColor: '#F0ECE4' }}
                            />
                          </div>
                        </div>
                      ) : col === '총 사용 횟수' ? (
                        <span
                          className={`${
                            isTopUsage ? 'bg-yellow-100 text-yellow-900 font-medium px-2 py-1 rounded' : 'text-gray-700'
                          }`}
                        >
                          {usageCount}회
                        </span>
                      ) : (
                        <span className="text-gray-700 truncate block max-w-[150px]">{row[col]}</span>
                      )}
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    );
  };

  // 진행률 바 렌더링
  const renderProgressBar = (score) => {
    const percentage = typeof score === 'number' ? score : parseInt(score) || 0;
    const isHighScore = percentage >= 90;

    return (
      <div className="flex items-center gap-3">
        <div className="flex-1 bg-gray-200 rounded-full h-6 max-w-[200px]">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{ width: `${percentage}%`, backgroundColor: isHighScore ? '#22c55e' : '#F0ECE4' }}
          />
        </div>
        <span
          className={`min-w-[45px] text-right ${
            isHighScore ? 'text-green-700 font-medium' : 'text-gray-700'
          }`}
        >
          {percentage}%
        </span>
      </div>
    );
  };

  // 예측 추천 표 렌더링
  const renderPredictionTable = (section) => {
    if (!section.predictions) return null;

    return (
      <div className="mt-4 overflow-x-auto">
        <table className="w-full text-sm border-collapse max-w-full">
          <thead>
            <tr className="bg-gray-100 border-b border-gray-300">
              <th className="text-left py-2 px-4 font-semibold text-gray-900">제품명</th>
              <th className="text-left py-2 px-4 font-semibold text-gray-900">점수</th>
            </tr>
          </thead>
          <tbody>
            {section.predictions.map((prediction, idx) => {
              const score = typeof prediction.score === 'number' ? prediction.score : parseInt(prediction.score) || 0;
              const isHighScore = score >= 90;

              return (
                <tr
                  key={idx}
                  className={`border-b border-gray-200 ${
                    isHighScore ? 'bg-green-50' : ''
                  }`}
                >
                  <td className="py-2 px-4">
                    <span className={`${isHighScore ? 'text-green-800 font-medium' : 'text-gray-700'} truncate block max-w-[200px]`}>
                      {prediction.product}
                    </span>
                  </td>
                  <td className="py-2 px-4">
                    {renderProgressBar(score)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    );
  };

  // 추론 데이터 렌더링
  const renderInferences = (inferences) => {
    if (!inferences || !Array.isArray(inferences)) return null;

    return (
      <div className="mt-4 space-y-3">
        {inferences.map((inference, idx) => {
          const icon = getInferenceIcon(inference.heading);
          return (
            <div key={idx} className="border-l-2 border-gray-300 pl-4 py-2">
              <div className="flex items-start gap-2 mb-1">
                {icon && <span className="text-lg">{icon}</span>}
                <h4 className="text-sm font-bold text-gray-900">{inference.heading}</h4>
              </div>
              <p className="text-sm text-gray-700 leading-relaxed ml-6">{inference.content}</p>
            </div>
          );
        })}
      </div>
    );
  };

  // 섹션 타입 확인
  const getSectionType = (heading) => {
    if (
      heading.includes('가전 사용성 데이터') ||
      heading.includes('가전 사용') ||
      heading.includes('최근 가전 사용 데이터') ||
      heading.includes('사용 데이터 분석')
    ) {
      return 'usage-data';
    }
    if (heading.includes('수리 이력') || heading.includes('수리')) {
      return 'repair-history';
    }
    if (heading.includes('상담 이력') || heading.includes('상담')) {
      return 'consultation-history';
    }
    if (heading.includes('구매 이력') || heading.includes('구매')) {
      return 'purchase-history';
    }
    if (heading.includes('고객성향') || heading.includes('고객 성향')) {
      return 'customer-tendency';
    }
    if (
      heading.includes('선제적 정보 확인') ||
      heading.includes('선제적') ||
      heading.includes('Policy')
    ) {
      return 'policy-action';
    }
    if (
      heading.includes('고객 속성 추론') ||
      heading.includes('속성 추론') ||
      heading.includes('고객 속성 추론 데이터')
    ) {
      return 'customer-inference';
    }
    return 'default';
  };

  // 중요한 키워드 강조 렌더링
  const renderHighlightedContent = (content) => {
    // 중요한 키워드 목록 (긴 키워드부터 정렬)
    const keywords = [
      '시간 낭비 방지',
      '즉시 식별됨',
      '빠른 응답',
      '즉시 확인',
      '자동화',
      '선제적',
      '실시간',
      '효율성',
      '자동',
      '즉각',
    ];

    // 먼저 **로 감싸진 텍스트를 처리
    const parts = content.split('**');
    const result = [];

    parts.forEach((part, partIndex) => {
      if (partIndex % 2 === 1) {
        // **로 감싸진 부분은 굵게
        result.push(
          <strong key={`bold-${partIndex}`} className="font-semibold text-gray-900">
            {part}
          </strong>
        );
      } else {
        // 키워드 강조 처리
        let remainingText = part;
        let keyCounter = 0;

        while (remainingText.length > 0) {
          let matched = false;
          let earliestMatch = null;
          let earliestIndex = Infinity;

          // 모든 키워드 중 가장 앞에 나오는 것 찾기
          keywords.forEach((keyword) => {
            const index = remainingText.toLowerCase().indexOf(keyword.toLowerCase());
            if (index !== -1 && index < earliestIndex) {
              earliestIndex = index;
              earliestMatch = keyword;
              matched = true;
            }
          });

          if (matched && earliestMatch) {
            // 키워드 이전 텍스트
            if (earliestIndex > 0) {
              result.push(
                <span key={`text-${keyCounter++}`}>{remainingText.substring(0, earliestIndex)}</span>
              );
            }
            // 키워드 강조
            result.push(
              <span
                key={`keyword-${keyCounter++}`}
                className="bg-green-100 text-green-800 font-semibold px-1.5 py-0.5 rounded"
              >
                {remainingText.substring(earliestIndex, earliestIndex + earliestMatch.length)}
              </span>
            );
            remainingText = remainingText.substring(earliestIndex + earliestMatch.length);
          } else {
            // 더 이상 키워드가 없으면 나머지 텍스트 추가
            if (remainingText.length > 0) {
              result.push(<span key={`text-${keyCounter++}`}>{remainingText}</span>);
            }
            break;
          }
        }
      }
    });

    return result;
  };

  // 핵심 추론 카드 렌더링 (고객 속성 분석)
  const renderCoreInference = (section) => {
    const icon = getInferenceIcon(section.heading);

    return (
      <FadeInContainer direction="top" offset={30} duration={0.6} delay={0.1}>
        <div className="bg-amber-50 rounded-lg border-2 border-amber-200 p-6 mb-6 shadow-md flex-shrink-0">
          <h3 className="text-xl font-bold mb-4 text-gray-900">
            🧠 핵심 고객 추론 및 행동 예측
          </h3>
          {section.content && (
            <div className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap mb-4">
              {section.content.split('**').map((part, i) =>
                i % 2 === 1 ? (
                  <strong key={i} className="font-semibold text-gray-900">
                    {part}
                  </strong>
                ) : (
                  part
                )
              )}
            </div>
          )}
          {renderInferences(section.inferences)}
        </div>
      </FadeInContainer>
    );
  };

  // 일반 섹션 렌더링
  const renderSection = (section, index, isAfterCore = false) => {
    const icon = getInferenceIcon(section.heading);
    const sectionType = getSectionType(section.heading);
    const isUsageData = sectionType === 'usage-data';
    const isWarningSection = sectionType === 'repair-history' || sectionType === 'customer-tendency';
    const isPolicyAction = sectionType === 'policy-action';

    // 테두리 스타일 결정
    let borderClass = 'border border-gray-200';
    if (isUsageData) {
      borderClass = 'border-4 border-green-500';
    }

    // Policy Action 섹션은 블록 인용구 스타일로 렌더링
    if (isPolicyAction) {
      return (
        <FadeInContainer
          key={index}
          direction="bottom"
          offset={40}
          duration={0.6}
          delay={(isAfterCore ? index + 1 : index) * 0.15}
          once={true}
        >
          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200 h-full flex flex-col">
            <h3 className="text-base font-bold text-gray-900 mb-4 flex-shrink-0">
              🔍 정책 기반 선제적 행동 결과
            </h3>
            <div className="flex-1 overflow-y-auto">
              {section.content && (
                <blockquote className="border-l-4 border-green-300 pl-4 py-3 bg-green-50 rounded-r-lg mb-4">
                  <div className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                    {renderHighlightedContent(section.content)}
                  </div>
                </blockquote>
              )}
              {renderInferences(section.inferences)}
              {renderTable(section)}
              {renderPredictionTable(section)}
            </div>
          </div>
        </FadeInContainer>
      );
    }

    return (
      <FadeInContainer
        key={index}
        direction="bottom"
        offset={40}
        duration={0.6}
        delay={(isAfterCore ? index + 1 : index) * 0.15}
        once={true}
      >
        <div className={`bg-white rounded-lg p-6 shadow-sm ${borderClass} h-full flex flex-col`}>
          {/* 배지 표시 */}
          <div className="flex items-center gap-2 mb-3 flex-shrink-0">
            {isUsageData && (
              <span className="text-xs font-bold px-2 py-1 rounded bg-green-100 text-green-800">
                원인 강조
              </span>
            )}
            {isWarningSection && (
              <span className="inline-flex items-center gap-1 text-xs font-semibold bg-red-100 text-red-700 px-2 py-1 rounded">
                🔴 경고
              </span>
            )}
          </div>
          <div className="flex items-start gap-3 mb-3 flex-shrink-0">
            {icon && <span className="text-xl">{icon}</span>}
            <h3 className="text-base font-bold text-gray-900 flex-1">{section.heading}</h3>
          </div>
          <div className="flex-1 overflow-y-auto">
            {section.content && (
              <div className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap mb-4">
                {section.content.split('**').map((part, i) =>
                  i % 2 === 1 ? (
                    <strong key={i} className="font-semibold text-gray-900">
                      {part}
                    </strong>
                  ) : (
                    part
                  )
                )}
              </div>
            )}
            {renderInferences(section.inferences)}
            {renderTable(section)}
            {renderPredictionTable(section)}
          </div>
        </div>
      </FadeInContainer>
    );
  };

  // 섹션 분리: Level 2 (원인/추론 강조)와 Level 3 (보조 데이터)
  const sections = thinking.sections || [];
  
  // Level 2: 원인/추론 강조 섹션들 (전체 폭)
  const usageDataIndex = sections.findIndex(
    (section) => getSectionType(section.heading) === 'usage-data'
  );
  const coreInferenceIndex = sections.findIndex(
    (section) =>
      section.heading.includes('고객 속성 분석') ||
      section.heading.includes('고객 속성') ||
      section.heading.includes('속성 분석')
  );
  
  const usageDataSection = usageDataIndex >= 0 ? sections[usageDataIndex] : null;
  const coreInferenceSection = coreInferenceIndex >= 0 ? sections[coreInferenceIndex] : null;
  
  // Level 3: 나머지 보조 섹션들 (2단 Grid)
  const level3Sections = sections.filter(
    (_, index) => index !== usageDataIndex && index !== coreInferenceIndex
  );

  return (
    <div className="h-full flex flex-col bg-gray-50">
      {/* 헤더 */}
      <FadeInContainer direction="top" offset={30} duration={0.6} delay={0}>
        <div className="px-8 py-5 border-b border-gray-200 bg-white flex-shrink-0">
          <h2 className="text-xl font-semibold text-gray-900">{thinking.title}</h2>
        </div>
      </FadeInContainer>

      {/* Thinking 섹션들 */}
      <div className="flex-1 flex flex-col px-8 py-6 min-h-0">
        {/* Level 1: Agent Comment - 전체 폭, 최상단 */}
        <div className="flex-shrink-0 mb-4">
          {renderAgentComment()}
        </div>
        
        {/* Level 2: 원인/추론 강조 섹션들 - 연속적으로 전체 폭 */}
        <div className="flex-shrink-0 space-y-4 mb-4">
          {usageDataSection && (
            <div>
              {renderSection(usageDataSection, 0, false)}
            </div>
          )}
          {coreInferenceSection && (
            <div>
              {renderCoreInference(coreInferenceSection)}
            </div>
          )}
        </div>
        
        {/* Level 3: 나머지 보조 섹션들 - 2단 Grid */}
        {level3Sections.length > 0 ? (
          <div className="flex-1 grid grid-cols-2 gap-4 min-h-0">
            {level3Sections.map((section, index) => (
              <div key={index} className="min-h-0">
                {renderSection(section, index, true)}
              </div>
            ))}
          </div>
        ) : (
          sections.length === 0 && (
            <div className="bg-white rounded-lg border border-gray-200 p-6 text-center text-gray-500">
              섹션 데이터가 없습니다.
            </div>
          )
        )}
      </div>
    </div>
  );
}

export default ThinkingPanel;

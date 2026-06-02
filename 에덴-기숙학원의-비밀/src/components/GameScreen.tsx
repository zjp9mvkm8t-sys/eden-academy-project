import { useState, useEffect, useRef } from 'react';
import { Scenario, Quest, LogEntry, GameState } from '../types';
import { SCENARIO_DB, ITEMS } from '../data/gameData';

interface GameScreenProps {
  scenario: Scenario;
  onEndReached: (endingType: string, suinTrust: number, aranTrust: number) => void;
  onOpenArgWeb?: () => void;
}

export default function GameScreen({ scenario, onEndReached, onOpenArgWeb }: GameScreenProps) {
  // 극 중 퀘스트 데이터베이터 획득
  const quests = SCENARIO_DB[scenario] || [];
  const questOrder = quests.map(q => q.qid);

  // 1. 게임 전반 상태 state
  const [currentQuestId, setCurrentQuestId] = useState<string>(questOrder[0]);
  const [completedQuests, setCompletedQuests] = useState<string[]>([]);
  const [inventory, setInventory] = useState<string[]>([]);
  const [suinTrust, setSuinTrust] = useState<number>(0);
  const [aranTrust, setAranTrust] = useState<number>(0);
  const [hqCompleted, setHqCompleted] = useState<string[]>([]);
  const [hintsUsed, setHintsUsed] = useState<Record<string, number>>({});
  
  // 2. 타이머 & 인게임 편의 지수 state
  const [timerRemaining, setTimerRemaining] = useState<number>(0);
  const [timerActive, setTimerActive] = useState<boolean>(false);
  const [isShakeInput, setIsShakeInput] = useState<boolean>(false);
  const [inputValue, setInputValue] = useState<string>('');
  const [feedback, setFeedback] = useState<{ type: 'ok' | 'err' | 'info' | ''; text: string }>({ type: '', text: '' });
  const [currentLogs, setCurrentLogs] = useState<LogEntry[]>([]);
  const [isOpenHintBody, setIsOpenHintBody] = useState<boolean>(false);
  
  // 가스실 등 observe 미니 전용 탐색 상태
  const [gasSearchStep, setGasSearchStep] = useState<number>(0); // 0: 미탐색, 1: 책상수색(동전획득), 2: 소화기치우기, 3: 볼트분거 완료
  const logEndRef = useRef<HTMLDivElement>(null);

  const quest = quests.find(q => q.qid === currentQuestId) as Quest;

  // 3. 컴포넌트 마운트 시 초기화 및 타임스탬프 기록
  useEffect(() => {
    addLog('초기 게임 구동 개시. 에덴 기숙학원 침입로에 진입하였습니다.', 'info');
    if (quest?.timeLimit > 0) {
      triggerTimer(quest.timeLimit);
    }
    // 각 시나리오별 첫 장비 지급 
    if (scenario === 'A') {
      addLog('서연: "규리를 꺼내기까진 수단과 방법을 가리지 않겠어."', 'normal');
    } else if (scenario === 'B') {
      addLog('서연: "이곳의 암호 프로토콜은 전부 규리의 지문들과 조응해 있어."', 'normal');
    } else {
      addLog('서연: "적자 선별 체제라니... 이 기만의 제국을 박살 내겠어."', 'normal');
    }
  }, [scenario]);

  // 퀘스트 전이 시 타이머 대처
  useEffect(() => {
    if (!quest) return;
    setInputValue('');
    setFeedback({ type: '', text: '' });
    setIsOpenHintBody(false);
    
    if (quest.timeLimit > 0) {
      triggerTimer(quest.timeLimit);
    } else {
      setTimerActive(false);
    }

    addLog(`[위치 진입] ${quest.location} — ${quest.title}`, 'info');

    // 특수구역 가스방 수색 수집 초기화
    if (quest.qid === 'A-10-gas') {
      setGasSearchStep(0);
    }
  }, [currentQuestId]);

  // 타이머 실행 루프
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (timerActive && timerRemaining > 0) {
      interval = setInterval(() => {
        setTimerRemaining(prev => {
          if (prev <= 1) {
            setTimerActive(false);
            onTimeout();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [timerActive, timerRemaining]);

  // 로그 보드로 자동 스크롤
  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [currentLogs]);

  // 4. 전용 기능: 로그 기록
  const addLog = (text: string, type: 'normal' | 'good' | 'bad' | 'key' | 'info' = 'normal') => {
    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    const newLog: LogEntry = { time: timeStr, text, type };
    setCurrentLogs(prev => [...prev, newLog]);
  };

  // 5. 타이머 발동
  const triggerTimer = (seconds: number) => {
    setTimerRemaining(seconds);
    setTimerActive(true);
  };

  // 6. 제한 시간 만료 시 대처
  const onTimeout = () => {
    addLog(`🚨 제한 시간이 초과되었습니다! [${quest.title}]`, 'bad');
    if (quest.qid === 'A-10-gas') {
      // 가스실은 생사 트랩이므로 즉각 소멸 게임오버로 분기
      onEndReached('gameover', suinTrust, aranTrust);
    } else {
      setFeedback({ type: 'err', text: '시간 초과! 단서들을 더 빠르게 재정비하세요.' });
    }
  };

  // 7. 장외 아이템 획득 통로
  const grantItem = (itemId: string) => {
    if (!ITEMS[itemId]) return;
    if (inventory.includes(itemId)) return;
    setInventory(prev => [...prev, itemId]);
    addLog(`🎒 아이템 획득: ${ITEMS[itemId].emoji} [${ITEMS[itemId].name}]`, 'key');
  };

  const hasItem = (itemId: string) => inventory.includes(itemId);

  // 8. 신뢰도 보정
  const adjustTrust = (target: 'suin' | 'aran', val: number) => {
    if (target === 'suin') {
      setSuinTrust(prev => Math.max(0, Math.min(100, prev + val)));
    } else {
      setAranTrust(prev => Math.max(0, Math.min(100, prev + val)));
    }
  };

  // 9. 힌트 발굴 처리
  const fetchHint = () => {
    const qid = quest.qid;
    const currentHintsUsed = hintsUsed[qid] || 0;
    if (currentHintsUsed >= quest.hintsMax) {
      setFeedback({ type: 'info', text: '이 구획의 모든 힌지 정보가 이미 개방되었습니다.' });
      setIsOpenHintBody(true);
      return;
    }

    const nextCount = currentHintsUsed + 1;
    setHintsUsed(prev => ({ ...prev, [qid]: nextCount }));
    setIsOpenHintBody(true);
    addLog(`🔑 암호구역 힌트 정보 가동 [${quest.title}] (${nextCount}/${quest.hintsMax})`, 'info');
  };

  // 10. 자물쇠 암호 확인 버튼 수락
  const handleCodeSubmit = () => {
    const trimmedInput = inputValue.trim().toUpperCase();
    if (!trimmedInput) {
      setFeedback({ type: 'err', text: '입력란에 코드를 입력하세요.' });
      return;
    }

    // A-10 가스실 퀘스트 전용 observe 수색 조건 확인!
    if (quest.qid === 'A-10-gas' && !hasItem('coin')) {
      setFeedback({ type: 'err', text: '볼트 나사를 제거할 납작한 도구가 필요해 보입니다. 방 안을 먼저 정밀히 수색하세요.' });
      setIsShakeInput(true);
      setTimeout(() => setIsShakeInput(false), 400);
      return;
    }

    if (trimmedInput === quest.answer) {
      onQuestSolveSuccess();
    } else {
      setFeedback({ type: 'err', text: '지정 전위와 일치하지 않습니다. 다시 독음하세요.' });
      setIsShakeInput(true);
      setTimeout(() => setIsShakeInput(false), 400);
      setInputValue('');
      addLog(`❌ [정합 오류] 잘못된 해치 다이얼 장전: ${trimmedInput}`, 'bad');
    }
  };

  // 11. 선택지 및 논리/도덕 기조 결정 수락
  const handleChoiceSubmit = (index: number) => {
    const choice = quest.choices?.[index];
    if (!choice) return;

    addLog(`☑️ 서연의 전격 선택: "${choice.text}"`, 'normal');

    // 기획 상의 신뢰도 및 전용 아이템 즉시 증여 적용
    if (quest.choiceTrust?.[index]) {
      const ct = quest.choiceTrust[index];
      if (ct.suin) adjustTrust('suin', ct.suin);
      if (ct.aran) adjustTrust('aran', ct.aran);
    }

    if (quest.choiceGrant?.[index]) {
      quest.choiceGrant[index].forEach(id => grantItem(id));
    }

    // 신뢰도 기본 효과 적용
    if (quest.trustEffect) {
      if (quest.trustEffect.suin) adjustTrust('suin', quest.trustEffect.suin);
      if (quest.trustEffect.aran) adjustTrust('aran', quest.trustEffect.aran);
    }

    // 다음 전환 퀘스트 확보
    const nextQ = quest.choiceNext?.[index] || quest.nextQuest;
    onQuestAdvance(nextQ);
  };

  // 12. 관찰형 구역 탐색 성공 핸들링
  const handleObserveSubmit = () => {
    // 특정 구획에서 얻는 고유 아이템 부여
    if (quest.itemsGranted) {
      quest.itemsGranted.forEach(id => grantItem(id));
    }

    if (quest.trustEffect) {
      if (quest.trustEffect.suin) adjustTrust('suin', quest.trustEffect.suin);
      if (quest.trustEffect.aran) adjustTrust('aran', quest.trustEffect.aran);
    }

    setFeedback({ type: 'ok', text: '✓ 정밀 수색 완료! 귀중한 단서 원류를 쟁취했습니다.' });
    addLog(`🔍 ${quest.location}의 조사를 성공리에 가동완료했습니다.`, 'good');
    
    // 지연 전이
    setTimeout(() => {
      onQuestAdvance(quest.nextQuest);
    }, 1200);
  };

  // 12-B. 특수 가스실 전용 조사 시퀀스
  const handleGasSearch = (action: 'desk' | 'extinguisher' | 'ventilator') => {
    if (action === 'desk' && gasSearchStep === 0) {
      grantItem('coin');
      setGasSearchStep(1);
      addLog('책상 위의 황동 문진 서랍을 세밀히 뒤져 얇고 마모된 "동전" 한 개를 회수했습니다!', 'key');
      setFeedback({ type: 'ok', text: '잠금장치 해지에 기용할 구리 동전(Cylinder Coin)을 확보했습니다.' });
    } else if (action === 'extinguisher' && gasSearchStep === 1) {
      setGasSearchStep(2);
      addLog('무거운 하론 분말 소화기 프레임을 옆으로 굴려 후방 틈새의 비밀 "비상 환기 보강구" 조절함을 색출해냈습니다!', 'good');
      setFeedback({ type: 'ok', text: '환풍 격자가 발굴되었습니다. 나사 고정부를 동전으로 풀어내십시오.' });
    } else if (action === 'ventilator' && gasSearchStep === 2) {
      setGasSearchStep(3);
      addLog('주머니 속 동전을 스크류 공구 삼아 꽉 물린 볼트 나사 4개를 무사히 돌려 환기 철망을 탈거했습니다!', 'good');
      setFeedback({ type: 'ok', text: '안쪽 알루미늄 필터 안 우측 끝에 서명된 4자리 암호 [2749] 가 비추어집니다!' });
    }
  };

  // 13. 성공 시 호출
  const onQuestSolveSuccess = () => {
    setFeedback({ type: 'ok', text: '✓ 암호 주입이 정합되었습니다! 세그먼트 장벽이 파쇄됩니다.' });
    addLog(`🔓 [식별 성공] 다이얼 격발 성공 — [${quest.title}]`, 'good');

    if (quest.itemsGranted) {
      quest.itemsGranted.forEach(id => grantItem(id));
    }

    if (quest.trustEffect) {
      if (quest.trustEffect.suin) adjustTrust('suin', quest.trustEffect.suin);
      if (quest.trustEffect.aran) adjustTrust('aran', quest.trustEffect.aran);
    }

    setTimeout(() => {
      onQuestAdvance(quest.nextQuest);
    }, 1000);
  };

  // 14. 씬 전환 공통 루트
  const onQuestAdvance = (nextQId: string) => {
    if (!completedQuests.includes(quest.qid)) {
      setCompletedQuests(prev => [...prev, quest.qid]);
    }

    if (nextQId === 'ENDING') {
      // 엔딩 수렴 판정 로직 작동
      determineAndTriggerEnding();
    } else if (nextQId === 'ENDING-DEFEAT') {
      onEndReached('defeat', suinTrust, aranTrust);
    } else {
      setCurrentQuestId(nextQId);
    }
  };

  // 15. 엔딩 수렴 검출기
  const determineAndTriggerEnding = () => {
    stopTimer();
    addLog('🏆 축하합니다! 에덴의 모든 물리 장벽 퀘스트의 암호 수용을 완료하였습니다.', 'key');
    
    // 신뢰도 세부 지수에 근거한 멀티 엔딩 산출
    let ending = 'escape';
    if (aranTrust >= 55) {
      ending = 'liberation';
    } else if (aranTrust >= 25) {
      ending = 'truth';
    } else if (suinTrust >= 45) {
      ending = 'defeat';
    }

    onEndReached(ending, suinTrust, aranTrust);
  };

  const stopTimer = () => {
    setTimerActive(false);
  };

  const currentHintsUsed = hintsUsed[quest.qid] || 0;

  return (
    <div className="flex h-full w-full bg-[#07070a] text-[#E6E4F4] overflow-hidden select-none font-sans gothic-stone">
      
      {/* ────────────────────────────────────────────────────────
           LEFT SECTION: MAP STATUS & INVENTORY PANELS
         ──────────────────────────────────────────────────────── */}
      <div className="w-[260px] bg-[#0d0d12]/90 border-r border-[#d4b86a]/20 flex flex-col justify-between flex-shrink-0">
        
        {/* 학원 추적 네비 세그먼트 헤더 */}
        <div className="p-4 border-b border-[#d4b86a]/15 select-none">
          <div className="font-serif text-sm font-black text-[#d4b86a] flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-[#d4b86a] animate-pulse"></span>
            {scenario === 'A' ? '에덴의 가면 (A)' : scenario === 'B' ? '무균실의 기억 (B)' : '선택받은 자들 (C)'}
          </div>
          <span className="font-mono text-[9px] text-[#50506A] uppercase tracking-widest block mt-1">
            EDEN SYSTEM CONNECTED
          </span>
        </div>

        {/* 퀘스트 사이드 디렉토리 트리 */}
        <div className="flex-1 overflow-y-auto px-1 py-3 space-y-4">
          <div className="px-3">
            <p className="font-mono text-[9px] text-[#50506A] tracking-widest uppercase mb-2">PROGRESS MAP</p>
            <div className="relative border-l border-[#d4b86a]/15 ml-3 pl-4 space-y-3">
              {quests.map((q, idx) => {
                const isCurrent = q.qid === currentQuestId;
                const isDone = completedQuests.includes(q.qid);
                const isLocked = !isCurrent && !isDone;

                return (
                  <div 
                    key={q.qid} 
                    className={`relative flex items-center gap-3 transition-colors ${isLocked ? 'opacity-25' : 'opacity-100'}`}
                  >
                    {/* 트리 핀 버텍스 노드 */}
                    <span 
                      className={`absolute -left-[20.5px] h-2.5 w-2.5 rounded-full border ${isDone ? 'bg-emerald-500 border-emerald-500' : isCurrent ? 'bg-[#d4b86a] border-[#f3d995] shadow-[0_0_10px_rgba(212,184,106,0.5)]' : 'bg-[#06060e] border-[#d4b86a]/30'}`}
                    ></span>
                    
                    <div className="min-w-0">
                      <div className="font-mono text-[8px] text-[#50506A] leading-none mb-0.5">{q.qid}</div>
                      <div className={`text-xs font-medium truncate ${isCurrent ? 'text-[#d4b86a] font-bold' : isDone ? 'text-gray-400 line-through' : 'text-gray-500'}`}>
                        {q.title}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* 실시간 구동 수인/아란 신뢰도 바 계측 */}
        <div className="p-4 border-t border-[#d4b86a]/15 bg-[#0d0d12]/50">
          <p className="font-mono text-[9px] text-[#50506A] tracking-widest uppercase mb-3 select-none">ALIGNMENT STATS</p>
          
          <div className="space-y-2.5 font-mono text-[10px]">
            {/* 수인 바 */}
            <div className="flex items-center gap-2">
              <span className="text-[#50506A] w-7 flex-shrink-0">SUIN</span>
              <div className="flex-1 h-1.5 bg-[#07070f] rounded-full overflow-hidden border border-[#d4b86a]/10">
                <div 
                  className="h-full bg-gradient-to-r from-[#d4b86a] via-[#f3d995] to-amber-500 rounded-full transition-all duration-500"
                  style={{ width: `${suinTrust}%` }}
                ></div>
              </div>
              <span className={`w-6 text-right font-bold ${suinTrust > 30 ? 'text-[#d4b86a]' : 'text-[#50506A]'}`}>{suinTrust}</span>
            </div>

            {/* 아란 바 */}
            <div className="flex items-center gap-2">
              <span className="text-[#50506A] w-7 flex-shrink-0">ARAN</span>
              <div className="flex-1 h-1.5 bg-[#07070f] rounded-full overflow-hidden border border-[#d4b86a]/10">
                <div 
                  className="h-full bg-gradient-to-r from-[#e6e4f4] to-[#9894b8] rounded-full transition-all duration-500"
                  style={{ width: `${aranTrust}%` }}
                ></div>
              </div>
              <span className={`w-6 text-right font-bold ${aranTrust > 30 ? 'text-[#e6e4f4]' : 'text-[#50506A]'}`}>{aranTrust}</span>
            </div>
          </div>
        </div>

        {/* 실시간 장착 인벤토리 */}
        <div className="p-4 border-t border-white/5 bg-[#0a0a0f]">
          <p className="font-mono text-[9px] text-[#50506A] tracking-[0.14em] uppercase mb-2.5">🎒 DETECTED INVENTORY</p>
          {inventory.length === 0 ? (
            <div className="rounded border border-dashed border-white/10 p-3 h-12 flex items-center justify-center text-center text-[10px] text-[#50506A] font-serif italic">
              — 현재 장비 없음 —
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">
              {inventory.map(itemId => {
                const item = ITEMS[itemId];
                return (
                  <div 
                    key={itemId}
                    className="group relative h-9 w-9 rounded border border-[#d4b86a]/30 hover:border-[#d4b86a] bg-[#111116] flex items-center justify-center text-lg cursor-default shadow-sm transition-all focus:outline-none"
                  >
                    {item?.emoji}
                    {/* 상향 호버 툴팁 */}
                    <div className="pointer-events-none absolute bottom-11 left-1/2 -translate-x-1/2 rounded border border-[#d4b86a]/30 bg-[#0d0d12] px-3 py-1.5 text-[10px] text-[#E6E4F4] opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-50 w-36 shadow-lg leading-relaxed">
                      <p className="font-bold text-[#d4b86a] mb-0.5">{item?.name}</p>
                      <p className="text-[#9894B8] text-[9px] whitespace-pre-line">{item?.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

      </div>

      {/* ────────────────────────────────────────────────────────
           CENTER SECTION: MAIN INTERACTIVE STAGE & WORKSPACE
         ──────────────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col justify-between bg-[#07070a] overflow-hidden">
        
        {/* 상단 현재 서스펜스 스테이지 지배 바 */}
        <div className="h-14 border-b border-white/5 bg-[#0d0d12]/60 px-6 flex items-center justify-between flex-shrink-0 select-none">
          <div className="flex items-center gap-3">
            <span className="text-xl animate-pulse">{quest?.emoji}</span>
            <div>
              <span className="font-mono text-[8px] text-[#50506A] tracking-wider block leading-none mb-0.5">LOCATION SEGMENT STAGE {quest?.stage}</span>
              <span className="font-serif text-xs font-semibold text-white">{quest?.location}</span>
            </div>
          </div>

          {/* 타임어택 가동 시 경보 표시 */}
          {timerActive && (
            <div className={`font-mono text-sm px-3 py-1 rounded border flex items-center gap-2 ${timerRemaining <= 30 ? 'border-red-500/50 bg-red-950/20 text-red-400 animate-pulse' : 'border-emerald-500/35 bg-emerald-500/5 text-emerald-400'}`}>
              <span className="h-2 w-2 rounded-full bg-current"></span>
              <span>{Math.floor(timerRemaining / 60)}:{String(timerRemaining % 60).padStart(2, '0')}</span>
            </div>
          )}
        </div>

        {/* 중앙 몰입형 시나리오 필드 */}
        <div className="flex-1 overflow-y-auto px-8 py-6 space-y-6">
          
          {/* 기획 연출 이모지 중심의 가상 어저스트 그래픽 룸 */}
          <div className="relative w-full h-44 rounded-md border border-[#d4b86a]/15 bg-gradient-to-br from-[#111116] to-[#07070a] flex items-center justify-center overflow-hidden group shadow-[inset_0_4px_40px_rgba(0,0,0,0.8)]">
            <div className="absolute inset-0 bg-[#d4b86a]/2 transition-opacity duration-300 group-hover:bg-transparent pointer-events-none"></div>
            <div className="flex flex-col items-center gap-2 z-10 text-center select-none">
              <span className="text-6xl drop-shadow-[0_0_20px_rgba(212,184,106,0.3)] transition-transform duration-500 group-hover:scale-110">{quest?.emoji}</span>
              <span className="font-mono text-[9px] text-[#50506A] tracking-wider uppercase">{quest?.location} 내부 환경식</span>
            </div>
          </div>

          {/* 퀘스트 본문 해설 */}
          <div>
            <div className="font-mono text-xs text-[#d4b86a] tracking-widest uppercase mb-1">{quest?.qid}</div>
            <h3 className="font-serif text-lg font-bold text-white tracking-tight mb-3">
              {quest?.title}
            </h3>
            
            {/* 퀘스트 주 지문 박스 */}
            <div className="rounded border border-[#d4b86a]/15 bg-[#111116]/65 p-5 text-sm text-[#9894B8] leading-relaxed whitespace-pre-line shadow-sm border-l-4 border-l-[#d4b86a]">
              {quest?.problem}
            </div>
          </div>

          {/* 특정 퀘스트 선결 요건 표시 */}
          {quest.itemsRequired && quest.itemsRequired.length > 0 && (
            <div>
              <p className="font-mono text-[9px] text-[#50506A] tracking-widest uppercase mb-2">REQUIRED CRITICAL EQUIPMENT</p>
              <div className="flex gap-2">
                {quest.itemsRequired.map(id => {
                  const have = hasItem(id);
                  const item = ITEMS[id];
                  return (
                    <div 
                      key={id}
                      className={`flex items-center gap-2 text-xs border rounded-sm px-3.5 py-1.5 font-medium ${have ? 'border-emerald-500/20 bg-emerald-500/5 text-emerald-400' : 'border-red-500/15 bg-red-950/5 text-red-400 select-none'}`}
                    >
                      <span>{item?.emoji}</span>
                      <span>{item?.name}</span>
                      <strong className="text-[10px] uppercase font-bold">{have ? '[보유]' : '[미획득]'}</strong>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* NPC 실시간 귓속말 스크립트 */}
          {quest.npcLine && (
            <div className="rounded border border-white/5 bg-[#111116]/40 px-4 py-3 text-xs italic text-[#9894B8] leading-relaxed border-l-2 border-l-[#d4b86a] shadow-sm">
              <strong className="text-[#d4b86a] not-italic mr-1.5 font-serif">●</strong> {quest.npcLine}
            </div>
          )}

        </div>

        {/* 하단 세련된 반응 인터랙트 조작 패널 */}
        <div className="border-t border-white/5 bg-[#0d0d12]/90 p-6 flex-shrink-0">
          
          {/* 가스실 전용 분기 수색 옵션 렌더링! */}
          {quest.qid === 'A-10-gas' ? (
            <div className="space-y-4">
              <p className="font-mono text-[9px] text-[#50506A] tracking-widest uppercase mb-2">ROOM RESEARCH SYSTEM (가스방 전격 조사)</p>
              
              <div className="flex gap-2 flex-wrap text-xs">
                <button 
                  disabled={gasSearchStep !== 0}
                  onClick={() => handleGasSearch('desk')}
                  className={`rounded px-4 py-2 font-semibold transition-all ${gasSearchStep === 0 ? 'bg-[#5546CC] hover:bg-[#7B6EE8] text-white' : 'bg-gray-800 text-gray-500 cursor-not-allowed'}`}
                >
                  {gasSearchStep > 0 ? '✓ 책상 수색완료' : '🔍 집무 책상 서랍 뒤지기'}
                </button>
                <button 
                  disabled={gasSearchStep !== 1}
                  onClick={() => handleGasSearch('extinguisher')}
                  className={`rounded px-4 py-2 font-semibold transition-all ${gasSearchStep === 1 ? 'bg-[#5546CC] hover:bg-[#7B6EE8] text-white' : 'bg-gray-800 text-gray-500 cursor-not-allowed'}`}
                >
                  {gasSearchStep > 1 ? '✓ 소화기 조사완료' : '🧯 구석의 무거운 소화기 치우기'}
                </button>
                <button 
                  disabled={gasSearchStep !== 2}
                  onClick={() => handleGasSearch('ventilator')}
                  className={`rounded px-4 py-2 font-semibold transition-all ${gasSearchStep === 2 ? 'bg-[#5546CC] hover:bg-[#7B6EE8] text-white' : 'bg-gray-800 text-gray-500 cursor-not-allowed'}`}
                >
                  {gasSearchStep > 2 ? '✓ 환기구 탈거완료' : '⚙️ 비상 송풍 격벽 분해하기'}
                </button>
              </div>

              {gasSearchStep === 3 && (
                <div className="mt-4 flex items-center gap-2">
                  <div className="flex border border-[#d4b86a]/35 rounded-sm bg-[#06060e] p-1 flex-1 max-w-[280px]">
                    <input 
                      type="text" 
                      value={inputValue}
                      onChange={e => setInputValue(e.target.value)}
                      maxLength={6}
                      placeholder="검출된 4자리 암호 입력"
                      onKeyDown={e => { if (e.key === 'Enter') handleCodeSubmit(); }}
                      className={`w-full bg-transparent p-1.5 font-mono text-sm tracking-widest text-center text-white outline-none placeholder:text-gray-600 ${isShakeInput ? 'border-red-500' : ''}`}
                    />
                  </div>
                  <button 
                    onClick={handleCodeSubmit}
                    className="rounded bg-emerald-600 hover:bg-emerald-500 text-white px-5 py-2.5 font-mono font-bold text-xs cursor-pointer transition-colors"
                  >
                    탈출해치 개방
                  </button>
                </div>
              )}
            </div>

          ) : (
            /* 일반 퀘스트 입력 유형 분기 렌더링 */
            <div>
              {/* 코드 및 쉬프트 암호해독 입력기 */}
              {(quest.type === 'code' || quest.type === 'caesar') && (
                <div className="space-y-3">
                  <p className="font-mono text-[9px] text-[#50506A] tracking-widest uppercase">
                    {quest.type === 'caesar' ? 'DECODE SHIFT CIPHER DIAL (카이사르 쉬프트 해독)' : 'DECRYPT SYSTEM CODE (시스템 자물쇠 해제)'}
                  </p>
                  
                  <div className="flex items-center gap-2">
                    <div className="flex border border-[#d4b86a]/30 rounded bg-[#06060e] p-1 flex-1 max-w-[280px]">
                      <input 
                        type="text" 
                        value={inputValue}
                        onChange={e => setInputValue(e.target.value)}
                        placeholder={quest.type === 'caesar' ? '복호 영문자' : '암호 입력'}
                        onKeyDown={e => { if (e.key === 'Enter') handleCodeSubmit(); }}
                        className={`w-full bg-transparent p-2 font-mono text-sm tracking-widest text-center text-white outline-none placeholder:text-[#50506A] ${isShakeInput ? 'animate-shake border-red-500' : ''}`}
                      />
                    </div>
                    <button 
                      onClick={handleCodeSubmit}
                      className="rounded bg-[#d4b86a] hover:bg-[#f3d995] px-6 py-2.5 font-mono font-bold text-xs text-[#07070a] shadow-md cursor-pointer transition-all active:translate-y-0.5"
                    >
                      잠금장치 타격
                    </button>
                  </div>
                </div>
              )}

              {/* 양자택일 / 도덕적 연극 선택 대안 버튼 */}
              {(quest.type === 'choice' || quest.type === 'logic') && (
                <div className="space-y-3">
                  <p className="font-mono text-[9px] text-[#50506A] tracking-widest uppercase">MAKE YOUR CRITICAL DECISION</p>
                  <div className="flex flex-col gap-2">
                    {quest.choices?.map((choice, i) => (
                      <button 
                        key={i}
                        onClick={() => handleChoiceSubmit(i)}
                        className={`text-left rounded border p-3 text-xs font-semibold cursor-pointer transition-all hover:bg-[#d4b86a]/15 focus:outline-none ${choice.danger ? 'border-red-500/20 text-red-300 hover:border-red-500' : choice.safe ? 'border-emerald-500/25 text-emerald-400 hover:border-emerald-500' : 'border-[#d4b86a]/20 text-[#d4b86a] hover:border-[#f3d995]'}`}
                      >
                        {choice.text}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* 수색 및 자물쇠 일체형 단순 돋보기 수색 */}
              {quest.type === 'observe' && (
                <div className="space-y-2">
                  <p className="font-mono text-[9px] text-[#50506A] tracking-widest uppercase py-1">ENVIRONMENT SYSTEM INVESTIGATION</p>
                  <button 
                    onClick={handleObserveSubmit}
                    className="flex items-center gap-2 rounded border border-[#d4b86a]/40 hover:border-[#d4b86a] text-white hover:bg-[#d4b86a]/10 px-6 py-3 font-serif text-xs font-semibold tracking-wide transition-all duration-300 cursor-pointer"
                  >
                    🔍 주변에 흩어진 전단/매듭 단서 완전 수색 갱신
                  </button>
                </div>
              )}
            </div>
          )}

          {/* 전용 인터랙티브 피드백 알림 라인 */}
          {feedback.text && (
            <div className={`mt-3 font-mono text-[11px] font-semibold transition-all ${feedback.type === 'ok' ? 'text-emerald-400' : feedback.type === 'err' ? 'text-red-400 animate-pulse' : 'text-[#d4b86a]'}`}>
              {feedback.text}
            </div>
          )}

        </div>

      </div>

      {/* ────────────────────────────────────────────────────────
           RIGHT SECTION: CHRONICLE JOURNAL & SEQUENTIAL HINTS
         ──────────────────────────────────────────────────────── */}
      <div className="w-[230px] bg-[#0d0d12]/90 border-l border-[#d4b86a]/20 flex flex-col justify-between flex-shrink-0">
        
        {/* 로그 저널 헤더 */}
        <div className="p-4 border-b border-[#d4b86a]/15 select-none">
          <p className="font-mono text-[9px] text-[#50506A] tracking-[0.14em] uppercase">CHRONICLE JOURNAL</p>
          <span className="block text-[8px] text-[#50506A]">실시간 스토리 극 행동 이력</span>
        </div>

        {/* 저널 로그 스트림 */}
        <div className="flex-1 overflow-y-auto px-4 py-2 space-y-3.5 select-all">
          {currentLogs.map((log, i) => (
            <div key={i} className="font-sans text-[11px] leading-relaxed">
              <span className="font-mono text-[8px] text-[#50506A] mr-1.5 block leading-none">{log.time}</span>
              <p className={`${log.type === 'good' ? 'text-emerald-400' : log.type === 'bad' ? 'text-red-400' : log.type === 'key' ? 'text-[#d4b86a] font-semibold' : log.type === 'info' ? 'text-amber-200' : 'text-[#9894B8]'}`}>
                {log.text}
              </p>
            </div>
          ))}
          <div ref={logEndRef}></div>
        </div>

        {/* 오프라인 위장 사이트 포탈 호출 단추 */}
        {onOpenArgWeb && (
          <div className="p-3 border-t border-[#5546CC]/10 bg-[#070712]/50">
            <button 
              onClick={onOpenArgWeb}
              className="w-full text-center rounded border border-[#C8A840]/30 hover:border-[#E0C870] font-mono text-[9px] text-[#D4B86A] py-1.5 transition-all bg-[#C8A840]/5"
            >
              🖥️ 가상 개발자 브라우저 기동
            </button>
          </div>
        )}

        {/* 구출용 순차 점목 힌트 존 */}
        <div className="border-t border-[#d4b86a]/15 bg-[#0a0a0f] p-4 flex-shrink-0">
          <button 
            onClick={fetchHint}
            className="w-full text-left font-mono text-[9px] text-[#50506A] hover:text-[#9894B8] transition-colors flex justify-between focus:outline-none cursor-pointer"
          >
            <span>[🔑 비밀 해독 힌지]</span>
            <span>({quest?.hintsMax - currentHintsUsed}/{quest?.hintsMax})</span>
          </button>

          {isOpenHintBody && (
            <div className="mt-3 rounded bg-[#070712] border border-[#d4b86a]/15 p-3 font-sans text-[10px] text-gray-400 leading-relaxed max-h-32 overflow-y-auto whitespace-pre-line select-all">
              {quest.hintLines.slice(0, currentHintsUsed).map((line, idx) => (
                <p key={idx} className="mb-2 last:mb-0">
                  <strong className="text-[#d4b86a] font-serif block text-[9px] mb-0.5">단서 {idx + 1}</strong>
                  {line}
                </p>
              ))}
            </div>
          )}
        </div>

      </div>

    </div>
  );
}

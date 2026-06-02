import React, { useState } from 'react';

interface TitleScreenProps {
  onStartClick: () => void;
  onOpenArgWeb?: () => void;
}

export default function TitleScreen({ onStartClick, onOpenArgWeb }: TitleScreenProps) {
  // 입사 지원서 폼 관련 상태들
  const [applicantName, setApplicantName] = useState('권서연');
  const [selectedTrack, setSelectedTrack] = useState('A');
  const [agreedPledges, setAgreedPledges] = useState({
    behavior: true,
    bio: true,
    device: true,
    punish: false,
  });
  const [touchedSubmit, setTouchedSubmit] = useState(false);

  // 미스터리 기밀 관리 포탈 관련 상태들
  const [isAdminPortalOpen, setIsAdminPortalOpen] = useState(false);
  const [adminCode, setAdminCode] = useState('');
  const [adminDecrypted, setAdminDecrypted] = useState(false);
  const [adminError, setAdminError] = useState(false);

  // 시크릿 손글씨 쪽지("They are watching") 상태값
  const [isNoteOpen, setIsNoteOpen] = useState(false);

  // 폼 유효성 검증
  const isFormValid = applicantName.trim() !== '' && agreedPledges.behavior && agreedPledges.bio && agreedPledges.device && agreedPledges.punish;

  const handleSubmitAdmission = (e: React.FormEvent) => {
    e.preventDefault();
    setTouchedSubmit(true);
    if (isFormValid) {
      onStartClick();
    }
  };

  const handleAdminVerify = (e: React.FormEvent) => {
    e.preventDefault();
    if (adminCode.toUpperCase() === 'EDEN2011') {
      setAdminDecrypted(true);
      setAdminError(false);
    } else {
      setAdminError(true);
      setAdminDecrypted(false);
    }
  };

  return (
    <section 
      id="s-title" 
      className="relative flex h-full w-full flex-col bg-[#07070a] text-[#E6E4F4] overflow-y-auto select-none font-sans gothic-stone"
    >
      {/* 백그라운드 리얼 스팅 안개 효과 */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-1/4 -left-1/4 w-[150%] h-[60%] bg-[radial-gradient(ellipse_at_center,rgba(212,184,106,0.06)_0%,transparent_60%)] animate-fog"></div>
        <div className="absolute bottom-0 -right-1/4 w-[150%] h-[50%] bg-[radial-gradient(ellipse_at_center,rgba(85,70,204,0.04)_0%,transparent_60%)] animate-fog" style={{ animationDelay: '3s' }}></div>
      </div>

      {/* 최상단 공지 알림 바 및 뱃지 */}
      <div className="w-full bg-[#111116] border-b border-[#d4b86a]/15 text-[#d4b86a] py-2 px-4 text-center text-[10px] md:text-xs font-serif tracking-[0.18em] flex items-center justify-center gap-2 relative z-30">
        <span className="inline-block h-2 w-2 rounded-full bg-red-500 animate-ping"></span>
        <span>[2026학년도 후기 수시 2차] 특별 관찰 대상자(장학생) 소집 전형 접수 중 (마감 조기 엄수)</span>
      </div>

      {/* 엘리트 아카데미 메인 네비게이션 헤더 */}
      <header className="w-full max-w-7xl mx-auto px-6 py-5 flex flex-col md:flex-row items-center justify-between gap-4 border-b border-white/5 relative z-30">
        <div className="flex flex-col items-center md:items-start text-center md:text-left">
          <div className="font-serif text-[10px] tracking-[0.38em] text-[#d4b86a] uppercase font-bold">THE HANSUNGUN</div>
          <h1 className="font-serif text-xl tracking-[0.15em] text-white font-black flex items-center gap-1.5 mt-0.5 animate-gold-shine">
             👑 EDEN ACADEMY
          </h1>
        </div>

        <nav className="flex items-center gap-6 text-xs font-serif text-[#9894b8] tracking-[0.1em]">
          <button 
            onClick={() => {
              // 폼 쪽으로 스크롤이동
              document.getElementById('admission-form')?.scrollIntoView({ behavior: 'smooth' });
            }}
            className="hover:text-[#d4b86a] transition-all bg-transparent border-none cursor-pointer"
          >
            입사 원서
          </button>
          <button 
            onClick={() => {
              document.getElementById('curriculum-info')?.scrollIntoView({ behavior: 'smooth' });
            }}
            className="hover:text-[#d4b86a] transition-all bg-transparent border-none cursor-pointer"
          >
            기숙 교육 안내
          </button>
          <button 
            onClick={() => {
              setIsAdminPortalOpen(true);
              setAdminDecrypted(false);
              setAdminCode('');
              setAdminError(false);
            }}
            className="px-3 py-1.5 border border-[#d4b86a]/45 rounded text-[#d4b86a] hover:bg-[#d4b86a]/10 hover:border-[#d4b86a] transition-all cursor-pointer font-bold flex items-center gap-1.5"
          >
            🔑 기밀 행정 포탈
          </button>
        </nav>
      </header>

      {/* 메인 랜딩 콘텐츠 컨테이너 */}
      <div className="w-full max-w-7xl mx-auto px-6 py-12 flex flex-col lg:flex-row items-start justify-between gap-12 relative z-10 flex-1">
        
        {/* 좌측: 캠페인 소개, 시네마틱 미스터리 영상 구획 */}
        <div className="w-full lg:w-[55%] flex flex-col items-start gap-8 select-text">
          <div className="inline-flex items-center gap-2 border border-[#d4b86a]/30 text-[#d4b86a] font-mono text-[10px] uppercase tracking-[0.25em] px-3.5 py-1.5 rounded bg-[#0d0d12]/90 shadow-[0_0_20px_rgba(212,184,106,0.06)]">
            🏛️ 주식회사 한성운 장학 재단 공식 지정 기구
          </div>

          <div className="space-y-4">
            <h2 className="font-serif text-3xl md:text-4.5xl leading-[1.25] text-white tracking-tight font-black">
              세상의 소음을 삼킨 곳,<br />
              극상의 침식 속에서 <span className="text-[#d4b86a] underline decoration-[#d4b86a]/35 underline-offset-8">완벽한 자</span>가 깨어납니다.
            </h2>
            <p className="text-sm text-[#9894b8] leading-relaxed max-w-xl">
              한성운 에덴 기숙학원은 무한 경쟁에서 완전히 도태되거나 도피하고자 하는 소외된 수재들을 수집하여, 고도의 신경 약학 교정과 인지 감응 교배를 제공하는 극도 밀폐식 교육 시설입니다. 오직 한성대 임상 연구팀과 함께 영원히 박제될 최상의 '장학생 무균' 상태를 보장합니다.
            </p>
          </div>

          {/* 비디오 연출용 인터랙티브 모션 프리뷰 박스 */}
          <div className="w-full border border-white/5 rounded-lg overflow-hidden bg-[#0d0d12] shadow-2xl relative group">
            {/* 비디오 탑바 */}
            <div className="px-4 py-2.5 bg-[#121217] border-b border-white/5 flex items-center justify-between text-[10px] font-mono text-[#50506a]">
              <span>🎥 PR FILM: "웰컴 투 에덴 (EDEN_ACADEMY_INTRO.mp4)"</span>
              <span className="text-[#d4b86a] flex items-center gap-1">● REC 00:38</span>
            </div>

            {/* 시네마틱 스틸 사진 및 플레이 가상 오버레이 */}
            <div className="relative aspect-video w-full flex items-center justify-center overflow-hidden">
              {/* 실제 비디오의 한 장면을 묘사한 무드 있는 어둠과 골드빛 */}
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/35 to-black/75 z-10"></div>
              
              {/* 가상의 고딕 철문 그래픽 (CSS로 아날로그 스타일링) */}
              <div className="absolute inset-x-8 inset-y-6 border border-white/5 opacity-40 z-0 rounded flex items-center justify-center">
                <div className="w-[1px] h-full bg-white/15"></div>
                <div className="w-[1px] h-full bg-white/15 ml-4"></div>
                <div className="w-[1px] h-full bg-white/15 ml-4"></div>
                <div className="w-[1px] h-full bg-white/15 mr-4"></div>
                <div className="w-[1px] h-full bg-white/15 mr-4"></div>
              </div>

              {/* 자욱한 안개 사이의 골드빛 안내 로고 */}
              <div className="text-center z-20 pointer-events-none select-none px-4">
                <div className="font-serif text-[11px] text-[#d4b86a] tracking-[0.4em] uppercase mb-1 drop-shadow-[0_0_10px_rgba(212,184,106,0.6)]">THE HANSUNGUN</div>
                <h3 className="font-serif text-2xl font-bold text-white tracking-[0.16em] mb-3">EDEN ACADEMY</h3>
                <p className="font-mono text-[9px] text-[#9894b8] tracking-widest max-w-xs mx-auto text-center leading-relaxed">
                  "그들은 도처에 있으며, 당신의 정신이 고백할 때까지 언제나 관조할 것입니다."
                </p>
              </div>

              {/* 하단 자막 연출 */}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 text-center w-full px-6">
                <p className="bg-black/70 inline-block px-3 py-1 text-[11px] text-white border border-[#d4b86a]/20 rounded tracking-normal font-serif animate-pulse">
                  🔊 "에덴의 가면 뒤에 준비된 심판. 너희 중 단 한 명만이 진술을 완성하리라."
                </p>
              </div>
            </div>

            {/* 비디오 풋 가이던스 */}
            <div className="p-3 bg-[#0a0a0f] text-center border-t border-white/5 text-[9px] font-mono text-[#50506a] tracking-wider">
              ※ 학원 내의 실시간 상황은 엄격히 위장 통제되고 있으며, 무단 정보 유출 시 즉시 영구 정화실로 강제 인계됩니다.
            </div>
          </div>

          {/* 세 가지 교과 트랙 기획 카드구획 */}
          <div id="curriculum-info" className="w-full grid grid-cols-1 md:grid-cols-3 gap-4 mt-2">
            <div className="p-5 rounded border border-white/5 bg-[#111116]/40 flex flex-col gap-3">
              <span className="font-serif text-[10px] text-[#d4b86a] tracking-widest uppercase">TRACK 01</span>
              <h4 className="font-serif text-sm font-bold text-white">신경 뇌과학 분석 기법</h4>
              <p className="text-[11px] text-[#9894b8] leading-relaxed">
                황수인 부대표가 고안한 고단위 집중 활성 인자기 기화 흡입을 통해, 학생의 기억 회로를 완전히 전위하고 정화합니다.
              </p>
            </div>
            <div className="p-5 rounded border border-white/5 bg-[#111116]/40 flex flex-col gap-3">
              <span className="font-serif text-[10px] text-[#d4b86a] tracking-widest uppercase">TRACK 02</span>
              <h4 className="font-serif text-sm font-bold text-white">동조적 기억 세뇌 교정</h4>
              <p className="text-[11px] text-[#9894b8] leading-relaxed">
                김아란 사감 및 행정수장팀의 밀착 모니터링을 통한 자아 해상도 분해. 정밀 보이스 주파수 교합으로 순종적 리더를 가공합니다.
              </p>
            </div>
            <div className="p-5 rounded border border-white/5 bg-[#111116]/40 flex flex-col gap-3">
              <span className="font-serif text-[10px] text-[#d4b86a] tracking-widest uppercase">TRACK 03</span>
              <h4 className="font-serif text-sm font-bold text-white">소집 통제망 기밀 설계</h4>
              <p className="text-[11px] text-[#9894b8] leading-relaxed">
                탈출 시도를 엄금하기 위해 에덴의 모든 사각지대 전파를 차단하는 지밀 코인 작동기 및 가스 배출 무균 시설을 구축합니다.
              </p>
            </div>
          </div>

        </div>

        {/* 우측: 웅장한 입사지원서 (폼) + 비밀 손글씨 쪽지(They are watching) */}
        <div className="w-full lg:w-[40%] flex flex-col gap-6 relative">
          
          {/* 기숙입사 원서 폼 */}
          <div 
            id="admission-form" 
            className="w-full p-8 rounded-xl border border-[#d4b86a]/30 bg-[#0d0d12] shadow-[0_22px_70px_rgba(212,184,106,0.06)] relative overflow-hidden"
          >
            {/* 장식선 */}
            <div className="absolute top-0 inset-x-0 h-[3px] bg-gradient-to-r from-[#d4b86a]/40 via-[#d4b86a] to-[#d4b86a]/40"></div>
            
            <div className="mb-6 text-center select-none">
              <span className="font-serif text-[10px] tracking-[0.25em] text-[#d4b86a] uppercase block mb-1">
                ADMISSION REGISTRATION
              </span>
              <h3 className="font-serif text-2xl font-black text-white tracking-tight">
                에덴 특별소집 입사 원서접수
              </h3>
              <p className="text-xs text-[#50506a] mt-1.5 font-mono">
                FORM · VER. 2.6.211 · SECURED CODES
              </p>
            </div>

            <form onSubmit={handleSubmitAdmission} className="space-y-5">
              
              {/* 이름 */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-[#d4b86a] font-serif tracking-wider font-semibold">
                  지원생 성명 (Applicant Name)
                </label>
                <input 
                  type="text" 
                  value={applicantName}
                  onChange={(e) => setApplicantName(e.target.value)}
                  className="w-full bg-[#111116] border border-white/10 hover:border-[#d4b86a]/30 focus:border-[#d4b86a] focus:bg-[#07070a] text-white text-sm rounded px-4 py-2.5 transition-all outline-none font-serif font-black"
                  placeholder="본인의 본명을 입력해 주십시오."
                  required
                />
                <p className="text-[10px] text-[#50506a] leading-tight">
                  ※ 시나리오 추적 등 본인 인식을 위해 반드시 실제 또는 추리할 요원의명을 기록해 주십시오. (기본값: 권서연)
                </p>
              </div>

              {/* 희망 세뇌 트랙 */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-[#d4b86a] font-serif tracking-wider font-semibold">
                  기숙 수련 시나리오 배정 (Selected track)
                </label>
                <select 
                  value={selectedTrack}
                  onChange={(e) => setSelectedTrack(e.target.value)}
                  className="w-full bg-[#111116] border border-white/10 hover:border-[#d4b86a]/30 focus:border-[#d4b86a] text-white text-xs rounded px-4 py-3 transition-all outline-none"
                >
                  <option value="A">시나리오 A : 바이오메디컬 (황수인 중심의 심리 교정)</option>
                  <option value="B">시나리오 B : 무균실 탈출 설계 (김규리 유출 코드 해석)</option>
                  <option value="C">시나리오 C : 오케스트레이션 (김아란과 고위층 선별 극)</option>
                </select>
                <p className="text-[10px] text-[#50506a] leading-tight">
                  ※ 특정 트랙 선택은 추후 자격 심증 과정 중 유기적 분기가 개방되게 설계됩니다.
                </p>
              </div>

              {/* 기밀 준수 서약서 조항들 (Immersive creepiness) */}
              <div className="space-y-3 pt-2">
                <label className="text-xs text-[#d4b86a] font-serif tracking-wider font-semibold block">
                  에덴 보안 및 임상 참가 서약
                </label>

                <div className="space-y-2.5 bg-[#111116]/60 p-4 rounded border border-white/5">
                  {/* 조항 1 */}
                  <label className="flex items-start gap-2.5 cursor-pointer text-[11px] select-none text-[#9894b8] hover:text-white transition-colors">
                    <input 
                      type="checkbox"
                      checked={agreedPledges.behavior}
                      onChange={(e) => setAgreedPledges({...agreedPledges, behavior: e.target.checked})}
                      className="mt-0.5 accent-[#d4b86a]"
                    />
                    <span>[필수] 외부 전파 차단 및 일체 비밀 규약 수락</span>
                  </label>

                  {/* 조항 2 */}
                  <label className="flex items-start gap-2.5 cursor-pointer text-[11px] select-none text-[#9894b8] hover:text-white transition-colors">
                    <input 
                      type="checkbox"
                      checked={agreedPledges.bio}
                      onChange={(e) => setAgreedPledges({...agreedPledges, bio: e.target.checked})}
                      className="mt-0.5 accent-[#d4b86a]"
                    />
                    <span>[필수] 실시간 안구 센서 및 신경전달 검진 참가 동의</span>
                  </label>

                  {/* 조항 3 */}
                  <label className="flex items-start gap-2.5 cursor-pointer text-[11px] select-none text-[#9894b8] hover:text-white transition-colors">
                    <input 
                      type="checkbox"
                      checked={agreedPledges.device}
                      onChange={(e) => setAgreedPledges({...agreedPledges, device: e.target.checked})}
                      className="mt-0.5 accent-[#d4b86a]"
                    />
                    <span>[필수] 신체 소지품 영구 밀폐 봉인 및 감금 규정 동의</span>
                  </label>

                  {/* 조항 4 - 요게 핵심 트릭이거나 크리피 요소 */}
                  <label className="flex items-start gap-2.5 cursor-pointer text-[11px] select-none text-[#ec9b9b] hover:text-red-400 transition-colors font-semibold">
                    <input 
                      type="checkbox"
                      checked={agreedPledges.punish}
                      onChange={(e) => setAgreedPledges({...agreedPledges, punish: e.target.checked})}
                      className="mt-0.5 accent-red-500"
                    />
                    <span>[필수] 서약 위반 시 가스 전위 정화실 처분 동의 동의서 (🚨 동의 필수)</span>
                  </label>
                </div>
              </div>

              {/* 경고문구 */}
              {touchedSubmit && !isFormValid && (
                <p className="text-[11px] text-[#ff6b6b] bg-[#401212]/30 border border-[#ff6b6b]/30 p-2.5 rounded text-center font-bold animate-shake">
                  ❌ 모든 에덴 보안 및 가스 정화 처분 수칙에 동의하셔야 적격 시험이 발동됩니다!
                </p>
              )}

              {/* 제출 런처 버튼 */}
              <button 
                type="submit"
                className={`w-full py-4 px-6 rounded font-serif text-sm font-bold tracking-[0.2em] transform transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer 
                  ${isFormValid 
                    ? 'bg-gradient-to-r from-[#d4b86a] via-[#f3d995] to-[#d4b86a] text-[#07070a] shadow-[0_5px_25px_rgba(212,184,106,0.3)] hover:-translate-y-1 hover:brightness-110 active:translate-y-0' 
                    : 'bg-white/10 text-white/40 cursor-not-allowed border border-white/5'
                  }`}
              >
                📥 에덴 특별 입사 자격 시험 개시하기
              </button>
            </form>

            <div className="mt-4 text-center">
              <button 
                type="button"
                onClick={onOpenArgWeb}
                className="font-mono text-[10px] text-[#50506a] hover:text-[#d4b86a] underline decoration-dashed decoration-[#d4b86a]/30 underline-offset-4 tracking-[0.14em] transition-colors"
              >
                🌐 에덴 위장 대외 정보 홈페이지(ARG) 접속해 단서 발굴
              </button>
            </div>
          </div>

          {/* 더 시크릿 쪽지: "They are watching" (비디오 속 손글씨 메세지 모사) */}
          <div className="relative">
            <div 
              onClick={() => setIsNoteOpen(!isNoteOpen)}
              className="w-full p-4 rounded-lg border border-[#e05858]/30 bg-[#160b0b]/80 shadow-[0_0_20px_rgba(224,88,88,0.05)] cursor-pointer hover:bg-[#201010] transition-all flex items-center justify-between text-left group"
            >
              <div className="flex items-center gap-3">
                <span className="text-xl animate-pulse">✉️</span>
                <div>
                  <h4 className="font-mono text-xs font-bold text-[#e05858] tracking-widest uppercase group-hover:text-red-400">
                    THEY ARE WATCHING
                  </h4>
                  <p className="text-[10px] text-[#a07070] font-serif">
                    뒤돌아보니 책상 밑에 수수께끼의 구겨진 잉크 노트가 끼어있습니다...
                  </p>
                </div>
              </div>
              <span className="font-mono text-xs text-[#a07070] group-hover:text-white transition-all transform group-hover:translate-x-1">
                {isNoteOpen ? '닫기 ▲' : '열어보기 ▼'}
              </span>
            </div>

            {/* 쪽지 상세 내용 */}
            {isNoteOpen && (
              <div className="absolute right-0 top-full mt-2 w-full p-6 bg-[#efe9d9] text-[#1c1a17] border-2 border-[#1c1a17] rounded shadow-[0_15px_40px_rgba(0,0,0,0.5)] z-40 relative overflow-hidden transform rotate-1 select-text">
                {/* 묵직한 핏자국 및 물얼룩 그래픽 (인라인 데코) */}
                <div className="absolute top-0 right-0 w-24 h-24 bg-red-800/15 rounded-full blur-xl pointer-events-none"></div>
                <div className="absolute bottom-2 left-6 w-16 h-16 bg-black/5 rounded-full blur-lg pointer-events-none"></div>
                
                {/* 잉크 얼룩 장식 */}
                <span className="absolute top-4 left-6 h-4 w-4 rounded-full bg-black/15 blur-[1px]"></span>
                <span className="absolute bottom-6 right-10 h-7 w-7 rounded-full bg-black/10 blur-[2px]"></span>

                {/* 손글씨 폰트 느낌의 텍스트 */}
                <div className="font-serif text-xs leading-relaxed space-y-3">
                  <p className="font-black text-[#851d1d] font-serif uppercase tracking-widest text-center border-b border-black/10 pb-1.5 text-sm">
                    They are watching.
                  </p>
                  <p className="font-medium">
                    "이 입사 지원 양식은 완전한 가짜 양방향 미끼야!! 에덴 학원의 실체는 선망에 버려진 아이들을 수용해 최적의 임상 반응 표본으로 만드는 강제 정신 세장이야."
                  </p>
                  <p className="font-semibold">
                    "수인과 아란 사감은 한 통속이야! 규리가 남긴 쪽지에 따르면, <strong className="text-red-800 bg-yellow-200 px-1 py-0.5 rounded">기밀 행정 포탈 비밀번호는 'EDEN2011'</strong> 이고, 가스실 탈출을 피하기 위해서는 <strong className="text-blue-900 bg-blue-100 px-1 py-0.5 rounded">동전(coin)</strong>과 <strong className="text-blue-900 bg-blue-100 px-1 py-0.5 rounded">비녀(hairpin)</strong>를 미리 입수해야만 살아남을 수 있대..."
                  </p>
                  <p className="text-[10px] text-gray-500 text-right leading-none border-t border-black/5 pt-2 mt-4 font-mono">
                    — K. S. Y. (어둠 속에서 남김)
                  </p>
                </div>
              </div>
            )}
          </div>

        </div>

      </div>

      {/* 기밀 관리자 행정 포탈 모달 */}
      {isAdminPortalOpen && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-xl bg-[#0a0a0f] border-2 border-[#d4b86a] rounded-lg shadow-[0_0_50px_rgba(212,184,106,0.2)] overflow-hidden">
            
            {/* 타이틀 바 */}
            <div className="bg-[#111116] border-b border-[#d4b86a]/30 px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-sm">🔑</span>
                <h3 className="font-serif text-sm font-bold text-[#d4b86a] tracking-widest uppercase">
                  CLASSIFIED ADMIN SECURITY PORTAL (LEVEL 3)
                </h3>
              </div>
              <button 
                onClick={() => setIsAdminPortalOpen(false)}
                className="text-gray-400 hover:text-white bg-transparent border-none text-sm cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="p-6">
              {!adminDecrypted ? (
                /* 관리자 로그인 필요 */
                <form onSubmit={handleAdminVerify} className="space-y-4">
                  <p className="text-xs text-[#9894b8] leading-relaxed">
                    본 구역은 에덴 기숙학원 이사회 및 최정상 통제 위원 전용 보안 행탈입니다. 
                    기밀 보존 조약에 승인된 8자리 임시 비밀 등기 코드를 입력하십시오.
                  </p>

                  <div className="space-y-2">
                    <label className="text-[11px] font-mono text-[#50506a] uppercase tracking-wider block">
                      ENTER ACCESS KEY (Hint: Look at the ink note)
                    </label>
                    <input 
                      type="text"
                      value={adminCode}
                      onChange={(e) => setAdminCode(e.target.value)}
                      placeholder="행정 접속 대조 키 입력"
                      className="w-full bg-[#111116] border border-[#d4b86a]/30 rounded px-4 py-3 text-white font-mono text-center text-sm outline-none focus:border-[#d4b86a] focus:ring-1 focus:ring-[#d4b86a]"
                      autoFocus
                    />
                  </div>

                  {adminError && (
                    <p className="text-xs text-red-400 bg-red-950/40 p-2.5 rounded border border-red-800 text-center font-semibold animate-shake">
                      ⚠️ ACCESS DENIED: 잘못된 이사 소집 원장 키 코드입니다.
                    </p>
                  )}

                  <div className="flex justify-end gap-3 pt-2">
                    <button 
                      type="button" 
                      onClick={() => setIsAdminPortalOpen(false)}
                      className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded text-xs text-gray-300 font-mono cursor-pointer"
                    >
                      CANCEL
                    </button>
                    <button 
                      type="submit"
                      className="px-5 py-2 bg-[#d4b86a] hover:bg-[#f3d995] text-[#07070a] rounded text-xs font-bold cursor-pointer transition-colors"
                    >
                      CONNECT INTERACTIVE DECRYPT
                    </button>
                  </div>
                </form>
              ) : (
                /* 기밀 해독 로그 열람 성공 */
                <div className="space-y-4 max-h-[350px] overflow-y-auto pr-2 select-text text-left">
                  <div className="bg-emerald-950/20 border border-emerald-800/40 p-3 rounded text-center text-xs text-emerald-400 font-mono tracking-widest">
                    ✔️ ACCESS GRANTED · LEVEL 3 SECURE FEED UNLOCKED
                  </div>

                  <div className="space-y-3.5 font-mono text-xs text-[#9894b8] leading-relaxed">
                    <div className="border-b border-white/5 pb-2">
                      <span className="text-[#d4b86a]">[LOG #2026-05-11] 수인 ↔ 아란 내부 무전]</span>
                      <p className="mt-1 text-[11px]">
                        <strong>수인:</strong> "권서연이라는 요원이 입사 평가 원서를 접수하고 잠입했습니다. 대리 신상을 썼지만 김규리의 친구가 복원 분석을 위해 접근한 것이 틀림없습니다."
                      </p>
                      <p className="mt-1 text-[11px]">
                        <strong>아란:</strong> "환영해 드려야지. 황수인 너는 예전처럼 친절한 탈을 쓰고 서연이 옆에 밀착해. 나는 사감으로서 외부 탈출 시도를 봉쇄하겠다."
                      </p>
                    </div>

                    <div className="border-b border-white/5 pb-2">
                      <span className="text-red-400">[기밀 연구 서류: 폐기 수칙 별항]</span>
                      <p className="mt-1 text-[11px]">
                        "기억 정화 시험에 저항을 표하거나, 진실에 과당 접근하여 수기 탈출을 시험하는 피험자는 <span className="text-red-400">즉시 수용소 하단 정화 가스실(Scenario A - gas room)</span>로 전송하며, 질식 정화용 가스가 전선에서 살포된다. 해당 가스는 가벼운 자성 동전으로 밀폐 수동 밸브를 회전시켜 배기하거나, 비녀 침핀으로 도어락 잠금쇠 구획을 직접 도통시켜 비상 제동하지 않는 한 차단이 영구 불가하다."
                      </p>
                    </div>

                    <div className="pb-1 bg-[#111116] p-3 rounded border border-white/5">
                      <span className="text-[#a89ff5] font-semibold">💡 플레이 요원을 위한 힌트 요약:</span>
                      <ul className="list-disc list-inside mt-1 space-y-1 text-[11px] text-[#e6e4f4]">
                        <li><strong>코인과 비녀:</strong> 가스실에서 무조건 살아남기 위해서 코인과 비녀는 꼭 순차 획득하여 인벤토리에 보관하세요.</li>
                        <li><strong>수인의 태도:</strong> 수인의 조력이 무조건적인 탈출을 돕는 것은 아닐 수 있습니다. 신뢰도 게이지를 면밀히 살피세요.</li>
                      </ul>
                    </div>
                  </div>

                  <div className="flex justify-end pt-4">
                    <button 
                      onClick={() => setIsAdminPortalOpen(false)}
                      className="px-5 py-2 bg-[#d4b86a] text-[#07070a] hover:bg-[#f3d995] rounded text-xs font-bold cursor-pointer"
                    >
                      기록 확인 완료 (닫기)
                    </button>
                  </div>
                </div>
              )}
            </div>

          </div>
        </div>
      )}

      {/* 푸터 영역 */}
      <footer className="w-full bg-[#0a0a0f] border-t border-white/5 py-8 mt-auto z-20">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4 text-center md:text-left select-none">
          <p className="text-[10px] text-[#50506a] uppercase tracking-widest font-mono">
            🏛️ 한성대 스토리텔링 융합 극예술 동아리 / 에덴 위장 대안 현실 게임 (ARG)<br />
            © 2011-2026 THE HANSUNGUN EDEN ACADEMY. ALL RIGHTS CLASSIFIED.
          </p>
          <div className="flex gap-4">
            <button 
              onClick={onOpenArgWeb}
              className="font-mono text-[10px] text-[#d4b86a] hover:text-white border border-[#d4b86a]/30 px-3 py-1 rounded transition-colors"
            >
              🌐 EDEN WEB ARCHIVE
            </button>
          </div>
        </div>
      </footer>
    </section>
  );
}

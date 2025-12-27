import React, { useState, useEffect, useRef } from 'react';

const sampleTexts = [
  "The quick brown fox jumps over the lazy dog near the riverbank where children play and birds sing their morning songs under the bright blue sky.",
  "Technology has revolutionized the way we communicate and interact with each other in modern society bringing people closer despite physical distances.",
  "Practice makes perfect when learning new skills and developing expertise in any field requires dedication patience and consistent effort over time.",
  "Mountains rise majestically above the clouds while valleys stretch endlessly below creating breathtaking landscapes that inspire wonder and admiration.",
  "Music has the power to evoke emotions and memories transporting us to different times and places with just a simple melody or harmony.",
  "A gentle breeze rustled through the autumn leaves as the sun dipped below the horizon painting the sky with shades of orange and pink.",
  "Reading books expands the mind, allowing people to travel through time and space, experiencing lives and worlds beyond their own imagination.",
  "In the bustling city, lights flickered on as night fell, and the streets were filled with the sounds of laughter, cars, and distant music.",
  "Mathematics is the language of the universe, unlocking patterns and relationships that explain everything from the tiniest atom to the vastness of galaxies.",
  "Cooking is an art that combines creativity, precision, and patience, turning simple ingredients into meals that nourish both body and soul.",
  "The ocean waves crashed against the shore, leaving behind seashells and driftwood, while gulls circled overhead in search of food.",
  "Innovation often comes from curiosity, experimentation, and the willingness to embrace failure as a stepping stone to success.",
  "History teaches us valuable lessons about human nature, triumphs, failures, and the enduring quest for knowledge and understanding."
];


const difficultyLevels = [
  { name: "Easy", wordsPerMinute: 40, color: "from-emerald-400 to-teal-400" },
  { name: "Medium", wordsPerMinute: 60, color: "from-amber-400 to-orange-400" },
  { name: "Hard", wordsPerMinute: 80, color: "from-rose-400 to-pink-500" },
  { name: "Expert", wordsPerMinute: 100, color: "from-purple-500 to-indigo-500" }
];

const wordDisplayModes = [
  { id: 'normal', name: 'Normal', icon: '🔤' },
  { id: 'capitalized', name: 'Capitalized', icon: '🔠' },
  { id: 'uppercase', name: 'UPPERCASE', icon: '⬆️' },
  { id: 'lowercase', name: 'lowercase', icon: '⬇️' }
];

export default function TypingSpeedTest() {
  const [text, setText] = useState('');
  const [input, setInput] = useState('');
  const [started, setStarted] = useState(false);
  const [finished, setFinished] = useState(false);
  const [startTime, setStartTime] = useState(null);
  const [timeLimit, setTimeLimit] = useState(30);
  const [timeRemaining, setTimeRemaining] = useState(30);
  const [wpm, setWpm] = useState(0);
  const [accuracy, setAccuracy] = useState(100);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [errors, setErrors] = useState(0);
  const [difficulty, setDifficulty] = useState(1);
  const [charStats, setCharStats] = useState({ correct: 0, total: 0 });
  const [showResults, setShowResults] = useState(false);
  const [isFocused, setIsFocused] = useState(true);
  const [wordDisplayMode, setWordDisplayMode] = useState('normal');
  const [fadeIn, setFadeIn] = useState(false);
  const [pulseAnimation, setPulseAnimation] = useState(false);
  const [floatingElements, setFloatingElements] = useState([]);
  const inputRef = useRef(null);
  const cursorRef = useRef(null);
  const textDisplayRef = useRef(null);

  useEffect(() => {
    resetTest();
    setFadeIn(true);
    
    // Create floating elements
    const elements = Array.from({ length: 15 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 4 + 1,
      speed: Math.random() * 0.5 + 0.2,
      delay: Math.random() * 5
    }));
    setFloatingElements(elements);
  }, []);

  useEffect(() => {
    let interval;
    if (started && !finished && timeRemaining > 0) {
      interval = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            finishTest();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [started, finished, timeRemaining]);

  useEffect(() => {
    // Smooth cursor movement with requestAnimationFrame
    const updateCursorPosition = () => {
      if (cursorRef.current && textDisplayRef.current) {
        const chars = textDisplayRef.current.getElementsByClassName('char');
        if (chars && chars[currentIndex]) {
          const rect = chars[currentIndex].getBoundingClientRect();
          const containerRect = textDisplayRef.current.getBoundingClientRect();
          cursorRef.current.style.transform = `translate3d(${rect.left - containerRect.left}px, ${rect.top - containerRect.top}px, 0)`;
          cursorRef.current.style.transition = 'transform 0.15s cubic-bezier(0.4, 0, 0.2, 1)';
        }
      }
      requestAnimationFrame(updateCursorPosition);
    };
    
    const animationId = requestAnimationFrame(updateCursorPosition);
    return () => cancelAnimationFrame(animationId);
  }, [currentIndex]);

  const resetTest = () => {
    const randomText = sampleTexts[Math.floor(Math.random() * sampleTexts.length)];
    setText(randomText);
    setInput('');
    setStarted(false);
    setFinished(false);
    setStartTime(null);
    setTimeRemaining(timeLimit);
    setWpm(0);
    setAccuracy(100);
    setCurrentIndex(0);
    setErrors(0);
    setCharStats({ correct: 0, total: 0 });
    setShowResults(false);
    setPulseAnimation(true);
    
    setTimeout(() => setPulseAnimation(false), 1000);
    
    if (inputRef.current) {
      inputRef.current.focus();
      setIsFocused(true);
    }
  };

  const finishTest = () => {
    setFinished(true);
    calculateFinalWPM();
    setTimeout(() => setShowResults(true), 300);
  };

  const handleInputChange = (e) => {
    const value = e.target.value;
    
    if (!started) {
      setStarted(true);
      setStartTime(Date.now());
      setPulseAnimation(false);
    }

    if (finished) return;

    if (value.length > text.length) return;

    // Smooth state updates
    setInput(value);
    setCurrentIndex(value.length);

    let errorCount = 0;
    let correctCount = 0;
    
    for (let i = 0; i < value.length; i++) {
      if (value[i] === text[i]) {
        correctCount++;
      } else {
        errorCount++;
      }
    }
    
    setErrors(errorCount);
    setCharStats({ correct: correctCount, total: value.length });

    const acc = value.length > 0 ? ((correctCount) / value.length) * 100 : 100;
    setAccuracy(Math.round(acc));

    if (started) {
      calculateWPM(value);
    }

    if (value.length === text.length) {
      finishTest();
    }
  };

  const calculateWPM = (typedText) => {
    const timeElapsed = (Date.now() - startTime) / 1000 / 60;
    const wordsTyped = typedText.trim().split(/\s+/).filter(w => w.length > 0).length;
    const calculatedWpm = Math.round(wordsTyped / timeElapsed);
    
    // Smooth WPM update
    setWpm(prev => {
      const diff = Math.abs(calculatedWpm - prev);
      if (diff < 5) return calculatedWpm;
      return prev + (calculatedWpm > prev ? 1 : -1);
    });
  };

  const calculateFinalWPM = () => {
    const timeElapsed = (timeLimit - timeRemaining) / 60;
    const wordsTyped = input.trim().split(/\s+/).filter(w => w.length > 0).length;
    const calculatedWpm = Math.round(wordsTyped / timeElapsed) || 0;
    
    // Animate final WPM counter
    let current = 0;
    const increment = calculatedWpm / 30;
    const interval = setInterval(() => {
      current += increment;
      if (current >= calculatedWpm) {
        current = calculatedWpm;
        clearInterval(interval);
      }
      setWpm(Math.floor(current));
    }, 16);
  };

  const getCharClass = (index) => {
    if (index < currentIndex) {
      if (input[index] === text[index]) {
        return 'correct-char';
      } else {
        return 'error-char';
      }
    } else if (index === currentIndex) {
      return 'current-char';
    }
    return 'pending-char';
  };

  const getDisplayedText = () => {
    switch(wordDisplayMode) {
      case 'capitalized':
        return text.split(' ').map(word => 
          word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
        ).join(' ');
      case 'uppercase':
        return text.toUpperCase();
      case 'lowercase':
        return text.toLowerCase();
      default:
        return text;
    }
  };

  const changeTimeLimit = (seconds) => {
    // Smooth transition
    setTimeRemaining(timeLimit);
    setTimeout(() => {
      setTimeLimit(seconds);
      setTimeRemaining(seconds);
      resetTest();
    }, 300);
  };

  const changeDifficulty = (level) => {
    setDifficulty(level);
    setTimeout(() => resetTest(), 300);
  };

  const changeWordDisplayMode = (mode) => {
    setWordDisplayMode(mode);
    setTimeout(() => resetTest(), 300);
  };

  const getWpmColor = (wpmValue) => {
    if (wpmValue >= difficultyLevels[3].wordsPerMinute) return 'text-purple-300';
    if (wpmValue >= difficultyLevels[2].wordsPerMinute) return 'text-rose-300';
    if (wpmValue >= difficultyLevels[1].wordsPerMinute) return 'text-amber-300';
    return 'text-emerald-300';
  };

  const getAccuracyColor = (accuracyValue) => {
    if (accuracyValue >= 95) return 'text-emerald-300';
    if (accuracyValue >= 85) return 'text-amber-300';
    return 'text-rose-300';
  };

  const displayedText = getDisplayedText();

  return (
    <div className={`min-h-screen bg-gradient-to-br from-slate-900 via-gray-900 to-black flex flex-col items-center justify-center p-4 md:p-6 transition-opacity duration-700 ${fadeIn ? 'opacity-100' : 'opacity-0'}`}>
      {/* Animated Floating Particles */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {floatingElements.map((el) => (
          <div
            key={el.id}
            className="absolute rounded-full bg-gradient-to-r from-cyan-500/10 to-blue-500/10"
            style={{
              width: `${el.size}px`,
              height: `${el.size}px`,
              left: `${el.x}%`,
              top: `${el.y}%`,
              animation: `float ${el.speed * 10}s ease-in-out infinite`,
              animationDelay: `${el.delay}s`,
              filter: 'blur(1px)'
            }}
          />
        ))}
      </div>

      {/* Glowing Orbs */}
      <div className="fixed -left-20 -top-20 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl"></div>
      <div className="fixed -right-20 bottom-20 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl"></div>

      <div className="max-w-6xl w-full relative z-10">
        {/* Header */}
        <header className="text-center mb-10">
          <div className="inline-block relative group">
            <h1 className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-cyan-300 via-blue-300 to-purple-300 bg-clip-text text-transparent mb-3 tracking-tight">
              TypeMaster Pro
            </h1>
            <div className="absolute -bottom-3 left-0 right-0 h-1.5 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-full transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500"></div>
          </div>
          <p className="text-slate-400 mt-8 text-lg font-light tracking-wide">Precision typing with real-time analytics</p>
        </header>

        {/* Main Container */}
        <div className="bg-slate-800/40 backdrop-blur-xl rounded-3xl border border-slate-700/30 shadow-2xl shadow-black/30 overflow-hidden transform transition-all duration-500 hover:shadow-cyan-500/10">
          
          {/* Control Bar */}
          <div className="p-6 border-b border-slate-700/30 bg-gradient-to-r from-slate-800/50 to-slate-900/50">
            <div className="flex flex-col lg:flex-row justify-between items-center gap-6">
              {/* Time Selection */}
              <div className="flex flex-wrap gap-2">
                {[15, 30, 60].map((seconds) => (
                  <button
                    key={seconds}
                    onClick={() => changeTimeLimit(seconds)}
                    className={`px-5 py-2.5 rounded-xl font-medium transition-all duration-300 transform hover:scale-105 active:scale-95 
                      ${timeLimit === seconds
                        ? 'bg-gradient-to-r from-cyan-500/90 to-blue-500/90 text-white shadow-lg shadow-cyan-500/30'
                        : 'bg-slate-800/70 text-slate-300 hover:bg-slate-700/70 border border-slate-600/50 hover:border-cyan-500/30'
                      }`}
                  >
                    <span className="flex items-center gap-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {seconds}s
                    </span>
                  </button>
                ))}
              </div>

              {/* Difficulty Levels */}
              <div className="flex flex-wrap gap-2">
                {difficultyLevels.map((level, index) => (
                  <button
                    key={level.name}
                    onClick={() => changeDifficulty(index)}
                    className={`px-4 py-2 rounded-xl font-medium text-sm transition-all duration-300 transform hover:scale-105 active:scale-95
                      ${difficulty === index
                        ? `bg-gradient-to-r ${level.color} text-white shadow-lg`
                        : 'bg-slate-800/70 text-slate-300 hover:bg-slate-700/70 border border-slate-600/50'
                      }`}
                  >
                    {level.name}
                  </button>
                ))}
              </div>

              {/* Word Display Mode */}
              <div className="flex flex-wrap gap-2">
                {wordDisplayModes.map((mode) => (
                  <button
                    key={mode.id}
                    onClick={() => changeWordDisplayMode(mode.id)}
                    className={`px-4 py-2 rounded-xl font-medium text-sm transition-all duration-300 transform hover:scale-105 active:scale-95
                      ${wordDisplayMode === mode.id
                        ? 'bg-gradient-to-r from-emerald-500/90 to-teal-500/90 text-white shadow-lg shadow-emerald-500/30'
                        : 'bg-slate-800/70 text-slate-300 hover:bg-slate-700/70 border border-slate-600/50 hover:border-emerald-500/30'
                      }`}
                  >
                    <span className="flex items-center gap-2">
                      {mode.icon}
                      {mode.name}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Stats and Text Area */}
          <div className="p-6 md:p-8">
            {/* Real-time Stats */}
            <div className={`grid grid-cols-2 md:grid-cols-4 gap-4 mb-8 transition-all duration-500 ${pulseAnimation ? 'scale-105' : 'scale-100'}`}>
              <div className="bg-slate-800/40 backdrop-blur-sm rounded-xl p-4 border border-slate-700/30 hover:border-cyan-500/30 transition-all duration-300 hover:scale-105 group">
                <div className="flex items-center justify-between">
                  <div>
                    <div className={`text-3xl font-bold ${getWpmColor(wpm)} transition-all duration-300`}>{wpm}</div>
                    <div className="text-sm text-slate-400 mt-1 group-hover:text-cyan-400 transition-colors">WPM</div>
                  </div>
                  <div className="text-cyan-400/70 group-hover:text-cyan-400 transition-colors">
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                </div>
              </div>

              <div className="bg-slate-800/40 backdrop-blur-sm rounded-xl p-4 border border-slate-700/30 hover:border-amber-500/30 transition-all duration-300 hover:scale-105 group">
                <div className="flex items-center justify-between">
                  <div>
                    <div className={`text-3xl font-bold transition-all duration-500 ${timeRemaining <= 5 ? 'text-rose-300 animate-pulse' : 'text-amber-300'}`}>
                      {timeRemaining}s
                    </div>
                    <div className="text-sm text-slate-400 mt-1 group-hover:text-amber-400 transition-colors">Remaining</div>
                  </div>
                  <div className="text-amber-400/70 group-hover:text-amber-400 transition-colors">
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
              </div>

              <div className="bg-slate-800/40 backdrop-blur-sm rounded-xl p-4 border border-slate-700/30 hover:border-emerald-500/30 transition-all duration-300 hover:scale-105 group">
                <div className="flex items-center justify-between">
                  <div>
                    <div className={`text-3xl font-bold ${getAccuracyColor(accuracy)} transition-all duration-300`}>{accuracy}%</div>
                    <div className="text-sm text-slate-400 mt-1 group-hover:text-emerald-400 transition-colors">Accuracy</div>
                  </div>
                  <div className="text-emerald-400/70 group-hover:text-emerald-400 transition-colors">
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
              </div>

              <div className="bg-slate-800/40 backdrop-blur-sm rounded-xl p-4 border border-slate-700/30 hover:border-rose-500/30 transition-all duration-300 hover:scale-105 group">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-3xl font-bold text-rose-300">{errors}</div>
                    <div className="text-sm text-slate-400 mt-1 group-hover:text-rose-400 transition-colors">Errors</div>
                  </div>
                  <div className="text-rose-400/70 group-hover:text-rose-400 transition-colors">
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            {/* Text Display */}
            <div className="relative mb-8">
              <div className="absolute -inset-4 bg-gradient-to-r from-cyan-500/10 via-transparent to-purple-500/10 rounded-3xl blur-2xl transition-all duration-1000 animate-gradient"></div>
              
              <div className="relative bg-slate-800/60 backdrop-blur-md rounded-2xl p-8 border border-slate-700/50 hover:border-cyan-500/30 transition-all duration-500">
                <div 
                  ref={textDisplayRef}
                  id="text-display" 
                  className="text-xl md:text-2xl leading-relaxed font-mono tracking-wide min-h-[180px] relative select-none transition-all duration-300"
                >
                  {/* Animated Cursor */}
                  <div
                    ref={cursorRef}
                    className={`absolute w-[3px] h-8 bg-gradient-to-b from-cyan-400 to-blue-400 rounded-full shadow-lg shadow-cyan-400/50 transition-all duration-150 ${started ? 'animate-pulse-slow' : ''}`}
                    style={{ transformOrigin: 'top left' }}
                  />
                  
                  {displayedText.split('').map((char, index) => (
                    <span 
                      key={index} 
                      className={`char inline-block ${getCharClass(index)} px-0.5 rounded transition-all duration-150`}
                    >
                      {char === ' ' ? '\u00A0' : char}
                    </span>
                  ))}
                </div>
                
                {/* Focus reminder */}
                {!isFocused && !finished && (
                  <div className="absolute inset-0 flex items-center justify-center bg-slate-900/80 backdrop-blur-sm rounded-2xl animate-fade-in">
                    <div className="text-center p-6">
                      <div className="text-cyan-400 mb-4 animate-bounce-slow">
                        <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
                        </svg>
                      </div>
                      <p className="text-slate-300 text-xl font-light tracking-wide">Click to focus and start typing</p>
                      <p className="text-slate-500 text-sm mt-2">Press any key to begin</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Input Area */}
            <div className="mb-8">
              <div className="relative">
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={handleInputChange}
                  onFocus={() => setIsFocused(true)}
                  onBlur={() => !finished && setIsFocused(false)}
                  disabled={finished}
                  className="w-full bg-slate-800/60 backdrop-blur-sm text-white text-xl p-5 rounded-2xl border-2 border-slate-700/50 focus:border-cyan-400 focus:outline-none font-mono disabled:opacity-50 transition-all duration-500 focus:scale-[1.02] focus:shadow-xl focus:shadow-cyan-500/10"
                  placeholder={finished ? "Test completed! Press reset to try again" : "Start typing here to begin..."}
                  autoFocus
                />
                <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                  {started && !finished && (
                    <div className="flex items-center gap-2 animate-pulse">
                      <div className="w-3 h-3 bg-cyan-400 rounded-full animate-ping"></div>
                      <span className="text-sm text-cyan-400 font-medium">Live</span>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Progress bar */}
              <div className="mt-4">
                <div className="flex justify-between text-sm text-slate-400 mb-2">
                  <span>Progress</span>
                  <span className="font-medium">{Math.round((currentIndex / text.length) * 100)}%</span>
                </div>
                <div className="h-2 bg-slate-800/60 rounded-full overflow-hidden backdrop-blur-sm">
                  <div 
                    className="h-full bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500 transition-all duration-500 ease-out"
                    style={{ width: `${(currentIndex / text.length) * 100}%` }}
                  ></div>
                </div>
              </div>
            </div>

            {/* Results Panel */}
            {showResults && (
              <div className="mb-8 animate-slide-up">
                <div className="bg-gradient-to-br from-slate-800/60 to-slate-900/60 backdrop-blur-md rounded-2xl p-8 border border-slate-700/50">
                  <div className="text-center mb-8">
                    <h2 className="text-3xl font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent mb-3">
                      Test Complete! 🎯
                    </h2>
                    <div className="w-24 h-1 bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-full mx-auto"></div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-slate-800/40 backdrop-blur-sm rounded-xl p-6 border border-slate-700/30 transform transition-all duration-500 hover:scale-105 hover:border-emerald-500/30">
                      <div className="text-center">
                        <div className={`text-5xl font-bold ${getWpmColor(wpm)} mb-2`}>{wpm}</div>
                        <div className="text-slate-400 mb-6">Words per minute</div>
                        <div>
                          <div className="flex justify-between text-sm text-slate-500 mb-2">
                            <span>Target</span>
                            <span>{difficultyLevels[difficulty].wordsPerMinute} WPM</span>
                          </div>
                          <div className="h-2 bg-slate-700/50 rounded-full overflow-hidden">
                            <div 
                              className={`h-full transition-all duration-1000 ease-out ${wpm >= difficultyLevels[difficulty].wordsPerMinute ? 'bg-gradient-to-r from-emerald-500 to-teal-500' : 'bg-gradient-to-r from-amber-500 to-orange-500'}`}
                              style={{ width: `${Math.min((wpm / difficultyLevels[difficulty].wordsPerMinute) * 100, 100)}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-slate-800/40 backdrop-blur-sm rounded-xl p-6 border border-slate-700/30 transform transition-all duration-500 hover:scale-105 hover:border-blue-500/30">
                      <div className="text-center">
                        <div className={`text-5xl font-bold ${getAccuracyColor(accuracy)} mb-2`}>{accuracy}%</div>
                        <div className="text-slate-400 mb-6">Accuracy</div>
                        <div className="flex justify-around">
                          <div className="text-center">
                            <div className="text-2xl font-bold text-emerald-400">{charStats.correct}</div>
                            <div className="text-xs text-slate-500">Correct</div>
                          </div>
                          <div className="text-center">
                            <div className="text-2xl font-bold text-rose-400">{errors}</div>
                            <div className="text-xs text-slate-500">Errors</div>
                          </div>
                          <div className="text-center">
                            <div className="text-2xl font-bold text-blue-400">{charStats.total}</div>
                            <div className="text-xs text-slate-500">Total</div>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-slate-800/40 backdrop-blur-sm rounded-xl p-6 border border-slate-700/30 transform transition-all duration-500 hover:scale-105 hover:border-cyan-500/30">
                      <div className="text-center">
                        <div className="text-5xl font-bold text-amber-300 mb-2">{timeLimit - timeRemaining}s</div>
                        <div className="text-slate-400 mb-6">Time taken</div>
                        <div>
                          <div className="text-sm text-slate-500 mb-2">Characters per second</div>
                          <div className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                            {((charStats.total + errors) / (timeLimit - timeRemaining)).toFixed(1)} CPS
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={resetTest}
                className="flex-1 bg-gradient-to-r from-cyan-500/90 to-blue-500/90 hover:from-cyan-600 hover:to-blue-600 text-white font-bold text-lg py-4 rounded-xl transition-all duration-500 transform hover:scale-[1.02] active:scale-95 shadow-xl shadow-cyan-500/20 hover:shadow-cyan-500/40 group"
              >
                <div className="flex items-center justify-center gap-3">
                  <svg className="w-6 h-6 transform group-hover:rotate-180 transition-transform duration-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  <span>{finished ? 'Start New Test' : 'Reset Test'}</span>
                </div>
                <div className="text-sm font-light opacity-90 mt-1">
                  {finished ? 'Try again with different settings' : 'Restart current test'}
                </div>
              </button>
              
              {finished && (
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(`🎮 I just typed at ${wpm} WPM with ${accuracy}% accuracy on TypeMaster Pro! 🚀`);
                  }}
                  className="px-8 bg-gradient-to-r from-purple-500/90 to-pink-500/90 hover:from-purple-600 hover:to-pink-600 text-white font-bold rounded-xl transition-all duration-500 transform hover:scale-[1.02] active:scale-95 shadow-xl shadow-purple-500/20 hover:shadow-purple-500/40 flex items-center justify-center gap-3 group"
                >
                  <svg className="w-5 h-5 transform group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  Share Results
                </button>
              )}
            </div>
          </div>

          {/* Footer Tips */}
          <div className="p-6 border-t border-slate-700/30 bg-gradient-to-r from-slate-900/30 to-black/30">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
              {[
                { icon: '🎯', text: 'Focus on accuracy first, speed comes naturally', color: 'text-cyan-400' },
                { icon: '💪', text: 'Regular practice builds muscle memory', color: 'text-emerald-400' },
                { icon: '📊', text: 'Track progress with detailed statistics', color: 'text-purple-400' }
              ].map((tip, index) => (
                <div key={index} className="flex items-center gap-3 group">
                  <div className={`text-xl transform group-hover:scale-125 transition-transform duration-300 ${tip.color}`}>
                    {tip.icon}
                  </div>
                  <span className="text-slate-400 group-hover:text-slate-300 transition-colors">{tip.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="text-center text-slate-500/70 text-sm mt-8 font-light tracking-wide">
          <p>TypeMaster Pro • Elevate your typing skills with precision analytics</p>
          <p className="mt-2 text-xs">Try different word display modes to challenge yourself</p>
        </footer>
      </div>

      {/* Custom CSS for smooth animations */}
      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) translateX(0px); }
          50% { transform: translateY(-20px) translateX(10px); }
        }
        
        @keyframes slide-up {
          from { transform: translateY(20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        
        @keyframes gradient {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        
        @keyframes pulse-slow {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        
        @keyframes bounce-slow {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        
        .animate-slide-up {
          animation: slide-up 0.6s cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        .animate-gradient {
          animation: gradient 8s ease infinite;
          background-size: 200% 200%;
        }
        
        .animate-pulse-slow {
          animation: pulse-slow 2s ease-in-out infinite;
        }
        
        .animate-bounce-slow {
          animation: bounce-slow 2s ease-in-out infinite;
        }
        
        .animate-fade-in {
          animation: slide-up 0.3s ease-out;
        }
        
        .correct-char {
          color: rgb(52 211 153);
          background-color: rgba(52, 211, 153, 0.1);
          border-radius: 2px;
        }
        
        .error-char {
          color: rgb(248 113 113);
          background-color: rgba(248, 113, 113, 0.1);
          border-radius: 2px;
          text-decoration: line-through;
        }
        
        .current-char {
          color: rgb(34 211 238);
          background-color: rgba(34, 211, 238, 0.15);
          border-radius: 2px;
          text-shadow: 0 0 10px rgba(34, 211, 238, 0.5);
        }
        
        .pending-char {
          color: rgb(148 163 184);
        }
      `}</style>
    </div>
  );
}
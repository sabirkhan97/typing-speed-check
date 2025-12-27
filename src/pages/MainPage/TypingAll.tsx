import React, { useState, useEffect, useRef } from 'react';

const sampleTexts = [
  "The quick brown fox jumps over the lazy dog near the riverbank where children play and birds sing their morning songs under the bright blue sky.",
  "Technology has revolutionized the way we communicate and interact with each other in modern society bringing people closer despite physical distances.",
  "Practice makes perfect when learning new skills and developing expertise in any field requires dedication patience and consistent effort over time.",
  "Mountains rise majestically above the clouds while valleys stretch endlessly below creating breathtaking landscapes that inspire wonder and admiration.",
  "Music has the power to evoke emotions and memories transporting us to different times and places with just a simple melody or harmony."
];

const difficultyLevels = [
  { name: "Easy", wordsPerMinute: 40, color: "from-emerald-500 to-teal-500" },
  { name: "Medium", wordsPerMinute: 60, color: "from-amber-500 to-orange-500" },
  { name: "Hard", wordsPerMinute: 80, color: "from-rose-500 to-pink-600" },
  { name: "Expert", wordsPerMinute: 100, color: "from-purple-600 to-indigo-600" }
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
  const inputRef = useRef(null);
  const cursorRef = useRef(null);

  useEffect(() => {
    resetTest();
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
    if (cursorRef.current) {
      const textElement = document.getElementById('text-display');
      const chars = textElement?.getElementsByClassName('char');
      if (chars && chars[currentIndex]) {
        const rect = chars[currentIndex].getBoundingClientRect();
        const containerRect = textElement.getBoundingClientRect();
        cursorRef.current.style.transform = `translate(${rect.left - containerRect.left}px, ${rect.top - containerRect.top}px)`;
      }
    }
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
    if (inputRef.current) {
      inputRef.current.focus();
      setIsFocused(true);
    }
  };

  const finishTest = () => {
    setFinished(true);
    calculateFinalWPM();
    setTimeout(() => setShowResults(true), 500);
  };

  const handleInputChange = (e) => {
    const value = e.target.value;
    
    if (!started) {
      setStarted(true);
      setStartTime(Date.now());
    }

    if (finished) return;

    if (value.length > text.length) return;

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
    setWpm(calculatedWpm || 0);
  };

  const calculateFinalWPM = () => {
    const timeElapsed = (timeLimit - timeRemaining) / 60;
    const wordsTyped = input.trim().split(/\s+/).filter(w => w.length > 0).length;
    const calculatedWpm = Math.round(wordsTyped / timeElapsed) || 0;
    setWpm(calculatedWpm);
  };

  const getCharClass = (index) => {
    if (index < currentIndex) {
      if (input[index] === text[index]) {
        return 'text-emerald-400 bg-emerald-400/10';
      } else {
        return 'text-rose-400 bg-rose-400/10';
      }
    } else if (index === currentIndex) {
      return 'text-cyan-300 bg-cyan-300/20';
    }
    return 'text-slate-400';
  };

  const changeTimeLimit = (seconds) => {
    setTimeLimit(seconds);
    setTimeRemaining(seconds);
    resetTest();
  };

  const changeDifficulty = (level) => {
    setDifficulty(level);
    resetTest();
  };

  const getWpmColor = (wpmValue) => {
    if (wpmValue >= difficultyLevels[3].wordsPerMinute) return 'text-purple-400';
    if (wpmValue >= difficultyLevels[2].wordsPerMinute) return 'text-rose-400';
    if (wpmValue >= difficultyLevels[1].wordsPerMinute) return 'text-amber-400';
    return 'text-emerald-400';
  };

  const getAccuracyColor = (accuracyValue) => {
    if (accuracyValue >= 95) return 'text-emerald-400';
    if (accuracyValue >= 85) return 'text-amber-400';
    return 'text-rose-400';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-950 to-gray-900 flex flex-col items-center justify-center p-4 md:p-6">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-gradient-to-r from-cyan-500/5 to-blue-500/5 animate-pulse"
            style={{
              width: `${Math.random() * 100 + 50}px`,
              height: `${Math.random() * 100 + 50}px`,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${Math.random() * 10 + 10}s`
            }}
          />
        ))}
      </div>

      <div className="max-w-6xl w-full relative z-10">
        {/* Header */}
        <header className="text-center mb-10">
          <div className="inline-block relative">
            <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent mb-3">
              TypeMaster
            </h1>
            <div className="absolute -bottom-2 left-0 right-0 h-1 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-full"></div>
          </div>
          <p className="text-slate-400 mt-6 text-lg">Test and improve your typing speed with precision tracking</p>
        </header>

        {/* Main Container */}
        <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-slate-700/50 shadow-2xl overflow-hidden">
          {/* Control Bar */}
          <div className="p-6 border-b border-slate-700/50">
            <div className="flex flex-col md:flex-row justify-between items-center gap-6">
              {/* Time Selection */}
              <div className="flex gap-3">
                {[15, 30, 60].map((seconds) => (
                  <button
                    key={seconds}
                    onClick={() => changeTimeLimit(seconds)}
                    className={`px-5 py-2.5 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 ${
                      timeLimit === seconds
                        ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-lg shadow-cyan-500/25'
                        : 'bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-600'
                    }`}
                  >
                    {seconds}s
                  </button>
                ))}
              </div>

              {/* Difficulty Levels */}
              <div className="flex gap-3">
                {difficultyLevels.map((level, index) => (
                  <button
                    key={level.name}
                    onClick={() => changeDifficulty(index)}
                    className={`px-4 py-2 rounded-xl font-semibold text-sm transition-all duration-300 ${
                      difficulty === index
                        ? `bg-gradient-to-r ${level.color} text-white shadow-lg`
                        : 'bg-slate-800 text-slate-400 hover:bg-slate-700 border border-slate-600'
                    }`}
                  >
                    {level.name}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Stats and Text Area */}
          <div className="p-6 md:p-8">
            {/* Real-time Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl p-4 border border-slate-700">
                <div className="flex items-center justify-between">
                  <div>
                    <div className={`text-3xl font-bold ${getWpmColor(wpm)}`}>{wpm}</div>
                    <div className="text-sm text-slate-400 mt-1">WPM</div>
                  </div>
                  <div className="text-blue-400">
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl p-4 border border-slate-700">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-3xl font-bold text-amber-400">{timeRemaining}s</div>
                    <div className="text-sm text-slate-400 mt-1">Remaining</div>
                  </div>
                  <div className="text-amber-400">
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl p-4 border border-slate-700">
                <div className="flex items-center justify-between">
                  <div>
                    <div className={`text-3xl font-bold ${getAccuracyColor(accuracy)}`}>{accuracy}%</div>
                    <div className="text-sm text-slate-400 mt-1">Accuracy</div>
                  </div>
                  <div className="text-emerald-400">
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl p-4 border border-slate-700">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-3xl font-bold text-rose-400">{errors}</div>
                    <div className="text-sm text-slate-400 mt-1">Errors</div>
                  </div>
                  <div className="text-rose-400">
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            {/* Text Display */}
            <div className="relative mb-8">
              <div className="absolute -inset-4 bg-gradient-to-r from-cyan-500/10 via-transparent to-purple-500/10 rounded-2xl blur-xl"></div>
              <div className="relative bg-slate-800/80 backdrop-blur-sm rounded-xl p-8 border border-slate-700/50">
                <div 
                  id="text-display" 
                  className="text-xl md:text-2xl leading-relaxed font-mono tracking-wide min-h-[180px] relative select-none"
                >
                  {/* Animated Cursor */}
                  <div
                    ref={cursorRef}
                    className="absolute w-[3px] h-8 bg-gradient-to-b from-cyan-400 to-blue-400 rounded-full transition-all duration-150 ease-out shadow-lg shadow-cyan-400/50"
                    style={{ transformOrigin: 'top left' }}
                  />
                  
                  {text.split('').map((char, index) => (
                    <span key={index} className={`char inline-block ${getCharClass(index)} px-0.5 rounded transition-all duration-150`}>
                      {char === ' ' ? '\u00A0' : char}
                    </span>
                  ))}
                </div>
                
                {/* Focus reminder */}
                {!isFocused && !finished && (
                  <div className="absolute inset-0 flex items-center justify-center bg-slate-900/80 backdrop-blur-sm rounded-xl">
                    <div className="text-center p-6">
                      <div className="text-cyan-400 mb-2">
                        <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
                        </svg>
                      </div>
                      <p className="text-slate-300 text-lg">Click to focus and start typing</p>
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
                  className="w-full bg-slate-800/80 text-white text-xl p-5 rounded-xl border-2 border-slate-700 focus:border-cyan-400 focus:outline-none font-mono disabled:opacity-50 transition-all duration-300 backdrop-blur-sm"
                  placeholder={finished ? "Test completed! Press reset to try again" : "Start typing here to begin..."}
                  autoFocus
                />
                <div className="absolute right-4 top-1/2 transform -translate-y-1/2 text-slate-500">
                  {started && !finished && (
                    <div className="flex items-center gap-2 animate-pulse">
                      <div className="w-2 h-2 bg-cyan-400 rounded-full"></div>
                      <span className="text-sm">Live</span>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Progress bar */}
              <div className="mt-4">
                <div className="flex justify-between text-sm text-slate-400 mb-2">
                  <span>Progress</span>
                  <span>{Math.round((currentIndex / text.length) * 100)}%</span>
                </div>
                <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 transition-all duration-300"
                    style={{ width: `${(currentIndex / text.length) * 100}%` }}
                  ></div>
                </div>
              </div>
            </div>

            {/* Results Panel */}
            {showResults && (
              <div className="mb-8 animate-in slide-in-from-bottom duration-500">
                <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl p-8 border border-slate-700/50">
                  <div className="text-center mb-6">
                    <h2 className="text-3xl font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent mb-2">
                      Test Complete! 🎯
                    </h2>
                    <p className="text-slate-400">Your typing performance analysis</p>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
                      <div className="text-center">
                        <div className={`text-4xl font-bold ${getWpmColor(wpm)}`}>{wpm}</div>
                        <div className="text-slate-400 mt-2">Words per minute</div>
                        <div className="mt-4">
                          <div className="text-sm text-slate-500 mb-1">Target: {difficultyLevels[difficulty].wordsPerMinute} WPM</div>
                          <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                            <div 
                              className={`h-full ${wpm >= difficultyLevels[difficulty].wordsPerMinute ? 'bg-emerald-500' : 'bg-amber-500'}`}
                              style={{ width: `${Math.min((wpm / difficultyLevels[difficulty].wordsPerMinute) * 100, 100)}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
                      <div className="text-center">
                        <div className={`text-4xl font-bold ${getAccuracyColor(accuracy)}`}>{accuracy}%</div>
                        <div className="text-slate-400 mt-2">Accuracy</div>
                        <div className="mt-4 flex justify-center gap-6">
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
                    
                    <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
                      <div className="text-center">
                        <div className="text-4xl font-bold text-amber-400">{timeLimit - timeRemaining}s</div>
                        <div className="text-slate-400 mt-2">Time taken</div>
                        <div className="mt-4">
                          <div className="text-sm text-slate-500 mb-1">Characters per second</div>
                          <div className="text-2xl font-bold text-cyan-400">
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
            <div className="flex gap-4">
              <button
                onClick={resetTest}
                className="flex-1 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white font-bold text-lg py-4 rounded-xl transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-cyan-500/25"
              >
                {finished ? 'Start New Test' : 'Reset Test'}
                <div className="text-sm font-normal opacity-90 mt-1">
                  {finished ? 'Try again with different settings' : 'Restart current test'}
                </div>
              </button>
              
              {finished && (
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(`I just typed at ${wpm} WPM with ${accuracy}% accuracy on TypeMaster!`);
                  }}
                  className="px-6 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold rounded-xl transition-all duration-300 transform hover:scale-[1.02] shadow-lg shadow-purple-500/25 flex items-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  Share
                </button>
              )}
            </div>
          </div>

          {/* Footer Tips */}
          <div className="p-6 border-t border-slate-700/50 bg-slate-900/30">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-slate-400">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-cyan-500/10 flex items-center justify-center">
                  <svg className="w-4 h-4 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <span>Focus on accuracy first, then speed</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-purple-500/10 flex items-center justify-center">
                  <svg className="w-4 h-4 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <span>Regular practice improves muscle memory</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center">
                  <svg className="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <span>Track your progress with statistics</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="text-center text-slate-500 text-sm mt-8">
          <p>TypeMaster • Practice typing to improve your speed and accuracy</p>
          <p className="mt-2">Try different difficulty levels and time limits to challenge yourself</p>
        </footer>
      </div>
    </div>
  );
}
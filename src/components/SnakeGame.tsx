import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useInterval } from '../hooks/useInterval';
import { Trophy, RefreshCw, Gamepad2, ChevronUp, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';

type Point = { x: number; y: number };

const GRID_SIZE = 20;
const INITIAL_SPEED = 150;
const SPEED_INCREMENT = 2; // Milliseconds to decrease from interval per food eaten
const MIN_SPEED = 50;

const INITIAL_SNAKE: Point[] = [
  { x: 10, y: 10 },
  { x: 10, y: 11 },
  { x: 10, y: 12 },
];
const INITIAL_DIRECTION: Point = { x: 0, y: -1 }; // Moving Up

const generateFood = (snake: Point[]): Point => {
  let newFood: Point;
  while (true) {
    newFood = {
      x: Math.floor(Math.random() * GRID_SIZE),
      y: Math.floor(Math.random() * GRID_SIZE),
    };
    // Ensure food doesn't spawn on the snake
    const isOnSnake = snake.some(segment => segment.x === newFood.x && segment.y === newFood.y);
    if (!isOnSnake) break;
  }
  return newFood;
};

export default function SnakeGame() {
  const [snake, setSnake] = useState<Point[]>(INITIAL_SNAKE);
  const [direction, setDirection] = useState<Point>(INITIAL_DIRECTION);
  const [food, setFood] = useState<Point>({ x: 5, y: 5 }); // Initial generic position
  const [isGameOver, setIsGameOver] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  
  // Track the direction actually processed in the last tick to prevent rapid reverse self-collisions
  const lastProcessedDirection = useRef<Point>(INITIAL_DIRECTION);

  useEffect(() => {
    setFood(generateFood(INITIAL_SNAKE));
    const savedHighScore = localStorage.getItem('snakeSynthHighScore');
    if (savedHighScore) {
      setHighScore(parseInt(savedHighScore, 10));
    }
  }, []);

  const startGame = () => {
    setSnake(INITIAL_SNAKE);
    setDirection(INITIAL_DIRECTION);
    lastProcessedDirection.current = INITIAL_DIRECTION;
    setScore(0);
    setIsGameOver(false);
    setIsPlaying(true);
    setFood(generateFood(INITIAL_SNAKE));
  };

  const handleGameOver = useCallback(() => {
    setIsPlaying(false);
    setIsGameOver(true);
    if (score > highScore) {
      setHighScore(score);
      localStorage.setItem('snakeSynthHighScore', score.toString());
    }
  }, [score, highScore]);

  const tick = useCallback(() => {
    if (!isPlaying || isGameOver) return;

    setSnake((prevSnake) => {
      const head = prevSnake[0];
      const newHead = {
        x: head.x + direction.x,
        y: head.y + direction.y,
      };

      // Wall collision
      if (
        newHead.x < 0 ||
        newHead.x >= GRID_SIZE ||
        newHead.y < 0 ||
        newHead.y >= GRID_SIZE
      ) {
        handleGameOver();
        return prevSnake;
      }

      // Self collision
      if (prevSnake.some((segment) => segment.x === newHead.x && segment.y === newHead.y)) {
        handleGameOver();
        return prevSnake;
      }

      const newSnake = [newHead, ...prevSnake];

      // Food collision
      if (newHead.x === food.x && newHead.y === food.y) {
        setScore((s) => s + 10);
        setFood(generateFood(newSnake));
      } else {
        newSnake.pop(); // Remove tail if no food eaten
      }

      lastProcessedDirection.current = direction; // Update the successfully processed direction
      return newSnake;
    });
  }, [direction, food, handleGameOver, isGameOver, isPlaying]);

  const currentSpeed = Math.max(MIN_SPEED, INITIAL_SPEED - (score / 10) * SPEED_INCREMENT);
  useInterval(tick, isPlaying && !isGameOver ? currentSpeed : null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isPlaying) {
        if (e.key === 'Enter' || e.code === 'Space') {
          e.preventDefault();
          if (!isPlaying) startGame();
        }
        return;
      }

      const { x: lastX, y: lastY } = lastProcessedDirection.current;

      switch (e.key) {
        case 'ArrowUp':
        case 'w':
        case 'W':
          if (lastY === 0) setDirection({ x: 0, y: -1 });
          break;
        case 'ArrowDown':
        case 's':
        case 'S':
          if (lastY === 0) setDirection({ x: 0, y: 1 });
          break;
        case 'ArrowLeft':
        case 'a':
        case 'A':
          if (lastX === 0) setDirection({ x: -1, y: 0 });
          break;
        case 'ArrowRight':
        case 'd':
        case 'D':
          if (lastX === 0) setDirection({ x: 1, y: 0 });
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPlaying]);

  const handleMobileControl = (dir: 'UP' | 'DOWN' | 'LEFT' | 'RIGHT') => {
    if (!isPlaying) return;
    const { x: lastX, y: lastY } = lastProcessedDirection.current;
    switch (dir) {
      case 'UP': if (lastY === 0) setDirection({ x: 0, y: -1 }); break;
      case 'DOWN': if (lastY === 0) setDirection({ x: 0, y: 1 }); break;
      case 'LEFT': if (lastX === 0) setDirection({ x: -1, y: 0 }); break;
      case 'RIGHT': if (lastX === 0) setDirection({ x: 1, y: 0 }); break;
    }
  };

  return (
    <div className="w-full flex flex-col items-center">
      {/* Top Header - Score tracking */}
      <div className="w-full sm:w-[400px] flex gap-4 justify-between mb-8 font-mono">
        <div className="flex-1 bg-black border-2 border-[#0ff] px-6 py-3 flex flex-col items-center shadow-[4px_4px_0_#f0f] relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full bg-[#0ff] opacity-10 pointer-events-none"></div>
          <span className="text-[10px] uppercase tracking-widest text-[#f0f] mb-1 font-bold">MEM_ALLOC</span>
          <motion.span 
            key={score}
            initial={{ scale: 1.2, x: 2 }}
            animate={{ scale: 1, x: 0 }}
            className="font-mono text-xl md:text-2xl font-bold text-white drop-shadow-[2px_2px_0_#0ff]"
          >
            0x{score.toString(16).toUpperCase().padStart(4, '0')}
          </motion.span>
        </div>
        <div className="flex-1 bg-black border-2 border-[#f0f] px-6 py-3 flex flex-col items-center shadow-[-4px_4px_0_#0ff] relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full bg-[#f0f] opacity-10 pointer-events-none"></div>
          <span className="text-[10px] uppercase tracking-widest text-[#0ff] mb-1 flex items-center gap-1 font-bold">
            MAX_BUFFER
          </span>
          <span className="font-mono text-xl md:text-2xl font-bold text-white drop-shadow-[2px_2px_0_#f0f]">
            0x{highScore.toString(16).toUpperCase().padStart(4, '0')}
          </span>
        </div>
      </div>

      {/* Game Board Container */}
      <div className="relative bg-black p-4 border border-[#0ff] ring-1 ring-[#f0f]">
        
        {/* The Grid itself */}
        <div 
          className="bg-black grid border border-[#f0f] relative"
          style={{
            gridTemplateColumns: `repeat(${GRID_SIZE}, minmax(0, 1fr))`,
            width: 'min(90vw, 400px)',
            height: 'min(90vw, 400px)',
          }}
        >
          {Array.from({ length: GRID_SIZE * GRID_SIZE }).map((_, index) => {
            const x = index % GRID_SIZE;
            const y = Math.floor(index / GRID_SIZE);
            
            const isSnake = snake.some((segment) => segment.x === x && segment.y === y);
            const isHead = snake[0].x === x && snake[0].y === y;
            const isFood = food.x === x && food.y === y;

            return (
              <div 
                key={index} 
                className={`w-full h-full border-[0.5px] border-[#0ff]/20 z-10 ${
                  isHead 
                    ? 'bg-[#f0f] border border-white z-20 shadow-[0_0_8px_#f0f]' 
                    : isSnake
                      ? 'bg-[#0ff]'
                      : isFood
                        ? 'bg-white z-20 animate-[glitch-skew_0.5s_infinite] shadow-[0_0_15px_#fff]'
                        : ''
                }`}
              />
            );
          })}
        </div>

        {/* Overlay States (Start / Game Over) */}
        <AnimatePresence>
          {(!isPlaying || isGameOver) && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 z-30 bg-black/90 flex flex-col items-center justify-center p-6 text-center border-4 border-[#f0f]"
            >
              {isGameOver ? (
                <>
                  <h2 className="text-3xl font-mono text-white mb-2 glitch-text tracking-widest uppercase drop-shadow-[2px_2px_0_#f0f]" data-text="SYSTEM_FAULT">
                    SYSTEM_FAULT
                  </h2>
                  <p className="font-sans text-[#0ff] mb-8 uppercase text-xl font-bold bg-black p-1">BIOMASS NEUTRALIZED.</p>
                  <button 
                    onClick={startGame}
                    className="glitch-btn px-6 py-3 font-mono flex items-center gap-2 text-sm"
                  >
                    <RefreshCw className="w-5 h-5" /> REBOOT_SEQ
                  </button>
                </>
              ) : (
                <>
                  <div className="w-16 h-16 bg-black border-2 border-[#0ff] flex items-center justify-center mb-4 text-[#f0f] shadow-[4px_4px_0_#f0f]">
                    <Gamepad2 className="w-8 h-8" />
                  </div>
                  <h2 className="text-2xl font-mono tracking-widest text-[#0ff] mb-2 glitch-text drop-shadow-[2px_2px_0_#0ff]" data-text="AWAITING INPUT">AWAITING INPUT</h2>
                  <p className="font-sans text-lg font-bold text-[#f0f] mb-8 max-w-[250px] uppercase bg-black">Navigate parameters. Consume fragments.</p>
                  <button 
                    onClick={startGame}
                    className="glitch-btn px-8 py-3 font-mono text-sm"
                  >
                    EXECUTE_SNAKE.EXE
                  </button>
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Mobile Controls / D-Pad (only visible on small screens / touch) */}
      <div className="mt-8 grid grid-cols-3 gap-2 sm:hidden w-[200px]">
        <div />
        <button 
          onClick={() => handleMobileControl('UP')}
          className="glitch-btn p-4 flex items-center justify-center"
        >
          <ChevronUp className="w-8 h-8" />
        </button>
        <div />
        <button 
          onClick={() => handleMobileControl('LEFT')}
          className="glitch-btn p-4 flex items-center justify-center"
        >
          <ChevronLeft className="w-8 h-8" />
        </button>
        <button 
          onClick={() => handleMobileControl('DOWN')}
          className="glitch-btn p-4 flex items-center justify-center"
        >
          <ChevronDown className="w-8 h-8" />
        </button>
        <button 
          onClick={() => handleMobileControl('RIGHT')}
          className="glitch-btn p-4 flex items-center justify-center"
        >
          <ChevronRight className="w-8 h-8" />
        </button>
      </div>
    </div>
  );
}

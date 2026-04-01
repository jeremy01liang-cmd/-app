import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router";
import { ArrowLeft, Play, RotateCcw } from "lucide-react";
import { motion } from "motion/react";

const VOCABULARY = [
  "APPLE", "BIRD", "CAT", "DOG", "EGG", "FISH", "GIRL", "HAT", "ICE", "JUMP",
  "KITE", "LION", "MILK", "NEST", "OWL", "PIG", "QUEEN", "RABBIT", "SUN", "TREE",
  "BEAR", "CAR", "DUCK", "FROG", "GOAT", "MOON", "STAR", "BOOK", "PEN", "DESK"
];

export const SpaceGame: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  
  const [score, setScore] = useState(0);
  const [gameState, setGameState] = useState<"start" | "playing" | "gameover">("start");

  // Game configuration
  const config = {
    playerSize: 50,
    bulletSpeed: 12,
    enemySpeed: 2,
    enemySpawnRate: 80, // frames
    powerupSpeed: 3,
  };

  useEffect(() => {
    if (gameState !== "playing") return;

    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Set canvas to full container size
    const resizeCanvas = () => {
      canvas.width = container.clientWidth;
      canvas.height = container.clientHeight;
    };
    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    let animationId: number;
    let frameCount = 0;
    let localScore = 0;

    // Game Objects
    const player = {
      x: canvas.width / 2,
      y: canvas.height - 100,
      width: config.playerSize,
      height: config.playerSize,
      weaponLevel: 1, // Max 3
    };

    let bullets: { x: number; y: number; width: number; height: number; color: string; vx: number; vy: number }[] = [];
    let enemies: { x: number; y: number; width: number; height: number; hp: number; word: string }[] = [];
    let powerups: { x: number; y: number; width: number; height: number; type: string }[] = [];
    let particles: { x: number; y: number; vx: number; vy: number; life: number; color: string; maxLife: number; text?: string }[] = [];
    let stars: { x: number; y: number; size: number; speed: number; opacity: number }[] = [];

    // Init stars
    for (let i = 0; i < 100; i++) {
      stars.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: Math.random() * 2 + 1,
        speed: Math.random() * 2 + 0.5,
        opacity: Math.random(),
      });
    }

    // Input handling
    let isDragging = false;
    
    const handleMove = (x: number, y: number) => {
      player.x = Math.max(player.width / 2, Math.min(x, canvas.width - player.width / 2));
      player.y = Math.max(player.height / 2, Math.min(y, canvas.height - player.height / 2));
    };

    const onPointerDown = (e: PointerEvent) => {
      isDragging = true;
      handleMove(e.clientX - canvas.getBoundingClientRect().left, e.clientY - canvas.getBoundingClientRect().top);
    };

    const onPointerMove = (e: PointerEvent) => {
      if (isDragging) {
        handleMove(e.clientX - canvas.getBoundingClientRect().left, e.clientY - canvas.getBoundingClientRect().top);
      }
    };

    const onPointerUp = () => {
      isDragging = false;
    };

    canvas.addEventListener("pointerdown", onPointerDown);
    canvas.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", onPointerUp);

    // Helpers
    const createExplosion = (x: number, y: number, color: string, word?: string) => {
      for (let i = 0; i < 20; i++) {
        particles.push({
          x,
          y,
          vx: (Math.random() - 0.5) * 8,
          vy: (Math.random() - 0.5) * 8,
          life: 30 + Math.random() * 20,
          maxLife: 50,
          color,
        });
      }
      if (word) {
        particles.push({
          x,
          y,
          vx: 0,
          vy: -2,
          life: 60,
          maxLife: 60,
          color: "#fff",
          text: word,
        });
      }
    };

    const drawSciFiShip = (ctx: CanvasRenderingContext2D, x: number, y: number) => {
      ctx.save();
      ctx.translate(x, y);
      
      // Glow effect
      ctx.shadowBlur = 15;
      ctx.shadowColor = "#00f0ff";
      
      ctx.beginPath();
      ctx.moveTo(0, -25);
      ctx.lineTo(25, 20);
      ctx.lineTo(12, 20);
      ctx.lineTo(0, 8);
      ctx.lineTo(-12, 20);
      ctx.lineTo(-25, 20);
      ctx.closePath();
      
      ctx.fillStyle = "rgba(0, 240, 255, 0.2)";
      ctx.fill();
      
      ctx.strokeStyle = "#00f0ff";
      ctx.lineWidth = 2;
      ctx.stroke();

      // Engine glow
      ctx.shadowColor = "#ff00ea";
      ctx.beginPath();
      ctx.arc(0, 20, 8 + Math.random() * 4, 0, Math.PI * 2);
      ctx.fillStyle = "#ff00ea";
      ctx.fill();

      // Weapon level indicator
      ctx.fillStyle = "#fff";
      ctx.font = "10px monospace";
      ctx.textAlign = "center";
      ctx.fillText(`Lv.${player.weaponLevel}`, 0, 5);

      ctx.restore();
    };

    const drawEggEnemy = (ctx: CanvasRenderingContext2D, enemy: any) => {
      ctx.save();
      ctx.translate(enemy.x, enemy.y);
      
      // Draw Egg
      ctx.shadowBlur = 15;
      ctx.shadowColor = "#ffeb3b";
      
      ctx.beginPath();
      // Bezier curve for egg shape
      ctx.moveTo(0, -enemy.height/2);
      ctx.bezierCurveTo(enemy.width/2 + 10, -enemy.height/2, enemy.width/2 + 10, enemy.height/2, 0, enemy.height/2);
      ctx.bezierCurveTo(-enemy.width/2 - 10, enemy.height/2, -enemy.width/2 - 10, -enemy.height/2, 0, -enemy.height/2);
      ctx.closePath();
      
      // Gradient fill for 3D egg look
      const gradient = ctx.createRadialGradient(-5, -5, 5, 0, 0, enemy.width);
      gradient.addColorStop(0, "#fff59d");
      gradient.addColorStop(1, "#fbc02d");
      
      ctx.fillStyle = gradient;
      ctx.fill();
      
      ctx.strokeStyle = "#f57f17";
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.shadowBlur = 0;

      // Draw word inside egg
      ctx.fillStyle = "#d84315";
      ctx.font = "bold 14px 'Courier New', monospace";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(enemy.word, 0, 0);

      ctx.restore();
    };

    const drawPowerUp = (ctx: CanvasRenderingContext2D, powerup: any) => {
      ctx.save();
      ctx.translate(powerup.x, powerup.y);
      
      ctx.shadowBlur = 20;
      ctx.shadowColor = "#00ff00";
      
      ctx.beginPath();
      ctx.arc(0, 0, powerup.width/2, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(0, 255, 0, 0.3)";
      ctx.fill();
      ctx.strokeStyle = "#00ff00";
      ctx.lineWidth = 3;
      ctx.stroke();

      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 16px 'Courier New'";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("UP", 0, 0);

      ctx.restore();
    };

    const gameLoop = () => {
      frameCount++;
      
      // Clear canvas
      ctx.fillStyle = "#050510";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw Grid
      ctx.strokeStyle = "rgba(0, 240, 255, 0.05)";
      ctx.lineWidth = 1;
      const gridSize = 50;
      const offset = (frameCount * 0.5) % gridSize;
      
      ctx.beginPath();
      for (let x = 0; x < canvas.width; x += gridSize) {
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
      }
      for (let y = offset; y < canvas.height; y += gridSize) {
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
      }
      ctx.stroke();

      // Update & Draw Stars
      ctx.fillStyle = "#ffffff";
      stars.forEach((star) => {
        star.y += star.speed;
        if (star.y > canvas.height) {
          star.y = 0;
          star.x = Math.random() * canvas.width;
        }
        ctx.globalAlpha = star.opacity * (0.5 + Math.sin(frameCount * 0.05) * 0.5);
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
        ctx.fill();
      });
      ctx.globalAlpha = 1;

      // Shoot bullets based on level
      if (frameCount % 10 === 0) {
        if (player.weaponLevel === 1) {
          bullets.push({ x: player.x, y: player.y - 25, width: 4, height: 15, color: "#00f0ff", vx: 0, vy: -config.bulletSpeed });
        } else if (player.weaponLevel === 2) {
          bullets.push(
            { x: player.x - 10, y: player.y - 20, width: 4, height: 15, color: "#00f0ff", vx: 0, vy: -config.bulletSpeed },
            { x: player.x + 10, y: player.y - 20, width: 4, height: 15, color: "#00f0ff", vx: 0, vy: -config.bulletSpeed }
          );
        } else {
          bullets.push(
            { x: player.x, y: player.y - 25, width: 6, height: 18, color: "#ff00ea", vx: 0, vy: -config.bulletSpeed },
            { x: player.x - 15, y: player.y - 15, width: 4, height: 15, color: "#00f0ff", vx: -2, vy: -config.bulletSpeed },
            { x: player.x + 15, y: player.y - 15, width: 4, height: 15, color: "#00f0ff", vx: 2, vy: -config.bulletSpeed }
          );
        }
      }

      // Spawn enemies (Eggs)
      let currentSpawnRate = Math.max(30, config.enemySpawnRate - Math.floor(localScore / 100));
      if (frameCount % currentSpawnRate === 0) {
        const word = VOCABULARY[Math.floor(Math.random() * VOCABULARY.length)];
        enemies.push({
          x: Math.random() * (canvas.width - 60) + 30,
          y: -40,
          width: 40,
          height: 50,
          hp: 2,
          word,
        });
      }

      // Spawn Power-ups randomly
      if (frameCount % 400 === 0 && Math.random() > 0.3) {
        powerups.push({
          x: Math.random() * (canvas.width - 40) + 20,
          y: -30,
          width: 30,
          height: 30,
          type: "upgrade"
        });
      }

      // Update & Draw Power-ups
      for (let i = powerups.length - 1; i >= 0; i--) {
        const p = powerups[i];
        p.y += config.powerupSpeed;
        
        drawPowerUp(ctx, p);

        // Check collision with player
        if (
          Math.abs(p.x - player.x) < (p.width / 2 + player.width / 2) &&
          Math.abs(p.y - player.y) < (p.height / 2 + player.height / 2)
        ) {
          if (player.weaponLevel < 3) player.weaponLevel++;
          createExplosion(p.x, p.y, "#00ff00");
          powerups.splice(i, 1);
          continue;
        }

        if (p.y > canvas.height + 30) {
          powerups.splice(i, 1);
        }
      }

      // Update & Draw Bullets
      for (let i = bullets.length - 1; i >= 0; i--) {
        const b = bullets[i];
        b.x += b.vx;
        b.y += b.vy;
        
        ctx.shadowBlur = 10;
        ctx.shadowColor = b.color;
        ctx.fillStyle = b.color;
        ctx.fillRect(b.x - b.width / 2, b.y - b.height / 2, b.width, b.height);
        ctx.shadowBlur = 0;

        if (b.y < -20 || b.x < -20 || b.x > canvas.width + 20) {
          bullets.splice(i, 1);
        }
      }

      // Update & Draw Enemies & Collision
      for (let i = enemies.length - 1; i >= 0; i--) {
        const e = enemies[i];
        e.y += config.enemySpeed + (localScore / 1000);
        
        drawEggEnemy(ctx, e);

        // Check collision with bullets
        for (let j = bullets.length - 1; j >= 0; j--) {
          const b = bullets[j];
          if (
            b.x > e.x - e.width / 2 &&
            b.x < e.x + e.width / 2 &&
            b.y > e.y - e.height / 2 &&
            b.y < e.y + e.height / 2
          ) {
            e.hp -= (player.weaponLevel === 3 && b.color === "#ff00ea" ? 2 : 1);
            bullets.splice(j, 1);
            
            // Hit effect
            createExplosion(b.x, b.y, "#ffffff");

            if (e.hp <= 0) {
              localScore += 20;
              setScore(localScore);
              // Explode and show word
              createExplosion(e.x, e.y, "#fbc02d", e.word);
              enemies.splice(i, 1);
              break;
            }
          }
        }

        // Check collision with player
        if (
          Math.abs(e.x - player.x) < (e.width / 2 + player.width / 3) &&
          Math.abs(e.y - player.y) < (e.height / 2 + player.height / 3)
        ) {
          createExplosion(player.x, player.y, "#00f0ff");
          setGameState("gameover");
          return; // Stop rendering
        }

        if (e.y > canvas.height + 40 && enemies[i]) {
          enemies.splice(i, 1);
        }
      }

      // Update & Draw Particles
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.life--;

        ctx.globalAlpha = Math.max(0, p.life / p.maxLife);
        
        if (p.text) {
          ctx.fillStyle = p.color;
          ctx.font = "bold 24px 'Courier New', monospace";
          ctx.textAlign = "center";
          ctx.shadowBlur = 10;
          ctx.shadowColor = "#ff00ea";
          ctx.fillText(p.text, p.x, p.y);
          ctx.shadowBlur = 0;
        } else {
          ctx.fillStyle = p.color;
          ctx.shadowBlur = 10;
          ctx.shadowColor = p.color;
          ctx.beginPath();
          ctx.arc(p.x, p.y, 2, 0, Math.PI * 2);
          ctx.fill();
          ctx.shadowBlur = 0;
        }
        
        ctx.globalAlpha = 1;

        if (p.life <= 0) {
          particles.splice(i, 1);
        }
      }

      // Draw Player
      drawSciFiShip(ctx, player.x, player.y);

      // Score and Level overlay
      ctx.fillStyle = "#00f0ff";
      ctx.font = "bold 24px 'Courier New', monospace";
      ctx.textAlign = "left";
      ctx.shadowBlur = 5;
      ctx.shadowColor = "#00f0ff";
      ctx.fillText(`SCORE: ${localScore.toString().padStart(6, '0')}`, 20, 40);
      
      ctx.fillStyle = "#00ff00";
      ctx.shadowColor = "#00ff00";
      ctx.fillText(`WEAPON LV: ${player.weaponLevel}/3`, 20, 70);
      ctx.shadowBlur = 0;

      animationId = requestAnimationFrame(gameLoop);
    };

    animationId = requestAnimationFrame(gameLoop);

    return () => {
      cancelAnimationFrame(animationId);
      canvas.removeEventListener("pointerdown", onPointerDown);
      canvas.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerUp);
      window.removeEventListener("resize", resizeCanvas);
    };
  }, [gameState]);

  return (
    <div className="relative flex h-full min-h-0 w-full flex-col overflow-hidden bg-[#030308] font-mono text-cyan-400">
      {/* 顶部导航返回 */}
      <div className="absolute top-4 left-4 z-20 flex items-center gap-4">
        <button
          onClick={() => navigate("/")}
          className="flex items-center justify-center w-12 h-12 rounded-full bg-cyan-900/40 border border-cyan-500 text-cyan-300 hover:bg-cyan-800/60 backdrop-blur-sm transition-all shadow-[0_0_15px_rgba(0,240,255,0.3)]"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
      </div>

      {/* 游戏画布容器 */}
      <div className="flex-1 w-full relative" ref={containerRef}>
        <canvas
          ref={canvasRef}
          className="block w-full h-full cursor-crosshair touch-none"
        />

        {/* 开始界面 */}
        {gameState === "start" && (
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center z-10">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="text-center"
            >
              <h1 className="text-6xl font-black italic tracking-widest text-transparent bg-clip-text bg-gradient-to-b from-cyan-300 to-blue-600 drop-shadow-[0_0_20px_rgba(0,240,255,0.8)] mb-2">
                WORD STRIKER
              </h1>
              <p className="text-cyan-400 mb-12 tracking-widest text-lg">打 破 鸡 蛋 学 单 词</p>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  setScore(0);
                  setGameState("playing");
                }}
                className="group relative inline-flex items-center justify-center gap-3 px-10 py-4 bg-transparent border-2 border-cyan-400 text-cyan-400 font-bold text-2xl tracking-widest overflow-hidden transition-all hover:text-black hover:border-transparent hover:shadow-[0_0_30px_rgba(0,240,255,0.8)]"
              >
                <div className="absolute inset-0 bg-cyan-400 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-in-out" />
                <Play className="w-8 h-8 relative z-10 fill-current" />
                <span className="relative z-10">启 动 飞 船</span>
              </motion.button>
            </motion.div>
          </div>
        )}

        {/* 游戏结束界面 */}
        {gameState === "gameover" && (
          <div className="absolute inset-0 bg-red-900/40 backdrop-blur-sm flex flex-col items-center justify-center z-10">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="text-center p-8 bg-black/80 border border-red-500 rounded-3xl shadow-[0_0_50px_rgba(255,0,0,0.3)]"
            >
              <h2 className="text-5xl font-black text-red-500 mb-2 drop-shadow-[0_0_10px_rgba(255,0,0,0.8)]">SYSTEM FAILURE</h2>
              <p className="text-red-300 mb-8 tracking-widest text-xl">战 机 被 摧 毁</p>
              
              <div className="text-cyan-400 text-3xl mb-12 flex flex-col items-center">
                <span className="text-sm text-cyan-600/80 mb-1 tracking-widest">最终得分</span>
                <span className="font-bold text-5xl text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.8)]">{score}</span>
              </div>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  setScore(0);
                  setGameState("playing");
                }}
                className="group relative inline-flex items-center justify-center gap-3 px-10 py-4 bg-transparent border-2 border-cyan-400 text-cyan-400 font-bold text-2xl tracking-widest overflow-hidden transition-all hover:text-black hover:border-transparent hover:shadow-[0_0_30px_rgba(0,240,255,0.8)]"
              >
                <div className="absolute inset-0 bg-cyan-400 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-in-out" />
                <RotateCcw className="w-8 h-8 relative z-10" />
                <span className="relative z-10">重 新 部 署</span>
              </motion.button>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
};

"use client";
import { cn } from "@/lib/utils";
import { useEffect, useRef, useState } from "react";

export const BackgroundGradientAnimation = ({
  gradientBackgroundStart = "rgb(108, 0, 162)",
  gradientBackgroundEnd = "rgb(0, 17, 82)",
  firstColor = "18, 113, 255",
  secondColor = "221, 74, 255",
  thirdColor = "100, 220, 255",
  fourthColor = "200, 50, 50",
  fifthColor = "180, 180, 50",
  pointerColor = "140, 100, 255",
  size = "80%",
  blendingValue = "hard-light",
  children,
  className,
  interactive = true,
  containerClassName,
  fullScreen = true,
}: {
  gradientBackgroundStart?: string;
  gradientBackgroundEnd?: string;
  firstColor?: string;
  secondColor?: string;
  thirdColor?: string;
  fourthColor?: string;
  fifthColor?: string;
  pointerColor?: string;
  size?: string;
  blendingValue?: string;
  children?: React.ReactNode;
  className?: string;
  interactive?: boolean;
  containerClassName?: string;
  fullScreen?: boolean;
}) => {
  const interactiveRef = useRef<HTMLDivElement>(null);
  const [effectiveSize, setEffectiveSize] = useState(size);

  // Store animated & target positions in refs to avoid endless React re-renders.
  const posRef = useRef({ curX: 0, curY: 0, tgX: 0, tgY: 0 });

  // Set CSS custom properties when inputs change.
  // Responsive sizing: on small screens enlarge the gradient size and recentre to avoid dark edges
  useEffect(() => {
    const updateSize = () => {
      if (typeof window === 'undefined') return;
      if (window.innerWidth < 640) {
        // Increase size to cover edges on narrow viewports
        setEffectiveSize('140%');
      } else if (window.innerWidth < 768) {
        setEffectiveSize('120%');
      } else {
        setEffectiveSize(size);
      }
    };
    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, [size]);

  useEffect(() => {
    const b = document.body.style;
    b.setProperty("--gradient-background-start", gradientBackgroundStart);
    b.setProperty("--gradient-background-end", gradientBackgroundEnd);
    b.setProperty("--first-color", firstColor);
    b.setProperty("--second-color", secondColor);
    b.setProperty("--third-color", thirdColor);
    b.setProperty("--fourth-color", fourthColor);
    b.setProperty("--fifth-color", fifthColor);
    b.setProperty("--pointer-color", pointerColor);
    b.setProperty("--size", effectiveSize);
    b.setProperty("--blending-value", blendingValue);
  }, [blendingValue, fifthColor, firstColor, fourthColor, pointerColor, secondColor, thirdColor, gradientBackgroundStart, gradientBackgroundEnd, effectiveSize]);

  // Animation loop using requestAnimationFrame (no React state updates per frame)
  useEffect(() => {
    let frame: number;
    const animate = () => {
      const { curX, curY, tgX, tgY } = posRef.current;
      const nx = curX + (tgX - curX) / 20;
      const ny = curY + (tgY - curY) / 20;
      posRef.current.curX = nx;
      posRef.current.curY = ny;
      if (interactiveRef.current) {
        interactiveRef.current.style.transform = `translate(${Math.round(nx)}px, ${Math.round(ny)}px)`;
      }
      frame = requestAnimationFrame(animate);
    };
    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, []);

  const handleMouseMove = (event: React.MouseEvent<HTMLDivElement>) => {
    if (!interactiveRef.current) return;
    const rect = interactiveRef.current.getBoundingClientRect();
    posRef.current.tgX = event.clientX - rect.left;
    posRef.current.tgY = event.clientY - rect.top;
  };

  const [isSafari, setIsSafari] = useState(false);
  useEffect(() => {
    setIsSafari(/^((?!chrome|android).)*safari/i.test(navigator.userAgent));
  }, []);

  return (
    <div
      className={cn(
        fullScreen
          ? "h-screen w-screen"
          : "h-full w-full",
        "relative overflow-hidden top-0 left-0 bg-[linear-gradient(40deg,var(--gradient-background-start),var(--gradient-background-end))]",
        containerClassName
      )}
  onMouseMove={interactive ? handleMouseMove : undefined}
  // Decorative animated background; no interactive semantics needed
    >
      <svg className="hidden">
        <defs>
          <filter id="blurMe">
            <feGaussianBlur
              in="SourceGraphic"
              stdDeviation="10"
              result="blur"
            />
            <feColorMatrix
              in="blur"
              mode="matrix"
              values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 18 -8"
              result="goo"
            />
            <feBlend in="SourceGraphic" in2="goo" />
          </filter>
        </defs>
      </svg>
      <div className={cn("", className)}>{children}</div>
      <div
        className={cn(
          "gradients-container h-full w-full blur-lg",
          isSafari ? "blur-2xl" : "[filter:url(#blurMe)_blur(40px)]"
        )}
      >
        {/* Center gradients */}
        <div
          className={cn(
            `absolute [background:radial-gradient(circle_at_center,_rgba(var(--first-color),_0.8)_0,_rgba(var(--first-color),_0)_50%)_no-repeat]`,
            `[mix-blend-mode:var(--blending-value)] w-[var(--size)] h-[var(--size)] top-[calc(50%-var(--size)/2)] left-[calc(50%-var(--size)/2)]`,
            `[transform-origin:center_center]`,
            `animate-first`,
            `opacity-100`
          )}
        ></div>
        <div
          className={cn(
            `absolute [background:radial-gradient(circle_at_center,_rgba(var(--second-color),_0.8)_0,_rgba(var(--second-color),_0)_50%)_no-repeat]`,
            `[mix-blend-mode:var(--blending-value)] w-[var(--size)] h-[var(--size)] top-[calc(50%-var(--size)/2)] left-[calc(50%-var(--size)/2)]`,
            `[transform-origin:calc(50%-400px)]`,
            `animate-second`,
            `opacity-100`
          )}
        ></div>
        <div
          className={cn(
            `absolute [background:radial-gradient(circle_at_center,_rgba(var(--third-color),_0.8)_0,_rgba(var(--third-color),_0)_50%)_no-repeat]`,
            `[mix-blend-mode:var(--blending-value)] w-[var(--size)] h-[var(--size)] top-[calc(50%-var(--size)/2)] left-[calc(50%-var(--size)/2)]`,
            `[transform-origin:calc(50%+400px)]`,
            `animate-third`,
            `opacity-100`
          )}
        ></div>
        <div
          className={cn(
            `absolute [background:radial-gradient(circle_at_center,_rgba(var(--fourth-color),_0.8)_0,_rgba(var(--fourth-color),_0)_50%)_no-repeat]`,
            `[mix-blend-mode:var(--blending-value)] w-[var(--size)] h-[var(--size)] top-[calc(50%-var(--size)/2)] left-[calc(50%-var(--size)/2)]`,
            `[transform-origin:calc(50%-200px)]`,
            `animate-fourth`,
            `opacity-70`
          )}
        ></div>
        <div
          className={cn(
            `absolute [background:radial-gradient(circle_at_center,_rgba(var(--fifth-color),_0.8)_0,_rgba(var(--fifth-color),_0)_50%)_no-repeat]`,
            `[mix-blend-mode:var(--blending-value)] w-[var(--size)] h-[var(--size)] top-[calc(50%-var(--size)/2)] left-[calc(50%-var(--size)/2)]`,
            `[transform-origin:calc(50%-800px)_calc(50%+800px)]`,
            `animate-fifth`,
            `opacity-100`
          )}
        ></div>

        {/* Top area gradients */}
        <div
          className={cn(
            `absolute [background:radial-gradient(circle_at_center,_rgba(var(--first-color),_0.6)_0,_rgba(var(--first-color),_0)_50%)_no-repeat]`,
            `[mix-blend-mode:var(--blending-value)] w-[60%] h-[60%] top-[10%] left-[20%]`,
            `[transform-origin:center_center]`,
            `animate-second`,
            `opacity-80`
          )}
        ></div>
        <div
          className={cn(
            `absolute [background:radial-gradient(circle_at_center,_rgba(var(--second-color),_0.7)_0,_rgba(var(--second-color),_0)_50%)_no-repeat]`,
            `[mix-blend-mode:var(--blending-value)] w-[70%] h-[70%] top-[5%] right-[10%]`,
            `[transform-origin:calc(50%+300px)]`,
            `animate-third`,
            `opacity-90`
          )}
        ></div>
        <div
          className={cn(
            `absolute [background:radial-gradient(circle_at_center,_rgba(var(--third-color),_0.5)_0,_rgba(var(--third-color),_0)_50%)_no-repeat]`,
            `[mix-blend-mode:var(--blending-value)] w-[50%] h-[50%] top-[15%] left-[10%]`,
            `[transform-origin:calc(50%-300px)]`,
            `animate-fourth`,
            `opacity-75`
          )}
        ></div>

        {/* Bottom area gradients */}
        <div
          className={cn(
            `absolute [background:radial-gradient(circle_at_center,_rgba(var(--fourth-color),_0.6)_0,_rgba(var(--fourth-color),_0)_50%)_no-repeat]`,
            `[mix-blend-mode:var(--blending-value)] w-[65%] h-[65%] bottom-[10%] left-[15%]`,
            `[transform-origin:calc(50%-200px)]`,
            `animate-first`,
            `opacity-85`
          )}
        ></div>
        <div
          className={cn(
            `absolute [background:radial-gradient(circle_at_center,_rgba(var(--fifth-color),_0.7)_0,_rgba(var(--fifth-color),_0)_50%)_no-repeat]`,
            `[mix-blend-mode:var(--blending-value)] w-[75%] h-[75%] bottom-[5%] right-[20%]`,
            `[transform-origin:calc(50%+500px)]`,
            `animate-fifth`,
            `opacity-90`
          )}
        ></div>
        <div
          className={cn(
            `absolute [background:radial-gradient(circle_at_center,_rgba(var(--first-color),_0.5)_0,_rgba(var(--first-color),_0)_50%)_no-repeat]`,
            `[mix-blend-mode:var(--blending-value)] w-[55%] h-[55%] bottom-[15%] right-[5%]`,
            `[transform-origin:calc(50%+200px)]`,
            `animate-second`,
            `opacity-70`
          )}
        ></div>

        {/* Left and right side gradients (hidden on small screens to avoid edge-only visuals) */}
        <div
          className={cn(
            `hidden sm:block absolute [background:radial-gradient(circle_at_center,_rgba(var(--second-color),_0.5)_0,_rgba(var(--second-color),_0)_50%)_no-repeat]`,
            `[mix-blend-mode:var(--blending-value)] w-[60%] h-[80%] top-[20%] left-[5%]`,
            `[transform-origin:calc(50%-600px)]`,
            `animate-third`,
            `opacity-75`
          )}
        ></div>
        <div
          className={cn(
            `hidden sm:block absolute [background:radial-gradient(circle_at_center,_rgba(var(--third-color),_0.6)_0,_rgba(var(--third-color),_0)_50%)_no-repeat]`,
            `[mix-blend-mode:var(--blending-value)] w-[60%] h-[80%] top-[25%] right-[5%]`,
            `[transform-origin:calc(50%+600px)]`,
            `animate-fourth`,
            `opacity-80`
          )}
        ></div>

        {/* Additional floating gradients */}
        <div
          className={cn(
            `absolute [background:radial-gradient(circle_at_center,_rgba(var(--fourth-color),_0.4)_0,_rgba(var(--fourth-color),_0)_50%)_no-repeat]`,
            `[mix-blend-mode:var(--blending-value)] w-[40%] h-[40%] top-[30%] left-[30%]`,
            `[transform-origin:calc(50%-100px)]`,
            `animate-fifth`,
            `opacity-65`
          )}
        ></div>
        <div
          className={cn(
            `absolute [background:radial-gradient(circle_at_center,_rgba(var(--fifth-color),_0.5)_0,_rgba(var(--fifth-color),_0)_50%)_no-repeat]`,
            `[mix-blend-mode:var(--blending-value)] w-[45%] h-[45%] top-[40%] right-[25%]`,
            `[transform-origin:calc(50%+100px)]`,
            `animate-first`,
            `opacity-70`
          )}
        ></div>

        {interactive && (
          <div
            ref={interactiveRef}
            aria-hidden="true"
            className={cn(
              `absolute pointer-events-none [background:radial-gradient(circle_at_center,_rgba(var(--pointer-color),_0.8)_0,_rgba(var(--pointer-color),_0)_50%)_no-repeat]`,
              `[mix-blend-mode:var(--blending-value)] w-full h-full -top-1/2 -left-1/2`,
              `opacity-70`
            )}
          />
        )}
      </div>
    </div>
  );
};

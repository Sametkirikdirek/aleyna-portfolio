import { useEffect, useRef } from "react";
import lottie from "lottie-web/build/player/lottie_light";

export default function LottieAnimation({ animationData, className = "" }) {
  const containerRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current || !animationData) return;

    const instance = lottie.loadAnimation({
      container: containerRef.current,
      renderer: "svg",
      loop: true,
      autoplay: true,
      animationData: animationData,
    });

    return () => {
      instance.destroy();
    };
  }, [animationData]);

  return <div ref={containerRef} className={className} />;
}

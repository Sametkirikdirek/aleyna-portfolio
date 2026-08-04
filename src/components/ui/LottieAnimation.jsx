import { DotLottieReact } from "@lottiefiles/dotlottie-react";

export default function LottieAnimation({
  src = "https://lottie.host/9fbe4ca7-fc55-437b-991f-895ef78a3b83/qO83AZAFbd.lottie",
  className = "",
}) {
  return (
    <DotLottieReact
      src={src}
      loop
      autoplay
      className={className}
    />
  );
}

type SingHubMarkProps = {
  className?: string;
};

export function SingHubMark({ className = "" }: SingHubMarkProps) {
  return (
    <img
      src="/images/singhub-mark.png"
      alt="SingHUB"
      className={`object-contain ${className}`}
    />
  );
}

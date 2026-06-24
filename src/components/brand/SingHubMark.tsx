type SingHubMarkProps = {
  className?: string;
};

export function SingHubMark({ className = "" }: SingHubMarkProps) {
  return (
    <img
      src="/images/brand/singhub-mark.svg"
      alt="SingHUB"
      className={`object-contain ${className}`}
    />
  );
}

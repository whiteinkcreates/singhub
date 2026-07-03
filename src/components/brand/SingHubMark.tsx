import Image from "next/image";

type SingHubMarkProps = {
  className?: string;
};

export function SingHubMark({ className = "" }: SingHubMarkProps) {
  return (
    <Image
      src="/images/singhub-mark.png"
      alt="SingHUB"
      width={420}
      height={160}
      className={`object-contain ${className}`}
    />
  );
}

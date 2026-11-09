import Image from "next/image";
import Link from "next/link";

export function Logo() {
  return (
    <Link className="logo" href="/" aria-label="RPM Rent — на главную">
      <Image
        className="logo-image logo-image-dark"
        src="/images/brand/rpm-logo-dark.png"
        alt="RPM Rent"
        width={1600}
        height={652}
        unoptimized
      />
      <Image
        className="logo-image logo-image-light"
        src="/images/brand/rpm-logo-light.png"
        alt="RPM Rent"
        width={1600}
        height={652}
        unoptimized
      />
    </Link>
  );
}

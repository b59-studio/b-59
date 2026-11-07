import Image from "next/image";

/** One captured screen of a product, at its intrinsic pixel size. */
export type Shot = { src: string; width: number; height: number; alt: string };

/**
 * A desktop screen in a plain browser frame, with the address the reader would
 * type shown in the bar. The frame is the screenshot's edge, not a container:
 * a white page captured on a white page has no boundary without one.
 */
export function BrowserShot({ shot, address, priority }: { shot: Shot; address: string; priority?: boolean }) {
  return (
    <figure className="product-browser">
      <div className="product-browser-bar" aria-hidden="true">
        <span className="product-browser-dots">
          <span />
          <span />
          <span />
        </span>
        <span className="product-browser-address">{address}</span>
      </div>
      <Image
        src={shot.src}
        alt={shot.alt}
        width={shot.width}
        height={shot.height}
        sizes="(min-width: 1024px) 44rem, 100vw"
        priority={priority}
      />
    </figure>
  );
}

/** The same product on a phone, cropped to the first screen a visitor sees. */
export function PhoneShot({ shot, className = "" }: { shot: Shot; className?: string }) {
  return (
    <div className={`product-phone ${className}`}>
      <Image src={shot.src} alt={shot.alt} width={shot.width} height={shot.height} sizes="12rem" />
    </div>
  );
}

/** Desktop and phone together: the browser at full width, the phone overlapping its far corner. */
export function DeviceStage({
  desktop,
  phone,
  address,
  priority,
}: {
  desktop: Shot;
  phone: Shot;
  address: string;
  priority?: boolean;
}) {
  return (
    <div className="product-stage">
      <BrowserShot shot={desktop} address={address} priority={priority} />
      <PhoneShot shot={phone} className="product-stage-phone" />
    </div>
  );
}

/**
 * A screen with a light and a dark capture. Both are in the markup and the
 * site's theme class picks one, so the picture follows the toggle rather than
 * only the device setting.
 */
export function ThemedShot({ light, dark }: { light: Shot; dark: Shot }) {
  return (
    <figure className="product-figure">
      <Image
        src={light.src}
        alt={light.alt}
        width={light.width}
        height={light.height}
        sizes="(min-width: 1024px) 36rem, 100vw"
        className="product-theme-light"
      />
      <Image
        src={dark.src}
        alt={dark.alt}
        width={dark.width}
        height={dark.height}
        sizes="(min-width: 1024px) 36rem, 100vw"
        className="product-theme-dark"
      />
    </figure>
  );
}

/** A single framed screen or illustration beside a block of text. */
export function FigureShot({ shot }: { shot: Shot }) {
  return (
    <figure className="product-figure">
      <Image src={shot.src} alt={shot.alt} width={shot.width} height={shot.height} sizes="(min-width: 1024px) 36rem, 100vw" />
    </figure>
  );
}

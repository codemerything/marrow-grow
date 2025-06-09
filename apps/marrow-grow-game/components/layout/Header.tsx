import Image from "next/image"

export default function Header() {
  return (
    <header className="absolute top-4 left-4 z-10">
      <Image src="/images/mglogo.png" alt="Marrow Grow Logo" width={80} height={80} className="drop-shadow-lg" />
    </header>
  )
}

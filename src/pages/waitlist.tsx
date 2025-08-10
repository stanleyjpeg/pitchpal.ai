import dynamic from "next/dynamic";
const WaitlistPage = dynamic(() => import("../components/WaitlistPage"), { ssr: false });

export default function Waitlist() {
  return <WaitlistPage />;
}

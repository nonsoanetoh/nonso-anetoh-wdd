import Navigation from "../navigation";

export default function Wrapper({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navigation />
      {children}
    </>
  );
}

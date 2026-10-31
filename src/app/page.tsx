import PagePlaceholder from "@/components/PagePlaceholder";
import StoreCheck from "@/components/StoreCheck";

export default function Home() {
  return (
    <PagePlaceholder
      title="Turn connections into outcomes"
      subtitle="Pick a startup to log in, earn XP by completing cross-border quests."
      phase={2}
    >
      <StoreCheck />
    </PagePlaceholder>
  );
}

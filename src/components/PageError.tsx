import { IconWifiOff } from "@tabler/icons-react";
import AppShell from "@/components/AppShell";

interface Props {
  inShell?: boolean;
}

const ErrorBody = () => (
  <div className="min-h-[60vh] flex items-center justify-center px-4 py-16">
    <div className="bg-white rounded-2xl border border-[#D0D7E2] p-8 md:p-10 max-w-md text-center">
      <div className="mx-auto w-14 h-14 rounded-full bg-[#FEF6E8] flex items-center justify-center mb-4">
        <IconWifiOff size={28} stroke={1.75} className="text-[#854F0B]" aria-hidden="true" />
      </div>
      <h1 className="font-bold text-[#1F3864] text-xl md:text-2xl mb-2">
        Something went wrong
      </h1>
      <p className="text-[#5F6B7D] text-sm leading-relaxed mb-6">
        We could not load your data. Please refresh the page or try again in a moment.
      </p>
      <button
        onClick={() => window.location.reload()}
        className="inline-flex items-center justify-center min-h-11 px-6 bg-[#1F3864] hover:bg-[#2A4A80] text-white font-semibold rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F5A623]"
      >
        Refresh
      </button>
    </div>
  </div>
);

const PageError = ({ inShell = true }: Props) =>
  inShell ? (
    <AppShell>
      <div className="bg-[#F4F6FB]">
        <ErrorBody />
      </div>
    </AppShell>
  ) : (
    <ErrorBody />
  );

export default PageError;

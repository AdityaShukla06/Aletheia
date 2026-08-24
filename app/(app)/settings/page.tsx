import SettingsFieldRow from "@/components/SettingsFieldRow";
import ProviderSelector from "@/components/ProviderSelector";
import { settingsData } from "@/lib/mock-data";

export default function SettingsPage() {
  const { account, providers, defaultProviderId, providerNote, apiKeys, dangerZone } =
    settingsData;

  return (
    <div className="flex w-full flex-col items-start gap-6">
      <h1 className="font-display text-[28px] font-semibold text-primary">Settings</h1>

      <div className="flex w-full shrink-0 flex-col items-start gap-3">
        <p className="font-ui text-[15px] font-semibold text-primary">Account</p>
        <div className="flex w-full flex-col items-start gap-px">
          {account.map((field) => (
            <SettingsFieldRow key={field.label} label={field.label} value={field.value} />
          ))}
        </div>
      </div>

      <div className="flex w-full shrink-0 flex-col items-start gap-3">
        <div className="flex w-full flex-col items-start gap-1">
          <p className="font-ui text-[15px] font-semibold text-primary">AI provider</p>
          <p className="font-ui text-xs text-muted">{providerNote}</p>
        </div>
        <ProviderSelector providers={providers} defaultProviderId={defaultProviderId} />
      </div>

      <div className="flex w-full shrink-0 flex-col items-start gap-3">
        <p className="font-ui text-[15px] font-semibold text-primary">API keys</p>
        <div className="flex w-full flex-col items-start gap-px">
          {apiKeys.map((field) => (
            <SettingsFieldRow key={field.label} label={field.label} value={field.value} />
          ))}
        </div>
      </div>

      <div className="flex w-full shrink-0 flex-col items-start gap-3">
        <p className="font-ui text-[15px] font-semibold text-primary">Danger zone</p>
        <div className="flex w-full items-center gap-4 rounded-md border border-oxblood px-[18px] py-4">
          <p className="min-w-px flex-1 font-ui text-[13px] text-secondary">{dangerZone.label}</p>
          <button
            type="button"
            className="shrink-0 font-ui text-xs font-semibold whitespace-nowrap text-oxblood-bright"
          >
            {dangerZone.actionLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

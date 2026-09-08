import { Icon } from "../../../components/shared/Icon";
import type { useOnboardingForm } from "../hooks/useOnboardingForm";

type Props = { form: ReturnType<typeof useOnboardingForm> };

export function SaveDraftModal({ form }: Props) {
  const {
    showSaveModal,
    setShowSaveModal,
    draftSaved,
    saveEmail,
    setSaveEmail,
    handleSaveDraft,
    isSaving,
  } = form;

  if (!showSaveModal) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6">
        {draftSaved ? (
          <div className="text-center py-6">
            <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
              <Icon name="check_circle" className="text-3xl text-green-600" />
            </div>
            <h3 className="font-display text-xl font-bold mb-2">
              Draft Saved!
            </h3>
            <p className="text-sm text-secondary-app">
              We've sent a resume link to <strong>{saveEmail}</strong>. Check
              your inbox to continue where you left off.
            </p>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-display text-lg font-bold">
                Save Your Progress
              </h3>
              <button
                onClick={() => setShowSaveModal(false)}
                className="text-gray-400 hover:text-on-surface"
              >
                <Icon name="close" className="text-xl" />
              </button>
            </div>
            <p className="text-sm text-secondary-app mb-5">
              Enter your email and we'll send you a link to resume your
              application anytime.
            </p>
            <label className="block text-sm font-semibold mb-2">
              Email Address
            </label>
            <input
              type="email"
              value={saveEmail}
              onChange={(e) => setSaveEmail(e.target.value)}
              placeholder="your@email.com"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white outline-none focus:border-brand-kinetic focus:ring-2 focus:ring-brand-kinetic/10 transition-all text-sm mb-5"
            />
            <div className="flex gap-3">
              <button
                onClick={() => setShowSaveModal(false)}
                className="flex-1 px-4 py-3 rounded-xl border border-gray-200 text-sm font-semibold text-secondary-app hover:text-on-surface transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveDraft}
                disabled={!saveEmail.includes("@") || isSaving}
                className="flex-1 px-4 py-3 rounded-xl bg-brand-kinetic text-white text-sm font-semibold hover:bg-brand-kinetic/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSaving ? "Saving..." : "Send Link"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

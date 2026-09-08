import { Icon } from "../../../components/shared/Icon";
import { TimePicker } from "../../../components/shared/TimePicker";
import type { useOnboardingForm } from "../hooks/useOnboardingForm";

type Props = { form: ReturnType<typeof useOnboardingForm> };

export function DayTimeSlotsEditor({ form }: Props) {
  const {
    copy, selectedDays, activeTimingDay, setActiveTimingDay, dayTimeSlots,
    addTimeSlot, updateTimeSlot, removeTimeSlot,
  } = form;
  return (
    <div className="border-t border-gray-100 pt-5">
      <div className="flex items-center justify-between mb-3">
        <label className="text-sm font-semibold">Opening &amp; Closing Hours</label>
        <button
          type="button"
          onClick={() => addTimeSlot(activeTimingDay)}
          className="flex items-center gap-1 text-xs font-semibold text-brand-kinetic hover:text-brand-kinetic/80 transition-colors"
        >
          <Icon name="add" className="text-base" />
          Add Slot
        </button>
      </div>
      <p className="text-xs text-secondary-app mb-3">{copy.operatingHelp}</p>
      <div className="flex flex-wrap gap-2 mb-4">
        {selectedDays.map((day) => (
          <button
            key={day}
            type="button"
            onClick={() => setActiveTimingDay(day)}
            className={`px-4 py-2 rounded-lg text-xs font-semibold border transition-all ${
              activeTimingDay === day
                ? "bg-brand-kinetic text-white border-brand-kinetic"
                : "bg-white text-secondary-app border-gray-200 hover:border-brand-kinetic/30"
            }`}
          >
            {day}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {(dayTimeSlots[activeTimingDay] || []).map((slot, i) => (
          <div key={i} className="flex items-end gap-3">
            <TimePicker
              label="Opening Time"
              value={slot.open}
              onChange={(v) => updateTimeSlot(activeTimingDay, i, "open", v)}
            />
            <span className="text-sm text-secondary-app pb-2.5">—</span>
            <TimePicker
              label="Closing Time"
              value={slot.close}
              onChange={(v) => updateTimeSlot(activeTimingDay, i, "close", v)}
            />
            {(dayTimeSlots[activeTimingDay] || []).length > 1 && (
              <button
                type="button"
                onClick={() => removeTimeSlot(activeTimingDay, i)}
                className="pb-2.5 text-gray-400 hover:text-red-500 transition-colors"
              >
                <Icon name="remove_circle" className="text-lg" />
              </button>
            )}
            <div className="pb-2.5">
              <span className="text-[10px] text-secondary-app/60 font-medium">
                Slot {i + 1}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

import { Icon } from "../../../components/shared/Icon";
import { DAYS } from "../constants";
import { DayTimeSlotsEditor } from "./DayTimeSlotsEditor";
import type { useOnboardingForm } from "../hooks/useOnboardingForm";

type Props = { form: ReturnType<typeof useOnboardingForm> };

export function StepTimings({ form }: Props) {
  const { selectedDays, setSelectedDays, setActiveTimingDay, toggleDay } = form;
  return (
    <section className="mb-10">
      <div className="flex items-center gap-2 mb-6">
        <div className="w-8 h-8 rounded-lg bg-brand-kinetic/10 flex items-center justify-center">
          <Icon name="schedule" className="text-base text-brand-kinetic" />
        </div>
        <h2 className="font-display text-lg font-bold">Operational Timings</h2>
      </div>

      <div className="space-y-5 bg-white rounded-2xl border border-gray-200 p-6">
        {/* Days of Operation */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <label className="text-sm font-semibold">
              Days of Operation <span className="text-brand-kinetic">*</span>
            </label>
            <button
              type="button"
              onClick={() => {
                const nextDays = selectedDays.length === 7 ? [] : [...DAYS];
                setSelectedDays(nextDays);
                setActiveTimingDay(nextDays[0] || "Monday");
              }}
              className="text-xs font-semibold text-brand-kinetic hover:text-brand-kinetic/80 transition-colors"
            >
              {selectedDays.length === 7 ? "Deselect All" : "Select All"}
            </button>
          </div>
          <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
            {DAYS.map((day) => (
              <button
                key={day}
                type="button"
                onClick={() => {
                  toggleDay(day);
                  setActiveTimingDay(day);
                }}
                className={`py-2.5 rounded-lg text-xs font-semibold border transition-all ${
                  selectedDays.includes(day)
                    ? "bg-brand-kinetic text-white border-brand-kinetic"
                    : "bg-white text-secondary-app border-gray-200 hover:border-brand-kinetic/30"
                }`}
              >
                {day.slice(0, 3)}
              </button>
            ))}
          </div>
        </div>

        {/* Time Slots */}
        <DayTimeSlotsEditor form={form} />
      </div>
    </section>
  );
}

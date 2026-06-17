import { STEP_LABELS, WizardStep } from '@/types/wizard'

type StepIndicatorProps = {
  currentStep: WizardStep
  totalSteps: number
}

export function StepIndicator({ currentStep, totalSteps }: StepIndicatorProps) {
  return (
    <div className="mb-8">
      {/* Texto del paso */}
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-medium text-blue-600 uppercase tracking-wide">
          Paso {currentStep} de {totalSteps}
        </span>
        <span className="text-xs text-gray-400">
          {STEP_LABELS[currentStep]}
        </span>
      </div>

      {/* Barra de progreso */}
      <div className="flex gap-1.5">
        {Array.from({ length: totalSteps }, (_, i) => i + 1).map((step) => (
          <div
            key={step}
            className={`h-1.5 flex-1 rounded-full transition-colors duration-300 ${step <= currentStep ? 'bg-blue-600' : 'bg-gray-200'
              }`}
          />
        ))}
      </div>
    </div>
  )
}
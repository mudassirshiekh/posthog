import { LemonCheckbox } from '@posthog/lemon-ui'
import { useActions, useValues } from 'kea'
import { RollingDateRangeFilter } from 'lib/components/DateFilter/RollingDateRangeFilter'
import { insightLogic } from 'scenes/insights/insightLogic'
import { insightVizDataLogic } from 'scenes/insights/insightVizDataLogic'

export function CompareFilter(): JSX.Element | null {
    const { insightProps, canEditInsight } = useValues(insightLogic)

    const { compare, supportsCompare } = useValues(insightVizDataLogic(insightProps))
    const { updateInsightFilter } = useActions(insightVizDataLogic(insightProps))

    const disabled: boolean = !canEditInsight || !supportsCompare

    // Hide compare filter control when disabled to avoid states where control is "disabled but checked"
    if (disabled) {
        return null
    }

    const label = (
        <span className="font-normal">
            Compare to{' '}
            <RollingDateRangeFilter
                dateRangeFilterLabel=""
                dateRangeFilterSuffixLabel="before"
                allowPeriod={true}
                onChange={(compareTo) => {
                    console.log(compareTo)
                    updateInsightFilter({ compareTo })
                }}
            />
        </span>
    )

    return (
        <LemonCheckbox
            onChange={(compare: boolean) => {
                updateInsightFilter({ compare })
            }}
            checked={!!compare}
            label={label}
            bordered
            size="small"
        />
    )
}

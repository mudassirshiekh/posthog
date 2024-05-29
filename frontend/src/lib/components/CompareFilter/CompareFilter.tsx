import { LemonSelect } from '@posthog/lemon-ui'
import { useActions, useValues } from 'kea'
import { RollingDateRangeFilter } from 'lib/components/DateFilter/RollingDateRangeFilter'
import { dateFromToText } from 'lib/utils'
import { useState } from 'react'
import { insightLogic } from 'scenes/insights/insightLogic'
import { insightVizDataLogic } from 'scenes/insights/insightVizDataLogic'

export function CompareFilter(): JSX.Element | null {
    const { insightProps, canEditInsight } = useValues(insightLogic)

    const { compare, supportsCompare, compareTo } = useValues(insightVizDataLogic(insightProps))
    const { updateInsightFilter } = useActions(insightVizDataLogic(insightProps))

    // This keeps the state of the rolling date range filter, even when different drop down options are selected
    // The default value for this is one month
    const [compareToUi, setCompareToUi] = useState<string>(compareTo || '-1m')

    const disabled: boolean = !canEditInsight || !supportsCompare

    // Hide compare filter control when disabled to avoid states where control is "disabled but checked"
    if (disabled) {
        return null
    }

    if (!!compareTo && compareToUi != compareTo) {
        setCompareToUi(compareTo)
    }

    const options = [
        {
            value: 'none',
            label: 'No comparison between periods',
        },
        {
            value: 'previous',
            label: 'Compare to previous period',
        },
        {
            value: 'compareTo',
            label: (
                <div onClick={() => updateInsightFilter({ compare: true, compareTo: compareToUi })}>
                    <RollingDateRangeFilter
                        isButton={false}
                        dateRangeFilterLabel="Compare to "
                        dateRangeFilterSuffixLabel=" earlier"
                        dateFrom={compareToUi}
                        selected={!!compare && !!compareTo}
                        inUse={true}
                        onChange={(compareTo) => {
                            updateInsightFilter({ compare: true, compareTo })
                        }}
                    />
                </div>
            ),
        },
    ]

    let value = 'none'
    if (compare) {
        if (compareTo) {
            value = 'compareTo'
        } else {
            value = 'previous'
        }
    }

    return (
        <LemonSelect
            renderButtonContent={(leaf) =>
                (leaf?.value == 'compareTo' ? `Compare to ${dateFromToText(compareToUi)} earlier` : leaf?.label) ||
                'Compare to'
            }
            value={value}
            dropdownMatchSelectWidth={false}
            onChange={(value) => {
                if (value == 'none') {
                    updateInsightFilter({ compare: false, compareTo: undefined })
                } else if (value == 'previous') {
                    updateInsightFilter({ compare: true, compareTo: undefined })
                }
            }}
            data-attr="compare-filter"
            options={options}
            size="small"
        />
    )

    /*
    const label = (
        <span className="font-normal">
            <RollingDateRangeFilter
                isButton={false}
                dateRangeFilterLabel="Compare to "
                dateRangeFilterSuffixLabel=" earlier"
                allowPeriod={true}
                dateFrom={compareTo}
                inUse={true}
                onChange={(compareTo) => {
                    updateInsightFilter({ compare: true, compareTo })
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
    )*/
}

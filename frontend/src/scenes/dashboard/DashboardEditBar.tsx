import { IconCalendar } from '@posthog/icons'
import { LemonButton, LemonDropdown, PopoverReferenceContext } from '@posthog/lemon-ui'
import clsx from 'clsx'
import { useActions, useValues } from 'kea'
import { DateFilter } from 'lib/components/DateFilter/DateFilter'
import { PropertyFilters } from 'lib/components/PropertyFilters/PropertyFilters'
import { TaxonomicFilterGroupType } from 'lib/components/TaxonomicFilter/types'
import { dashboardLogic } from 'scenes/dashboard/dashboardLogic'

import { groupsModel } from '~/models/groupsModel'

export function DashboardEditBar(): JSX.Element {
    const { dashboard, canEditDashboard, editMode, temporaryFilters, stale } = useValues(dashboardLogic)
    const { setDates, setProperties, cancelTemporary, applyTemporary, setEditMode } = useActions(dashboardLogic)
    const { groupsTaxonomicTypes } = useValues(groupsModel)

    const isEditing = editMode && canEditDashboard

    return (
        <LemonDropdown
            visible={isEditing}
            overlay={
                <div className="flex items-center gap-2 p-1">
                    <LemonButton onClick={cancelTemporary} type="secondary" size="small">
                        Cancel changes
                    </LemonButton>
                    <LemonButton
                        onClick={applyTemporary}
                        type="primary"
                        size="small"
                        disabledReason={!stale ? 'No changes to apply' : undefined}
                    >
                        Apply and save
                    </LemonButton>
                </div>
            }
            className="ml-2"
            placement="right"
            fallbackPlacements={['bottom-start']}
            showArrow
        >
            <div
                className={clsx(
                    'flex gap-2 items-center justify-between flex-wrap relative',
                    isEditing &&
                        "before:content-[''] before:absolute before:-inset-2 before:p-2 before:rounded before:border before:border-dashed"
                )}
            >
                <PopoverReferenceContext.Provider value={null}>
                    <DateFilter
                        showCustom
                        dateFrom={temporaryFilters.date_from}
                        dateTo={temporaryFilters.date_to}
                        onChange={setDates}
                        disabled={!canEditDashboard}
                        makeLabel={(key) => (
                            <>
                                <IconCalendar />
                                <span className="hide-when-small"> {key}</span>
                            </>
                        )}
                    />
                    <PropertyFilters
                        disabled={!isEditing}
                        onChange={setProperties}
                        pageKey={'dashboard_' + dashboard?.id}
                        propertyFilters={temporaryFilters.properties}
                        taxonomicGroupTypes={[
                            TaxonomicFilterGroupType.EventProperties,
                            TaxonomicFilterGroupType.PersonProperties,
                            TaxonomicFilterGroupType.EventFeatureFlags,
                            ...groupsTaxonomicTypes,
                            TaxonomicFilterGroupType.Cohorts,
                            TaxonomicFilterGroupType.Elements,
                            TaxonomicFilterGroupType.HogQLExpression,
                        ]}
                    />
                    {canEditDashboard && !editMode && (
                        <LemonButton type="secondary" size="small" onClick={() => setEditMode(true)}>
                            Edit filters
                        </LemonButton>
                    )}
                </PopoverReferenceContext.Provider>
            </div>
        </LemonDropdown>
    )
}

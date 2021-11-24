import { Meta } from '@storybook/react'
import { createMemoryHistory } from 'history'
import { Provider } from 'kea'
import { ACTIONS_LINE_GRAPH_LINEAR } from 'lib/constants'

import { rest } from 'msw'
import React from 'react'
import { initKea } from '~/initKea'
import { worker } from '~/mocks/browser'
import { Insights } from '../Insights'

export default {
    title: 'PostHog/Scenes/Insights/Retention',
} as Meta

export const RetentionTable = (): JSX.Element => {
    worker.use(
        rest.get('/api/projects/:projectId/insights/retention/', (_, res, ctx) =>
            res(ctx.json(sampleRetentionResponse))
        ),
        rest.get('/api/person/retention', (_, res, ctx) => res(ctx.json(sampleRetentionPeopleResponse))),
        rest.post('/api/projects/:projectId/cohorts/', (_, res, ctx) => res(ctx.json({ id: 1 })))
    )

    const history = createMemoryHistory({
        initialEntries: [
            `/insights?${new URLSearchParams({
                insight: 'RETENTION',
                filter_test_accounts: 'false',
                target_event: JSON.stringify([{ id: '$pageview', name: '$pageview', type: 'events', order: 0 }]),
                returning_event: JSON.stringify([{ id: '$pageview', name: '$pageview', type: 'events', order: 0 }]),
                actions: JSON.stringify([]),
                new_entity: JSON.stringify([]),
                date_from: '-14d',
                exclusions: JSON.stringify([]),
            })}#fromItem=`,
        ],
    })

    // @ts-ignore
    history.pushState = history.push
    // @ts-ignore
    history.replaceState = history.replace

    // This is data that is rendered into the html. I tried not to use this and just
    // use the endoints, but it appears to be difficult to set this up to not have
    // race conditions.
    // @ts-ignore
    window.POSTHOG_APP_CONTEXT = sampleContextData

    initKea({ routerHistory: history, routerLocation: history.location })

    return (
        <Provider>
            <Insights />
        </Provider>
    )
}

export const RetentionChart = (): JSX.Element => {
    worker.use(
        rest.get('/api/projects/:projectId/insights/retention/', (_, res, ctx) =>
            res(ctx.json(sampleRetentionChartResponse))
        ),
        rest.get('/api/person/retention', (_, res, ctx) => res(ctx.json(sampleRetentionPeopleResponse))),
        rest.post('/api/projects/:projectId/cohorts/', (_, res, ctx) => res(ctx.json({ id: 1 })))
    )

    const history = createMemoryHistory({
        initialEntries: [
            `/insights?${new URLSearchParams({
                insight: 'RETENTION',
                filter_test_accounts: 'false',
                target_event: JSON.stringify([{ id: '$pageview', name: '$pageview', type: 'events', order: 0 }]),
                returning_event: JSON.stringify([{ id: '$pageview', name: '$pageview', type: 'events', order: 0 }]),
                actions: JSON.stringify([]),
                new_entity: JSON.stringify([]),
                date_from: '-14d',
                exclusions: JSON.stringify([]),
                display: ACTIONS_LINE_GRAPH_LINEAR,
            })}#fromItem=`,
        ],
    })

    // @ts-ignore
    history.pushState = history.push
    // @ts-ignore
    history.replaceState = history.replace

    // This is data that is rendered into the html. I tried not to use this and just
    // use the endoints, but it appears to be difficult to set this up to not have
    // race conditions.
    // @ts-ignore
    window.POSTHOG_APP_CONTEXT = sampleContextData

    initKea({ routerHistory: history, routerLocation: history.location })

    return (
        <Provider>
            <Insights />
        </Provider>
    )
}

// This is data that is rendered into the html. I tried not to use this and just
// use the endoints, but it appears to be difficult to set this up to not have
// race conditions.
// NOTE: these are not complete according to type, but the minimum I could get away with
const sampleContextData = {
    current_team: {
        id: 2,
    },
    current_user: { organization: { available_features: ['correlation_analysis'] } },
    preflight: {
        is_clickhouse_enabled: true,
        instance_preferences: { disable_paid_fs: false },
    },
    default_event_name: '$pageview',
    persisted_feature_flags: ['correlation-analysis'],
}

const sampleRetentionChartResponse = {
    result: [
        {
            data: [100.0, 30, 10, 9, 8.4, 7.3, 7.43, 7.1, 6.9, 6.7, 6.66],
            labels: [
                'Day 0',
                'Day 1',
                'Day 2',
                'Day 3',
                'Day 4',
                'Day 5',
                'Day 6',
                'Day 7',
                'Day 8',
                'Day 9',
                'Day 10',
            ],
            count: 819,
            days: [
                '2021-11-14',
                '2021-11-15',
                '2021-11-16',
                '2021-11-17',
                '2021-11-18',
                '2021-11-19',
                '2021-11-20',
                '2021-11-21',
                '2021-11-22',
                '2021-11-23',
                '2021-11-24',
            ],
            people_urls: [
                'https://app.posthog.com/api/person/retention/?date_from=-11d&display=ActionsLineGraph&insight=RETENTION&period=Day&retention_type=retention_first_time&returning_entity=%7B%22id%22%3A+%22%24pageview%22%2C+%22type%22%3A+%22events%22%2C+%22order%22%3A+null%2C+%22name%22%3A+%22%24pageview%22%2C+%22custom_name%22%3A+null%2C+%22math%22%3A+null%2C+%22math_property%22%3A+null%2C+%22math_group_type_index%22%3A+null%2C+%22properties%22%3A+%5B%5D%7D&target_entity=%7B%22id%22%3A+%22%24pageview%22%2C+%22type%22%3A+%22events%22%2C+%22order%22%3A+null%2C+%22name%22%3A+%22%24pageview%22%2C+%22custom_name%22%3A+null%2C+%22math%22%3A+null%2C+%22math_property%22%3A+null%2C+%22math_group_type_index%22%3A+null%2C+%22properties%22%3A+%5B%5D%7D&total_intervals=11',
                'https://app.posthog.com/api/person/retention/?date_from=-11d&display=ActionsLineGraph&insight=RETENTION&period=Day&retention_type=retention_first_time&returning_entity=%7B%22id%22%3A+%22%24pageview%22%2C+%22type%22%3A+%22events%22%2C+%22order%22%3A+null%2C+%22name%22%3A+%22%24pageview%22%2C+%22custom_name%22%3A+null%2C+%22math%22%3A+null%2C+%22math_property%22%3A+null%2C+%22math_group_type_index%22%3A+null%2C+%22properties%22%3A+%5B%5D%7D&selected_interval=1&target_entity=%7B%22id%22%3A+%22%24pageview%22%2C+%22type%22%3A+%22events%22%2C+%22order%22%3A+null%2C+%22name%22%3A+%22%24pageview%22%2C+%22custom_name%22%3A+null%2C+%22math%22%3A+null%2C+%22math_property%22%3A+null%2C+%22math_group_type_index%22%3A+null%2C+%22properties%22%3A+%5B%5D%7D&total_intervals=11',
                'https://app.posthog.com/api/person/retention/?date_from=-11d&display=ActionsLineGraph&insight=RETENTION&period=Day&retention_type=retention_first_time&returning_entity=%7B%22id%22%3A+%22%24pageview%22%2C+%22type%22%3A+%22events%22%2C+%22order%22%3A+null%2C+%22name%22%3A+%22%24pageview%22%2C+%22custom_name%22%3A+null%2C+%22math%22%3A+null%2C+%22math_property%22%3A+null%2C+%22math_group_type_index%22%3A+null%2C+%22properties%22%3A+%5B%5D%7D&selected_interval=2&target_entity=%7B%22id%22%3A+%22%24pageview%22%2C+%22type%22%3A+%22events%22%2C+%22order%22%3A+null%2C+%22name%22%3A+%22%24pageview%22%2C+%22custom_name%22%3A+null%2C+%22math%22%3A+null%2C+%22math_property%22%3A+null%2C+%22math_group_type_index%22%3A+null%2C+%22properties%22%3A+%5B%5D%7D&total_intervals=11',
                'https://app.posthog.com/api/person/retention/?date_from=-11d&display=ActionsLineGraph&insight=RETENTION&period=Day&retention_type=retention_first_time&returning_entity=%7B%22id%22%3A+%22%24pageview%22%2C+%22type%22%3A+%22events%22%2C+%22order%22%3A+null%2C+%22name%22%3A+%22%24pageview%22%2C+%22custom_name%22%3A+null%2C+%22math%22%3A+null%2C+%22math_property%22%3A+null%2C+%22math_group_type_index%22%3A+null%2C+%22properties%22%3A+%5B%5D%7D&selected_interval=3&target_entity=%7B%22id%22%3A+%22%24pageview%22%2C+%22type%22%3A+%22events%22%2C+%22order%22%3A+null%2C+%22name%22%3A+%22%24pageview%22%2C+%22custom_name%22%3A+null%2C+%22math%22%3A+null%2C+%22math_property%22%3A+null%2C+%22math_group_type_index%22%3A+null%2C+%22properties%22%3A+%5B%5D%7D&total_intervals=11',
                'https://app.posthog.com/api/person/retention/?date_from=-11d&display=ActionsLineGraph&insight=RETENTION&period=Day&retention_type=retention_first_time&returning_entity=%7B%22id%22%3A+%22%24pageview%22%2C+%22type%22%3A+%22events%22%2C+%22order%22%3A+null%2C+%22name%22%3A+%22%24pageview%22%2C+%22custom_name%22%3A+null%2C+%22math%22%3A+null%2C+%22math_property%22%3A+null%2C+%22math_group_type_index%22%3A+null%2C+%22properties%22%3A+%5B%5D%7D&selected_interval=4&target_entity=%7B%22id%22%3A+%22%24pageview%22%2C+%22type%22%3A+%22events%22%2C+%22order%22%3A+null%2C+%22name%22%3A+%22%24pageview%22%2C+%22custom_name%22%3A+null%2C+%22math%22%3A+null%2C+%22math_property%22%3A+null%2C+%22math_group_type_index%22%3A+null%2C+%22properties%22%3A+%5B%5D%7D&total_intervals=11',
                'https://app.posthog.com/api/person/retention/?date_from=-11d&display=ActionsLineGraph&insight=RETENTION&period=Day&retention_type=retention_first_time&returning_entity=%7B%22id%22%3A+%22%24pageview%22%2C+%22type%22%3A+%22events%22%2C+%22order%22%3A+null%2C+%22name%22%3A+%22%24pageview%22%2C+%22custom_name%22%3A+null%2C+%22math%22%3A+null%2C+%22math_property%22%3A+null%2C+%22math_group_type_index%22%3A+null%2C+%22properties%22%3A+%5B%5D%7D&selected_interval=5&target_entity=%7B%22id%22%3A+%22%24pageview%22%2C+%22type%22%3A+%22events%22%2C+%22order%22%3A+null%2C+%22name%22%3A+%22%24pageview%22%2C+%22custom_name%22%3A+null%2C+%22math%22%3A+null%2C+%22math_property%22%3A+null%2C+%22math_group_type_index%22%3A+null%2C+%22properties%22%3A+%5B%5D%7D&total_intervals=11',
                'https://app.posthog.com/api/person/retention/?date_from=-11d&display=ActionsLineGraph&insight=RETENTION&period=Day&retention_type=retention_first_time&returning_entity=%7B%22id%22%3A+%22%24pageview%22%2C+%22type%22%3A+%22events%22%2C+%22order%22%3A+null%2C+%22name%22%3A+%22%24pageview%22%2C+%22custom_name%22%3A+null%2C+%22math%22%3A+null%2C+%22math_property%22%3A+null%2C+%22math_group_type_index%22%3A+null%2C+%22properties%22%3A+%5B%5D%7D&selected_interval=6&target_entity=%7B%22id%22%3A+%22%24pageview%22%2C+%22type%22%3A+%22events%22%2C+%22order%22%3A+null%2C+%22name%22%3A+%22%24pageview%22%2C+%22custom_name%22%3A+null%2C+%22math%22%3A+null%2C+%22math_property%22%3A+null%2C+%22math_group_type_index%22%3A+null%2C+%22properties%22%3A+%5B%5D%7D&total_intervals=11',
                'https://app.posthog.com/api/person/retention/?date_from=-11d&display=ActionsLineGraph&insight=RETENTION&period=Day&retention_type=retention_first_time&returning_entity=%7B%22id%22%3A+%22%24pageview%22%2C+%22type%22%3A+%22events%22%2C+%22order%22%3A+null%2C+%22name%22%3A+%22%24pageview%22%2C+%22custom_name%22%3A+null%2C+%22math%22%3A+null%2C+%22math_property%22%3A+null%2C+%22math_group_type_index%22%3A+null%2C+%22properties%22%3A+%5B%5D%7D&selected_interval=7&target_entity=%7B%22id%22%3A+%22%24pageview%22%2C+%22type%22%3A+%22events%22%2C+%22order%22%3A+null%2C+%22name%22%3A+%22%24pageview%22%2C+%22custom_name%22%3A+null%2C+%22math%22%3A+null%2C+%22math_property%22%3A+null%2C+%22math_group_type_index%22%3A+null%2C+%22properties%22%3A+%5B%5D%7D&total_intervals=11',
                'https://app.posthog.com/api/person/retention/?date_from=-11d&display=ActionsLineGraph&insight=RETENTION&period=Day&retention_type=retention_first_time&returning_entity=%7B%22id%22%3A+%22%24pageview%22%2C+%22type%22%3A+%22events%22%2C+%22order%22%3A+null%2C+%22name%22%3A+%22%24pageview%22%2C+%22custom_name%22%3A+null%2C+%22math%22%3A+null%2C+%22math_property%22%3A+null%2C+%22math_group_type_index%22%3A+null%2C+%22properties%22%3A+%5B%5D%7D&selected_interval=8&target_entity=%7B%22id%22%3A+%22%24pageview%22%2C+%22type%22%3A+%22events%22%2C+%22order%22%3A+null%2C+%22name%22%3A+%22%24pageview%22%2C+%22custom_name%22%3A+null%2C+%22math%22%3A+null%2C+%22math_property%22%3A+null%2C+%22math_group_type_index%22%3A+null%2C+%22properties%22%3A+%5B%5D%7D&total_intervals=11',
                'https://app.posthog.com/api/person/retention/?date_from=-11d&display=ActionsLineGraph&insight=RETENTION&period=Day&retention_type=retention_first_time&returning_entity=%7B%22id%22%3A+%22%24pageview%22%2C+%22type%22%3A+%22events%22%2C+%22order%22%3A+null%2C+%22name%22%3A+%22%24pageview%22%2C+%22custom_name%22%3A+null%2C+%22math%22%3A+null%2C+%22math_property%22%3A+null%2C+%22math_group_type_index%22%3A+null%2C+%22properties%22%3A+%5B%5D%7D&selected_interval=9&target_entity=%7B%22id%22%3A+%22%24pageview%22%2C+%22type%22%3A+%22events%22%2C+%22order%22%3A+null%2C+%22name%22%3A+%22%24pageview%22%2C+%22custom_name%22%3A+null%2C+%22math%22%3A+null%2C+%22math_property%22%3A+null%2C+%22math_group_type_index%22%3A+null%2C+%22properties%22%3A+%5B%5D%7D&total_intervals=11',
                'https://app.posthog.com/api/person/retention/?date_from=-11d&display=ActionsLineGraph&insight=RETENTION&period=Day&retention_type=retention_first_time&returning_entity=%7B%22id%22%3A+%22%24pageview%22%2C+%22type%22%3A+%22events%22%2C+%22order%22%3A+null%2C+%22name%22%3A+%22%24pageview%22%2C+%22custom_name%22%3A+null%2C+%22math%22%3A+null%2C+%22math_property%22%3A+null%2C+%22math_group_type_index%22%3A+null%2C+%22properties%22%3A+%5B%5D%7D&selected_interval=10&target_entity=%7B%22id%22%3A+%22%24pageview%22%2C+%22type%22%3A+%22events%22%2C+%22order%22%3A+null%2C+%22name%22%3A+%22%24pageview%22%2C+%22custom_name%22%3A+null%2C+%22math%22%3A+null%2C+%22math_property%22%3A+null%2C+%22math_group_type_index%22%3A+null%2C+%22properties%22%3A+%5B%5D%7D&total_intervals=11',
            ],
        },
    ],
    last_refresh: '2021-11-24T13:42:53.956519Z',
    is_cached: false,
}

const sampleRetentionResponse = {
    result: [
        {
            values: [
                { count: 1086, people: [] },
                { count: 13, people: [] },
                { count: 15, people: [] },
                { count: 12, people: [] },
                { count: 10, people: [] },
                { count: 5, people: [] },
                { count: 3, people: [] },
                { count: 5, people: [] },
                { count: 4, people: [] },
                { count: 3, people: [] },
                { count: 6, people: [] },
            ],
            label: 'Week 0',
            date: '2021-11-13T00:00:00Z',
        },
        {
            values: [
                { count: 819, people: [] },
                { count: 21, people: [] },
                { count: 13, people: [] },
                { count: 13, people: [] },
                { count: 11, people: [] },
                { count: 6, people: [] },
                { count: 6, people: [] },
                { count: 4, people: [] },
                { count: 3, people: [] },
                { count: 3, people: [] },
            ],
            label: 'Week 1',
            date: '2021-11-14T00:00:00Z',
        },
        {
            values: [
                { count: 1245, people: [] },
                { count: 56, people: [] },
                { count: 37, people: [] },
                { count: 28, people: [] },
                { count: 8, people: [] },
                { count: 7, people: [] },
                { count: 7, people: [] },
                { count: 13, people: [] },
                { count: 6, people: [] },
            ],
            label: 'Week 2',
            date: '2021-11-15T00:00:00Z',
        },
        {
            values: [
                { count: 1369, people: [] },
                { count: 67, people: [] },
                { count: 28, people: [] },
                { count: 30, people: [] },
                { count: 7, people: [] },
                { count: 7, people: [] },
                { count: 29, people: [] },
                { count: 10, people: [] },
            ],
            label: 'Week 3',
            date: '2021-11-16T00:00:00Z',
        },
        {
            values: [
                { count: 1559, people: [] },
                { count: 64, people: [] },
                { count: 37, people: [] },
                { count: 14, people: [] },
                { count: 12, people: [] },
                { count: 28, people: [] },
                { count: 14, people: [] },
            ],
            label: 'Week 4',
            date: '2021-11-17T00:00:00Z',
        },
        {
            values: [
                { count: 1912, people: [] },
                { count: 96, people: [] },
                { count: 26, people: [] },
                { count: 18, people: [] },
                { count: 34, people: [] },
                { count: 20, people: [] },
            ],
            label: 'Week 5',
            date: '2021-11-18T00:00:00Z',
        },
        {
            values: [
                { count: 1595, people: [] },
                { count: 49, people: [] },
                { count: 21, people: [] },
                { count: 56, people: [] },
                { count: 24, people: [] },
            ],
            label: 'Week 6',
            date: '2021-11-19T00:00:00Z',
        },
        {
            values: [
                { count: 1013, people: [] },
                { count: 21, people: [] },
                { count: 18, people: [] },
                { count: 12, people: [] },
            ],
            label: 'Week 7',
            date: '2021-11-20T00:00:00Z',
        },
        {
            values: [
                { count: 721, people: [] },
                { count: 33, people: [] },
                { count: 16, people: [] },
            ],
            label: 'Week 8',
            date: '2021-11-21T00:00:00Z',
        },
        {
            values: [
                { count: 1183, people: [] },
                { count: 36, people: [] },
            ],
            label: 'Week 9',
            date: '2021-11-22T00:00:00Z',
        },
        { values: [{ count: 810, people: [] }], label: 'Day 10', date: '2021-11-23T00:00:00Z' },
    ],
    last_refresh: '2021-11-23T13:45:29.314009Z',
    is_cached: true,
}

const sampleRetentionPeopleResponse = {
    result: [
        {
            person: {
                id: 195158300,
                name: 'test_user@posthog.com',
                distinct_ids: ['1234'],
                properties: {
                    $os: 'Mac OS X',
                    email: 'test_user@posthog.com',
                },
                is_identified: true,
                created_at: '2021-11-15T15:23:54.099000Z',
                uuid: '017d27d1-173a-2345-9bb1-337a0bb07be3',
            },
            appearances: [true, true, true, true, true, true, true, true, true],
        },
        {
            person: {
                id: 194626019,
                name: 'test@posthog.com',
                distinct_ids: ['abc'],
                properties: {
                    $os: 'Mac OS X',
                    email: 'test@posthog.com',
                },
                is_identified: false,
                created_at: '2021-11-15T14:12:41.919000Z',
                uuid: '017d23f1-6326-3456-0c5c-af00affbd563',
            },
            appearances: [true, true, true, true, true, false, true, true, true],
        },
    ],
    next: 'https://app.posthog.com/api/person/retention/?insight=RETENTION&target_entity=%7B%22id%22%3A%22%24pageview%22%2C%22name%22%3A%22%24pageview%22%2C%22type%22%3A%22events%22%7D&returning_entity=%7B%22id%22%3A%22%24pageview%22%2C%22type%22%3A%22events%22%2C%22name%22%3A%22%24pageview%22%7D&period=Day&retention_type=retention_first_time&display=ActionsTable&properties=%5B%5D&selected_interval=2&offset=100',
}

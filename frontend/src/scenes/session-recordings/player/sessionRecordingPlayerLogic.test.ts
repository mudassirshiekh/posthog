import { sessionRecordingPlayerLogic } from 'scenes/session-recordings/player/sessionRecordingPlayerLogic'
import { initKeaTests } from '~/test/init'
import { expectLogic } from 'kea-test-utils'
import { eventUsageLogic } from 'lib/utils/eventUsageLogic'
import {
    parseMetadataResponse,
    sessionRecordingDataLogic,
} from 'scenes/session-recordings/player/sessionRecordingDataLogic'
import { playerSettingsLogic } from 'scenes/session-recordings/player/playerSettingsLogic'
import { useMocks } from '~/mocks/jest'
import recordingSnapshotsJson from 'scenes/session-recordings/__mocks__/recording_snapshots.json'
import recordingMetaJson from 'scenes/session-recordings/__mocks__/recording_meta.json'
import recordingEventsJson from 'scenes/session-recordings/__mocks__/recording_events.json'
import { resumeKeaLoadersErrors, silenceKeaLoadersErrors } from '~/initKea'
import { featureFlagLogic } from 'lib/logic/featureFlagLogic'
import api from 'lib/api'
import { MOCK_TEAM_ID } from 'lib/api.mock'
import { sessionRecordingsListLogic } from 'scenes/session-recordings/playlist/sessionRecordingsListLogic'
import { router } from 'kea-router'
import { urls } from 'scenes/urls'

describe('sessionRecordingPlayerLogic', () => {
    let logic: ReturnType<typeof sessionRecordingPlayerLogic.build>

    beforeEach(() => {
        useMocks({
            get: {
                '/api/projects/:team/session_recordings/:id/snapshots': recordingSnapshotsJson,
                '/api/projects/:team/session_recordings/:id': recordingMetaJson,
                '/api/projects/:team/events': { results: recordingEventsJson },
            },
            delete: {
                '/api/projects/:team/session_recordings/:id': { success: true },
            },
        })
        initKeaTests()
        featureFlagLogic.mount()
        logic = sessionRecordingPlayerLogic({ sessionRecordingId: '2', playerKey: 'test' })
        logic.mount()
    })

    describe('core assumptions', () => {
        it('mounts other logics', async () => {
            await expectLogic(logic).toMount([
                eventUsageLogic,
                sessionRecordingDataLogic({ sessionRecordingId: '2' }),
                playerSettingsLogic,
            ])
        })
    })

    describe('loading session core', () => {
        it('load snapshot errors and triggers error state', async () => {
            silenceKeaLoadersErrors()
            // Unmount and remount the logic to trigger fetching the data again after the mock change
            logic.unmount()
            useMocks({
                get: {
                    '/api/projects/:team/session_recordings/:id/snapshots': () => [500, { status: 0 }],
                },
            })
            logic.mount()

            await expectLogic(logic, () => {
                logic.actions.seek(
                    {
                        time: 50, // greater than null buffered time
                        windowId: '1',
                    },
                    true
                )
            }).toDispatchActionsInAnyOrder([
                sessionRecordingDataLogic({ sessionRecordingId: '2' }).actionTypes.loadRecordingSnapshots,
                sessionRecordingDataLogic({ sessionRecordingId: '2' }).actionTypes.loadRecordingMeta,
                sessionRecordingDataLogic({ sessionRecordingId: '2' }).actionTypes.loadRecordingSnapshotsFailure,
                sessionRecordingDataLogic({ sessionRecordingId: '2' }).actionTypes.loadRecordingMetaSuccess,
                'seek',
                'setErrorPlayerState',
            ])

            expectLogic(logic).toMatchValues({
                sessionPlayerData: {
                    person: recordingMetaJson.person,
                    metadata: parseMetadataResponse(recordingMetaJson),
                    snapshotsByWindowId: {},
                    bufferedTo: null,
                },
                isErrored: true,
            })
            resumeKeaLoadersErrors()
        })
    })

    describe('delete session recording', () => {
        it('on playlist page', async () => {
            silenceKeaLoadersErrors()
            const listLogic = sessionRecordingsListLogic({ playlistShortId: 'playlist_id' })
            listLogic.mount()
            logic = sessionRecordingPlayerLogic({
                sessionRecordingId: '3',
                playerKey: 'test',
                playlistShortId: 'playlist_id',
            })
            logic.mount()
            jest.spyOn(api, 'delete')

            await expectLogic(logic, () => {
                logic.actions.deleteRecording()
            })
                .toDispatchActions([
                    'deleteRecording',
                    listLogic.actionTypes.loadAllRecordings,
                    listLogic.actionCreators.setSelectedRecordingId(null),
                ])
                .toNotHaveDispatchedActions([
                    sessionRecordingsListLogic({ updateSearchParams: true }).actionTypes.loadAllRecordings,
                ])

            expect(api.delete).toHaveBeenCalledWith(`api/projects/${MOCK_TEAM_ID}/session_recordings/3`)
            resumeKeaLoadersErrors()
        })

        it('on any other recordings page with a list', async () => {
            silenceKeaLoadersErrors()
            const listLogic = sessionRecordingsListLogic({ updateSearchParams: true })
            listLogic.mount()
            logic = sessionRecordingPlayerLogic({ sessionRecordingId: '3', playerKey: 'test' })
            logic.mount()
            jest.spyOn(api, 'delete')

            await expectLogic(logic, () => {
                logic.actions.deleteRecording()
            }).toDispatchActions([
                'deleteRecording',
                listLogic.actionTypes.loadAllRecordings,
                listLogic.actionCreators.setSelectedRecordingId(null),
            ])

            expect(api.delete).toHaveBeenCalledWith(`api/projects/${MOCK_TEAM_ID}/session_recordings/3`)
            resumeKeaLoadersErrors()
        })

        it('on a single recording page', async () => {
            silenceKeaLoadersErrors()
            logic = sessionRecordingPlayerLogic({ sessionRecordingId: '3', playerKey: 'test' })
            logic.mount()
            jest.spyOn(api, 'delete')
            router.actions.push(urls.sessionRecording('3'))

            await expectLogic(logic, () => {
                logic.actions.deleteRecording()
            })
                .toDispatchActions(['deleteRecording'])
                .toNotHaveDispatchedActions([
                    sessionRecordingsListLogic({ updateSearchParams: true }).actionTypes.loadAllRecordings,
                ])
                .toFinishAllListeners()

            expect(router.values.location.pathname).toEqual(urls.sessionRecordings())

            expect(api.delete).toHaveBeenCalledWith(`api/projects/${MOCK_TEAM_ID}/session_recordings/3`)
            resumeKeaLoadersErrors()
        })

        it('on a single recording modal', async () => {
            silenceKeaLoadersErrors()
            logic = sessionRecordingPlayerLogic({ sessionRecordingId: '3', playerKey: 'test' })
            logic.mount()
            jest.spyOn(api, 'delete')

            await expectLogic(logic, () => {
                logic.actions.deleteRecording()
            })
                .toDispatchActions(['deleteRecording'])
                .toNotHaveDispatchedActions([
                    sessionRecordingsListLogic({ updateSearchParams: true }).actionTypes.loadAllRecordings,
                ])
                .toFinishAllListeners()

            expect(router.values.location.pathname).toEqual('/')

            expect(api.delete).toHaveBeenCalledWith(`api/projects/${MOCK_TEAM_ID}/session_recordings/3`)
            resumeKeaLoadersErrors()
        })
    })

    describe('matching', () => {
        const listOfMatchingEvents = [
            { uuid: '1', timestamp: '2022-06-01T12:00:00.000Z', session_id: '1', window_id: '1' },
            { uuid: '2', timestamp: '2022-06-01T12:01:00.000Z', session_id: '1', window_id: '1' },
            { uuid: '3', timestamp: '2022-06-01T12:02:00.000Z', session_id: '1', window_id: '1' },
        ]
        it('starts as empty list', async () => {
            await expectLogic(logic).toMatchValues({
                matching: [],
            })
        })
        it('initialized through props', async () => {
            logic = sessionRecordingPlayerLogic({
                sessionRecordingId: '3',
                playerKey: 'test',
                matching: [
                    {
                        events: listOfMatchingEvents,
                    },
                ],
            })
            logic.mount()
            await expectLogic(logic).toMatchValues({
                matching: [
                    {
                        events: listOfMatchingEvents,
                    },
                ],
            })
        })
        it('changes when filter results change', async () => {
            logic = sessionRecordingPlayerLogic({
                sessionRecordingId: '4',
                playerKey: 'test',
                matching: [
                    {
                        events: listOfMatchingEvents,
                    },
                ],
            })
            logic.mount()
            await expectLogic(logic).toMatchValues({
                matching: [
                    {
                        events: listOfMatchingEvents,
                    },
                ],
            })
            logic = sessionRecordingPlayerLogic({
                sessionRecordingId: '4',
                playerKey: 'test',
                matching: [
                    {
                        events: [listOfMatchingEvents[0]],
                    },
                ],
            })
            logic.mount()
            await expectLogic(logic)
                .toDispatchActions(['setMatching'])
                .toMatchValues({
                    matching: [
                        {
                            events: [listOfMatchingEvents[0]],
                        },
                    ],
                })
        })
    })
})

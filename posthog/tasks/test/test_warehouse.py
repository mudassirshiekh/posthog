from posthog.test.base import APIBaseTest
import datetime
from unittest.mock import patch, MagicMock
from posthog.tasks.warehouse import (
    _traverse_jobs_by_field,
    calculate_workspace_rows_synced_by_team,
    _get_data_warehouse_usage_limit,
    check_external_data_source_billing_limit_by_team,
)
from posthog.warehouse.models import ExternalDataSource
from freezegun import freeze_time


class TestWarehouse(APIBaseTest):
    @patch("posthog.tasks.warehouse.send_request")
    @freeze_time("2023-11-07")
    def test_traverse_jobs_by_field(self, send_request_mock):
        send_request_mock.return_value = {
            "data": [
                {
                    "jobId": 5827835,
                    "status": "succeeded",
                    "jobType": "sync",
                    "startTime": "2023-11-07T16:50:49Z",
                    "connectionId": "fake",
                    "lastUpdatedAt": "2023-11-07T16:52:54Z",
                    "duration": "PT2M5S",
                    "rowsSynced": 93353,
                },
                {
                    "jobId": 5783573,
                    "status": "succeeded",
                    "jobType": "sync",
                    "startTime": "2023-11-05T18:32:41Z",
                    "connectionId": "fake-2",
                    "lastUpdatedAt": "2023-11-05T18:35:11Z",
                    "duration": "PT2M30S",
                    "rowsSynced": 97747,
                },
            ]
        }
        mock_capture = MagicMock()
        response = _traverse_jobs_by_field(mock_capture, self.team, "fake-url", "rowsSynced")

        self.assertEqual(
            response,
            [
                {"count": 93353, "startTime": "2023-11-07T16:50:49Z"},
                {"count": 97747, "startTime": "2023-11-05T18:32:41Z"},
            ],
        )

        self.assertEqual(mock_capture.capture.call_count, 2)
        mock_capture.capture.assert_called_with(
            self.team.pk,
            "external data sync job",
            {
                "count": 97747,
                "workspace_id": self.team.external_data_workspace_id,
                "team_id": self.team.pk,
                "team_uuid": self.team.uuid,
                "startTime": "2023-11-05T18:32:41Z",
                "job_id": "5783573",
            },
        )

    @patch("posthog.tasks.warehouse._traverse_jobs_by_field")
    @patch("posthog.tasks.warehouse.get_ph_client")
    @freeze_time("2023-11-07")
    def test_calculate_workspace_rows_synced_by_team(self, mock_capture, traverse_jobs_mock):
        traverse_jobs_mock.return_value = [
            {"count": 97747, "startTime": "2023-11-05T18:32:41Z"},
            {"count": 93353, "startTime": "2023-11-07T16:50:49Z"},
        ]

        calculate_workspace_rows_synced_by_team(self.team.pk)

        self.team.refresh_from_db()
        self.assertEqual(
            self.team.external_data_workspace_last_synced_at,
            datetime.datetime(2023, 11, 7, 16, 50, 49, tzinfo=datetime.timezone.utc),
        )

    @patch("posthog.tasks.warehouse._traverse_jobs_by_field")
    @patch("posthog.tasks.warehouse.get_ph_client")
    @freeze_time("2023-11-07")
    def test_calculate_workspace_rows_synced_by_team_month_cutoff(self, mock_capture, traverse_jobs_mock):
        # external_data_workspace_last_synced_at unset
        traverse_jobs_mock.return_value = [
            {"count": 93353, "startTime": "2023-11-07T16:50:49Z"},
        ]

        calculate_workspace_rows_synced_by_team(self.team.pk)

        self.team.refresh_from_db()
        self.assertEqual(
            self.team.external_data_workspace_last_synced_at,
            datetime.datetime(2023, 11, 7, 16, 50, 49, tzinfo=datetime.timezone.utc),
        )

    @patch("posthog.tasks.warehouse._traverse_jobs_by_field")
    @patch("posthog.tasks.warehouse.get_ph_client")
    @freeze_time("2023-11-07")
    def test_calculate_workspace_rows_synced_by_team_month_cutoff_field_set(self, mock_capture, traverse_jobs_mock):
        self.team.external_data_workspace_last_synced_at = datetime.datetime(
            2023, 10, 29, 18, 32, 41, tzinfo=datetime.timezone.utc
        )
        self.team.save()
        traverse_jobs_mock.return_value = [
            {"count": 97747, "startTime": "2023-10-30T18:32:41Z"},
            {"count": 93353, "startTime": "2023-11-07T16:50:49Z"},
        ]

        calculate_workspace_rows_synced_by_team(self.team.pk)

        self.team.refresh_from_db()
        self.assertEqual(
            self.team.external_data_workspace_last_synced_at,
            datetime.datetime(2023, 11, 7, 16, 50, 49, tzinfo=datetime.timezone.utc),
        )

    def test_external_data_source_get_usage_limit(self):
        self.team.organization.usage = {
            "data_warehouse": {
                "usage": 2,
                "limit": 100,
            }
        }
        self.team.organization.save()
        usage_limit = _get_data_warehouse_usage_limit(self.team.pk)
        self.assertEqual(usage_limit, 100)

    @patch("posthog.warehouse.external_data_source.connection.send_request")
    @patch("posthog.tasks.warehouse._get_data_warehouse_usage_limit")
    def test_external_data_source_billing_limit_deactivate(self, usage_limit_mock, send_request_mock):
        usage_limit_mock.return_value = 100
        self.team.save()

        external_source = ExternalDataSource.objects.create(
            source_id="test_id",
            connection_id="fake connectino_id",
            destination_id="fake destination_id",
            team=self.team,
            status="running",
            source_type="Stripe",
        )

        check_external_data_source_billing_limit_by_team(self.team.pk)

        external_source.refresh_from_db()
        self.assertEqual(external_source.status, "inactive")

    @patch("posthog.warehouse.external_data_source.connection.send_request")
    @patch("posthog.tasks.warehouse._get_data_warehouse_usage_limit")
    def test_external_data_source_billing_limit_activate(self, usage_limit_mock, send_request_mock):
        usage_limit_mock.return_value = 100
        self.team.save()

        external_source = ExternalDataSource.objects.create(
            source_id="test_id",
            connection_id="fake connectino_id",
            destination_id="fake destination_id",
            team=self.team,
            status="inactive",
            source_type="Stripe",
        )

        check_external_data_source_billing_limit_by_team(self.team.pk)

        external_source.refresh_from_db()
        self.assertEqual(external_source.status, "running")

    @patch("posthog.warehouse.external_data_source.connection.send_request")
    @patch("posthog.tasks.warehouse._get_data_warehouse_usage_limit")
    def test_external_data_source_billing_limit_no_limit(self, usage_limit_mock, send_request_mock):
        usage_limit_mock.return_value = None
        self.team.save()

        external_source = ExternalDataSource.objects.create(
            source_id="test_id",
            connection_id="fake connectino_id",
            destination_id="fake destination_id",
            team=self.team,
            status="inactive",
            source_type="Stripe",
        )

        check_external_data_source_billing_limit_by_team(self.team.pk)

        external_source.refresh_from_db()
        self.assertEqual(external_source.status, "running")

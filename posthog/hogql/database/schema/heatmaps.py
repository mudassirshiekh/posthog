from typing import Dict

from posthog.hogql.database.models import (
    StringDatabaseField,
    DateTimeDatabaseField,
    IntegerDatabaseField,
    Table,
    FieldOrTable,
    BooleanDatabaseField,
)


class HeatmapsTable(Table):
    fields: Dict[str, FieldOrTable] = {
        "session_id": StringDatabaseField(name="session_id"),
        "team_id": IntegerDatabaseField(name="team_id"),
        "x": IntegerDatabaseField(name="x"),
        "y": IntegerDatabaseField(name="y"),
        "scale_factor": IntegerDatabaseField(name="scale_factor"),
        "viewport_width": IntegerDatabaseField(name="viewport_width"),
        "viewport_height": IntegerDatabaseField(name="viewport_height"),
        "pointer_target_fixed": BooleanDatabaseField(name="pointer_target_fixed"),
        "current_url": StringDatabaseField(name="current_url"),
        "timestamp": DateTimeDatabaseField(name="timestamp"),
        "type": StringDatabaseField(name="type"),
        # join to get analytics for heatmap areas?
        # "session": LazyJoin(
        #     from_field=["session_id"],
        #     join_table=SessionsTable(),
        #     join_function=join_events_table_to_sessions_table,
        # ),
        # join to get example replays?
        # "recordings": LazyJoin(
        #     from_field=["session_id"],
        #     join_table=SessionReplayEventsTable(),
        #     join_function=join_events_table_to_replay_table,
        # ),
    }

    def to_printed_clickhouse(self, context):
        return "heatmaps"

    def to_printed_hogql(self):
        return "heatmaps"

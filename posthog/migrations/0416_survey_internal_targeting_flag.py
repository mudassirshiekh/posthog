# Generated by Django 4.2.11 on 2024-05-22 16:31

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):
    atomic = False  # Added to support concurrent index creation
    dependencies = [
        ("posthog", "0415_pluginconfig_match_action"),
    ]

    operations = [
        migrations.SeparateDatabaseAndState(
            state_operations=[
                migrations.AddField(
                    model_name="survey",
                    name="internal_targeting_flag",
                    field=models.ForeignKey(
                        blank=True,
                        null=True,
                        on_delete=django.db.models.deletion.SET_NULL,
                        related_name="surveys_internal_targeting_flag",
                        related_query_name="survey_internal_targeting_flag",
                        to="posthog.featureflag",
                    ),
                )
            ],
            database_operations=[
                # We add -- existing-table-constraint-ignore to ignore the constraint validation in CI.
                migrations.RunSQL(
                    """
                    ALTER TABLE "posthog_survey" ADD COLUMN "internal_targeting_flag_id" integer NULL CONSTRAINT "posthog_survey_internal_targeting_f_b3911925_fk_posthog_f" REFERENCES "posthog_featureflag"("id") DEFERRABLE INITIALLY DEFERRED; -- existing-table-constraint-ignore
                    SET CONSTRAINTS "posthog_survey_internal_targeting_f_b3911925_fk_posthog_f" IMMEDIATE; -- existing-table-constraint-ignore
                    """,
                    reverse_sql="""
                        ALTER TABLE "posthog_survey" DROP COLUMN IF EXISTS "internal_targeting_flag_id";
                    """,
                ),
                # We add CONCURRENTLY to the create command
                migrations.RunSQL(
                    """
                    CREATE INDEX CONCURRENTLY "posthog_survey_internal_targeting_flag_id_b3911925" ON "posthog_survey" ("internal_targeting_flag_id");
                    """,
                    reverse_sql="""
                        DROP INDEX IF EXISTS "posthog_survey_internal_targeting_flag_id_b3911925";
                    """,
                ),
            ],
        )
    ]

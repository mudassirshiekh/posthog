from django.db import models

from ee.models.rbac.organization_resource_access import OrganizationResourceAccess
from posthog.models.utils import UUIDModel


class Role(UUIDModel):
    class Meta:
        constraints = [models.UniqueConstraint(fields=["organization", "name"], name="unique_role_name")]

    name: models.CharField = models.CharField(max_length=200)
    organization: models.ForeignKey = models.ForeignKey(
        "posthog.Organization",
        on_delete=models.CASCADE,
        related_name="roles",
        related_query_name="role",
    )

    created_at: models.DateTimeField = models.DateTimeField(auto_now_add=True)
    created_by: models.ForeignKey = models.ForeignKey(
        "posthog.User",
        on_delete=models.SET_NULL,
        related_name="roles",
        related_query_name="role",
        null=True,
    )

    # TODO: Deprecate this field
    feature_flags_access_level: models.PositiveSmallIntegerField = models.PositiveSmallIntegerField(
        default=OrganizationResourceAccess.AccessLevel.CAN_ALWAYS_EDIT,
        choices=OrganizationResourceAccess.AccessLevel.choices,
    )


class RoleMembership(UUIDModel):
    class Meta:
        constraints = [models.UniqueConstraint(fields=["role", "user"], name="unique_user_and_role")]

    role: models.ForeignKey = models.ForeignKey(
        "Role",
        on_delete=models.CASCADE,
        related_name="roles",
        related_query_name="role",
    )
    # TODO: We should get rid of this and just use the organization_membership field
    user: models.ForeignKey = models.ForeignKey(
        "posthog.User",
        on_delete=models.CASCADE,
        related_name="role_memberships",
        related_query_name="role_membership",
    )

    organization_membership: models.ForeignKey = models.ForeignKey(
        "posthog.OrganizationMembership",
        on_delete=models.CASCADE,
        related_name="role_memberships",
        related_query_name="role_memberships",
        null=True,
    )
    joined_at: models.DateTimeField = models.DateTimeField(auto_now_add=True)
    updated_at: models.DateTimeField = models.DateTimeField(auto_now=True)

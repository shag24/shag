
import { leapwork } from "./leapwork";

import { Asset1TeamCreation } from "@assets/Data Creation/1 - Team creation";
import { Asset2TeamDeleation } from "@assets/Data Creation/2 - Team deleation";
import { Logout } from "@assets/ReusableFunctions/Logout";

// ============================================================
// CONFIGURATION
// ============================================================

leapwork.configuration({
    timeoutMs: Number(
        leapwork.team.settings.get("timeoutMs")
        ?? leapwork.workspace.settings.get("timeoutMs")
    ) || 30000,

    enableSelfHeal:
        (
            leapwork.team.settings.get("enableSelfHeal")
            ?? leapwork.workspace.settings.get("enableSelfHeal")
        ) !== "false",

    chromiumArgs:
        leapwork.team.settings.get("chromiumArgs")
        ?? leapwork.workspace.settings.get("chromiumArgs")
        ?? [
            "--deny-permission-prompts",
            "--disable-notifications"
        ],

    chromiumPrefs:
        leapwork.team.settings.get("chromiumPrefs")
        ?? leapwork.workspace.settings.get("chromiumPrefs")
        ?? {
            credentials_enable_service: false,
            profile: {
                password_manager_enabled: false,
                password_manager_leak_detection: false
            }
        }
});

// ============================================================
// TEST DATA
// ============================================================

const ACTION_TIMEOUT = 15000;
const TEAM_TIMEOUT = 30000;

const PROTECTED_TEAM_NAME = "New Team (Dont)";

let createdTeamName = "";

// ============================================================
// LOCATORS
// ============================================================

const explorerPanel = page.locator(
    ".explorer-panel"
);

const contextMenu = page.locator(
    '[aria-label="Context menu"]'
);

const registrationsTab = page.locator(
    '.tab[role="button"][title="Registrations"]'
);

const triggerActionsButton = page.locator(
    'button.scheduler-trigger-card-menu-button[title="Trigger actions"]'
);

// ============================================================
// HELPER - GET CREATED TEAM
// ============================================================

function getCreatedTeam() {

    return explorerPanel.locator(
        '.explorer-item[data-aistudio-tour-target="team"]'
    ).filter({
        has: page.locator(
            ".explorer-item-name"
        ).getByText(
            createdTeamName,
            {
                exact: true
            }
        )
    });
}

// ============================================================
// HELPER - OPEN REGISTRATIONS TAB
// ============================================================

async function openRegistrationsTab(): Promise<void> {

    await expect(registrationsTab).toHaveCount(1, {
        timeout: ACTION_TIMEOUT
    });

    await expect(registrationsTab).toBeVisible({
        timeout: ACTION_TIMEOUT
    });

    await registrationsTab.click();

    await expect(registrationsTab).toHaveClass(
        /tab--active/,
        {
            timeout: ACTION_TIMEOUT
        }
    );

    logInfo("Registrations tab opened.");
}

// ============================================================
// HELPER - OPEN EVENT TRIGGER ACTIONS
// ============================================================

async function openTriggerActions(): Promise<void> {

    await expect(registrationsTab).toHaveClass(
        /tab--active/,
        {
            timeout: ACTION_TIMEOUT
        }
    );

    await expect(triggerActionsButton).toHaveCount(1, {
        timeout: ACTION_TIMEOUT
    });

    await expect(triggerActionsButton).toBeVisible({
        timeout: ACTION_TIMEOUT
    });

    await expect(triggerActionsButton).toBeEnabled();

    await triggerActionsButton.scrollIntoViewIfNeeded({
        timeout: ACTION_TIMEOUT
    });

    await triggerActionsButton.click({
        timeout: ACTION_TIMEOUT
    });

    await expect(contextMenu).toBeVisible({
        timeout: ACTION_TIMEOUT
    });

    logInfo(
        "Event Subscription trigger actions menu opened."
    );
}

// ============================================================
// STEP 1 - INITIAL TEAM CLEANUP
// ============================================================

// ai-studio-step-id: pw1ggfez40
await leapwork.step(
    "Use test case: 2 - Team deleation",
    async () => {

        return await Asset2TeamDeleation();
    },
    {
        action: "asset_reference",
        linkedAssetType: "test-case"
    }
);

// ============================================================
// STEP 2 - CREATE TEAM
// ============================================================

// ai-studio-step-id: pw13nht6m0
await leapwork.step(
    "Use test case: 1 - Team creation",
    async () => {

        return await Asset1TeamCreation();
    },
    {
        action: "asset_reference",
        linkedAssetType: "test-case"
    }
);

// ============================================================
// STEP 3 - COLLAPSE CHAT
// ============================================================

// ai-studio-step-id: pw1glwkqu0
await leapwork.step(
    "Collapse chat after Team creation",
    async () => {

        const collapseChatButton = page.getByRole(
            "button",
            {
                name: "Collapse chat",
                exact: true
            }
        );

        if (
            await collapseChatButton.isVisible()
                .catch(() => false)
        ) {
            await collapseChatButton.click();
            logInfo("Chat panel collapsed.");
        } else {
            logInfo("Chat panel already collapsed.");
        }
    },
    {
        action: "click"
    }
);

// ============================================================
// STEP 4 - GET DYNAMIC TEAM NAME
// ============================================================

// ai-studio-step-id: pw14xd6qw0
await leapwork.step(
    "Get dynamically created Team name",
    async () => {

        createdTeamName = String(
            leapwork.variables.get(
                "createdTeamName",
                leapwork.storage.LOCAL
            ) ?? ""
        ).trim();

        if (!createdTeamName) {
            throw new Error(
                "createdTeamName was not found after Team Creation."
            );
        }

        if (createdTeamName === PROTECTED_TEAM_NAME) {
            throw new Error(
                "Created team matches protected team."
            );
        }

        logInfo(
            `Created Team: ${createdTeamName}`
        );
    },
    {
        action: "validate"
    }
);

// ============================================================
// STEP 5 - VALIDATE CREATE NEW BUTTON
// ============================================================

// ai-studio-step-id: pw11i12d50
await leapwork.step(
    "Validate Create new button for created Team",
    async () => {

        const team = getCreatedTeam();

        await expect(team).toHaveCount(1, {
            timeout: TEAM_TIMEOUT
        });

        await expect(team).toBeVisible({
            timeout: ACTION_TIMEOUT
        });

        await team.hover();

        const createButton = team.getByRole(
            "button",
            {
                name: `Create new in ${createdTeamName}`,
                exact: true
            }
        );

        await expect(createButton).toHaveCount(1, {
            timeout: ACTION_TIMEOUT
        });

        await expect(createButton).toBeVisible({
            timeout: ACTION_TIMEOUT
        });

        await expect(createButton).toBeEnabled();

        logInfo(
            `Create new button validated for ${createdTeamName}`
        );
    },
    {
        action: "validate"
    }
);

// ============================================================
// STEP 6 - CLICK CREATE NEW
// ============================================================

// ai-studio-step-id: pwi7h6gq00
await leapwork.step(
    "Click Create new button for created Team",
    async () => {

        const team = getCreatedTeam();

        await expect(team).toBeVisible({
            timeout: ACTION_TIMEOUT
        });

        await team.hover();

        const createButton = team.getByRole(
            "button",
            {
                name: `Create new in ${createdTeamName}`,
                exact: true
            }
        );

        await expect(createButton).toBeVisible({
            timeout: ACTION_TIMEOUT
        });

        await createButton.click();

        await expect(contextMenu).toBeVisible({
            timeout: ACTION_TIMEOUT
        });
    },
    {
        action: "click"
    }
);

// ============================================================
// STEP 7 - CREATE NEW AGENT
// ============================================================

// ai-studio-step-id: pw1ch69mr0
await leapwork.step(
    "Click New agent",
    async () => {

        const newAgentOption = contextMenu.getByText(
            "New agent",
            {
                exact: true
            }
        );

        await expect(newAgentOption).toBeVisible({
            timeout: ACTION_TIMEOUT
        });

        await newAgentOption.click();

        logInfo("New Agent created.");
    },
    {
        action: "click"
    }
);

// ============================================================
// STEP 8 - OPEN REGISTRATIONS TAB
// ============================================================

// ai-studio-step-id: pw4nge9e00
await leapwork.step(
    "Open Registrations tab",
    async () => {

        await openRegistrationsTab();
    },
    {
        action: "click"
    }
);

// ============================================================
// STEP 9 - CLICK ADD TRIGGER
// ============================================================

// ai-studio-step-id: pwmf4ef100
await leapwork.step(
    "Click Add trigger",
    async () => {

        const addTriggerButton = page.getByRole(
            "button",
            {
                name: "Add trigger",
                exact: true
            }
        );

        await expect(addTriggerButton).toHaveCount(1, {
            timeout: ACTION_TIMEOUT
        });

        await expect(addTriggerButton).toBeVisible({
            timeout: ACTION_TIMEOUT
        });

        await expect(addTriggerButton).toBeEnabled();

        await addTriggerButton.click();

        await expect(contextMenu).toBeVisible({
            timeout: ACTION_TIMEOUT
        });
    },
    {
        action: "click"
    }
);

// ============================================================
// STEP 10 - SELECT EVENT SUBSCRIPTION
// ============================================================

// ai-studio-step-id: pw4yn8cu00
await leapwork.step(
    "Select Event subscription trigger",
    async () => {

        const eventSubscriptionOption = contextMenu.getByText(
            "Event subscription",
            {
                exact: true
            }
        );

        await expect(eventSubscriptionOption).toHaveCount(1, {
            timeout: ACTION_TIMEOUT
        });

        await expect(eventSubscriptionOption).toBeVisible({
            timeout: ACTION_TIMEOUT
        });

        await eventSubscriptionOption.click();

        logInfo(
            "Event Subscription trigger form opened."
        );
    },
    {
        action: "click"
    }
);

// ============================================================
// STEP 11 - CREATE EVENT TRIGGER
// ============================================================

// ai-studio-step-id: pwop3gb900
await leapwork.step(
    "Create Event subscription trigger",
    async () => {

        const createTriggerButton = page.getByRole(
            "button",
            {
                name: "Create trigger",
                exact: true
            }
        );

        await expect(createTriggerButton).toBeVisible({
            timeout: ACTION_TIMEOUT
        });

        await expect(createTriggerButton).toBeEnabled();

        await createTriggerButton.click();

        logInfo(
            "Event Subscription trigger created."
        );
    },
    {
        action: "click"
    }
);

// ============================================================
// STEP 12 - VALIDATE ENABLED STATUS
// ============================================================

// ai-studio-step-id: pw5f8mtn00
await leapwork.step(
    "Validate Event subscription trigger is Enabled",
    async () => {

        const enabledStatus = page.getByText(
            "Enabled",
            {
                exact: true
            }
        );

        await expect(enabledStatus).toHaveCount(1, {
            timeout: ACTION_TIMEOUT
        });

        await expect(enabledStatus).toBeVisible({
            timeout: ACTION_TIMEOUT
        });

        await expect(enabledStatus).toHaveText(
            "Enabled"
        );

        logInfo(
            "PASS: Event Subscription trigger is Enabled."
        );
    },
    {
        action: "validate"
    }
);

// ============================================================
// STEP 13 - OPEN EVENT TRIGGER ACTIONS
// ============================================================

// ai-studio-step-id: pw18fmz9e0
await leapwork.step(
    "Open Event subscription trigger actions",
    async () => {

        await openTriggerActions();
    },
    {
        action: "click"
    }
);

// ============================================================
// STEP 14 - VALIDATE DISABLE OPTION
// ============================================================

// ai-studio-step-id: pw6vdak500
await leapwork.step(
    "Validate Disable option is available",
    async () => {

        const disableOption = contextMenu.getByText(
            "Disable",
            {
                exact: true
            }
        );

        await expect(disableOption).toHaveCount(1, {
            timeout: ACTION_TIMEOUT
        });

        await expect(disableOption).toBeVisible({
            timeout: ACTION_TIMEOUT
        });

        logInfo(
            "PASS: Disable option is available."
        );
    },
    {
        action: "validate"
    }
);

// ============================================================
// STEP 15 - VALIDATE DELETE OPTION
// ============================================================

// ai-studio-step-id: pw1gl5sa60
await leapwork.step(
    "Validate Delete option is available",
    async () => {

        const deleteOption = contextMenu.getByText(
            "Delete",
            {
                exact: true
            }
        );

        await expect(deleteOption).toHaveCount(1, {
            timeout: ACTION_TIMEOUT
        });

        await expect(deleteOption).toBeVisible({
            timeout: ACTION_TIMEOUT
        });

        logInfo(
            "PASS: Delete option is available."
        );
    },
    {
        action: "validate"
    }
);

// ============================================================
// STEP 16 - CLOSE TRIGGER ACTIONS
// ============================================================

// ai-studio-step-id: pwfsyl2300
await leapwork.step(
    "Close Event subscription trigger actions",
    async () => {

        await page.keyboard.press("Escape");

        await expect(contextMenu).toBeHidden({
            timeout: ACTION_TIMEOUT
        });

        logInfo(
            "Event Subscription trigger actions menu closed."
        );
    },
    {
        action: "click"
    }
);

// ============================================================
// STEP 17 - LOGOUT
// ============================================================

// ai-studio-step-id: pwkvvggj00
await leapwork.step(
    "Use test case: Logout",
    async () => {

        return await Logout();
    },
    {
        action: "asset_reference",
        linkedAssetType: "test-case"
    }
);

// ============================================================
// FINAL RESULT
// ============================================================

logInfo(
    "Event Subscription Trigger automation completed successfully."
);

logInfo(`Team: ${createdTeamName}`);

logInfo(
    "PASS: Event Subscription trigger created."
);

logInfo(
    "PASS: Trigger Enabled status validated."
);

logInfo(
    "PASS: Disable and Delete actions validated."
);

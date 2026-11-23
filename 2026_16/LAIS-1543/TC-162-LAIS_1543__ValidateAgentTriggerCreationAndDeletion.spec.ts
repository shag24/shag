
import { leapwork } from "./leapwork";

import { Logout } from "@assets/ReusableFunctions/Logout";
import { Asset1TeamCreation } from "@assets/Data Creation/1 - Team creation";
import { Asset2TeamDeleation } from "@assets/Data Creation/2 - Team deleation";

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
const EDITOR_TIMEOUT = 30000;

const PROTECTED_TEAM_NAME = "New Team (Dont)";

let createdTeamName = "";
let createdEndpointSuffix = "";
let createdTriggerName = "";

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

const typescriptTab = page.locator(
    '.tab[role="button"][title="Typescript"]'
);

const apiTriggerForm = page.locator(
    ".registration-trigger-form-api"
);

const codeEditor = page.locator(
    ".ts-editor .monaco-editor"
).first();

const codeLines = codeEditor.locator(
    ".view-lines"
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
// HELPER - OPEN TYPESCRIPT TAB
// ============================================================

async function openTypescriptTab(): Promise<void> {

    await expect(typescriptTab).toHaveCount(1, {
        timeout: ACTION_TIMEOUT
    });

    await expect(typescriptTab).toBeVisible({
        timeout: ACTION_TIMEOUT
    });

    await typescriptTab.click();

    await expect(typescriptTab).toHaveClass(
        /tab--active/,
        {
            timeout: ACTION_TIMEOUT
        }
    );

    logInfo("Typescript tab opened.");
}

// ============================================================
// HELPER - GET TRIGGER NAME FIELD
// ============================================================

function getTriggerNameField() {

    return apiTriggerForm.locator(
        ".scheduler-trigger-field"
    ).filter({
        has: page.locator(
            ".scheduler-trigger-label"
        ).getByText(
            "Name",
            {
                exact: true
            }
        )
    }).locator(
        "input.scheduler-trigger-input"
    );
}

// ============================================================
// HELPER - GET ENDPOINT SUFFIX FIELD
// ============================================================

function getEndpointSuffixField() {

    return apiTriggerForm.locator(
        ".scheduler-trigger-field"
    ).filter({
        has: page.locator(
            ".scheduler-trigger-label"
        ).getByText(
            "Endpoint suffix",
            {
                exact: true
            }
        )
    }).locator(
        "input.scheduler-trigger-input"
    );
}

// ============================================================
// HELPER - READ MONACO EDITOR CODE
// ============================================================

async function getEditorCode(): Promise<string> {

    await expect(codeEditor).toBeVisible({
        timeout: EDITOR_TIMEOUT
    });

    await expect(codeLines).toBeVisible({
        timeout: EDITOR_TIMEOUT
    });

    const editorLines = codeLines.locator(
        ".view-line"
    );

    const code = await editorLines.evaluateAll(
        (elements) => elements
            .map(element =>
                (element.textContent ?? "")
                    .replace(/\u00a0/g, " ")
            )
            .join("\n")
    );

    if (!code.trim()) {
        throw new Error(
            "Monaco Editor returned empty TypeScript code."
        );
    }

    return code;
}

// ============================================================
// HELPER - GET EXACT TRIGGER BLOCK
// ============================================================

function getTriggerBlockLines(
    code: string
): string[] {

    if (!createdTriggerName || !createdEndpointSuffix) {
        throw new Error(
            "Trigger name or endpoint suffix was not captured."
        );
    }

    const lines = code
        .split(/\r?\n/)
        .map(line => line.trim());

    const openingMarker =
        `// <ai-studio-trigger key="api-endpoint-${createdTriggerName}">`;

    const closingMarker =
        "// </ai-studio-trigger>";

    const startIndex = lines.findIndex(
        line => line === openingMarker
    );

    if (startIndex === -1) {
        throw new Error(
            `Opening marker not found for "${createdTriggerName}".`
        );
    }

    const endIndex = lines.findIndex(
        (line, index) =>
            index > startIndex &&
            line === closingMarker
    );

    if (endIndex === -1) {
        throw new Error(
            "Closing API trigger marker not found."
        );
    }

    return lines.slice(
        startIndex,
        endIndex + 1
    );
}

// ============================================================
// HELPER - VALIDATE ACTIVE API TRIGGER
// ============================================================

async function validateActiveApiTrigger(): Promise<void> {

    const code = await getEditorCode();
    const lines = getTriggerBlockLines(code);

    const openingMarker =
        `// <ai-studio-trigger key="api-endpoint-${createdTriggerName}">`;

    if (!lines.includes(openingMarker)) {
        throw new Error(
            "Active API trigger opening marker not found."
        );
    }

    const registrationLine = lines.find(
        line => line.includes(
            `agent.registerApiTrigger("${createdTriggerName}"`
        )
    );

    if (!registrationLine) {
        throw new Error(
            "API trigger registration call not found."
        );
    }

    if (registrationLine.startsWith("//")) {
        throw new Error(
            "API trigger registration is unexpectedly commented."
        );
    }

    if (
        !registrationLine.includes(
            `endpointSuffix: "${createdEndpointSuffix}"`
        )
    ) {
        throw new Error(
            "API trigger endpoint suffix does not match."
        );
    }

    if (!/method:\s*"POST"/.test(registrationLine)) {
        throw new Error(
            "Expected POST method not found."
        );
    }

    if (
        !lines.includes(
            "// Handle the API request here."
        )
    ) {
        throw new Error(
            "Active API trigger handler comment not found."
        );
    }

    if (!lines.includes("});")) {
        throw new Error(
            "Active API trigger closing statement not found."
        );
    }

    if (
        !lines.includes(
            "// </ai-studio-trigger>"
        )
    ) {
        throw new Error(
            "Active API trigger closing marker not found."
        );
    }

    logInfo(
        `PASS: API trigger "${createdTriggerName}" is active.`
    );

    logInfo(
        `Validated endpoint suffix: ${createdEndpointSuffix}`
    );
}

// ============================================================
// HELPER - VALIDATE DELETED API TRIGGER
// ============================================================

async function validateDeletedApiTrigger(): Promise<void> {

    const code = await getEditorCode();
    const lines = getTriggerBlockLines(code);

    // ========================================================
    // 1. VALIDATE OPENING MARKER
    // ========================================================

    const openingMarker =
        `// <ai-studio-trigger key="api-endpoint-${createdTriggerName}">`;

    if (!lines.includes(openingMarker)) {
        throw new Error(
            "Deleted API trigger opening marker not found."
        );
    }

    // ========================================================
    // 2. VALIDATE COMMENTED REGISTRATION
    // ========================================================

    const registrationLine = lines.find(
        line => line.includes(
            `agent.registerApiTrigger("${createdTriggerName}"`
        )
    );

    if (!registrationLine) {
        throw new Error(
            "Deleted API trigger registration not found."
        );
    }

    if (
        !/^\/\/\s*agent\.registerApiTrigger\(/.test(
            registrationLine
        )
    ) {
        throw new Error(
            "Deleted API trigger registration is still active."
        );
    }

    // ========================================================
    // 3. VALIDATE ENDPOINT SUFFIX
    // ========================================================

    if (
        !registrationLine.includes(
            `endpointSuffix: "${createdEndpointSuffix}"`
        )
    ) {
        throw new Error(
            "Deleted API trigger endpoint suffix does not match."
        );
    }

    // ========================================================
    // 4. VALIDATE HTTP METHOD
    // ========================================================

    if (!/method:\s*"POST"/.test(registrationLine)) {
        throw new Error(
            "Deleted API trigger POST method not found."
        );
    }

    // ========================================================
    // 5. VALIDATE DOUBLE-COMMENTED HANDLER
    // ========================================================

    const handlerLine = lines.find(
        line => line.includes(
            "Handle the API request here."
        )
    );

    if (!handlerLine) {
        throw new Error(
            "Deleted API trigger handler not found."
        );
    }

    if (
        !/^\/\/\s*\/\/\s*Handle the API request here\./.test(
            handlerLine
        )
    ) {
        throw new Error(
            "Deleted API trigger handler is not double-commented. " +
            `Actual line: ${handlerLine}`
        );
    }

    // ========================================================
    // 6. VALIDATE COMMENTED CLOSING STATEMENT
    // ========================================================

    if (
        !lines.some(
            line => /^\/\/\s*\}\);$/.test(line)
        )
    ) {
        throw new Error(
            "Deleted API trigger closing statement is not commented."
        );
    }

    // ========================================================
    // 7. ENSURE NO ACTIVE REGISTRATION REMAINS
    // ========================================================

    if (
        lines.some(
            line => /^agent\.registerApiTrigger\(/.test(line)
        )
    ) {
        throw new Error(
            "Active API trigger registration still exists."
        );
    }

    // ========================================================
    // 8. VALIDATE CLOSING MARKER
    // ========================================================

    if (
        !lines.includes(
            "// </ai-studio-trigger>"
        )
    ) {
        throw new Error(
            "Deleted API trigger closing marker not found."
        );
    }

    logInfo(
        `PASS: Deleted API trigger "${createdTriggerName}" is fully commented.`
    );

    logInfo(
        `Validated deleted endpoint suffix: ${createdEndpointSuffix}`
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
// STEP 3 - GET DYNAMIC TEAM NAME
// ============================================================

// ai-studio-step-id: pwz8322k00
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
// STEP 4 - VALIDATE CREATE NEW BUTTON
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
// STEP 5 - COLLAPSE CHAT
// ============================================================

// ai-studio-step-id: pw1pzqu860
await leapwork.step(
    "Collapse chat",
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
        }

        logInfo("Chat panel handled.");
    },
    {
        action: "click"
    }
);

// ============================================================
// STEP 6 - CLICK CREATE NEW
// ============================================================

// ai-studio-step-id: pw1bx13ae0
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
// STEP 8 - OPEN REGISTRATIONS
// ============================================================

// ai-studio-step-id: pw1fa24do0
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
// STEP 9 - ADD TRIGGER
// ============================================================

// ai-studio-step-id: pwggbl7x00
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
// STEP 10 - SELECT API ENDPOINT
// ============================================================

// ai-studio-step-id: pw16owv7w0
await leapwork.step(
    "Select API endpoint trigger",
    async () => {

        const apiEndpointOption = contextMenu.getByText(
            "API endpoint",
            {
                exact: true
            }
        );

        await expect(apiEndpointOption).toBeVisible({
            timeout: ACTION_TIMEOUT
        });

        await apiEndpointOption.click();

        await expect(apiTriggerForm).toBeVisible({
            timeout: ACTION_TIMEOUT
        });

        await expect(
            apiTriggerForm.locator(
                ".scheduler-trigger-card-title"
            )
        ).toHaveText("API endpoint");
    },
    {
        action: "click"
    }
);

// ============================================================
// STEP 11 - VALIDATE TRIGGER FORM
// ============================================================

// ai-studio-step-id: pwvfo3i700
await leapwork.step(
    "Validate API endpoint trigger form",
    async () => {

        const nameField = getTriggerNameField();
        const endpointSuffixField = getEndpointSuffixField();

        await expect(nameField).toBeVisible({
            timeout: ACTION_TIMEOUT
        });

        await expect(nameField).not.toHaveValue("");

        await expect(endpointSuffixField).toBeVisible({
            timeout: ACTION_TIMEOUT
        });

        await expect(endpointSuffixField).toHaveValue(
            /^api-trigger-\d+$/
        );

        createdTriggerName = (
            await nameField.inputValue()
        ).trim();

        createdEndpointSuffix = (
            await endpointSuffixField.inputValue()
        ).trim();

        if (!createdTriggerName || !createdEndpointSuffix) {
            throw new Error(
                "API trigger name or endpoint suffix is empty."
            );
        }

        logInfo(`Trigger name: ${createdTriggerName}`);
        logInfo(`Endpoint suffix: ${createdEndpointSuffix}`);
    },
    {
        action: "validate"
    }
);

// ============================================================
// STEP 12 - CREATE TRIGGER
// ============================================================

// ai-studio-step-id: pwbgg53100
await leapwork.step(
    "Create API endpoint trigger",
    async () => {

        const createTriggerButton = apiTriggerForm.getByRole(
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

        await expect(apiTriggerForm).toBeHidden({
            timeout: ACTION_TIMEOUT
        });

        logInfo("API endpoint trigger created.");
    },
    {
        action: "click"
    }
);

// ============================================================
// STEP 13 - OPEN TYPESCRIPT TAB
// ============================================================

// ai-studio-step-id: pwx490gv00
await leapwork.step(
    "Open Typescript tab",
    async () => {

        await openTypescriptTab();
    },
    {
        action: "click"
    }
);

// ============================================================
// STEP 14 - VALIDATE ACTIVE API TRIGGER
// ============================================================

// ai-studio-step-id: pwnlnwrm00
await leapwork.step(
    "Validate API trigger code and markers",
    async () => {

        await validateActiveApiTrigger();
    },
    {
        action: "validate"
    }
);

// ============================================================
// STEP 15 - OPEN REGISTRATIONS AGAIN
// ============================================================

// ai-studio-step-id: pwb1w4e900
await leapwork.step(
    "Open Registrations tab again",
    async () => {

        await openRegistrationsTab();
    },
    {
        action: "click"
    }
);

// ============================================================
// STEP 16 - OPEN API TRIGGER ACTIONS
// ============================================================

// ai-studio-step-id: pw10or4040
await leapwork.step(
    "Open API endpoint trigger actions",
    async () => {

        await expect(registrationsTab).toHaveClass(
            /tab--active/,
            {
                timeout: ACTION_TIMEOUT
            }
        );

        const moreActionsButton = page.locator(
            "button.api-trigger-card-menu-button"
        );

        await expect(moreActionsButton).toHaveCount(1, {
            timeout: ACTION_TIMEOUT
        });

        await expect(moreActionsButton).toBeVisible({
            timeout: ACTION_TIMEOUT
        });

        await expect(moreActionsButton).toBeEnabled();

        await moreActionsButton.scrollIntoViewIfNeeded();

        await moreActionsButton.click();

        await expect(contextMenu).toBeVisible({
            timeout: ACTION_TIMEOUT
        });

        await expect(
            contextMenu.getByText(
                "Delete",
                {
                    exact: true
                }
            )
        ).toBeVisible({
            timeout: ACTION_TIMEOUT
        });

        logInfo(
            "API endpoint trigger actions opened."
        );
    },
    {
        action: "click"
    }
);

// ============================================================
// STEP 17 - DELETE API TRIGGER
// ============================================================

// ai-studio-step-id: pw6zrxpz00
await leapwork.step(
    "Delete API endpoint trigger",
    async () => {

        const deleteOption = contextMenu.getByText(
            "Delete",
            {
                exact: true
            }
        );

        await expect(deleteOption).toBeVisible({
            timeout: ACTION_TIMEOUT
        });

        await deleteOption.click();

        logInfo("API endpoint trigger deleted.");
    },
    {
        action: "click"
    }
);

// ============================================================
// STEP 18 - OPEN TYPESCRIPT TAB
// ============================================================

// ai-studio-step-id: pwnxvn3400
await leapwork.step(
    "Open Typescript tab after trigger deletion",
    async () => {

        await openTypescriptTab();
    },
    {
        action: "click"
    }
);

// ============================================================
// STEP 19 - VALIDATE DELETED API TRIGGER
// ============================================================

// ai-studio-step-id: pw1kp96nl0
await leapwork.step(
    "Validate deleted API trigger remains commented",
    async () => {

        await validateDeletedApiTrigger();
    },
    {
        action: "validate"
    }
);

// ============================================================
// STEP 20 - LOGOUT
// ============================================================

// ai-studio-step-id: pw1szo3ci0
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
    "API Endpoint Trigger Creation and Deletion automation completed successfully."
);

logInfo(`Team: ${createdTeamName}`);
logInfo(`Trigger name: ${createdTriggerName}`);
logInfo(`Endpoint suffix: ${createdEndpointSuffix}`);

logInfo(
    "PASS: API trigger registration validated before deletion."
);

logInfo(
    "PASS: API trigger code is commented after deletion."
);

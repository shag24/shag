import { leapwork } from "./leapwork";

import { LoginFlow } from "@assets/ReusableFunctions/LoginFlow";
import { Asset1TeamCreation } from "@assets/Data Creation/1 - Team creation";
import { Logout } from "@assets/ReusableFunctions/Logout";

leapwork.configuration({
  timeoutMs: Number(
    leapwork.team.settings.get("timeoutMs")
    ?? leapwork.workspace.settings.get("timeoutMs")
  ) || 5000,
  enableSelfHeal:
    (leapwork.team.settings.get("enableSelfHeal")
      ?? leapwork.workspace.settings.get("enableSelfHeal")) !== "false",
  enableXpath:
    (leapwork.team.settings.get("enableXpath")
      ?? leapwork.workspace.settings.get("enableXpath")) !== "false",
  chromiumArgs:
    leapwork.team.settings.get("chromiumArgs")
      ?? leapwork.workspace.settings.get("chromiumArgs")
      ?? ["--deny-permission-prompts",
          "--disable-notifications"
        ],
  chromiumPrefs: leapwork.team.settings.get("chromiumPrefs")
      ?? leapwork.workspace.settings.get("chromiumPrefs")
      ?? { "credentials_enable_service": false,
          "profile":
          {
            "password_manager_enabled": false,
            "password_manager_leak_detection": false
          }
        },
});

// ai-studio-step-id: pwmt2bke00
await leapwork.step("Use test case: LoginFlow", async () => {
    return await LoginFlow();
}, { action: "asset_reference", linkedAssetType: "test-case" });


// ai-studio-step-id: pw1kgyaef0
await leapwork.step("Collapse expanded teams before creating a new team", async () => {
    const collapseButtons = page.locator(
        '.explorer-panel button[aria-label="Collapse folder"]:visible'
    );

    while (await collapseButtons.count() > 0) {
        await collapseButtons.first().click();
    }
}, {
    action: "click",
    enableXpath: false,
    continueOnFailure: true
});


// ai-studio-step-id: pwr8rpz500
await leapwork.step("Use test case: 1 - Team creation", async () => {
    return await Asset1TeamCreation();
}, { action: "asset_reference", linkedAssetType: "test-case" });


// ============================================================
// 3. GET DYNAMICALLY CREATED TEAM NAME
// ============================================================

const createdTeamName = leapwork.variables.get(
    "createdTeamName",
    leapwork.storage.LOCAL
) as string;

if (!createdTeamName) {
    throw new Error(
        "createdTeamName was not found after Team Creation."
    );
}

logInfo(
    `Created team name: ${createdTeamName}`
);


// ============================================================
// 5. RIGHT-CLICK DYNAMICALLY CREATED TEAM
// ============================================================

// ai-studio-step-id: pw1b466nk0
await leapwork.step(
    `Right-click the created team "${createdTeamName}"`,
    async () => {

        const createdTeam = page
            .locator(
                `.explorer-panel span.explorer-item-name[title="${createdTeamName}"]:visible`
            )
            .first();

        await expect(
            createdTeam
        ).toBeVisible({
            timeout: 30000
        });

        await createdTeam.click({
            button: "right"
        });

        await page.waitForTimeout(2000);
    },
    {
        action: "click"
    }
);


// ============================================================
// 6. OPEN IMPORT PLAYWRIGHT
// ============================================================

// ai-studio-step-id: pw1ig60pr0
await leapwork.step(
    "Click the Import submenu in the created team actions menu",
    async () => {

        const importOption = page
            .locator(
                '[aria-label="Context menu"]'
            )
            .getByText(
                "Import",
                {
                    exact: true
                }
            );

        await expect(
            importOption
        ).toHaveCount(1);

        await expect(
            importOption
        ).toBeVisible({
            timeout: 10000
        });

        await importOption.hover();

        await page.waitForTimeout(2000);
    },
    {
        action: "click"
    }
);


// ai-studio-step-id: pw154pxju0
await leapwork.step(
    "Click Import tests in the Import submenu",
    async () => {

        const importTests = page
            .locator(
                '[aria-label="Submenu"]'
            )
            .getByText(
                "Import tests",
                {
                    exact: true
                }
            );

        await expect(
            importTests
        ).toHaveCount(1);

        await expect(
            importTests
        ).toBeVisible({
            timeout: 10000
        });

        await importTests.click();

        await page.waitForTimeout(5000);
    },
    {
        action: "click"
    }
);

const ACTION_TIMEOUT = 15000;

// ai-studio-step-id: pwqr91q300
await leapwork.step("Upload the TC-40 SERVICE NOW LOGIN file", async () => {
    const browseButton = page.locator(
        "button.test-case-import-popup-browse-button"
    );

    await expect(browseButton).toBeVisible({ timeout: ACTION_TIMEOUT });

    const fileChooserPromise = page.waitForEvent("filechooser");
    await browseButton.click();

    const fileChooser = await fileChooserPromise as {
        setFiles: (filePath: string) => Promise<void>
    };

    await fileChooser.setFiles(leapwork.files.path("FL-19"));
}, {
    action: "input",
    enableXpath: false
});

// ai-studio-step-id: pwff31k900
await leapwork.step("Click the “Create test cases” button in the import dialog", async () => {
    // Click button "Create test cases"
    await page.getByRole('button', { name: 'Create test cases' }).click();
}, { action: "click", relativeXpath: ".//div[2]/div[3]/div/div[3]/div/button[2]" });

// ai-studio-step-id: pwhw02ts00
await leapwork.step("Validate the Add missing secrets popup", async () => {
    await expect(page.getByRole("heading", { name: "Add missing secrets" })).toBeVisible();
    await expect(page.getByText("Enter values for the destination team to continue.")).toBeVisible();
    await expect(page.getByText("pwd_servicenow", { exact: true })).toBeVisible();
    await expect(page.getByRole("button", { name: "Save and Continue" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Skip" })).toBeVisible();
}, {
    action: "validate",
    relativeXpath: "//*[@id=\"basic-popup-title\"]",
    enableXpath: false
});

// ai-studio-step-id: pw1ia3c100
await leapwork.step("Click the Skip button in the Save and Continue dialog.", async () => {
    // Click button "Skip"
    await page.getByRole('button', { name: 'Skip' }).click();
}, { action: "click", relativeXpath: ".//div[2]/div[2]/div[3]/div/div[2]/button[2]" });

// ai-studio-step-id: pw1m8dc5a0
await leapwork.step(
    `Validate imported test case under "${createdTeamName}"`,
    async () => {

        const importedTestCase = page
            .locator(
                ".explorer-panel"
            )
            .locator(
                "span"
            )
            .filter({
                hasText:
                    /SERVICE NOW LOGIN/i
            })
            .first();

        await expect(
            importedTestCase
        ).toBeVisible({
            timeout: 30000
        });

        logInfo(
            `Successfully validated imported test case "SERVICE NOW LOGIN" under team "${createdTeamName}".`
        );
    },
    {
        action: "validate"
    }
);


// ============================================================
// 12. VALIDATE IMPORTED TEST CASE CONTENT
// ============================================================

// ai-studio-step-id: pw10pu6j80
await leapwork.step(
    "Validate the imported test case contains the expected name",
    async () => {

        const testCaseItem = page
            .locator(
                ".explorer-panel span"
            )
            .filter({
                hasText:
                    /SERVICE NOW LOGIN/i
            })
            .first();

        await expect(
            testCaseItem
        ).toBeVisible({
            timeout: 30000
        });

        await expect(
            testCaseItem
        ).toContainText(
            /SERVICE NOW LOGIN/i
        );

        logInfo(
            "Imported test case name was validated successfully."
        );
    },
    {
        action: "validate"
    }
);


// ai-studio-step-id: pw1vrg4iv0
await leapwork.step(
  `Right-click ${createdTeamName} in the Leapwork Play explorer`,
  async () => {
    const team = page.locator(
      `.explorer-panel span.explorer-item-name[title=${JSON.stringify(createdTeamName)}]`,
    );

    await expect(team).toHaveCount(1);
    await expect(team).toBeVisible();
    await team.click({ button: "right" });
  },
  {
    action: "click",
    relativeXpath: `.//span[@title=${JSON.stringify(createdTeamName)}]`,
  },
);

// ai-studio-step-id: pweq50zf00
await leapwork.step("Click Delete in the context menu", async () => {
    // Click menuitem "Delete"
    await page.getByRole('menuitem', { name: 'Delete' }).click();
}, { action: "click", relativeXpath: ".//div[2]/div[1]/div[2]/div[2]/div[@aria-label=\"Context menu\"]/div[6]" });

// ai-studio-step-id: pw1g16ei00
await leapwork.step(
  `Click the Delete button to confirm deleting team "${createdTeamName}"`,
  async () => {
    await page.getByRole("button", { name: "Delete", exact: true }).click();
  },
  {
    action: "click",
    relativeXpath: ".//div[2]/div[2]/div[3]/div/div/button[2]",
  },
);

// ai-studio-step-id: pw1gu90ts0
await leapwork.step("Use test case: Logout", async () => {
    return await Logout();
}, { action: "asset_reference", linkedAssetType: "test-case" });

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

const ACTION_TIMEOUT = 20000;

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


// ai-studio-step-id: pw1bf8sdu0
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

// ai-studio-step-id: pw1vce3yb0
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

// ai-studio-step-id: pw1n5w52w0
await leapwork.step("Click Create test cases in the test case import dialog", async () => {
    // Click button "Create test cases"
    await page.getByRole('button', { name: 'Create test cases' }).click();
}, { action: "click", relativeXpath: ".//div[2]/div[3]/div/div[3]/div/button[2]" });

// ai-studio-step-id: pwpziloz00
await leapwork.step("Click the pwd_servicenow password field", async () => {
    // Click textbox "pwd_servicenow"
    await page.getByRole('textbox', { name: 'pwd_servicenow' }).click();
}, { action: "click", relativeXpath: ".//div[2]/div[3]/div/div[1]/label/input" });

// ai-studio-step-id: pw11gr8rj0
await leapwork.step("Fill the pwd_servicenow password field on the ServiceNow login test case", async () => {
    // Fill textbox "pwd_servicenow"
    await page.getByRole('textbox', { name: 'pwd_servicenow' }).fill(leapwork.variables.getSecret("pwd_4ZvWTF24"));
}, { action: "input", relativeXpath: ".//div[2]/div[3]/div/div[1]/label/input" });

// ai-studio-step-id: pwuiyow000
await leapwork.step("Click Save and Continue for the password field `pwd_servicenow`", async () => {
    // Click button "Save and Continue"
    await page.getByRole('button', { name: 'Save and Continue' }).click();
}, { action: "click", relativeXpath: ".//div[2]/div[2]/div[3]/div/div[2]/button[1]" });


// ai-studio-step-id: pw14gj4o00
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

// ai-studio-step-id: pw16c98100
await leapwork.step(
    `Open the created team "${createdTeamName}" tab`,
    async () => {
        const teamTab = page.getByRole("button", {
            name: `TM-1 ${createdTeamName} close`,
            exact: true
        });

        await expect(teamTab).toBeVisible({ timeout: 30000 });
        await teamTab.click();
    },
    { action: "click", enableXpath: false }
);

// ai-studio-step-id: pw1d2z00p0
await leapwork.step("Click the Variables & Secrets tab in Team settings navigation", async () => {
    // Click button "Variables & Secrets"
    await page.getByRole('button', { name: 'Variables & Secrets' }).click();
}, { action: "click", relativeXpath: ".//div[2]/div[1]/div/div/nav[@aria-label=\"Team settings navigation\"]/button[3]" });


// ai-studio-step-id: pw2yycsy00
await leapwork.step("Validate secret in the Secrets section", async () => {
    await expect(page.getByText("pwd_servicenow", { exact: true })).toBeVisible();
    await expect(page.getByText("1 asset", { exact: true })).toHaveCount(1);
}, {
    action: "validate",
    enableXpath: false
});


// ai-studio-step-id: pwr24l8z00
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

// ai-studio-step-id: pw1pin7mo0
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


// ai-studio-step-id: pw1aev5k50
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

// ai-studio-step-id: pw128c5v20
await leapwork.step("Click the Browse button in the Import Tests dialog", async () => {
    // Click button "Browse"
    await page.getByRole('button', { name: 'Browse' }).click();
}, { action: "click", relativeXpath: ".//div[2]/div[2]/div[3]/div/div[1]/button" });

// ai-studio-step-id: pw12coasx0
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

// ai-studio-step-id: pwcye99s00
await leapwork.step("Click Create test cases in the test case import dialog", async () => {
    // Click button "Create test cases"
    await page.getByRole('button', { name: 'Create test cases' }).click();
}, { action: "click", relativeXpath: ".//div[2]/div[3]/div/div[3]/div/button[2]" });

// ai-studio-step-id: pw1q2e8940
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

// ai-studio-step-id: pw62ttgv00
await leapwork.step(
    `Open the created team "${createdTeamName}" tab`,
    async () => {
        const teamTab = page.getByRole("button", {
            name: `TM-1 ${createdTeamName} close`,
            exact: true
        });

        await expect(teamTab).toBeVisible({ timeout: 30000 });
        await teamTab.click();
    },
    { action: "click", enableXpath: false }
);

// ai-studio-step-id: pwxethc600
await leapwork.step("Click the Variables & Secrets tab in Team settings navigation", async () => {
    // Click button "Variables & Secrets"
    await page.getByRole('button', { name: 'Variables & Secrets' }).click();
}, { action: "click", relativeXpath: ".//div[2]/div[1]/div/div/nav[@aria-label=\"Team settings navigation\"]/button[3]" });


// ai-studio-step-id: pwnlm9yy00
await leapwork.step("Validate secrets in the Secrets section", async () => {
    await expect(page.getByText("pwd_servicenow", { exact: true })).toBeVisible();
    await expect(page.getByText("2 assets", { exact: true })).toHaveCount(1);
}, {
    action: "validate",
    enableXpath: false
});

// ai-studio-step-id: pwb8q25900
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

// ai-studio-step-id: pwk6eor400
await leapwork.step("Click Delete in the context menu", async () => {
    // Click menuitem "Delete"
    await page.getByRole('menuitem', { name: 'Delete' }).click();
}, { action: "click", relativeXpath: ".//div[2]/div[1]/div[2]/div[2]/div[@aria-label=\"Context menu\"]/div[6]" });

// ai-studio-step-id: pwgdynbj00
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

// Warning: Do not delete this step. It is linked to the validate step above.
// await leapwork.step("Get value from Secret name", async () => {
//     // Get value from span
//     const lw_value = (await page.getByText('Secret name').textContent())?.trim() ?? '';
//     leapwork.variables.set("lw_secretName", lw_value, leapwork.storage.LOCAL);
// }, { action: "get_value", enableXpath: false, relativeXpath: ".//div[2]/div[7]/div[4]/div[1]/div[1]/span[1]" });

// ai-studio-step-id: pw1szo3ci0
await leapwork.step("Use test case: Logout", async () => {
    return await Logout();
}, { action: "asset_reference", linkedAssetType: "test-case" });

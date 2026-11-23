import { leapwork } from "./leapwork";

import { Asset1TeamCreation } from "@assets/Data Creation/1 - Team creation";
import { LoginFlow } from "@assets/ReusableFunctions/LoginFlow";
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
// 4. CLICK CREATE NEW
// ============================================================

// ai-studio-step-id: pwnx8vxk00
await leapwork.step(
    `Validate the Create new button for "${createdTeamName}"`,
    async () => {

        const team = page
            .locator(
                `.explorer-panel span.explorer-item-name[title="${createdTeamName}"]`
            )
            .first();

        await expect(team).toBeVisible();

        await team.hover();

        const createButton = page.getByRole(
            "button",
            {
                name: `Create new in ${createdTeamName}`,
                exact: true
            }
        );

        await expect(createButton).toHaveCount(1);
        await expect(createButton).toBeVisible();

        await page.waitForTimeout(5000);
    },
    {
        action: "validate"
    }
);


// ============================================================
// 5. CLICK NEW RUNLIST FROM CREATE MENU
// ============================================================

// ai-studio-step-id: pw2wggqz00
await leapwork.step(
    `Click the Create new button for "${createdTeamName}"`,
    async () => {

        const createButton = page.getByRole(
            "button",
            {
                name: `Create new in ${createdTeamName}`,
                exact: true
            }
        );

        await expect(createButton).toHaveCount(1);
        await expect(createButton).toBeVisible();

        await createButton.click({
            force: true
        });

        await page.waitForTimeout(5000);
    },
    {
        action: "click"
    }
);


// ============================================================
// 6. CREATE RUNLIST
// ============================================================

// ai-studio-step-id: pw4zftz600
await leapwork.step(
    `Click the New runlist option for "${createdTeamName}"`,
    async () => {

        const newRunlistOption = page
            .locator('[aria-label="Context menu"]')
            .getByText(
                "New runlist",
                {
                    exact: true
                }
            );

        await expect(newRunlistOption).toHaveCount(1);
        await expect(newRunlistOption).toBeVisible();

        await newRunlistOption.click();

        await page.waitForTimeout(5000);
    },
    {
        action: "click"
    }
);


// ============================================================
// 7. VALIDATE NEW RUNLIST
// ============================================================

// ai-studio-step-id: pwiv733t00
await leapwork.step(
    "Press Enter to create the new runlist",
    async () => {

        await page.keyboard.press("Enter");

        await page.waitForTimeout(5000);
    },
    {
        action: "keydown"
    }
);


// ============================================================
// 8. CLICK NEW RUNLIST
// ============================================================

// ai-studio-step-id: pwiirgt000
await leapwork.step(
    'Validate that "New runlist" is displayed in the explorer',
    async () => {

        const newRunlist = page
            .locator(
                '.explorer-panel span.explorer-item-name[title="New runlist"]'
            )
            .first();

        await expect(newRunlist).toBeVisible();

        await page.waitForTimeout(5000);
    },
    {
        action: "validate"
    }
);

// ai-studio-step-id: pw70hs5l00
await leapwork.step(
    "Click the New runlist item in the explorer",
    async () => {

        const newRunlist = page
            .locator(
                '.explorer-panel span.explorer-item-name[title="New runlist"]'
            )
            .first();

        await expect(newRunlist).toBeVisible();

        await newRunlist.click();

        await page.waitForTimeout(5000);
    },
    {
        action: "click"
    }
);

// ai-studio-step-id: pw1qbscuv0
await leapwork.step("Click the Run settings tab in Leapwork Play", async () => {
    // Click span
    await page.getByRole('button', { name: 'Run settings' }).click();
}, { action: "click", relativeXpath: ".//div/div/div/div[2]/span/span" });

// ai-studio-step-id: pw1ltefe70
await leapwork.step("Click the Browser type dropdown in Run settings (currently Google Chromium)", async () => {
    // Click button "Browser type"
    await page.getByRole('button', { name: 'Browser type' }).click();
}, { action: "click", relativeXpath: ".//div/div[2]/div[1]/div/div/div[@aria-label=\"Browser type\"]" });

// ai-studio-step-id: pwvu2iz400
await leapwork.step("Click Microsoft Edge in the Run settings Browser type menu", async () => {
    // Click div
    await page.getByText('Microsoft Edge').click();
}, { action: "click", relativeXpath: ".//body/div[6]/div[2]" });

// ai-studio-step-id: pw1shp3l50
await leapwork.step("Close the RL-1 New runlist tab", async () => {
    const runListTab = page.getByRole("button", {
        name: "RL-1 New runlist close"
    });

    const tabBounds = await runListTab.boundingBox();

    if (!tabBounds) {
        throw new Error("RL-1 New runlist tab was not found");
    }

    await runListTab.click({
        position: {
            x: tabBounds.width - 10,
            y: tabBounds.height / 2
        }
    });
}, {
    action: "click",
    relativeXpath: ".//div[2]/div[2]/div[1]/div/div/div[3]",
    enableXpath: false
});

// ai-studio-step-id: pw1kqhipo0
await leapwork.step("Double-click the New runlist item in the explorer", async () => {
    const newRunlist = page
        .locator('.explorer-panel span.explorer-item-name[title="New runlist"]')
        .first();

    await expect(newRunlist).toBeVisible({ timeout: 30000 });
    await newRunlist.dblclick();
}, {
    action: "dblclick"
});

// ai-studio-step-id: pw1ymkk8t0
await leapwork.step("Validate the Browser type in Run settings is Microsoft Edge", async () => {
    await expect(page.locator('[aria-label="Browser type"]')).toContainText("Microsoft Edge");
}, {
    action: "validate",
    relativeXpath: ".//div/div[2]/div[1]/div/div/div[@aria-label=\"Browser type\"]",
    enableXpath: false
});

// Warning: Do not delete this step. It is linked to the validate step above.
// await leapwork.step("Get value from Browser type", async () => {
//     // Get value from button "Browser type"
//     const lw_value = (await page.getByRole('button', { name: 'Browser type' }).textContent())?.trim() ?? '';
//     leapwork.variables.set("lw_browserType", lw_value, leapwork.storage.LOCAL);
// }, { action: "get_value", enableXpath: false, relativeXpath: ".//div/div[2]/div[1]/div/div/div[@aria-label=\"Browser type\"]" });

// ai-studio-step-id: pwhaq2dh00
await leapwork.step("Click the Browser type dropdown in Run settings showing Microsoft Edge", async () => {
    // Click button "Browser type"
    await page.getByRole('button', { name: 'Browser type' }).click();
}, { action: "click", relativeXpath: ".//div/div[2]/div[1]/div/div/div[@aria-label=\"Browser type\"]" });

// ai-studio-step-id: pw1nyktko0
await leapwork.step("Click the Browser type button and select Google Chromium in Run settings", async () => {
    // Click div
    await page.getByText('Google Chromium').click();
}, { action: "click", relativeXpath: ".//body/div[6]/div[1]" });

// ai-studio-step-id: pwoi5kk700
await leapwork.step("Close the RL-1 New runlist tab", async () => {
    const runListTab = page.getByRole("button", {
        name: "RL-1 New runlist close"
    });

    const tabBounds = await runListTab.boundingBox();

    if (!tabBounds) {
        throw new Error("RL-1 New runlist tab was not found");
    }

    await runListTab.click({
        position: {
            x: tabBounds.width - 10,
            y: tabBounds.height / 2
        }
    });
}, {
    action: "click",
    relativeXpath: ".//div[2]/div[2]/div[1]/div/div/div[3]",
    enableXpath: false
});

// ai-studio-step-id: pw25w09o00
await leapwork.step("Double-click the New runlist item in the explorer", async () => {
    const newRunlist = page
        .locator('.explorer-panel span.explorer-item-name[title="New runlist"]')
        .first();

    await expect(newRunlist).toBeVisible({ timeout: 30000 });
    await newRunlist.dblclick();
}, {
    action: "dblclick"
});

// ai-studio-step-id: pwdjebco00
await leapwork.step("Validate the Browser type on Run settings is \"Google Chromium\"", async () => {
    // Assert span contains "Google Chromium"
    await expect(page.getByRole('button', { name: 'Browser type' })).toContainText("Google Chromium");
}, { action: "validate", relativeXpath: ".//div[2]/div[1]/div/div/div[@aria-label=\"Browser type\"]/span", enableXpath: false });

// Warning: Do not delete this step. It is linked to the validate step above.
// await leapwork.step("Get value from Google Chromium", async () => {
//     // Get value from span
//     const lw_value = (await page.getByRole('button', { name: 'Browser type' }).textContent())?.trim() ?? '';
//     leapwork.variables.set("lw_googleChromium", lw_value, leapwork.storage.LOCAL);
// }, { action: "get_value", enableXpath: false, relativeXpath: ".//div[2]/div[1]/div/div/div[@aria-label=\"Browser type\"]/span" });

// ai-studio-step-id: pwf607y200
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

// ai-studio-step-id: pw41hiku00
await leapwork.step("Click Delete in the context menu", async () => {
    // Click menuitem "Delete"
    await page.getByRole('menuitem', { name: 'Delete' }).click();
}, { action: "click", relativeXpath: ".//div[2]/div[1]/div[2]/div[2]/div[@aria-label=\"Context menu\"]/div[6]" });

// ai-studio-step-id: pw1sy8e400
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

// ai-studio-step-id: pws1hxp000
await leapwork.step("Use test case: Logout", async () => {
    return await Logout();
}, { action: "asset_reference", linkedAssetType: "test-case" });

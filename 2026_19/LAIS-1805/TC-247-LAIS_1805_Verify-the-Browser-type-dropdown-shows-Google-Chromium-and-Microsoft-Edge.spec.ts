import { leapwork } from "./leapwork";

import { Asset1TeamCreation } from "@assets/Data Creation/1 - Team creation";
import { Logout } from "@assets/ReusableFunctions/Logout";
import { LoginFlow } from "@assets/ReusableFunctions/LoginFlow";

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



// ai-studio-step-id: pwmvzlqp00
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
// 4. CLICK CREATE NEW
// ============================================================

// ai-studio-step-id: pwuwy6pg00
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
// 5. CLICK NEW RUNLIST FROM CREATE MENU
// ============================================================

// ai-studio-step-id: pw1kaq6dz0
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
// 6. CREATE RUNLIST
// ============================================================

// ai-studio-step-id: pwy9ta6y00
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
// 7. VALIDATE NEW RUNLIST
// ============================================================

// ai-studio-step-id: pw1uzi0f10
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


// ============================================================
// 8. CLICK NEW RUNLIST
// ============================================================

// ai-studio-step-id: pwp3nhua00
await leapwork.step("Double-click the New runlist item in the explorer", async () => {
    const newRunlist = page
        .locator('.explorer-panel span.explorer-item-name[title="New runlist"]')
        .first();

    await expect(newRunlist).toBeVisible({ timeout: 30000 });
    await newRunlist.dblclick();
}, {
    action: "dblclick"
});

// ai-studio-step-id: pw1oly4tv0
await leapwork.step("Click the Run settings button on the Leapwork Play page", async () => {
    // Click span
    await page.getByRole('button', { name: 'Run settings' }).click();
}, { action: "click", relativeXpath: ".//div/div/div/div[2]/span/span" });

// ai-studio-step-id: pw1iuwv1z0
await leapwork.step("Click the Browser type dropdown to select Google Chromium", async () => {
    // Click button "Browser type"
    await page.getByRole('button', { name: 'Browser type' }).click();
}, { action: "click", relativeXpath: ".//div/div[2]/div[1]/div/div/div[@aria-label=\"Browser type\"]" });

// ai-studio-step-id: pw1yb6jyi0
await leapwork.step(
    "Verify the Browser type dropdown shows both browser options",
    async () => {
        await expect(page.getByText("Google Chromium", { exact: true }).nth(1)).toBeVisible();
        await expect(page.getByText("Microsoft Edge", { exact: true })).toBeVisible();
    },
    {
        action: "validate",
        relativeXpath: ".//body/div[7]/div[1]",
        enableXpath: false
    }
);


// ai-studio-step-id: pwftfaph00
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

// ai-studio-step-id: pwr8iijq00
await leapwork.step("Click Delete in the context menu", async () => {
    // Click menuitem "Delete"
    await page.getByRole('menuitem', { name: 'Delete' }).click();
}, { action: "click", relativeXpath: ".//div[2]/div[1]/div[2]/div[2]/div[@aria-label=\"Context menu\"]/div[6]" });

// ai-studio-step-id: pw1se0vnr0
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
// await leapwork.step("Get value from Google Chromium", async () => {
//     // Get value from div
//     const lw_value = (await page.getByText('Google Chromium').nth(1).textContent())?.trim() ?? '';
//     leapwork.variables.set("lw_googleChromium", lw_value, leapwork.storage.LOCAL);
// }, { action: "get_value", enableXpath: false, relativeXpath: ".//body/div[7]/div[1]" });


// Warning: Do not delete this step. It is linked to the validate step above.
// await leapwork.step("Get value from Microsoft Edge", async () => {
//     // Get value from div
//     const lw_value = (await page.getByText('Microsoft Edge').textContent())?.trim() ?? '';
//     leapwork.variables.set("lw_microsoftEdge", lw_value, leapwork.storage.LOCAL);
// }, { action: "get_value", enableXpath: false, relativeXpath: ".//body/div[7]/div[2]" });

// ai-studio-step-id: pw1gu90ts0
await leapwork.step("Use test case: Logout", async () => {
    return await Logout();
}, { action: "asset_reference", linkedAssetType: "test-case" });

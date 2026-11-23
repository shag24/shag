import { leapwork } from "./leapwork";

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

// ============================================================
// TEST DATA
// ============================================================

const ACTION_TIMEOUT = 15000;
const EXPORT_WAIT = 10000;

const TEST_CASE_NAME = "SERVICE NOW LOGIN";


// ai-studio-step-id: pwmt2bke00
await leapwork.step("Use test case: LoginFlow", async () => {
    return await LoginFlow();
}, { action: "asset_reference", linkedAssetType: "test-case" });


// ai-studio-step-id: pw1052rxn0
await leapwork.step("Expand the New Team (Dont) folder", async () => {
    const folder = page.locator('.explorer-panel span.explorer-item-name[title="New Team (Dont)"]');
    await folder.locator('xpath=ancestor::div[.//button[@aria-label="Expand folder"]][1]')
        .getByRole("button", { name: "Expand folder" }).click();
}, { action: "click", relativeXpath: ".//div[2]/div[2]/div[2]/div[1]/div/button[@aria-label=\"Expand folder\"]" });

// ai-studio-step-id: pw1m5abc60
await leapwork.step("Expand the shruti folder", async () => {
    const folder = page.locator('.explorer-panel span.explorer-item-name[title="shruti"]');
    await folder.locator('xpath=ancestor::div[.//button[@aria-label="Expand folder"]][1]')
        .getByRole("button", { name: "Expand folder" }).click();
}, { action: "click", relativeXpath: ".//div[2]/div[1]/div[2]/div[4]/div/button[@aria-label=\"Expand folder\"]" });

// ai-studio-step-id: pw1n183bh0
await leapwork.step("Expand the LAIS-1783 folder", async () => {
    const folder = page.locator('.explorer-panel span.explorer-item-name[title="LAIS-1783"]');
    await folder.locator('xpath=ancestor::div[.//button[@aria-label="Expand folder"]][1]')
        .getByRole("button", { name: "Expand folder" }).click();
}, { action: "click", relativeXpath: ".//div[2]/div[4]/div[2]/div[2]/div/button[@aria-label=\"Expand folder\"]" });

// ai-studio-step-id: pw10ooxvi0
await leapwork.step(
    'Validate that "SERVICE NOW LOGIN"',
    async () => {

        const testCase =
            page.locator(
                '.explorer-panel span.explorer-item-name[title="SERVICE NOW LOGIN"]:visible'
            ).first();

        await expect(
            testCase
        ).toBeVisible({
            timeout: 30000
        });

        logInfo(
            'Successfully validated "SERVICE NOW LOGIN".'
        );
    },
    {
        action: "validate"
    }
);

// ai-studio-step-id: pwso1fu100
await leapwork.step("Right-click the TC-40 “SERVICE NOW LOGIN” item", async () => {
    // Right-click "SERVICE NOW LOGIN"
    await page.getByText('TC-40').click({ button: 'right' });
}, { action: "click", relativeXpath: ".//div[2]/div[2]/div[2]/div/div/span[3]" });

// ai-studio-step-id: pw189tnls0
await leapwork.step("Click Export tests from the context menu", async () => {
    // Click span
    await page.getByText('Export tests').click();
}, { action: "click", relativeXpath: ".//div[2]/div[2]/div[@aria-label=\"Context menu\"]/div[3]/span/span" });


// ai-studio-step-id: pw4ysxo000
await leapwork.step("Click the Collapse folder button for LAIS-1783", async () => {
    // Click button "Collapse folder"
    await page.getByRole('button', { name: 'Collapse folder' }).nth(2).click();
}, { action: "click", relativeXpath: ".//div[2]/div[4]/div[2]/div[2]/div[1]/button[@aria-label=\"Collapse folder\"]" });

// ai-studio-step-id: pwbeyeqj00
await leapwork.step("Click the Collapse folder button for the shruti folder", async () => {
    // Click button "Collapse folder"
    await page.getByRole('button', { name: 'Collapse folder' }).nth(1).click();
}, { action: "click", relativeXpath: ".//div[2]/div[1]/div[2]/div[4]/div[1]/button[@aria-label=\"Collapse folder\"]" });

// ai-studio-step-id: pw1rqxh5k0
await leapwork.step("Click the Collapse folder button for New Team (Dont)", async () => {
    // Click button "Collapse folder"
    await page.getByRole('button', { name: 'Collapse folder' }).click();
}, { action: "click", relativeXpath: ".//div[2]/div[2]/div[2]/div[1]/div[1]/button[@aria-label=\"Collapse folder\"]" });

// ai-studio-step-id: pwxpbj7o00
await leapwork.step("Use test case: Logout", async () => {
    return await Logout();
}, { action: "asset_reference", linkedAssetType: "test-case" });

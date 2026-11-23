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

// ai-studio-step-id: pwmt2bke00
await leapwork.step("Use test case: LoginFlow", async () => {
    return await LoginFlow();
}, { action: "asset_reference", linkedAssetType: "test-case" });


// Warning: Do not delete this step. It is linked to the validate step above.
// await leapwork.step("Get value from Test Cases Created", async () => {
//     // Get value from dialog "Test Cases Created"
//     const lw_value = (await page.getByRole('dialog', { name: 'Test Cases Created' }).textContent())?.trim() ?? '';
//     leapwork.variables.set("lw_testCasesCreated", lw_value, leapwork.storage.LOCAL);
// }, { action: "get_value", enableXpath: false, relativeXpath: ".//div[2]/div/div[2]/div/div[2]/div" });

// ai-studio-step-id: pw130ope70
await leapwork.step("Expand the LAIS-1805 folder hierarchy", async () => {
    for (const name of ["New Team (Dont)", "shruti", "LAIS-1805"]) {
        const folder = page.locator(
            `.explorer-panel span.explorer-item-name[title="${name}"]`
        );
        await expect(folder).toBeVisible({ timeout: 30000 });

        const row = folder.locator(
            "xpath=ancestor::div[.//button[@aria-label='Expand folder' or @aria-label='Collapse folder']][1]"
        );
        const expandButton = row.getByRole("button", {
            name: "Expand folder",
            exact: true
        });

        if (await expandButton.count()) await expandButton.click();
    }
}, { action: "click", enableXpath: false });


// ai-studio-step-id: pw16gj5kg0
await leapwork.step("Double-click the KB-20 knowledge base item labeled “New knowledge base”", async () => {
    // Double-click "New knowledge base"
    await page.getByText('KB-').dblclick();
}, { action: "dblclick", relativeXpath: ".//div[2]/div[2]/div[2]/div[1]/div/span[3]" });


// ai-studio-step-id: pwzzh63m00
await leapwork.step("Click the Blueprint tab", async () => {
    // Click span
    await page.getByRole('button', { name: 'Blueprint' }).click();
}, { action: "click", relativeXpath: ".//div/div/div/div[2]/span/span" });

// ai-studio-step-id: pw11icbln0
await leapwork.step("Click the Booking Review and Add-ons description text", async () => {
    // Click div
    await page.getByText('Verify itinerary and').click();
}, { action: "click", relativeXpath: ".//div/div/div[7]/div/section[1]/div[2]" });

// ai-studio-step-id: pwm4k8tg00
await leapwork.step("Right-click the Booking Review and Add-ons section", async () => {
    // Right-click div
    await page.getByText('Verify itinerary and').click({ button: 'right' });
}, { action: "click", relativeXpath: ".//div/div/div[7]/div/section[1]/div[2]" });

// ai-studio-step-id: pw1wkfr4r0
await leapwork.step("Click Create test cases in Leapwork Play\\Blueprints", async () => {
    // Click span
    await page.getByText('Create test cases', { exact: true }).click();
}, { action: "click", relativeXpath: ".//div[2]/div/div[@aria-label=\"Context menu\"]/div[1]/span/span" });

// ai-studio-step-id: pw1mo3zkl0
await leapwork.step("Validate the “OK” button in the “Test Cases Created” dialog on Leapwork Play", async () => {
    // Assert div contains "OK"
    await expect(page.locator('div').filter({ hasText: /^OK$/ })).toContainText("OK");
}, { action: "validate", relativeXpath: ".//div/div[2]/div/div[2]/div/div", enableXpath: false });

// Warning: Do not delete this step. It is linked to the validate step above.
// await leapwork.step("Get value from OK", async () => {
//     // Get value from div
//     const lw_value = (await page.locator('div').filter({ hasText: /^OK$/ }).textContent())?.trim() ?? '';
//     leapwork.variables.set("lw_oK", lw_value, leapwork.storage.LOCAL);
// }, { action: "get_value", enableXpath: false, relativeXpath: ".//div/div[2]/div/div[2]/div/div" });

// ai-studio-step-id: pw1gqd5480
await leapwork.step("Click OK to confirm that 1 test case was created in 1 folder", async () => {
    // Click button "OK"
    await page.getByRole('button', { name: 'OK', exact: true }).click();
}, { action: "click", relativeXpath: ".//div[2]/div/div[2]/div/div/button" });

// ai-studio-step-id: pw1wshwv90
await leapwork.step("Right-click Booking Review and Add-ons in the Leapwork Play explorer", async () => {
    // Right-click "Booking Review and Add-ons"
    await page.locator('span').filter({ hasText: /^Booking Review and Add-ons$/ }).click({ button: 'right' });
}, { action: "click", relativeXpath: ".//div[2]/div[2]/div[2]/div[1]/div/span[2]" });

// ai-studio-step-id: pw1ppaih60
await leapwork.step("Click Delete in the context menu for “Booking Review and Add-ons”", async () => {
    // Click menuitem "Delete"
    await page.getByRole('menuitem', { name: 'Delete' }).click();
}, { action: "click", relativeXpath: ".//div[2]/div[1]/div[2]/div[2]/div[@aria-label=\"Context menu\"]/div[4]" });

// ai-studio-step-id: pw19l6tgj0
await leapwork.step(
    'Confirm deleting the "Booking Review and Add-ons" folder',
    async () => {
        const deleteButton = page.getByRole("button", {
            name: "Delete",
            exact: true
        });

        await expect(deleteButton).toBeVisible({ timeout: 30000 });
        await expect(deleteButton).toBeEnabled();
        await deleteButton.click();
    },
    {
        action: "click",
        relativeXpath: ".//div[2]/div[2]/div[3]/div/div/button[2]"
    }
);

// ai-studio-step-id: pw1gu90ts0
await leapwork.step("Use test case: Logout", async () => {
    return await Logout();
}, { action: "asset_reference", linkedAssetType: "test-case" });

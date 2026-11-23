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


// Warning: Do not delete this step. It is linked to the validate step above.
// await leapwork.step("Get value from presentation", async () => {
//     // Get value from div
//     const lw_value = (await page.locator('.view-lines').textContent())?.trim() ?? '';
//     leapwork.variables.set("lw_presentation", lw_value, leapwork.storage.LOCAL);
// }, { action: "get_value", enableXpath: false, relativeXpath: ".//div/div/div[1]/div[3]/div[1]/div[4]" });

// ai-studio-step-id: pwmt2bke00
await leapwork.step("Use test case: LoginFlow", async () => {
    return await LoginFlow();
}, { action: "asset_reference", linkedAssetType: "test-case" });

// ai-studio-step-id: pw7efo8p00
await leapwork.step("Click the Expand folder button for New Team (Dont)", async () => {
    // Click button "Expand folder"
    await page.getByRole('button', { name: 'Expand folder' }).click();
}, { action: "click", relativeXpath: ".//div[2]/div[2]/div[2]/div[1]/div/button[@aria-label=\"Expand folder\"]" });

// ai-studio-step-id: pwob8xo600
await leapwork.step("Click the Collapse folder button for Test Data", async () => {
    // Click button "Collapse folder"
    await page.getByRole('button', { name: 'Collapse folder' }).nth(1).click();
}, { action: "click", relativeXpath: ".//div[2]/div[1]/div[2]/div[4]/div[1]/button[@aria-label=\"Collapse folder\"]", continueOnFailure: true });

// ai-studio-step-id: pwxukrqz00
await leapwork.step("Click the Expand folder button for the shruti folder", async () => {
    // Click button "Expand folder"
    await page.getByRole('button', { name: 'Expand folder' }).nth(2).click();
}, { action: "click", relativeXpath: ".//div[2]/div[1]/div[2]/div[3]/div/button[@aria-label=\"Expand folder\"]" });

// ai-studio-step-id: pwwzicbu00
await leapwork.step("Click the Expand folder button for LAIS-1543", async () => {
    // Click button "Expand folder"
    await page.getByRole('button', { name: 'Expand folder' }).nth(2).click();
}, { action: "click", relativeXpath: ".//div[2]/div[3]/div[2]/div[1]/div/button[@aria-label=\"Expand folder\"]" });


// ai-studio-step-id: pw5jgas200
await leapwork.step("Double-click the New agent item in the asset explorer", async () => {
    await page.getByText("New agent").first().dblclick();
}, {
    action: "click",
    relativeXpath: ".//div[2]/div[2]/div[2]/div[1]/div/span[4]"
});

// ai-studio-step-id: pwmt9a8x00
await leapwork.step("Click the Collapse chat button in Leapwork Play.", async () => {
    // Click button "Collapse chat"
    await page.getByRole('button', { name: 'Collapse chat' }).click();
}, { action: "click", relativeXpath: ".//div[2]/div[2]/div/div[2]/div[1]/button[@aria-label=\"Collapse chat\"]", continueOnFailure: true });

// Warning: Do not delete this step. It is linked to the validate step above.
// await leapwork.step("Get value from presentation", async () => {
//     // Get value from div
//     const lw_value = (await page.locator('.view-lines').textContent())?.trim() ?? '';
//     leapwork.variables.set("lw_presentation", lw_value, leapwork.storage.LOCAL);
// }, { action: "get_value", enableXpath: false, relativeXpath: ".//div/div/div[1]/div[3]/div[1]/div[4]" });

// Warning: Do not delete this step. It is linked to the validate step above.
// await leapwork.step("Get value from presentation", async () => {
//     // Get value from div
//     const lw_value = (await page.locator('.view-lines').textContent())?.trim() ?? '';
//     leapwork.variables.set("lw_presentation", lw_value, leapwork.storage.LOCAL);
// }, { action: "get_value", enableXpath: false, relativeXpath: ".//div/div/div[1]/div[3]/div[1]/div[4]" });

// ai-studio-step-id: pw1xf4mw00
await leapwork.step("Click the Typescript tab in Leapwork Play", async () => {
    await page.getByRole("button", { name: "Typescript", exact: true }).click();
}, {
    action: "click",
    relativeXpath: ".//div/div/div/div[2]/span/span"
});

// Warning: Do not delete this step. It is linked to the validate step above.
// await leapwork.step("Get value from presentation", async () => {
//     // Get value from div
//     const lw_value = (await page.locator('.view-lines').textContent())?.trim() ?? '';
//     leapwork.variables.set("lw_presentation", lw_value, leapwork.storage.LOCAL);
// }, { action: "get_value", enableXpath: false, relativeXpath: ".//div/div[1]/div[1]/div[3]/div[1]/div[4]" });

// ai-studio-step-id: pw3bot0n00
await leapwork.step("Verify both event subscriber triggers in the TypeScript editor", async () => {
    const editor = page.locator(".monaco-editor .view-lines");
    const code = (await editor.innerText())
        .replace(/\u00a0/g, " ")
        .replace(/\s+/g, " ");

    const requiredCode = [
        'key="event-subscriber-system.asset.created-registration-2548"',
        '// agent.registerEventSubscriber("system.asset.created"',
        'key="event-subscriber-system.asset.created-registration-2549"',
        'agent.registerEventSubscriber("system.asset.created"',
        "// Handle the event here."
    ];

    const missingCode = requiredCode.filter(text => !code.includes(text));

    if (missingCode.length > 0) {
        throw new Error(`Missing code: ${missingCode.join(", ")}`);
    }
}, {
    action: "validate",
    relativeXpath: ".//div/div[1]/div[1]/div[3]/div[1]/div[4]",
    enableXpath: false
});

// Warning: Do not delete this step. It is linked to the validate step above.
// await leapwork.step("Get value from presentation", async () => {
//     // Get value from div
//     const lw_value = (await page.locator('.view-lines').textContent())?.trim() ?? '';
//     leapwork.variables.set("lw_presentation", lw_value, leapwork.storage.LOCAL);
// }, { action: "get_value", enableXpath: false, relativeXpath: ".//div/div[1]/div[1]/div[3]/div[1]/div[4]" });

// ai-studio-step-id: pwxpbj7o00
await leapwork.step("Use test case: Logout", async () => {
    return await Logout();
}, { action: "asset_reference", linkedAssetType: "test-case" });


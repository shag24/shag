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
let runId ="";

const ACTION_TIMEOUT = 15000;
const TEAM_TIMEOUT = 30000;
const EXECUTION_TIMEOUT = 180000;

const refreshButton = page.getByRole(
    "button",
    {
        name: "Refresh",
        exact: true
    }
);

// ============================================================
// HELPER - GET CURRENT RUN ROW
// ============================================================

function getRunRow() {

    // Based on the working Run Log structure.
    // Replace this XPath if the Run Log DOM changes.

    return page.locator(
        "xpath=.//div/div[2]/section/div[5]/div[2]"
    );
}

// ai-studio-step-id: pwmt2bke00
await leapwork.step("Use test case: LoginFlow", async () => {
    return await LoginFlow();
}, { action: "asset_reference", linkedAssetType: "test-case" });

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

// ai-studio-step-id: pw1j5crp00
await leapwork.step("Double-click the RL-26 New runlist item", async () => {
    const runlist = page.getByText("RL-26", { exact: false }).first();

    await expect(runlist).toBeVisible({ timeout: 30000 });
    await runlist.dblclick();
}, {
    action: "dblclick",
    enableXpath: false
});

// ai-studio-step-id: pw1xno6e00
await leapwork.step("Click the Run settings button in Leapwork Play", async () => {
    // Click span
    await page.getByRole('button', { name: 'Run settings' }).click();
}, { action: "click", relativeXpath: ".//div/div/div/div[2]/span/span" });

// ai-studio-step-id: pwvurs7x00
await leapwork.step("Click the Browser type dropdown in Run settings showing Microsoft Edge", async () => {
    // Click button "Browser type"
    await page.getByRole('button', { name: 'Browser type' }).click();
}, { action: "click", relativeXpath: ".//div/div[2]/div[1]/div/div/div[@aria-label=\"Browser type\"]" });

// ai-studio-step-id: pwavjyc000
await leapwork.step("Click the Browser type dropdown and select Microsoft Edge", async () => {
    // Click div
    await page.getByText('Microsoft Edge').nth(1).click();
}, { action: "click", relativeXpath: ".//body/div[6]/div[2]" });

// ai-studio-step-id: pwh9e5pz00
await leapwork.step("Set \"Use default\" checkbox", async () => {
    // Check checkbox "Use default"
    await page.getByRole('checkbox', { name: 'Use default' }).check();
}, { action: "click", relativeXpath: ".//div/div[1]/div/div/label/input" });

// ai-studio-step-id: pwq6mvpp00
await leapwork.step("Click the Selection button in Leapwork Play", async () => {
    // Click span
    await page.getByRole('button', { name: 'Selection' }).click();
}, { action: "click", relativeXpath: ".//div/div/div/div[1]/span/span" });

// ============================================================
// STEP 26 - EXECUTE RUN LIST
// ============================================================

// ai-studio-step-id: pw1yvno1u0
await leapwork.step(
    "Execute Run List",
    async () => {

        const runNowButton = page.getByRole(
            "button",
            {
                name: "Run now",
                exact: true
            }
        );

        await expect(runNowButton).toBeVisible({
            timeout: ACTION_TIMEOUT
        });

        await expect(runNowButton).toBeEnabled();

        await runNowButton.click();

        logInfo("Run List execution started.");
    },
    {
        action: "click"
    }
);

// ============================================================
// STEP 27 - CAPTURE RUN ID
// ============================================================

// ai-studio-step-id: pw1bh32rv0
await leapwork.step(
    "Capture dynamically generated Run ID",
    async () => {

        const runIdLocator = page.locator(
            "xpath=.//div/div[2]/section/div[5]/div[2]/span[3]"
        );

        await expect(runIdLocator).toBeVisible({
            timeout: TEAM_TIMEOUT
        });

        runId = (
            await runIdLocator.innerText()
        ).trim();

        if (!runId) {
            throw new Error(
                "Run ID was not found after execution."
            );
        }

        leapwork.variables.set(
            "createdRunId",
            runId,
            leapwork.storage.LOCAL
        );

        logInfo(`Captured Run ID: ${runId}`);
    },
    {
        action: "get_value"
    }
);

// ============================================================
// STEP 28 - REFRESH RUN LOG
// ============================================================

// ai-studio-step-id: pw1045avr0
await leapwork.step(
    "Refresh Run log",
    async () => {

        await expect(refreshButton).toBeVisible({
            timeout: ACTION_TIMEOUT
        });

        await refreshButton.click();
    },
    {
        action: "click"
    }
);

// ============================================================
// STEP 29 - VALIDATE RUN STATUS
// ============================================================

// ai-studio-step-id: pwv1w1u000
await leapwork.step(
    "Validate Run List execution succeeded",
    async () => {

        const runRow = getRunRow();

        const runStatus = runRow.locator(
            "xpath=.//span[8]"
        );

        const deadline =
            Date.now() + EXECUTION_TIMEOUT;

        let latestStatus = "";

        while (Date.now() < deadline) {

            await expect(runRow).toContainText(
                runId,
                {
                    timeout: ACTION_TIMEOUT
                }
            );

            latestStatus = (
                await runStatus.innerText()
            ).trim();

            if (latestStatus === "SUCCEEDED") {
                break;
            }

            if (
                latestStatus === "FAILED" ||
                latestStatus === "CANCELLED" ||
                latestStatus === "ABORTED"
            ) {
                throw new Error(
                    `Run ${runId} ended with ${latestStatus}.`
                );
            }

            await page.waitForTimeout(3000);

            await expect(refreshButton).toBeVisible({
                timeout: ACTION_TIMEOUT
            });

            await refreshButton.click();
        }

        if (latestStatus !== "SUCCEEDED") {
            throw new Error(
                `Run ${runId} did not succeed within ` +
                `${EXECUTION_TIMEOUT}ms. ` +
                `Last status: ${latestStatus}`
            );
        }

        logInfo(
            `PASS: Run ${runId} SUCCEEDED.`
        );
    },
    {
        action: "click",
        timeoutMs: EXECUTION_TIMEOUT + 30000
    }
);


// ai-studio-step-id: pw11vz70d0
await leapwork.step("Click the succeeded run in the run log", async () => {
   
    await page.getByText(`${runId}`).click();
}, {
    action: "click",
    relativeXpath: ".//div/div/div[2]/section/div[5]/div[2]"
});


// ai-studio-step-id: pw1ebxnqs0
await leapwork.step(`Click Run information for run ${runId}`, async () => {
    await page.locator(`aside[aria-label="Run ${runId}"]`)
        .getByRole("button", { name: "Run information" })
        .click({ timeout: 20000 });
}, {
    action: "click",
    enableXpath: false
});

// ai-studio-step-id: pw126iob90
await leapwork.step("Verify the Browser type is Microsoft Edge", async () => {
    await expect(
        page.locator("xpath=.//div/dl/div[1]/div[2]/div[5]/strong")
    ).toHaveText("Microsoft Edge", { timeout: 40000 });
}, {
    action: "validate",
    relativeXpath: ".//div/dl/div[1]/div[2]/div[5]/strong",
    enableXpath: false
});

// Warning: Do not delete this step. It is linked to the validate step above.
// await leapwork.step("Get value from Microsoft Edge", async () => {
//     // Get value from strong
//     const lw_value = await page.getByText('Microsoft Edge').getAttribute('title');
//     leapwork.variables.set("lw_microsoftEdge", lw_value, leapwork.storage.LOCAL);
// }, { action: "get_value", enableXpath: false, relativeXpath: ".//div/dl/div[1]/div[2]/div[5]/strong" });

// ai-studio-step-id: pw112he600
await leapwork.step("Click the Close button in the run details dialog", async () => {
    // Click button "Close"
    await page.getByText('Close').click();
}, { action: "click", relativeXpath: ".//section/div[6]/div/div/div/button" });

// ai-studio-step-id: pwsri4dd00
await leapwork.step("Click Close on the run details panel", async () => {
    // Click button "Close"
    await page.getByRole('button', { name: 'Close', exact: true }).click();
}, { action: "click", relativeXpath: ".//section/div[6]/aside[@aria-label=\"Run fp1newyG\"]/header/div[2]/button[@aria-label=\"Close\"]" });

// ai-studio-step-id: pw17t1inc0
await leapwork.step("Click the Selection button.", async () => {
    // Click span
    await page.getByRole('button', { name: 'Selection' }).click();
}, { action: "click", relativeXpath: ".//div/div/div/div[1]/span/span" });

// ============================================================
// STEP 26 - EXECUTE RUN LIST
// ============================================================

// ai-studio-step-id: pw1y9eqwv0
await leapwork.step(
    "Execute Run List",
    async () => {

        const runNowButton = page.getByRole(
            "button",
            {
                name: "Run now",
                exact: true
            }
        );

        await expect(runNowButton).toBeVisible({
            timeout: ACTION_TIMEOUT
        });

        await expect(runNowButton).toBeEnabled();

        await runNowButton.click();

        logInfo("Run List execution started.");
    },
    {
        action: "click"
    }
);

// ============================================================
// STEP 27 - CAPTURE RUN ID
// ============================================================

// ai-studio-step-id: pwrx97ki00
await leapwork.step(
    "Capture dynamically generated Run ID",
    async () => {

        const runIdLocator = page.locator(
            "xpath=.//div/div[2]/section/div[5]/div[2]/span[3]"
        );

        await expect(runIdLocator).toBeVisible({
            timeout: TEAM_TIMEOUT
        });

        runId = (
            await runIdLocator.innerText()
        ).trim();

        if (!runId) {
            throw new Error(
                "Run ID was not found after execution."
            );
        }

        leapwork.variables.set(
            "createdRunId",
            runId,
            leapwork.storage.LOCAL
        );

        logInfo(`Captured Run ID: ${runId}`);
    },
    {
        action: "get_value"
    }
);

// ============================================================
// STEP 28 - REFRESH RUN LOG
// ============================================================

// ai-studio-step-id: pw1ufcqlq0
await leapwork.step(
    "Refresh Run log",
    async () => {

        await expect(refreshButton).toBeVisible({
            timeout: ACTION_TIMEOUT
        });

        await refreshButton.click();
    },
    {
        action: "click"
    }
);

// ============================================================
// STEP 29 - VALIDATE RUN STATUS
// ============================================================

// ai-studio-step-id: pw1grclh50
await leapwork.step(
    "Validate Run List execution succeeded",
    async () => {

        const runRow = getRunRow();

        const runStatus = runRow.locator(
            "xpath=.//span[8]"
        );

        const deadline =
            Date.now() + EXECUTION_TIMEOUT;

        let latestStatus = "";

        while (Date.now() < deadline) {

            await expect(runRow).toContainText(
                runId,
                {
                    timeout: ACTION_TIMEOUT
                }
            );

            latestStatus = (
                await runStatus.innerText()
            ).trim();

            if (latestStatus === "SUCCEEDED") {
                break;
            }

            if (
                latestStatus === "FAILED" ||
                latestStatus === "CANCELLED" ||
                latestStatus === "ABORTED"
            ) {
                throw new Error(
                    `Run ${runId} ended with ${latestStatus}.`
                );
            }

            await page.waitForTimeout(3000);

            await expect(refreshButton).toBeVisible({
                timeout: ACTION_TIMEOUT
            });

            await refreshButton.click();
        }

        if (latestStatus !== "SUCCEEDED") {
            throw new Error(
                `Run ${runId} did not succeed within ` +
                `${EXECUTION_TIMEOUT}ms. ` +
                `Last status: ${latestStatus}`
            );
        }

        logInfo(
            `PASS: Run ${runId} SUCCEEDED.`
        );
    },
    {
        action: "click",
        timeoutMs: EXECUTION_TIMEOUT + 30000
    }
);


// ai-studio-step-id: pw1uw7vqk0
await leapwork.step("Click the succeeded run in the run log", async () => {
   
    await page.getByText(`${runId}`).click();
}, {
    action: "click",
    relativeXpath: ".//div/div/div[2]/section/div[5]/div[2]"
});

// ai-studio-step-id: pwu0lkay00
await leapwork.step(`Click Run information for run ${runId}`, async () => {
    await page.locator(`aside[aria-label="Run ${runId}"]`)
        .getByRole("button", { name: "Run information" })
        .click({ timeout: 20000 });
}, {
    action: "click",
    enableXpath: false
});

// ai-studio-step-id: pwix4ye400
await leapwork.step("Verify the Browser type is Microsoft Edge", async () => {
    await expect(
        page.locator("xpath=.//div/dl/div[1]/div[2]/div[5]/strong")
    ).toHaveText("Microsoft Edge", { timeout: 30000 });
}, {
    action: "validate",
    relativeXpath: ".//div/dl/div[1]/div[2]/div[5]/strong",
    enableXpath: false
});

// await leapwork.step("Verify the Browser type is Microsoft Edge", async () => {
//     const browserType = page.locator(
//         "xpath=.//div/dl/div[1]/div[2]/div[5]/strong"
//     );

//     await expect(browserType).toHaveText("Microsoft Edge");
// }, {
//     action: "validate",
//     relativeXpath: ".//div/dl/div[1]/div[2]/div[5]/strong",
//     enableXpath: false
// });

// ai-studio-step-id: pw1amm8jt0
await leapwork.step("Click the Close button in the run details dialog", async () => {
    await page.getByText("Close", { exact: true }).click();
}, {
    action: "click",
    relativeXpath: ".//section/div[6]/div/div/div/button",
    enableXpath: false
});

// ai-studio-step-id: pw5mgndm00
await leapwork.step("Click Close on the run details panel", async () => {
    await page.locator('aside[aria-label^="Run "]')
        .getByRole("button", { name: "Close" })
        .click();
}, {
    action: "click",
    relativeXpath: ".//section/div[6]/aside/header/div[2]/button[@aria-label=\"Close\"]",
    enableXpath: false
});

// ai-studio-step-id: pws1hxp000
await leapwork.step("Use test case: Logout", async () => {
    return await Logout();
}, { action: "asset_reference", linkedAssetType: "test-case" });



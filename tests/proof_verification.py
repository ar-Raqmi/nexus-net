"""Company onboarding regression. Approval cases use controlled responses, not live AI.
Start the production server first. No uploaded files or API keys are stored here.
"""
import json
import os
from pathlib import Path
import tempfile
from playwright.sync_api import sync_playwright

BASE = os.environ.get("BASE_URL", "http://localhost:3100")
OUT = Path(tempfile.gettempdir()) / "nexus-company-qa"
OUT.mkdir(exist_ok=True)
FIXTURE = str(OUT / "unrelated.png")


def state(page):
    return page.evaluate('JSON.parse(localStorage.getItem("nexus-net-game")).state')


def register(page, new_company=False):
    if new_company:
        page.goto(BASE + "/register")
        page.get_by_label("Legal company name", exact=True).fill("Regional Test Labs")
        page.get_by_label("Sector", exact=True).fill("Software")
        page.get_by_label("What does your company do?").fill("Software tools for regional businesses.")
    else:
        page.goto(BASE)
        page.get_by_role("button").filter(has_text="PayLah Lite").click()
        page.get_by_role("link", name="Complete company details", exact=True).first.click()
    page.get_by_label("Registration number", exact=True).fill("QA-MY-001")
    page.get_by_label("Company website", exact=True).fill("https://company.example")
    page.get_by_role("button", name="Save and continue").click()
    page.get_by_role("button", name="Verify company →", exact=True).wait_for()


def open_upload(page):
    page.locator(".onboarding-review-main .onboarding-primary").click()
    dialog = page.get_by_role("dialog")
    expected_mode = "Instant simulation (no AI)" if "demo=1" in page.url else "Live Gemma AI"
    assert dialog.get_by_role("radio", name=expected_mode, exact=True).is_checked()
    dialog.locator("input[type=file]").set_input_files(FIXTURE)
    dialog.get_by_alt_text("Selected company document preview").wait_for()
    return dialog


with sync_playwright() as p:
    browser = p.chromium.launch(headless=True, executable_path=os.environ.get("CHROME_PATH", "/usr/bin/google-chrome"), args=["--no-sandbox"])
    fixture = browser.new_page()
    fixture.set_content("<h1>Unrelated screenshot</h1><p>Test fixture. Not a company registration document.</p>")
    fixture.screenshot(path=FIXTURE)
    fixture.close()
    page = browser.new_page(viewport={"width": 1440, "height": 1050})
    errors = []
    page.on("pageerror", lambda error: errors.append(str(error)))
    page.goto(BASE + "/profile")
    page.get_by_role("link", name="Register company →").wait_for()
    register(page)
    initial = state(page)
    assert initial["startups"][0]["xp"] == 250
    assert not initial["companyVerifications"]
    assert page.locator("#company-passport").count() == 0
    page.screenshot(path=str(OUT / "pending-desktop.png"), full_page=True)
    payloads = []

    def mock(decision, confidence, error=False):
        page.unroute("**/api/company/verify")
        def respond(route):
            payload = route.request.post_data_json
            payloads.append(payload)
            if error:
                route.fulfill(status=502, json={"error": "Temporary verification failure."})
                return
            result = {"profile": payload["profile"], "mode": "live", "checkedAt": "2026-10-31T05:00:00Z", "verdict": {
                "decision": decision, "confidence": confidence, "documentType": "Company registration document",
                "parties": [payload["profile"]["legalName"]], "reason": "Controlled company review response.",
            }}
            if decision == "approved" and confidence >= .7:
                result["passportId"] = "NN-QA-IDENTITY"
            route.fulfill(json={"verification": result})
        page.route("**/api/company/verify", respond)

    for decision, confidence, heading in [("rejected", .98, "Document rejected"), ("approved", .69, "More evidence needed"), ("unclear", .6, "More evidence needed")]:
        mock(decision, confidence)
        dialog = open_upload(page)
        dialog.get_by_role("button", name="Verify company", exact=True).click()
        dialog.get_by_role("heading", name=heading, exact=True).wait_for()
        dialog.get_by_role("button", name="Back to company profile").click()
        assert page.locator("#company-passport").count() == 0
        assert state(page)["startups"][0]["xp"] == 250

    mock("approved", .9, error=True)
    dialog = open_upload(page)
    dialog.get_by_role("button", name="Verify company", exact=True).click()
    dialog.get_by_role("alert").get_by_text("Temporary verification failure.").wait_for()
    assert page.locator("#company-passport").count() == 0
    dialog.get_by_role("button", name="Close company verification").click()

    mock("approved", .9)
    dialog = open_upload(page)
    dialog.locator("input[type=file]").set_input_files({"name": "wrong.txt", "mimeType": "text/plain", "buffer": b"bad file"})
    dialog.get_by_role("alert").get_by_text("Choose a PNG, JPEG or WebP image.").wait_for()
    dialog.locator("input[type=file]").set_input_files(FIXTURE)
    dialog.get_by_role("button", name="Verify company", exact=True).click()
    dialog.get_by_role("heading", name="Company document approved ✓").wait_for()
    dialog.get_by_role("button", name="View company passport").click()
    page.get_by_role("heading", name="Company passport", exact=True).wait_for()
    after = state(page)
    assert after["startups"][0]["xp"] == 250, "Company review must not award XP"
    assert after["quests"] == initial["quests"], "Company review must not change quests"
    assert "quest" not in payloads[-1]
    assert after["companyVerifications"]["paylah-lite"]["passportId"] == "NN-QA-IDENTITY"
    page.reload()
    page.get_by_text("NN-QA-IDENTITY", exact=True).wait_for()
    page.locator(".passport-evidence summary").click()
    page.locator("#company-passport").get_by_text("Controlled company review response.", exact=True).wait_for()
    page.screenshot(path=str(OUT / "identity-desktop.png"), full_page=True)
    for width in [320, 390, 768]:
        page.set_viewport_size({"width": width, "height": 900})
        assert page.evaluate("document.documentElement.scrollWidth <= innerWidth"), width
    page.set_viewport_size({"width": 390, "height": 900})
    page.screenshot(path=str(OUT / "identity-mobile.png"), full_page=True)
    page.goto(BASE + "/quests")
    page.get_by_role("heading", name="Active quests", exact=True).wait_for()
    assert page.locator("#company-passport").count() == 0
    assert page.get_by_role("button", name="Upload proof").count() == 0
    assert page.get_by_role("button", name="Add sample proof quest").count() == 0
    page.goto(BASE + "/profile")
    page.get_by_role("link", name="Edit company details").click()
    page.get_by_label("Registration number", exact=True).fill("QA-MY-CHANGED")
    page.get_by_role("button", name="Save and continue").click()
    page.get_by_role("button", name="Verify company →", exact=True).wait_for()
    assert "paylah-lite" not in state(page)["companyVerifications"], "Editing details must invalidate review"
    assert page.locator("#company-passport").count() == 0
    page.goto(BASE)
    page.get_by_role("button").filter(has_text="TaniPintar").click()
    assert page.locator("#company-passport").count() == 0
    assert page.get_by_text("QA-MY-001", exact=True).count() == 0

    # The company from the reported missing-fields case has its own complete demo.
    page.get_by_role("link", name="Complete company details", exact=True).first.click()
    assert page.get_by_label("Registration number", exact=True).input_value() == "ID-DEMO-2026-002"
    assert page.get_by_label("Company website", exact=True).input_value() == "https://tanipintar.example/"
    page.get_by_role("button", name="Use sample company", exact=True).click()
    assert page.get_by_label("Legal company name", exact=True).input_value() == "TaniPintar"
    page.get_by_role("button", name="Save and continue").click()
    page.wait_for_url("**/profile")
    sample_link = page.get_by_role("link", name="Download sample company record ↗", exact=True)
    assert sample_link.get_attribute("href") == "/demo-evidence/tanipintar-company-record.png"
    page.locator(".onboarding-review-main .onboarding-primary").click()
    dialog = page.get_by_role("dialog")
    assert dialog.get_by_role("radio", name="Live Gemma AI", exact=True).is_checked()
    dialog.get_by_role("radio", name="Instant simulation (no AI)", exact=True).check()
    dialog.locator("input[type=file]").set_input_files(str(Path(__file__).resolve().parents[1] / "public/demo-evidence/tanipintar-company-record.png"))
    dialog.get_by_role("button", name="Verify company", exact=True).click()
    dialog.get_by_role("button", name="View company passport").click()
    page.locator("#company-passport").get_by_text("Demo passport", exact=True).wait_for()
    assert state(page)["companyVerifications"]["tanipintar"]["profile"]["registrationNumber"] == "ID-DEMO-2026-002"
    assert next(s for s in state(page)["startups"] if s["id"] == "tanipintar")["xp"] == 1015

    # Every seeded startup has correctly prefilled synthetic fields and an uploadable record.
    catalogue = browser.new_page()
    demo_profiles = json.loads((Path(__file__).resolve().parents[1] / "public/demo-evidence/company-profiles.json").read_text())
    for company in demo_profiles:
        catalogue.goto(BASE)
        catalogue.get_by_role("button").filter(has_text=company["legalName"]).click()
        catalogue.goto(BASE + "/register")
        assert catalogue.get_by_label("Registration number", exact=True).input_value() == company["registrationNumber"]
        assert catalogue.get_by_label("Company website", exact=True).input_value() == company["website"]
        catalogue.get_by_role("button", name="Use sample company", exact=True).click()
        assert catalogue.get_by_label("Legal company name", exact=True).input_value() == company["legalName"]
        record = "01-matching-company-record" if company["startupId"] == "paylah-lite" else company["startupId"] + "-company-record"
        assert catalogue.request.get(BASE + "/demo-evidence/" + record + ".png").status == 200
    catalogue.close()

    # A newly registered company, rather than a seeded one, uses the real demo endpoint.
    demo = browser.new_page(viewport={"width": 390, "height": 900})
    register(demo, new_company=True)
    demo.goto(BASE + "/profile?demo=1")
    dialog = open_upload(demo)
    dialog.get_by_role("button", name="Verify company", exact=True).click()
    dialog.get_by_text("Demo result · image was not checked by AI", exact=True).wait_for()
    dialog.get_by_role("button", name="View company passport").click()
    demo.locator("#company-passport").get_by_text("Demo passport", exact=True).wait_for()
    demo_state = state(demo)
    new_id = demo_state["currentStartupId"]
    assert new_id.startswith("company-")
    assert next(s for s in demo_state["startups"] if s["id"] == new_id)["xp"] == 0
    assert demo_state["companyVerifications"][new_id]["mode"] == "demo"
    assert page.request.post(BASE + "/api/company/verify", data="invalid").status == 400
    assert page.request.post(BASE + "/api/company/verify", data={**payloads[-1], "imageBase64": "aGVsbG8="}).status == 400
    assert page.request.post(BASE + "/api/company/verify", data={**payloads[-1], "profile": {**payloads[-1]["profile"], "registrationNumber": ""}}).status == 400
    assert page.request.post(BASE + "/api/proof/verify", data=payloads[-1]).status == 404
    # Complete the presentation flow using the actual shipped synthetic data and image.
    stage = browser.new_page(viewport={"width": 390, "height": 900})
    stage.goto(BASE + "/register")
    stage.get_by_role("button", name="Use sample company", exact=True).click()
    stage.get_by_role("status").get_by_text("Sample details filled.", exact=False).wait_for()
    assert stage.get_by_label("Legal company name", exact=True).input_value() == "PayLah Lite"
    assert stage.get_by_label("Registration number", exact=True).input_value() == "MY-DEMO-2026-001"
    stage.get_by_role("button", name="Save and continue").click()
    stage.wait_for_url("**/profile")
    with stage.expect_download() as download_info:
        stage.get_by_role("link", name="Download sample company record ↗", exact=True).click()
    downloaded = OUT / "downloaded-company-record.png"
    download_info.value.save_as(str(downloaded))
    assert downloaded.read_bytes() == (Path(__file__).resolve().parents[1] / "public/demo-evidence/01-matching-company-record.png").read_bytes()
    stage.locator(".onboarding-review-main .onboarding-primary").click()
    dialog = stage.get_by_role("dialog")
    assert dialog.get_by_role("radio", name="Live Gemma AI", exact=True).is_checked()
    dialog.get_by_role("radio", name="Instant simulation (no AI)", exact=True).check()
    dialog.locator("input[type=file]").set_input_files(str(downloaded))
    dialog.get_by_role("button", name="Verify company", exact=True).click()
    dialog.get_by_role("heading", name="Company document approved ✓").wait_for()
    dialog.get_by_role("button", name="View company passport").click()
    stage.locator("#company-passport").get_by_text("Demo passport", exact=True).wait_for()
    stage_state = state(stage)
    stage_id = stage_state["currentStartupId"]
    saved_passport_id = stage_state["companyVerifications"][stage_id]["passportId"]
    assert next(s for s in stage_state["startups"] if s["id"] == stage_id)["xp"] == 0
    stage.reload()
    stage.get_by_text(saved_passport_id, exact=True).wait_for()
    assert stage.evaluate("document.documentElement.scrollWidth <= innerWidth")
    for name in ["02-mismatched-company-record.png", "03-incomplete-company-record.png", "profile-values.json", "README.md"]:
        assert stage.request.get(BASE + "/demo-evidence/" + name).status == 200

    assert not errors, errors
    print(json.dumps({"company_onboarding_checks": "passed", "page_errors": errors, "screenshots": str(OUT)}))
    browser.close()

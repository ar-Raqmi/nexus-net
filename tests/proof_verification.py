from playwright.sync_api import sync_playwright
import json, os, pathlib, tempfile
# Start the production server first. All approval responses below are mocked.
base=os.environ.get('BASE_URL', 'http://localhost:3100')
fixture=str(pathlib.Path(tempfile.gettempdir()) / 'nexus-proof-unrelated.png')
out=pathlib.Path(tempfile.gettempdir()) / 'nexus-proof-qa';out.mkdir(exist_ok=True)
with sync_playwright() as p:
 browser=p.chromium.launch(headless=True,executable_path=os.environ.get('CHROME_PATH','/usr/bin/google-chrome'),args=['--no-sandbox'])
 fixture_page=browser.new_page()
 fixture_page.set_content('<h1>Feature list</h1><p>Unrelated screenshot for automated testing. Not a pilot agreement.</p>')
 fixture_page.screenshot(path=fixture);fixture_page.close()
 page=browser.new_page(viewport={'width':1440,'height':1000})
 errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
 page.goto(base);page.wait_for_load_state('networkidle')
 page.get_by_role('button').filter(has_text='PayLah Lite').click()
 page.get_by_role('heading',name='Company passport',exact=True).wait_for()
 page.get_by_role('button',name='Add sample proof quest').click()
 page.get_by_role('button',name='Upload proof',exact=True).click()
 page.locator('input[type=file]').set_input_files({'name':'wrong.txt','mimeType':'text/plain','buffer':b'not an image'})
 page.get_by_role('alert').get_by_text('Choose a PNG, JPEG or WebP image.').wait_for()
 page.locator('input[type=file]').set_input_files(fixture)
 page.get_by_alt_text('Selected proof preview').wait_for()
 page.screenshot(path=str(out/'upload-desktop.png'))
 # Capture the exact resized payload used by the UI, and exercise live API separately.
 payloads=[]
 def rejected(route):
  payloads.append(route.request.post_data_json)
  route.fulfill(json={'mode':'live','verdict':{'decision':'rejected','confidence':0.95,'documentType':'Unrelated screenshot','parties':[],'reason':'This is a feature table, not a signed pilot agreement.'}})
 page.route('**/api/proof/verify',rejected)
 page.get_by_role('button',name='Check proof',exact=True).click()
 page.get_by_role('heading',name='Proof rejected').wait_for()
 page.get_by_text('No XP awarded.',exact=False).wait_for()
 page.get_by_role('button',name='Back to quests').click()
 assert page.evaluate('JSON.parse(localStorage.getItem("nexus-net-game")).state.startups.find(s=>s.id==="paylah-lite").xp')==250
 page.unroute('**/api/proof/verify')
 # Low-confidence approval must remain retryable, with no stamp or XP.
 page.route('**/api/proof/verify',lambda route: route.fulfill(json={'mode':'live','verdict':{'decision':'approved','confidence':0.69,'documentType':'Blurry agreement','parties':['PayLah Lite'],'reason':'The signature cannot be read.'}}))
 page.get_by_role('button',name='Upload new proof').click();page.locator('input[type=file]').set_input_files(fixture)
 page.get_by_role('button',name='Check proof',exact=True).click();page.get_by_role('heading',name='More evidence needed').wait_for()
 page.get_by_role('button',name='Back to quests').click()
 assert page.evaluate('JSON.parse(localStorage.getItem("nexus-net-game")).state.startups.find(s=>s.id==="paylah-lite").xp')==250
 page.unroute('**/api/proof/verify')
 page.route('**/api/proof/verify',lambda route: route.fulfill(json={'mode':'live','verdict':{'decision':'approved','confidence':0.9,'documentType':'Pilot agreement','parties':['PayLah Lite','Test partner'],'date':'2026-10-31','reason':'Both parties signed a pilot agreement.'}}))
 page.get_by_role('button',name='Upload new proof').click();page.locator('input[type=file]').set_input_files(fixture)
 page.get_by_role('button',name='Check proof',exact=True).click();page.get_by_role('heading',name='Proof approved ✓').wait_for()
 page.get_by_role('button',name='View company passport').click()
 page.get_by_text('1 AI-checked',exact=True).wait_for()
 assert page.evaluate('JSON.parse(localStorage.getItem("nexus-net-game")).state.startups.find(s=>s.id==="paylah-lite").xp')==400
 page.reload();page.get_by_text('1 AI-checked',exact=True).wait_for()
 page.screenshot(path=str(out/'passport-desktop.png'),full_page=True)
 page.set_viewport_size({'width':390,'height':844});page.screenshot(path=str(out/'passport-mobile.png'),full_page=True)
 assert page.evaluate('document.documentElement.scrollWidth<=window.innerWidth'), 'mobile horizontal overflow'
 # Switch startup: the passport cannot leak the previous startup's stamps.
 page.goto(base);page.get_by_role('button').filter(has_text='TaniPintar').click()
 page.get_by_text('Awaiting first proof',exact=True).wait_for()
 # A fresh browser goes through the actual demo route, without a model call.
 demo=browser.new_page();demo.goto(base)
 demo.get_by_role('button').filter(has_text='PayLah Lite').click()
 demo.goto(base+'/quests?demo=1');demo.get_by_role('button',name='Add sample proof quest').click()
 demo.get_by_role('button',name='Upload proof',exact=True).click();demo.locator('input[type=file]').set_input_files(fixture)
 demo.get_by_role('button',name='Check proof',exact=True).click();demo.get_by_text('Demo result · image was not checked by AI',exact=True).wait_for()
 demo.get_by_role('button',name='View company passport').click();demo.get_by_text('Demo passport',exact=True).wait_for()
 # Actual API input validation.
 assert page.request.post(base+'/api/proof/verify',data='invalid').status==400
 bad={**payloads[0],'imageBase64':'aGVsbG8='}
 assert page.request.post(base+'/api/proof/verify',data=bad).status==400
 assert page.request.post(base+'/api/proof/verify',data={**payloads[0],'quest':{**payloads[0]['quest'],'startupId':'other'}}).status==400
 print(json.dumps({'browser_checks':'passed','page_errors':errors,'screenshots':str(out)}))
 assert not errors
 browser.close()

# Sarah's Agent Memory

## Recipy Account
- User ID: 162
- Username: woodenspoon
- Email: sarahblog@recipy.com
- Creator profile: food_blogger, gold tier

## Blog Recipes (slugs in data/recipes.js)
- nonnas-sunday-gravy
- crispy-honey-garlic-chicken-thighs
- shakshuka-with-feta
- perfect-lemon-herb-roast-chicken
- 15-minute-thai-basil-fried-rice
- creamy-wild-mushroom-risotto
- baja-fish-tacos-mango-salsa
- slow-braised-beef-bourguignon
- miso-glazed-salmon-bok-choy
- brown-butter-banana-bread
- spring-pea-asparagus-pasta-lemon-ricotta

## Recipes Imported to Recipy
- miso-glazed-salmon-bok-choy -> Recipe ID 2313 (via UI import)
- crispy-honey-garlic-chicken-thighs -> Recipe ID 2312 (via UI import)
- brown-butter-banana-bread -> Recipe ID 2314 (via orchestrator + API confirm)
- spring-pea-asparagus-pasta-lemon-ricotta -> Recipe ID 2329 (via API import)

## Known Recipy Web App Bug (2026-03-08)
- **AUTH TOKEN WIPED ON NAVIGATION**: After login, `recipy_auth_token` is stored in localStorage correctly. But navigating to a different page (e.g., /chat) causes it to be deleted. Only `recipy-auth` (Zustand persist key) survives. Root cause is likely in the Zustand auth store's `initializeAuth()` method or a competing hydration issue.
- This blocks ALL orchestrator chat usage on the web app. Both the main chat and sidebar mini-chat show "Not authenticated" immediately.
- Workaround: Use the API directly with a fresh JWT token.

## Activity Log
- 2026-03-08 | ~15 turns | Tested orchestrator recipe import. Found auth bug on web app chat. Successfully imported Brown Butter Banana Bread (Recipe ID 2314) via direct API.
- 2026-03-15 | ~8 turns | Imported Spring Pea & Asparagus Pasta (Recipe ID 2329) via API. Updated widget map in recipe.ejs.

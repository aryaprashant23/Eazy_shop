# Eazy Shop (Virtual POS) - Edge Cases & Corner Scenarios

Based on the problem statement and architecture, the following edge cases and corner scenarios must be handled to ensure a seamless, secure, and robust Virtual POS experience.

## 1. Barcode Scanning & Product Identification
* **Unreadable Barcodes:** The physical barcode on the product is damaged, torn, faded, or bent. 
  * *Mitigation:* Provide a manual fallback where the user can type the numerical barcode digits into the app.
* **Product Not Found:** A user scans a barcode, but the product does not exist in the `Product DB`.
  * *Mitigation:* Display a clear "Product not recognized" error and prompt the user to hand the item to store staff. Log the missing barcode to the admin dashboard for inventory correction.
* **Rapid Multi-Scanning:** The camera scanner fires multiple times for the same product within milliseconds.
  * *Mitigation:* Implement debouncing in the frontend scanner UI (e.g., ignore identical scans for 2 seconds).
* **Low Light / Poor Camera Quality:** The supermarket aisle is dim, or the user's phone camera is low quality.
  * *Mitigation:* Add a toggle in the UI to turn on the smartphone flashlight during the scanning process.

## 2. Cart & Inventory Management
* **Inventory Race Conditions (Overselling):** Two customers scan the last remaining unit of an item at the exact same time. Both try to checkout.
  * *Mitigation:* The backend must lock inventory or perform a strict stock check *at the exact moment of payment initialization*. If the item went out of stock while in the cart, notify the user and remove it from their cart.
* **Abandoned Carts:** A user scans 10 items, places them in their physical cart, but leaves the app or walks out of the store without paying.
  * *Mitigation:* Implement a cart expiry mechanism (e.g., clear cart after 2 hours of inactivity). Un-reserve any allocated stock. Staff may need a dashboard alert for high-value abandoned carts to restock physical items.
* **Device Battery Dies During Shopping:** The user's phone turns off midway through scanning.
  * *Mitigation:* Because the `Shopping Cart Service` persists the cart state in the backend database (`cart_items`), the user can log in on another device (or plug their phone in) and their cart will be perfectly restored.

## 3. Pricing & Discounts
* **Price Fluctuations During Session:** A product's price is updated in the Admin Dashboard while a customer currently has that item in their active shopping cart.
  * *Mitigation:* The price of an item should be locked the moment it enters the cart, OR the app must display an alert at checkout saying "Prices for some items have updated" with a mandatory recalculation.
* **Weight-based Pricing (e.g., Fresh Produce):** Items that don't have standard barcodes but are weighed at a scale.
  * *Mitigation:* The weighing scale prints a dynamic barcode containing both the Product ID and the exact weight/price. The Virtual POS scanner must be programmed to parse these specific dynamic barcodes.

## 4. Payment Processing
* **Payment Deducted but Order Fails:** The user pays via UPI, money is deducted from their bank, but the Payment Gateway webhook is delayed, so the app shows "Payment Failed."
  * *Mitigation:* The `Order & Payment Service` must poll the Payment Gateway status API if the webhook is delayed. Provide a "Check Payment Status" button for the user. Do *not* allow the user to pay twice.
* **App Closed During Payment Redirect:** The user is redirected to a UPI app, completes the payment, but accidentally kills the Eazy Shop app instead of returning to it.
  * *Mitigation:* Rely heavily on Backend Webhooks from the Payment Gateway. When the user reopens the app, the backend should recognize the paid order state and immediately render the Digital Receipt & Exit QR Code.

## 5. Exit Verification & Security (Shrinkage)
* **QR Code Reuse / Screenshotting:** A user successfully pays, takes a screenshot of the Exit QR Code, and tries to use it the next day to steal the same items.
  * *Mitigation:* The Exit QR Code must include a short-lived cryptographic signature or timestamp. Once scanned by the `Exit Verification App`, its status in the backend must change to "CONSUMED."
* **Theft / Unscanned Items:** A user places 10 items in their bag but only scans 5 items in the app, pays, and attempts to exit.
  * *Mitigation (MVP):* The Exit Staff performs a quick random spot-check of the physical bag versus the digital receipt.
  * *Mitigation (Future):* Integrate physical weight scales at the exit gates that compare the total physical weight of the bag to the sum of the `weight` attributes from the database for the purchased items.
* **Dead Phone at Exit:** The user completes the payment, but their phone battery dies before they can show the Exit QR Code to the staff.
  * *Mitigation:* The `Exit Verification App` must allow staff to look up successful transactions by the user's registered phone number or email address.

## 6. Network Connectivity
* **Poor Supermarket Wi-Fi / Dead Zones:** Deep inside the store, cellular data drops and the store Wi-Fi is unreliable. The user cannot scan items because the `Product Catalog Service` cannot be reached.
  * *Mitigation:* Provide robust offline fallback. The app should queue scanned barcodes locally on the device. When the user walks to a better signal area (like the checkout/exit zone), the app batch-syncs the queued barcodes to the backend.
